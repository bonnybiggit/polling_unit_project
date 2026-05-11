const toastContainer = document.getElementById('toastContainer');

export function showToast(message, type = 'info') {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<strong>${type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notice'}</strong>
    <p>${message}</p>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('dismissed');
    toast.remove();
  }, 3800);
}

export function openModal(content) {
  const existing = document.querySelector('.modal-backdrop');
  if (existing) existing.remove();
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <section class="modal-dialog" role="dialog" aria-modal="true">
      ${content}
    </section>
  `;
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeModal();
  });
  document.body.append(backdrop);
}

export function closeModal() {
  const modal = document.querySelector('.modal-backdrop');
  modal?.remove();
}

export function setLoading(element, isLoading, label = 'Loading...') {
  if (!element) return;
  if (isLoading) {
    element.disabled = true;
    element.dataset.originalText = element.textContent;
    element.textContent = `${label}`;
  } else {
    element.disabled = false;
    element.textContent = element.dataset.originalText || element.textContent;
  }
}

export function setThemePreference(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('pollingunit-theme', theme);
}

export function getThemePreference() {
  return localStorage.getItem('pollingunit-theme') || 'light';
}

export function setSession(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

export function getSession(key) {
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession(key) {
  sessionStorage.removeItem(key);
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}
