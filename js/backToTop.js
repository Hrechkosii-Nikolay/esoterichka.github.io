const button = document.querySelector(".back-to-top");
let viewportHeight = window.innerHeight;
let scrollFrame = null;

if (button) {
  button.addEventListener("click", goTop);
  window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
  window.addEventListener("resize", updateViewportHeight, { passive: true });
  updateButtonVisibility();
}

function scheduleScrollUpdate() {
  if (scrollFrame !== null) return;

  scrollFrame = window.requestAnimationFrame(() => {
    updateButtonVisibility();
    scrollFrame = null;
  });
}

function updateViewportHeight() {
  viewportHeight = window.innerHeight;
  scheduleScrollUpdate();
}

function updateButtonVisibility() {
  button.classList.toggle("back-to-top--show", window.scrollY > viewportHeight);
}

function goTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}
