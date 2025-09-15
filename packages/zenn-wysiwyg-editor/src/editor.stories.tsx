import type { Meta, StoryObj } from '@storybook/react-vite';
import { useZennEditor } from '.';
import EditorContent from './components/editor/editor-content';

function Editor() {
  const editor = useZennEditor({
    initialContent: '',
  });
  return <EditorContent editor={editor} />;
}

const meta = {
  component: Editor,
} satisfies Meta<typeof Editor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    primary: true,
    label: 'Editor',
  },
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
};
