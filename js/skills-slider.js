// document.addEventListener("DOMContentLoaded", () => {
//   const sliderList = document.querySelector(".skills-list");
//   const items = Array.from(document.querySelectorAll(".skills-item"));
//   const nextBtn = document.querySelector(".next");
//   const prevBtn = document.querySelector(".prev");

//   function getItemsPerPage() {
//     return window.innerWidth < 768 ? 4 : 8; // 2x2 для мобільних, 4x2 для десктопа
//   }

//   let itemsPerPage = getItemsPerPage();
//   let totalPages = Math.ceil(items.length / itemsPerPage);
//   let currentPage = 0;

//   function createPages() {
//     const pages = [];

//     for (let i = 0; i < totalPages; i++) {
//       const page = document.createElement("li");
//       page.classList.add("skills-page");

//       const slice = items.slice(i * itemsPerPage, (i + 1) * itemsPerPage);
//       slice.forEach(item => page.appendChild(item));

//       // робимо сітку для кожної сторінки
//       page.style.display = "flex";
//       page.style.flexWrap = "wrap";
//       page.style.justifyContent = "center";

//       // 🔧 головна зміна — для останньої сторінки
//       // замість align-items: center → align-items: flex-start
//       if (i === totalPages - 1) {
//         page.style.alignItems = "flex-start";
//       } else {
//         page.style.alignItems = "center";
//       }

//       pages.push(page);
//     }

//     sliderList.innerHTML = "";
//     pages.forEach(page => sliderList.appendChild(page));
//   }

//   function updateSlider() {
//     sliderList.style.transform = `translateX(-${currentPage * 100}%)`;
//   }

//   nextBtn.addEventListener("click", () => {
//     currentPage = (currentPage + 1) % totalPages;
//     updateSlider();
//   });

//   prevBtn.addEventListener("click", () => {
//     currentPage = (currentPage - 1 + totalPages) % totalPages;
//     updateSlider();
//   });

//   createPages();
//   updateSlider();

//   window.addEventListener("resize", () => {
//     const newItemsPerPage = getItemsPerPage();
//     if (newItemsPerPage !== itemsPerPage) {
//       itemsPerPage = newItemsPerPage;
//       totalPages = Math.ceil(items.length / itemsPerPage);
//       currentPage = 0;
//       createPages();
//       updateSlider();
//     }
//   });
// });
document.addEventListener("DOMContentLoaded", () => {
  const sliderList = document.querySelector(".skills-list");
  const items = Array.from(document.querySelectorAll(".skills-item"));
  const nextBtn = document.querySelector(".next");
  const prevBtn = document.querySelector(".prev");

  let itemsPerPage = getItemsPerPage();
  let totalPages = Math.ceil(items.length / itemsPerPage);
  let currentPage = 0;
  let pages = [];

  function getItemsPerPage() {
    return window.innerWidth < 768 ? 4 : 8; // 2x2 для мобільних, 4x2 для десктопа
  }

  function createPages() {
    const fragment = document.createDocumentFragment();
    pages = [];

    for (let i = 0; i < totalPages; i++) {
      const page = document.createElement("li");
      page.classList.add("skills-page");

      const slice = items.slice(i * itemsPerPage, (i + 1) * itemsPerPage);
      slice.forEach(item => page.appendChild(item));

      page.style.display = "flex";
      page.style.flexWrap = "wrap";
      page.style.justifyContent = "center";
      page.style.alignItems = i === totalPages - 1 ? "flex-start" : "center";

      // спочатку ховаємо всі сторінки
      page.style.minWidth = "100%";
      page.style.transition = "transform 0.3s ease";

      pages.push(page);
      fragment.appendChild(page);
    }

    sliderList.innerHTML = "";
    sliderList.style.display = "flex";
    sliderList.style.transition = "transform 0.3s ease";
    sliderList.appendChild(fragment);
  }

  function updateSlider() {
    sliderList.style.transform = `translateX(-${currentPage * 100}%)`;
  }

  nextBtn.addEventListener("click", () => {
    currentPage = (currentPage + 1) % totalPages;
    updateSlider();
  });

  prevBtn.addEventListener("click", () => {
    currentPage = (currentPage - 1 + totalPages) % totalPages;
    updateSlider();
  });

  // Ініціалізація
  createPages();
  updateSlider();

  window.addEventListener("resize", () => {
    const newItemsPerPage = getItemsPerPage();
    if (newItemsPerPage !== itemsPerPage) {
      itemsPerPage = newItemsPerPage;
      totalPages = Math.ceil(items.length / itemsPerPage);
      currentPage = 0;
      createPages();
      updateSlider();
    }
  });
});
