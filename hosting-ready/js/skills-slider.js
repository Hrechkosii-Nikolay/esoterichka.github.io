document.addEventListener("DOMContentLoaded", () => {
  const skillsList = document.querySelector(".skills-list");
  const skillsItems = Array.from(document.querySelectorAll(".skills-item"));
  const nextButton = document.querySelector(".next");
  const prevButton = document.querySelector(".prev");

  if (!skillsList || !skillsItems.length || !nextButton || !prevButton) return;

  let itemsPerPage = getItemsPerPage();
  let pagesCount = Math.ceil(skillsItems.length / itemsPerPage);
  let currentPage = 0;
  let pages = [];

  function getItemsPerPage() {
    return window.innerWidth < 768 ? 4 : 8;
  }

  function buildPages() {
    const fragment = document.createDocumentFragment();
    pages = [];

    for (let pageIndex = 0; pageIndex < pagesCount; pageIndex += 1) {
      const page = document.createElement("li");
      const pageItems = skillsItems.slice(
        pageIndex * itemsPerPage,
        (pageIndex + 1) * itemsPerPage
      );

      page.classList.add("skills-page");
      pageItems.forEach((item) => page.appendChild(item.cloneNode(true)));

      Object.assign(page.style, {
        display: pageIndex === currentPage ? "flex" : "none",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: pageIndex === pagesCount - 1 ? "flex-start" : "center",
        minWidth: "100%",
      });

      pages.push(page);
      fragment.appendChild(page);
    }

    requestAnimationFrame(() => {
      skillsList.innerHTML = "";
      skillsList.style.display = "flex";
      skillsList.style.transition = "transform 0.3s ease";
      skillsList.appendChild(fragment);
    });
  }

  function showCurrentPage() {
    requestAnimationFrame(() => {
      pages.forEach((page, index) => {
        page.style.display = index === currentPage ? "flex" : "none";
      });
    });
  }

  nextButton.addEventListener("click", () => {
    currentPage = (currentPage + 1) % pagesCount;
    showCurrentPage();
  });

  prevButton.addEventListener("click", () => {
    currentPage = (currentPage - 1 + pagesCount) % pagesCount;
    showCurrentPage();
  });

  buildPages();
  showCurrentPage();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const nextItemsPerPage = getItemsPerPage();

      if (nextItemsPerPage === itemsPerPage) return;

      itemsPerPage = nextItemsPerPage;
      pagesCount = Math.ceil(skillsItems.length / itemsPerPage);
      currentPage = 0;
      buildPages();
      showCurrentPage();
    }, 200);
  });
});
