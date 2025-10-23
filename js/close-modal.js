const openModalBtns = document.querySelectorAll('[data-open-modal]');
const closeModalBtn = document.querySelector('[data-close-modal]');
const backdrop = document.querySelector('[data-backdrop]');

openModalBtns.forEach(openModalBtn =>{
  openModalBtn.addEventListener('click', toggleModal);
})
closeModalBtn.addEventListener('click', toggleModal);

function toggleModal(){
backdrop.classList.toggle('is-close')
}