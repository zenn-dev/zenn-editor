import type { EditorState } from '@tiptap/pm/state';
import {
  type CanCommands,
  type ChainedCommands,
  type ExtendedRegExpMatchArray,
  findChildren,
  findParentNode,
  getText,
  getTextBetween,
  getTextSerializersFromSchema,
  InputRule,
  Node,
  type Range,
} from '@tiptap/react';
import { replaceNewlines } from '../../../lib/node';
import { normalizeLangName } from './utils';

type SetCodeBlockContainerOptions = {
  language?: string;
  filename?: string | null;
};

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    codeBlockContainer: {
      setAllSelectionInCodeBlock: () => ReturnType;
      setCodeBlockContainer: (
        attrs: SetCodeBlockContainerOptions
      ) => ReturnType;
      unsetCodeBlockContainer: () => ReturnType;
    };
  }
}

export const backtickInputRegex = /^```([a-z-]+(?::[a-zA-Z0-9._-]+)?)?[\s\n]$/;
export const tildeInputRegex = /^~~~([a-z-]+(?::[a-zA-Z0-9._-]+)?)?[\s\n]$/;

const inputHandler = ({
  range,
  match,
  can,
  chain,
}: {
  state: EditorState;
  range: Range;
  match: ExtendedRegExpMatchArray;
  can: () => CanCommands;
  chain: () => ChainedCommands;
}) => {
  let language: string, filename: string | null;

  if (match[1]?.includes(':')) {
    [language, filename] = match[1].split(':');
  } else {
    language = match[1];
    filename = null;
  }

  if (!can().setCodeBlockContainer({ language, filename })) {
    return;
  }

  chain()
    .deleteRange({ from: range.from, to: range.to })
    .setCodeBlockContainer({ language, filename })
    .run();
};

export const CodeBlockContainer = Node.create({
  name: 'codeBlockContainer',
  group: 'block',
  content: 'codeBlockFileName (codeBlock | diffCodeBlock)',

  parseHTML() {
    return [
      {
        tag: 'div.code-block-container',
      },
    ];
  },

  renderHTML() {
    return ['div', { class: 'code-block-container' }, 0];
  },

  addCommands() {
    return {
      setCodeBlockContainer:
        ({ filename, language }) =>
        ({ chain, state }) => {
          const { schema, selection } = state;
          const { $from, $to } = selection;
          const range = $from.blockRange($to);

          if (!range) {
            return false;
          }

          const isParentMatch = range.parent.type.contentMatch.matchType(
            this.type
          );

          if (!isParentMatch) {
            return false;
          }

          const isDiff = language?.startsWith('diff');
          const normedLanguage = normalizeLangName(language);

          const text = getTextBetween(
            state.doc,
            { from: range.start, to: range.end },
            {
              blockSeparator: '\n',
              textSerializers: getTextSerializersFromSchema(schema),
            }
          );

          const codeFileNameNodeSize = (filename?.length ?? 0) + 2;

          return chain()
            .insertContentAt(
              {
                from: range.start,
                to: range.end,
              },
              {
                type: 'codeBlockContainer',
                content: [
                  {
                    type: 'codeBlockFileName',
                    content: filename ? [{ type: 'text', text: filename }] : [],
                  },
                  isDiff
                    ? {
                        type: 'diffCodeBlock',
                        attrs: { language: normedLanguage },
                        content: text.split('\n').map((line) => ({
                          type: 'diffCodeLine',
                          content: line ? [{ type: 'text', text: line }] : [],
                        })),
                      }
                    : {
                        type: 'codeBlock',
                        attrs: { language: normedLanguage },
                        content: text ? [{ type: 'text', text }] : [],
                      },
                ],
              }
            )
            .setTextSelection(
              range.start + 1 + codeFileNameNodeSize + (isDiff ? 2 : 1)
            ) //コンテンツの開始位置にカーソルを移動
            .run();
        },
      setAllSelectionInCodeBlock:
        () =>
        ({ state, commands }) => {
          const { selection } = state;

          const codeBlock = findParentNode(
            (node) => node.type === state.schema.nodes.codeBlock
          )(selection);

          const codeBlockDiff = findParentNode(
            (node) => node.type === state.schema.nodes.diffCodeBlock
          )(selection);

          if (codeBlock) {
            return commands.setTextSelection({
              from: codeBlock.start,
              to: codeBlock.pos + codeBlock.node.nodeSize - 1,
            });
          }

          if (codeBlockDiff) {
            return commands.setTextSelection({
              from: codeBlockDiff.start + 1,
              to: codeBlockDiff.pos + codeBlockDiff.node.nodeSize - 2,
            });
          }

          return false;
        },
      unsetCodeBlockContainer:
        () =>
        ({ chain, state }) => {
          const { selection, schema } = state;
          const codeBlockContainer = findParentNode(
            (node) => node.type === this.type
          )(selection);

          if (!codeBlockContainer) {
            return false;
          }

          const codeBlocks = findChildren(
            codeBlockContainer.node,
            (node) => node.type === schema.nodes.codeBlock
          );
          const diffCodeBlocks = findChildren(
            codeBlockContainer.node,
            (node) => node.type === schema.nodes.diffCodeBlock
          );

          if (!codeBlocks.length && !diffCodeBlocks.length) return false;

          const codeBlockNode = codeBlocks[0] || diffCodeBlocks[0];

          const from = codeBlockContainer.pos;
          const $from = state.doc.resolve(from);
          const to = from + codeBlockContainer.node.nodeSize;
          const range = { from, to };
          const code = getText(codeBlockNode.node, {
            blockSeparator: '\n',
            textSerializers: getTextSerializersFromSchema(schema),
          });
          const defaultType = $from.parent.type.contentMatch.defaultType;
          if (!defaultType) return false;

          const contentNode = defaultType?.create(
            null,
            code ? schema.text(code) : null
          );
          const contentNodeWithNewLine = replaceNewlines(contentNode);

          return chain()
            .insertContentAt(range, contentNodeWithNewLine)
            .setTextSelection(from + 1)
            .run();
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-a': () => {
        return this.editor.commands.setAllSelectionInCodeBlock();
      },
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: backtickInputRegex,
        handler: inputHandler,
      }),
      new InputRule({
        find: tildeInputRegex,
        handler: inputHandler,
      }),
    ];
  },
});
