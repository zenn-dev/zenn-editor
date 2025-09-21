import { toast } from 'sonner';

export function showToast(message: string, type: 'info' | 'alert' = 'info') {
  toast(
    <aside
      className={`msg ${type === 'alert' ? 'alert' : ''}`}
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
        background:
          type === 'alert' ? 'var(--c-bg-alert)' : 'var(--c-bg-warning)',
        padding: 0,
      },
    }
  );
}
