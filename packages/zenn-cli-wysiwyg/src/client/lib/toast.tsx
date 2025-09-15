import { toast } from 'sonner';

export function showToast(message: string, type: 'info' | 'error' = 'info') {
  toast(
    <aside
      className={`msg ${type === 'error' ? 'alert' : ''}`}
      style={{ margin: 0 }} // zenn-content-css のマージンをリセット
    >
      <span className="msg-symbol">!</span>
      <div className="msg-content">
        <p>{message}</p>
      </div>
    </aside>,
    {
      position: 'bottom-center',
      duration: 5000,
      className: 'znc',
      style: {
        background: 'var(--c-bg-alert)',
        padding: 0,
      },
    }
  );
}
