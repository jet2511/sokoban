export class RetroToast {
  public static show(
    message: string,
    type: 'success' | 'warning' | 'error' | 'info' = 'success',
    durationMs: number = 2500
  ): void {
    const container = document.getElementById('toast-container');
    if (!container) return;

    container.classList.remove('hidden');

    const badge = document.createElement('div');
    badge.className = `toast-badge toast-${type}`;
    badge.innerText = message;

    container.appendChild(badge);

    setTimeout(() => {
      badge.style.transition = 'opacity 0.3s ease';
      badge.style.opacity = '0';
      setTimeout(() => {
        badge.remove();
        if (container.childElementCount === 0) {
          container.classList.add('hidden');
        }
      }, 300);
    }, durationMs);
  }
}
