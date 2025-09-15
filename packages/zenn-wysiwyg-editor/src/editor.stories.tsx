import type { Meta, StoryObj } from '@storybook/react-vite';
import { useZennEditor } from '.';
import EditorContent from './components/editor/editor-content';

type EditorProps = {
  initialContent?: string;
};

function Editor({ initialContent }: EditorProps) {
  const editor = useZennEditor({
    initialContent: initialContent || '',
  });
  return <EditorContent editor={editor} />;
}

const meta = {
  component: Editor,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '760px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Editor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Heading: Story = {
  args: {
    initialContent:
      '<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3><h4>Heading 4</h4>',
  },
};

export const Blockquote: Story = {
  args: {
    initialContent:
      '<blockquote><p>Blockquote content</p><p>Blockquote content</p></blockquote>',
  },
};

export const CodeBlock: Story = {
  args: {
    initialContent: `
    <div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div>
    <pre><code class="language-javascript">console.log("hello");</code></pre></div>
    <div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename">example.ts</span></div>
    <pre><code class="language-diff-python diff-highlight"><span>+ import os</span></code></pre></div>
    `,
  },
};
