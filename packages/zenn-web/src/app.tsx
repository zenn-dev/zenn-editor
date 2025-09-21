import 'zenn-wysiwyg-editor/dist/style.css';

import { EditorContent, useZennEditor } from 'zenn-wysiwyg-editor';

import styles from './app.module.css';

function App() {
  const editor = useZennEditor({
    initialContent: '',
  });

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default App;
