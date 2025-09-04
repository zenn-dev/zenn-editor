import type { Node } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';
import { Extension } from '@tiptap/react';
import { EMBED_BACKEND_ORIGIN } from '../../../lib/constants';
import { getEmbedTypeFromUrl, sanitizeEmbedToken } from '../../../lib/embed';
import { extractSpeakerDeckEmbedParams, isFigmaUrl } from '../../../lib/url';
import type { SpeakerDeckEmbedResponse } from '../../../types';

export const EmbedPasteHandler = Extension.create({
  name: 'embedPasteHandler',
  priority: 2, // マークダウンペーストより先に実行する

  addProseMirrorPlugins() {
    return [pasteHandlerPlugin()];
  },
});

function pasteHandlerPlugin(): Plugin {
  return new Plugin({
    key: new PluginKey('embedPasteHandler'),
    props: {
      handlePaste: (view, _, slice) => {
        const { state } = view;
        const { selection } = state;
        const { empty } = selection;
        const { tr } = state;

        // 範囲選択の場合はデフォルトのリンクマークの挙動にする
        if (!empty) {
          return false;
        }

        let textContent = '';

        slice.content.forEach((node) => {
          textContent += node.textContent;
        });

        const type = getEmbedTypeFromUrl(textContent);
        if (!type) return false;

        let node: Node;
        if (type === 'speakerdeck') {
          node = createSpeakerDeckNode(view, textContent);
        } else if (isFigmaUrl(textContent)) {
          node = state.schema.nodes.embed.create({
            url: `https://www.figma.com/embed?embed_host=zenn&url=${sanitizeEmbedToken(textContent)}`,
            type,
          });
        } else {
          node = state.schema.nodes.embed.create({
            url: textContent,
            type,
          });
        }
        tr.replaceSelectionWith(node);
        view.dispatch(tr);
        return true;
      },
    },
  });
}

function createSpeakerDeckNode(view: EditorView, url: string) {
  const params = extractSpeakerDeckEmbedParams(url);
  if (params) {
    return view.state.schema.nodes.speakerDeckEmbed.create(params);
  }

  const tempId = `temp-${Math.random().toString(36)}`;

  const deleteTempNode = () => {
    view.state.doc.descendants((n, pos) => {
      if (n.type.name === 'speakerDeckEmbed' && n.attrs.tempId === tempId) {
        view.dispatch(
          view.state.tr
            .delete(pos, pos + n.nodeSize)
            .setMeta('addToHistory', false)
        );
        return true;
      }
    });
  };

  fetch(
    `${EMBED_BACKEND_ORIGIN}/api/speakerdeck/embed?url=${encodeURIComponent(url)}`
  )
    .then((response) => {
      if (!response.ok) {
        if (response.status === 400) {
          throw 'URLの形式が異なります。';
        } else {
          throw 'サーバーエラーが発生しました。時間をおいてから再度お試しください。';
        }
      }
      return response.json() as Promise<SpeakerDeckEmbedResponse>;
    })
    .then((data) => {
      view.state.doc.descendants((n, pos) => {
        if (n.type.name === 'speakerDeckEmbed' && n.attrs.tempId === tempId) {
          const node = view.state.schema.nodes.speakerDeckEmbed.create({
            embedId: data.embedId,
            slideIndex: data.slideIndex,
          });
          view.dispatch(
            view.state.tr
              .replaceRangeWith(pos, pos + n.nodeSize, node)
              .setMeta('addToHistory', false)
          );
          return true;
        }
      });
    })
    .catch((error) => {
      deleteTempNode();
      if (typeof error === 'string') {
        console.warn('SpeakerDeck embed error:', error);
      } else {
        console.error('Failed to fetch SpeakerDeck embed:', error);
      }
    });

  return view.state.schema.nodes.speakerDeckEmbed.create({
    loading: true,
    tempId,
  });
}
