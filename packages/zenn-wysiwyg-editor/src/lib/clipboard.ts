export function isProseMirrorPaste(event: ClipboardEvent) {
  const html = event.clipboardData?.getData('text/html') ?? '';
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  return !!wrapper.querySelector('[data-pm-slice]');
}
