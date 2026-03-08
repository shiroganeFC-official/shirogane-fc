const menuBtn = document.getElementById('mobile-menu-btn');
const navLeft = document.querySelector('.nav-left');
const navRight = document.querySelector('.nav-right');

menuBtn.addEventListener('click', () => {
    navLeft.classList.toggle('active');
    navRight.classList.toggle('active');
    menuBtn.classList.toggle('open');
});