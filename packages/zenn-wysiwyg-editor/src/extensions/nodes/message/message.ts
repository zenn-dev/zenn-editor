import {
  findChildren,
  findParentNode,
  InputRule,
  mergeAttributes,
  Node,
} from '@tiptap/react';
import { cn } from '../../../lib/utils';
import { createMessageSymbolDecorationPlugin } from './message-symbol-decoration-plugin';

export type MessageType = 'message' | 'alert';

export interface MessageOptions {
  type?: MessageType;
}

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    message: {
      setMessage: (attrs: { type: MessageType }) => ReturnType;
      unsetMessage: () => ReturnType;
    };
  }
}

export const Message = Node.create({
  name: 'message',
  group: 'block',
  content: 'messageContent',
  isolating: true,

  addAttributes() {
    return {
      type: {
        default: 'message',
        rendered: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'aside.msg',
        getAttrs: (element) => {
          return {
            type: element.classList.contains('alert') ? 'alert' : 'message',
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'aside',
      mergeAttributes(HTMLAttributes, {
        class: cn('msg', {
          alert: node.attrs.type === 'alert',
        }),
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setMessage:
        ({ type }) =>
        ({ chain, state }) => {
          const { schema, selection } = state;
          const { $from, $to } = selection;
          const range = $from.blockRange($to);

          if (!range) {
            return false;
          }

          const slice = state.doc.slice(range.start, range.end);
          const contentMatch =
            schema.nodes.messageContent.contentMatch.matchFragment(
              slice.content
            );

          if (!contentMatch) {
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
                attrs: { type },
                content: [
                  {
                    type: 'messageContent',
                    content,
                  },
                ],
              }
            )
            .setTextSelection(range.start + 3) // paragraph の startに移動
            .run();
        },
      unsetMessage:
        () =>
        ({ state, chain }) => {
          const { selection, schema } = state;
          const message = findParentNode((node) => node.type === this.type)(
            selection
          );

          if (!message) {
            return false;
          }

          const messageContents = findChildren(
            message.node,
            (node) => node.type === schema.nodes.messageContent
          );

          if (!messageContents.length) {
            return false;
          }

          const messageContent = messageContents[0];
          const from = message.pos;
          const to = from + message.node.nodeSize;
          const range = { from, to };
          const content = (messageContent.node.content.toJSON() as []) || [];

          return chain()
            .insertContentAt(range, content)
            .setTextSelection(from + 1) // paragraph の startに移動
            .run();
        },
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: /^:::(message|alert)\s$/,
        handler: ({ can, chain, range, match }) => {
          const type = match[1] as MessageType;

          if (!can().setMessage({ type })) {
            return;
          }

          chain().deleteRange(range).setMessage({ type }).run();
        },
        undoable: false,
      }),
    ];
  },

  addProseMirrorPlugins() {
    return [createMessageSymbolDecorationPlugin(this.name)];
  },
});
