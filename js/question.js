// const detailsElements = document.querySelectorAll("details");

// detailsElements.forEach(details => {
//   const content = Array.from(details.children).find(
//     el => el.tagName.toLowerCase() !== "summary"
//   );

//   // Основна логіка розгортання/згортання
//   function toggleContent(open) {
//     if (open) {
//       // закриваємо інші
//       detailsElements.forEach(other => {
//         if (other !== details) other.open = false;
//       });

//       // плавне відкриття
//       content.style.height = content.scrollHeight + "px";
//       content.addEventListener("transitionend", function handler() {
//         content.style.height = "auto";
//         content.removeEventListener("transitionend", handler);
//       });
//     } else {
//       // плавне закриття
//       const currentHeight = content.scrollHeight;
//       content.style.height = currentHeight + "px";
//       requestAnimationFrame(() => {
//         content.style.height = "0px";
//       });
//     }
//   }

//   // toggle при відкритті/закритті summary
//   details.addEventListener("toggle", () => toggleContent(details.open));

//   // додатково: клік всередині контенту теж закриває
//   content.addEventListener("click", () => {
//     if (details.open) {
//       details.open = false; // це запустить "toggle" і анімацію
//     }
//   });
// });

const detailsElements = document.querySelectorAll("details");

detailsElements.forEach(details => {
  const content = Array.from(details.children).find(
    el => el.tagName.toLowerCase() !== "summary"
  );

  // Функція плавного відкриття
  function openContent() {
    // Закриваємо інші
    detailsElements.forEach(other => {
      if (other !== details && other.open) {
        other.open = false;
        collapse(other.querySelector(":scope > *:not(summary)"));
      }
    });

    const startHeight = content.getBoundingClientRect().height;
    const endHeight = content.scrollHeight;

    content.style.height = startHeight + "px";
    requestAnimationFrame(() => {
      content.style.height = endHeight + "px";
    });

    content.addEventListener("transitionend", function handler() {
      if (details.open) content.style.height = "auto"; // щоб текст переносився
      content.removeEventListener("transitionend", handler);
    });
  }

  // Функція плавного закриття
  function collapse(el) {
    const startHeight = el.getBoundingClientRect().height;
    el.style.height = startHeight + "px";

    requestAnimationFrame(() => {
      el.style.height = "0px";
    });
  }

  // Подія toggle
  details.addEventListener("toggle", () => {
    if (details.open) {
      openContent();
    } else {
      collapse(content);
    }
  });

  // Клік по тексту <p> закриває details
  content.addEventListener("click", () => {
    if (details.open) details.open = false;
  });
});
