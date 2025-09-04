import { Fragment, type Node } from '@tiptap/pm/model';
import type { EditorState, Transaction } from '@tiptap/pm/state';
import { ReplaceStep } from '@tiptap/pm/transform';

// 脚注参照が追加・削除・移動されたか否か
export function isFootnoteRefChanged(transactions: readonly Transaction[]) {
  let refsChanged = false;
  for (const tr of transactions) {
    if (refsChanged) break;
    if (!tr.docChanged) continue;

    for (const step of tr.steps) {
      if (!(step instanceof ReplaceStep)) continue;
      if (refsChanged) break;

      const isDelete = step.from !== step.to;
      const isInsert = step.slice.size > 0;

      if (isInsert) {
        step.slice.content.descendants((node) => {
          if (node?.type.name === 'footnoteReference') {
            refsChanged = true;
            return false;
          }
        });
      }
      if (isDelete && !refsChanged) {
        tr.before.nodesBetween(
          step.from,
          Math.min(tr.before.content.size, step.to),
          (node) => {
            if (node.type.name === 'footnoteReference') {
              refsChanged = true;
              return false;
            }
          }
        );
      }
    }
  }

  return refsChanged;
}

export function updateFootnoteReferences(tr: Transaction) {
  let count = 1;

  const nodes: Node[] = [];

  tr.doc.descendants((node, pos) => {
    if (node.type.name === 'footnoteReference') {
      tr.setNodeAttribute(pos, 'referenceNumber', count);

      nodes.push(node);
      count += 1;
    }
  });

  return nodes;
}

function getFootnotes(tr: Transaction) {
  let footnotesRange: { from: number; to: number } | undefined;
  const footnoteItems: Node[] = [];
  tr.doc.descendants((node, pos) => {
    if (node.type.name === 'footnoteItem') {
      footnoteItems.push(node);
    } else if (node.type.name === 'footnotes') {
      footnotesRange = { from: pos, to: pos + node.nodeSize };
    } else if (node.type.name === 'footnotesList') {
      // 子要素を探索する
    } else {
      return false;
    }
  });
  return { footnotesRange, footnoteItems };
}

export function updateFootnotes(tr: Transaction, state: EditorState) {
  const footnoteReferences = updateFootnoteReferences(tr);

  const footnoteItemType = state.schema.nodes.footnoteItem;
  const footnotesType = state.schema.nodes.footnotes;
  const footnotesListType = state.schema.nodes.footnotesList;

  const { footnotesRange, footnoteItems } = getFootnotes(tr);

  const mappingId2FootnoteItem = footnoteItems.reduce<{ [key: string]: Node }>(
    (obj, footnote) => {
      obj[footnote.attrs.id] = footnote;
      return obj;
    },
    {}
  );

  const newFootnotes: Node[] = [];

  for (let i = 0; i < footnoteReferences.length; i++) {
    const refId = footnoteReferences[i].attrs.id;
    const footnoteId = footnoteReferences[i].attrs.footnoteId;

    if (footnoteId in mappingId2FootnoteItem) {
      const footnoteItem = mappingId2FootnoteItem[footnoteId];
      newFootnotes.push(
        footnoteItemType.create({ ...footnoteItem.attrs }, footnoteItem.content)
      );
    } else {
      const newNode = footnoteItemType.create(
        {
          id: footnoteId,
          referenceId: refId,
        },
        []
      );
      newFootnotes.push(newNode);
    }
  }

  if (newFootnotes.length === 0) {
    // 脚注参照がない場合は脚注を削除
    if (footnotesRange) {
      tr.delete(footnotesRange.from, footnotesRange.to);
    }
  } else if (!footnotesRange) {
    // 脚注がない場合は新規追加
    tr.insert(
      tr.doc.content.size,
      footnotesType.create(
        null,
        footnotesListType.create(null, Fragment.from(newFootnotes))
      )
    );
  } else {
    tr.replaceWith(
      footnotesRange.from + 2, // footnotesList start
      footnotesRange.to - 2, // footnotesList end
      Fragment.from(newFootnotes)
    );
  }
}
