import { userEvent } from '@vitest/browser/context';

export async function copyText(text: string) {
  const input = document.createElement('input');
  input.value = text;
  document.body.appendChild(input);

  await userEvent.tripleClick(input);
  await userEvent.copy();

  input.remove(); // クリーンアップ
}
