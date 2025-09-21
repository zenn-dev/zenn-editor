import 'zenn-wysiwyg-editor/dist/style.css';

import { useState } from 'react';
import { parseToc } from 'zenn-markdown-html';
import type { TocNode } from 'zenn-model/lib/types';
import { EditorContent, useZennEditor } from 'zenn-wysiwyg-editor';
import { Toaster } from 'sonner';

import { Toc } from './components/toc';
import { usePersistedState } from './hooks/use-persisted-state';
import styles from './app.module.css';
import FixedMenu from './components/fixed-menu';
import { showToast } from './lib/toast';

function App() {
  const [toc, setToc] = useState<TocNode[]>([]);
  const [persistedContent, setPersistedContent] = usePersistedState<string>({
    cacheKey: 'zenn-editor-content',
    defaultValue: '',
  });

  const editor = useZennEditor({
    initialContent: persistedContent,
    onChange: (html) => {
      setToc(parseToc(html));
      setPersistedContent(html);
    },
    onMessage: (message) => {
      showToast(message.text, message.type);
    },
  });

  return (
    <div className={styles.container}>
      <div className="znc">
        <aside className="msg">
          <span className="msg-symbol">!</span>
          <div className="msg-content">
            <p>情報共有コミュニティ Zenn の WYSIWYG エディターです。</p>
            <p>
              <a
                href="https://zenn.dev/karintou/articles/eabe0354fcc947"
                target="_blank"
                rel="noreferrer"
              >
                使い方はこちら
              </a>
            </p>
          </div>
        </aside>
      </div>

      <FixedMenu editor={editor} className={styles.fixedMenu} />

      <div className={styles.contentWrapper}>
        <div className={styles.content}>
          <Toc maxDepth={2} toc={toc} />
          <EditorContent editor={editor} />
        </div>
      </div>

      <Toaster />
    </div>
  );
}

export default App;
