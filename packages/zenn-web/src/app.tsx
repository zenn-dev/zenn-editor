import 'zenn-wysiwyg-editor/dist/style.css';

import { EditorContent, useZennEditor } from 'zenn-wysiwyg-editor';
import { Toc } from './components/toc';

import styles from './app.module.css';

function App() {
  const editor = useZennEditor({
    initialContent: '',
  });

  // サンプルのToC data
  const sampleToc = [
    {
      id: 'section1',
      text: 'はじめに',
      children: [
        { id: 'subsection1-1', text: '概要', children: [] },
        { id: 'subsection1-2', text: '使い方', children: [] },
      ],
    },
    {
      id: 'section2',
      text: '詳細',
      children: [{ id: 'subsection2-1', text: '仕様', children: [] }],
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {sampleToc && sampleToc.length > 0 && (
          <Toc maxDepth={2} toc={sampleToc} />
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default App;
