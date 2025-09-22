import { PluginKey } from '@tiptap/pm/state';
import { Extension, ReactRenderer } from '@tiptap/react';
import { Suggestion } from '@tiptap/suggestion';
import { computePosition } from '@floating-ui/dom';

import SlashCommandList from '../../../components/editor/slash-command-list';

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        pluginKey: new PluginKey('slashCommandSuggestion'),
        editor: this.editor,
        char: '/',
        items: ({ query }) => {
          return ['text', 'heading'].filter((item) =>
            item.toLowerCase().startsWith(query.toLowerCase())
          );
        },
        command: ({ editor, range }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setHeading({ level: 2 })
            .run();
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
                throw new Error('Client rect not found');
              }

              document.body.appendChild(component.element);
              repositionComponent(rect);
            },

            onUpdate(props) {
              if (!component) throw new Error('Component not found');

              const rect = props.clientRect?.();
              if (!rect) throw new Error('Client rect not found');

              component.updateProps(props);
              repositionComponent(rect);
            },

            onKeyDown(props) {
              if (!component) throw new Error('Component not found');

              if (props.event.key === 'Escape') {
                document.body.removeChild(component.element);
                component.destroy();

                return true;
              }

              // @ts-ignore
              return component.ref.onKeyDown(props);
            },

            onExit() {
              if (!component) throw new Error('Component not found');

              if (document.body.contains(component.element)) {
                document.body.removeChild(component.element);
              }
              component.destroy();
              component = null;
            },
          };
        },
      }),
    ];
  },
});
