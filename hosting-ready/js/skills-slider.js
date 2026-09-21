function initCertificatesMarquee() {
  const slider = document.querySelector(".skills-slider");
  const wrapper = document.querySelector(".skills-wrapper");
  const list = document.querySelector(".skills-list");
  const originalItems = Array.from(list?.querySelectorAll(".skills-item") || []);

  if (!slider || !wrapper || !list || !originalItems.length || list.dataset.marqueeReady) return;
  list.dataset.marqueeReady = "true";

  slider.querySelectorAll(".slider-btn").forEach((button) => {
    button.hidden = true;
  });

  const fragment = document.createDocumentFragment();
  originalItems.forEach((item) => fragment.appendChild(item.cloneNode(true)));
  list.appendChild(fragment);
  list.classList.add("skills-marquee");

  const lightbox = document.createElement("div");
  lightbox.className = "certificate-lightbox";
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.innerHTML = `
    <div class="certificate-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Перегляд сертифіката">
      <button class="certificate-lightbox-close" type="button" aria-label="Закрити">×</button>
      <img class="certificate-lightbox-image" width="640" height="453" alt="" />
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector(".certificate-lightbox-image");
  const closeButton = lightbox.querySelector(".certificate-lightbox-close");
  let isPaused = false;
  let offset = 0;
  let previousTime = performance.now();
  let loopPoint = 0;

  function measureLoopPoint() {
    loopPoint = list.children[originalItems.length].offsetLeft - list.children[0].offsetLeft;
  }

  function getLargestImageSource(image) {
    const candidates = image.srcset
      .split(",")
      .map((candidate) => candidate.trim().split(/\s+/))
      .map(([src, width]) => ({ src, width: Number.parseInt(width, 10) || 0 }))
      .sort((a, b) => b.width - a.width);

    return candidates[0]?.src || image.currentSrc || image.src;
  }

  function openCertificate(image) {
    isPaused = true;
    lightboxImage.src = getLargestImageSource(image);
    lightboxImage.alt = image.alt;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("body-no-scroll");
    closeButton.focus();
  }

  function closeCertificate() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("body-no-scroll");
    isPaused = false;
    previousTime = performance.now();
  }

  list.querySelectorAll(".skills-item").forEach((item) => {
    const image = item.querySelector("img");
    if (!image) return;

    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-label", `Відкрити: ${image.alt || "сертифікат"}`);
    item.addEventListener("click", () => openCertificate(image));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openCertificate(image);
      }
    });
  });

  closeButton.addEventListener("click", closeCertificate);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeCertificate();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeCertificate();
    }
  });

  function animate(currentTime) {
    const elapsed = Math.min(currentTime - previousTime, 40);
    previousTime = currentTime;

    if (!isPaused) {
      offset += elapsed * 0.035;
      if (loopPoint > 0 && offset >= loopPoint) offset %= loopPoint;
      list.style.transform = `translate3d(${-offset}px, 0, 0)`;
    }

    requestAnimationFrame(animate);
  }

  const resizeObserver = new ResizeObserver(measureLoopPoint);
  resizeObserver.observe(wrapper);
  measureLoopPoint();
  requestAnimationFrame(animate);
}

function initMarqueeWhenVisible() {
  const slider = document.querySelector(".skills-slider");
  if (!slider) return;

  if (!("IntersectionObserver" in window)) {
    initCertificatesMarquee();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    observer.disconnect();
    initCertificatesMarquee();
  }, { rootMargin: "300px" });
  observer.observe(slider);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMarqueeWhenVisible, { once: true });
} else {
  initMarqueeWhenVisible();
}
