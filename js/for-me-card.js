document.addEventListener("DOMContentLoaded", () => {
  const triggers = document.querySelectorAll(".subject-txt");
  const cards = document.querySelectorAll(".for-me-item");

  // показуємо першу картку за замовчуванням
  cards[0].classList.add("active");

  triggers.forEach(trigger => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();

      const targetId = trigger.getAttribute("data-target");

      // ховаємо всі картки
      cards.forEach(card => card.classList.remove("active"));

      // показуємо потрібну з плавним ефектом
      const activeCard = document.getElementById(targetId);
      activeCard.classList.add("active");

      // якщо ширина екрана менше 768px, скролимо до активної картки
      if (window.innerWidth < 768) {
        activeCard.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });
});

