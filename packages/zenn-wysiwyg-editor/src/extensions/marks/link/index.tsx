import { computePosition, flip, shift } from "@floating-ui/dom";
import TiptapLink from "@tiptap/extension-link";
import type { Mark } from "@tiptap/pm/model";
import type { EditorView } from "@tiptap/pm/view";
import { ReactRenderer } from "@tiptap/react";
import LinkEdit from "./link-edit";

const updatePosition = (
  targetElement: HTMLElement,
  popOverElement: HTMLElement,
) => {
  computePosition(targetElement, popOverElement, {
    placement: "bottom",
    strategy: "absolute",
    middleware: [shift(), flip()],
  }).then(({ x, y, strategy }) => {
    popOverElement.style.width = "max-content";
    popOverElement.style.position = strategy;
    popOverElement.style.left = `${x}px`;
    popOverElement.style.top = `${y}px`;
  });
};

export const Link = TiptapLink.extend({
  inclusive: false,

  addMarkView() {
    return ({
      mark,
      updateAttributes,
      view,
    }: {
      mark: Mark;
      updateAttributes: (attrs: Record<string, string>) => void;
      view: EditorView;
    }) => {
      const a = document.createElement("a");
      a.setAttribute("href", mark.attrs.href);
      a.setAttribute("target", mark.attrs.target);
      a.setAttribute("rel", mark.attrs.rel);

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
      const currentLinkRange = () => {
        const pos = view.posAtDOM(a, 0);
        if (pos === -1) return null;
        const node = view.state.doc.nodeAt(pos); // TextNode
        if (!node) return null;
        return { from: pos, to: pos + node.nodeSize };
      };
      const handleDelete = () => {
        // 位置はイベント時に動的に取得することで、最新の状態を参照できる
        const range = currentLinkRange();
        if (!range) return;

        this.editor
          .chain()
          .command(({ tr }) => {
            tr.removeMark(range.from, range.to, this.type);
            return true;
          })
          .setTextSelection(range.from)
          .focus()
          .run();
        destroyComponent();
      };

      // 0.5秒間ホバーし続けたらリンク編集UIを表示する
      a.addEventListener("mouseenter", (e) => {
        hoverTimeout = setTimeout(() => {
          component = new ReactRenderer(LinkEdit, {
            props: {
              href: mark.attrs.href,
              handleMouseLeave: (e: MouseEvent) => {
                e.stopPropagation();
                destroyComponent();
              },
              handleSave: (href: string) => {
                if (!href) {
                  handleDelete();
                  return;
                }

                this.editor
                  .chain()
                  .setTextSelection(currentLinkRange()?.from || 0)
                  .focus()
                  .run();

                // 属性を更新すると、リンクが再描画されて a要素が置き換わる。
                // なのでcurrentLinkRangeはupdateAttributesの前に呼び出す
                updateAttributes({ href: href });
                destroyComponent();
              },
              handleDelete: handleDelete,
            },
            editor: this.editor,
          });

          const element = component.element as HTMLElement;
          element.style.position = "absolute";
          document.body.appendChild(element);
          updatePosition(e.target as HTMLElement, element);
        }, 500); // 0.5秒後に表示
      });

      a.addEventListener("mouseleave", (e) => {
        // タイムアウトをクリアして、リンク編集UIの表示をキャンセル
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
        dom: a,
        destroy: destroyComponent,
      };
    };
  },
});
