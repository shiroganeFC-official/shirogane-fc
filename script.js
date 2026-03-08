const menuBtn = document.getElementById('mobile-menu-btn');
const navLeft = document.querySelector('.nav-left');
const navRight = document.querySelector('.nav-right');

menuBtn.addEventListener('click', () => {
    navLeft.classList.toggle('active');
    navRight.classList.toggle('active');
    menuBtn.classList.toggle('open');
});


//for parents section
// スクロール時のフェードインアニメーション
document.addEventListener("DOMContentLoaded", function() {
    const fadeElements = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active'); // 画面に入ったら'active'クラスを追加
                observer.unobserve(entry.target); // 一度表示したら監視を止める
            }
        });
    }, {
        threshold: 0.1 // 10%見えたら実行
    });

    fadeElements.forEach(el => {
        observer.observe(el);
    });
});