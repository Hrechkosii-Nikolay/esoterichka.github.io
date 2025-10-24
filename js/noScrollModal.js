const backdrop = document.querySelector('[data-backdrop]');
const openBtns = document.querySelectorAll('[data-open-modal]');
const closeBtn = backdrop.querySelector('[data-close-modal]');

// Відкрити модалку
openBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    backdrop.classList.add('is-open');
    document.body.classList.add('body-no-scroll');
  });
});

// Закрити модалку
closeBtn.addEventListener('click', closeModal);
backdrop.addEventListener('click', (e) => {
  if (e.target === backdrop) closeModal(); // клік по затемненню
});

function closeModal() {
  backdrop.classList.remove('is-open');
  document.body.classList.remove('body-no-scroll');
}
