const button = document.querySelector(".back-to-top");

if (button) {
  button.addEventListener("click", goTop);
  window.addEventListener("scroll", trackScroll, { passive: true });
  trackScroll();
}

function trackScroll() {
  const viewportHeight = document.documentElement.clientHeight;

  button.classList.toggle("back-to-top--show", window.scrollY > viewportHeight);
}

function goTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}
