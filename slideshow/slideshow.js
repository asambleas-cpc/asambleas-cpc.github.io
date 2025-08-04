let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const slideCount = slides.length;
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.querySelector('.progress-bar');
let slideInterval;

function showSlide(n) {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[n].classList.add('active');
    updateProgressBar();
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slideCount;
    showSlide(currentSlide);
    resetSlideInterval();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slideCount) % slideCount;
    showSlide(currentSlide);
    resetSlideInterval();
}

function updateProgressBar() {
    const progress = ((currentSlide + 1) / slideCount) * 100;
    progressBar.style.width = `${progress}%`;
}

function resetSlideInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
}

prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);

resetSlideInterval();
showSlide(currentSlide);
