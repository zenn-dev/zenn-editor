import { PluginKey } from '@tiptap/pm/state';
import { Editor, ReactRenderer } from '@tiptap/react';
import { Suggestion } from '@tiptap/suggestion';
import { computePosition } from '@floating-ui/dom';

import SlashCommandList from '../../../components/editor/slash-command-list';
import { items } from './items';

export function createSuggestion(editor: Editor) {
  return Suggestion({
    pluginKey: new PluginKey('slashCommandSuggestion'),
    editor: editor,
    char: '/',
    // TODO: paragraphの先頭以外でも許可する
    startOfLine: true,
    allow: () => {
      const { selection } = editor.state;
      const { $from } = selection;
      return $from.parent.type.name === 'paragraph' && $from.depth === 1;
    },
    items: ({ query }) => {
      return items.filter((item) =>
        item.value.toLowerCase().startsWith(query.toLowerCase())
      );
    },
    command: ({ editor, range, props }) => {
      const key = props.key;
      const command = items.find((item) => item.value === key)?.command;
      command?.({ editor, range, props });
    },
    render: () => {
      let component: ReactRenderer | null = null;

      function repositionComponent(clientRect: DOMRect) {
        if (!component || !component.element) {
          return;
        }

        const el = component.element as HTMLElement;
        const virtualElement = {
          getBoundingClientRect() {
            return clientRect;
          },
        };

        computePosition(virtualElement, el, {
          placement: 'bottom-start',
        }).then((pos) => {
          Object.assign(el.style, {
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            position: pos.strategy === 'fixed' ? 'fixed' : 'absolute',
          });
        });
      }

      return {
        onStart: (props) => {
          component = new ReactRenderer(SlashCommandList, {
            props,
            editor: props.editor,
          });

          const rect = props.clientRect?.();
          if (!rect) {
            return;
          }

          document.body.appendChild(component.element);
          repositionComponent(rect);
        },

        onUpdate(props) {
          if (!component) return;

          const rect = props.clientRect?.();
          if (!rect) return;

          component.updateProps(props);
          repositionComponent(rect);
        },

        onKeyDown(props) {
          if (!component) return false;

          if (props.event.key === 'Escape') {
            document.body.removeChild(component.element);
            component.destroy();

            return true;
          }

          // @ts-ignore
          return component.ref.onKeyDown(props);
        },

        onExit() {
          if (!component) return;

          if (document.body.contains(component.element)) {
            document.body.removeChild(component.element);
          }
          component.destroy();
          component = null;
        },
      };
    },
  });
}
