function initForMeCards() {
  const tabs = document.querySelectorAll(".subject-txt");
  const cards = document.querySelectorAll(".for-me-item");

  if (!tabs.length || !cards.length) return;

  cards[0].classList.add("active");
  cards.forEach((card, index) => {
    card.setAttribute("aria-hidden", index === 0 ? "false" : "true");
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.getAttribute("data-target");
      const targetCard = document.getElementById(targetId);

      if (!targetCard) return;

      tabs.forEach((item) => item.setAttribute("aria-pressed", "false"));
      tab.setAttribute("aria-pressed", "true");

      cards.forEach((card) => {
        card.classList.remove("active");
        card.setAttribute("aria-hidden", "true");
      });

      targetCard.classList.add("active");
      targetCard.setAttribute("aria-hidden", "false");

      if (window.innerWidth < 768) {
        targetCard.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initForMeCards, { once: true });
} else {
  initForMeCards();
}
