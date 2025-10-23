const button = document.querySelector('.back-to-top');

button.addEventListener('click', goTop);
window.addEventListener('scroll', trackScroll)

function trackScroll(){
  const coords = document.documentElement.clientHeight;
  const offSet = window.scrollY;

  if (offSet > coords){
    button.classList.add('back-to-top--show');
  } else {
    button.classList.remove('back-to-top--show');
  }
}

function goTop() {
  if( window.scrollY > 0){
    window.scrollBy(0, -55);

    setTimeout(goTop, 0); 
  }
}