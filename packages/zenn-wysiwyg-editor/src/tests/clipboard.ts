import { userEvent } from '@vitest/browser/context';
import { wait } from './utils';

export async function setClipboardContent(text: string): Promise<void> {
  const temp = document.createElement('textarea');
  temp.value = text;
  document.body.appendChild(temp);

  await userEvent.click(temp);
  await userEvent.keyboard('{ControlOrMeta>}{a}{/ControlOrMeta}');
  await wait(100);
  await userEvent.keyboard('{ControlOrMeta>}{c}{/ControlOrMeta}');
  await wait(100);

  temp.remove();
}

export async function paste(): Promise<void> {
  await userEvent.keyboard('{ControlOrMeta>}{v}{/ControlOrMeta}');
  await wait(100);
}
