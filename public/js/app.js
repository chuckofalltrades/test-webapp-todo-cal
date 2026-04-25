// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.warn('SW registration failed:', err);
    });
  });
}

// Tag checkbox interactive toggling
document.addEventListener('DOMContentLoaded', () => {
  const tagCheckboxes = document.querySelectorAll('.tag-checkbox-input');
  tagCheckboxes.forEach(checkbox => {
    const label = checkbox.closest('.tag-checkbox-label');
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        label.classList.add('selected');
      } else {
        label.classList.remove('selected');
      }
    });
  });
});
