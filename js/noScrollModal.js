const backdrop = document.querySelector("[data-backdrop]");
const openBtns = document.querySelectorAll("[data-open-modal]");
const closeBtn = document.querySelector("[data-close-modal]");
let lastFocusedElement = null;

function getFocusableElements() {
  if (!backdrop) return [];

  return Array.from(
    backdrop.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
}

function openModal() {
  if (!backdrop) return;

  lastFocusedElement = document.activeElement;
  backdrop.classList.add("is-open");
  backdrop.classList.remove("is-close");
  backdrop.setAttribute("aria-hidden", "false");
  document.body.classList.add("body-no-scroll");

  const focusableElements = getFocusableElements();
  if (focusableElements.length) {
    focusableElements[0].focus();
  }
}

function closeModal() {
  if (!backdrop) return;

  backdrop.classList.remove("is-open");
  backdrop.classList.add("is-close");
  backdrop.setAttribute("aria-hidden", "true");
  document.body.classList.remove("body-no-scroll");

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

function keepFocusInsideModal(event) {
  if (!backdrop || !backdrop.classList.contains("is-open") || event.key !== "Tab") {
    return;
  }

  const focusableElements = getFocusableElements();
  if (!focusableElements.length) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  }

  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

openBtns.forEach((openBtn) => {
  openBtn.addEventListener("click", openModal);
});

if (closeBtn) {
  closeBtn.addEventListener("click", closeModal);
}

if (backdrop) {
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) closeModal();
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
  keepFocusInsideModal(event);
});
