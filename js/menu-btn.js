const menuBtnRef = document.querySelector("[data-menu-btn]");
const menuListRef = document.querySelector(".menu-list");
const menuItemRef = document.querySelectorAll(".menu-item");

function closeMenu() {
  if (!menuBtnRef || !menuListRef) return;

  menuBtnRef.classList.remove("is-open");
  menuListRef.classList.remove("is-open");
  menuBtnRef.setAttribute("aria-expanded", "false");
}

if (menuBtnRef && menuListRef) {
  menuBtnRef.addEventListener("click", () => {
    const isOpen = menuBtnRef.getAttribute("aria-expanded") === "true";

    menuBtnRef.classList.toggle("is-open", !isOpen);
    menuListRef.classList.toggle("is-open", !isOpen);
    menuBtnRef.setAttribute("aria-expanded", String(!isOpen));
  });

  menuItemRef.forEach((menuItem) => {
    menuItem.addEventListener("click", closeMenu);
  });
}
