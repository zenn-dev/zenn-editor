import { userEvent } from '@vitest/browser/context';

export async function setClipboardContent(text: string): Promise<void> {
  const temp = document.createElement('button');
  temp.addEventListener('click', () => {
    navigator.clipboard.writeText(text);
  });
  document.body.appendChild(temp);

  await userEvent.click(temp);

  document.body.removeChild(temp);
  temp.remove();
}

export async function paste(): Promise<void> {
  await userEvent.keyboard('{ControlOrMeta>}{v}{/ControlOrMeta}');
}
