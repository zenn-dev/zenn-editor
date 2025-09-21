import 'zenn-wysiwyg-editor/dist/style.css';

import { useState } from 'react';
import { parseToc } from 'zenn-markdown-html';
import type { TocNode } from 'zenn-model/lib/types';
import { EditorContent, useZennEditor } from 'zenn-wysiwyg-editor';

import { Toc } from './components/toc';
import { usePersistedState } from './hooks/use-persisted-state';
import styles from './app.module.css';

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
  });

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Toc maxDepth={2} toc={toc} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default App;
