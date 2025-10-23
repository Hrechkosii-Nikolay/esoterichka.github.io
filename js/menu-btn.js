const menuBtnRef = document.querySelector('[data-menu-btn]');
const menuListRef = document.querySelector('.menu-list');
const menuItemRef = document.querySelectorAll('.menu-item');

menuBtnRef.addEventListener('click', ()=>{
  const expanded = menuBtnRef.getAttribute('aria-expanded') === 'true' || false;
  menuBtnRef.classList.toggle('is-open');
  menuListRef.classList.toggle('is-open');
  menuBtnRef.setAttribute('aria-expanded', !expanded);
});


menuItemRef.forEach(item => {
  item.addEventListener('click', event => {
    menuListRef.classList.toggle('is-open');
  menuBtnRef.classList.toggle('is-open');
   
  });
});