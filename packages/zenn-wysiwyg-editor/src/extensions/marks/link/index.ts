import TiptapLink from '@tiptap/extension-link';
import type { Mark } from '@tiptap/pm/model';
import type { EditorView } from '@tiptap/pm/view';
import { ReactRenderer } from '@tiptap/react';
import {
  createLinkElement,
  createLinkEditComponent,
  updatePosition,
} from './utils';

export const Link = TiptapLink.extend({
  inclusive: false,

  addMarkView() {
    return ({ mark }: { mark: Mark; view: EditorView }) => {
      const linkElement = createLinkElement(mark);
      let component: ReactRenderer | null = null;
      let hoverTimeout: NodeJS.Timeout | null = null;

      const destroyComponent = () => {
        if (component) {
          component.destroy();
          component = null;
        }
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
          hoverTimeout = null;
        }
      };

      linkElement.addEventListener('mouseenter', (e) => {
        hoverTimeout = setTimeout(() => {
          component = createLinkEditComponent(
            this.editor,
            mark,
            linkElement,
            destroyComponent
          );

          const element = component.element as HTMLElement;
          element.style.position = 'absolute';
          document.body.appendChild(element);
          updatePosition(e.target as HTMLElement, element);
        }, 500);
      });

      linkElement.addEventListener('mouseleave', (e) => {
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
          hoverTimeout = null;
        }

        if (
          e.relatedTarget &&
          e.relatedTarget instanceof Node &&
          (component?.element as HTMLElement)?.contains(e.relatedTarget)
        ) {
          return;
        }

        destroyComponent();
      });

      return {
        dom: linkElement,
        destroy: destroyComponent,
      };
    };
  },
});
