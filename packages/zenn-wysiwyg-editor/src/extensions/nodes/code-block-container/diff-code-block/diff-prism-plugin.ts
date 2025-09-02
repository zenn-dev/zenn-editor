import type { Node as ProsemirrorNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { findChildren } from "@tiptap/react";
import {
  getDiffCode,
  getDiffHighlightLineNodes,
  highlightCode,
  parseNodes,
} from "../utils";

function createDiffDecorations(
  lineNodes: HTMLElement[],
  preStart: number,
): Decoration[] {
  const decorations: Decoration[] = [];

  let to = preStart + 1; // code-lineのstart
  lineNodes.forEach((lineNode) => {
    let from = to;
    const lineStart = to;

    const parsedNodes = parseNodes(Array.from(lineNode.childNodes));
    parsedNodes.forEach((node) => {
      to = from + node.text.length;

      if (node.classes.length) {
        const decoration = Decoration.inline(from, to, {
          class: node.classes.join(" "),
        });
        decorations.push(decoration);
      }

      from = to;
    });
    decorations.push(
      Decoration.node(lineStart - 1, to + 1, { class: lineNode.className }),
    );

    to += 2; // lineのspanを跨ぐ
  });

  return decorations;
}

function getDecorations({
  doc,
  name,
  defaultLanguage,
}: {
  doc: ProsemirrorNode;
  name: string;
  defaultLanguage: string | null | undefined;
}) {
  const decorations: Decoration[] = [];

  findChildren(doc, (node) => node.type.name === name).forEach((preNode) => {
    const preStart = preNode.pos + 1;
    const language = preNode.node.attrs.language || defaultLanguage;

    const html = highlightCode(getDiffCode(preNode.node), language);
    const nodes = getDiffHighlightLineNodes(html);

    const blockDecorations = createDiffDecorations(nodes, preStart);

    decorations.push(...blockDecorations);
  });

  return DecorationSet.create(doc, decorations);
}

export function DiffPrismPlugin({
  name,
  defaultLanguage,
}: {
  name: string;
  defaultLanguage: string;
}) {
  const prismjsPlugin: Plugin = new Plugin({
    key: new PluginKey("diff-prism"),

    state: {
      init: (_, { doc }) =>
        getDecorations({
          doc,
          name,
          defaultLanguage,
        }),
      apply: (transaction, decorationSet, oldState, newState) => {
        const oldNodeName = oldState.selection.$head.node(-1)?.type.name;
        const newNodeName = newState.selection.$head.node(-1)?.type.name;

        if (!oldNodeName || !newNodeName) {
          return decorationSet.map(transaction.mapping, transaction.doc);
        }

        const oldNodes = findChildren(
          oldState.doc,
          (node) => node.type.name === name,
        );
        const newNodes = findChildren(
          newState.doc,
          (node) => node.type.name === name,
        );

        if (
          transaction.docChanged &&
          // Apply decorations if:
          // selection includes named node,
          ([oldNodeName, newNodeName].includes(name) ||
            // OR transaction adds/removes named node,
            newNodes.length !== oldNodes.length ||
            // OR transaction has changes that completely encapsulte a node
            // (for example, a transaction that affects the entire document).
            // Such transactions can happen during collab syncing via y-prosemirror, for example.
            transaction.steps.some((step) => {
              return (
                // @ts-expect-error
                step.from !== undefined &&
                // @ts-expect-error
                step.to !== undefined &&
                oldNodes.some((node) => {
                  return (
                    // @ts-expect-error
                    node.pos >= step.from &&
                    // @ts-expect-error
                    node.pos + node.node.nodeSize <= step.to
                  );
                })
              );
            }))
        ) {
          return getDecorations({
            doc: transaction.doc,
            name,
            defaultLanguage,
          });
        }

        return decorationSet.map(transaction.mapping, transaction.doc);
      },
    },

    props: {
      decorations(state) {
        return prismjsPlugin.getState(state);
      },
    },
  });

  return prismjsPlugin;
}
