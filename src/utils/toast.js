export function showToast(message) {
  // 1. Find or create the toast container
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  // 2. Create the toast element
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  // 3. Add it to the screen
  container.appendChild(toast);

  // 4. Remove it after 3 seconds
  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
}