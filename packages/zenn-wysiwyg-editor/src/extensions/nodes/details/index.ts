import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import {
  findChildren,
  findParentNode,
  InputRule,
  isActive,
  mergeAttributes,
  Node,
} from '@tiptap/react';
import { findClosestVisibleNode, isNodeVisible } from '../../../lib/node';

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    details: {
      setDetails: () => ReturnType;
      unsetDetails: () => ReturnType;
    };
  }
}

export const Details = Node.create({
  name: 'details',

  content: 'detailsSummary detailsContent',
  group: 'block',
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      open: {
        default: false,
        parseHTML: (element) => element.hasAttribute('open'),
        renderHTML: ({ open }) => {
          if (!open) {
            return {};
          }

          return { open: '' };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'details',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'details',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      setDetails:
        () =>
        ({ state, chain }) => {
          const { schema, selection } = state;
          const { $from, $to } = selection;
          const range = $from.blockRange($to);

          if (!range) {
            return false;
          }

          const slice = state.doc.slice(range.start, range.end);
          const match = schema.nodes.detailsContent.contentMatch.matchFragment(
            slice.content
          );

          if (!match) {
            return false;
          }

          const isParentMatch = range.parent.type.contentMatch.matchType(
            this.type
          );

          if (!isParentMatch) {
            return false;
          }

          const content = slice.toJSON()?.content || [];

          return chain()
            .insertContentAt(
              { from: range.start, to: range.end },
              {
                type: this.name,
                attrs: { open: true },
                content: [
                  {
                    type: 'detailsSummary',
                  },
                  {
                    type: 'detailsContent',
                    content,
                  },
                ],
              }
            )
            .setTextSelection(range.start + 2)
            .run();
        },

      unsetDetails:
        () =>
        ({ state, chain }) => {
          const { selection, schema } = state;
          const details = findParentNode((node) => node.type === this.type)(
            selection
          );

          if (!details) {
            return false;
          }

          const detailsSummaries = findChildren(
            details.node,
            (node) => node.type === schema.nodes.detailsSummary
          );
          const detailsContents = findChildren(
            details.node,
            (node) => node.type === schema.nodes.detailsContent
          );

          if (!detailsSummaries.length || !detailsContents.length) {
            return false;
          }

          const detailsSummary = detailsSummaries[0];
          const detailsContent = detailsContents[0];
          const from = details.pos;
          const $from = state.doc.resolve(from);
          const to = from + details.node.nodeSize;
          const range = { from, to };
          const content = (detailsContent.node.content.toJSON() as []) || [];
          const defaultTypeForSummary =
            $from.parent.type.contentMatch.defaultType;

          const summaryContent = defaultTypeForSummary
            ?.create(null, detailsSummary.node.content)
            .toJSON();
          const mergedContent = [summaryContent, ...content];

          return chain()
            .insertContentAt(range, mergedContent)
            .setTextSelection(from + 1)
            .run();
        },
    };
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div');
      dom.className = 'details';

      if (node.attrs.open) {
        dom.setAttribute('data-open', '');
      }

      return {
        dom,
        contentDOM: dom,
      };
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: /^:::details\s$/,
        handler: ({ range, chain, can }) => {
          if (!can().setDetails()) {
            return;
          }

          chain().deleteRange(range).setDetails().run();
        },
        undoable: false,
      }),
    ];
  },

  addProseMirrorPlugins() {
    return [
      // 閉じたコンテンツ内にカーソルを移動することを防ぐ
      new Plugin({
        key: new PluginKey('detailsSelection'),
        appendTransaction: (transactions, oldState, newState) => {
          const { editor, type } = this;
          const selectionSet = transactions.some(
            (transaction) => transaction.selectionSet
          );

          if (
            !selectionSet ||
            !oldState.selection.empty ||
            !newState.selection.empty
          ) {
            return;
          }

          const detailsIsActive = isActive(newState, type.name);

          if (!detailsIsActive) {
            return;
          }

          const { $from } = newState.selection;
          const isVisible = isNodeVisible($from.pos, editor);

          if (isVisible) {
            return;
          }

          const details = findClosestVisibleNode(
            $from,
            (node) => node.type === type,
            editor
          );

          if (!details) {
            return;
          }

          const detailsSummaries = findChildren(
            details.node,
            (node) => node.type === newState.schema.nodes.detailsSummary
          );

          if (!detailsSummaries.length) {
            return;
          }

          const detailsSummary = detailsSummaries[0];
          const selectionDirection =
            oldState.selection.from < newState.selection.from
              ? 'forward'
              : 'backward';
          const correctedPosition =
            selectionDirection === 'forward'
              ? details.start + detailsSummary.pos
              : details.pos + detailsSummary.pos + detailsSummary.node.nodeSize;
          const selection = TextSelection.create(
            newState.doc,
            correctedPosition
          );
          const transaction = newState.tr.setSelection(selection);

          return transaction;
        },
      }),
    ];
  },
});
