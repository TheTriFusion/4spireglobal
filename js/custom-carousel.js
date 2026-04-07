const carouselSlides = [
  {
    img: "images/Banner-1.jpg",
    title: "Innovative Technology",
    desc: "Powerful Results",
    // btn1: 'Explore Our Catalog',
    // btn2: 'Request a Quote',
  },
  {
    img: "images/Banner-2.jpg",
    title: "Reliable IT Solutions",
    desc: "For Modern Business",
    // btn1: 'View Solutions',
    // btn2: 'Get a Quote',
  },
  {
    img: "images/Banner-3.png",
    title: "Accelerate Your Business",
    desc: "With Smart Technology",
    // btn1: 'Learn More',
    // btn2: 'Get Started',
  },
  {
    img: "images/Banner-4.jpg",
    title: "Future-Ready Technology",
    desc: "For Ambitious Brands",
    // btn1: 'Discover More',
    // btn2: 'Join Us',
  },
  {
    img: "images/Banner-5.jpg",
    title: "4spire Global — We don’t promise growth",
    desc: "We deliver it",
    // btn1: 'Discover More',
    // btn2: 'Join Us',
  },
];

let currentSlide = 0;
let progress = 0;
const duration = 4000;
let intervalId = null;

function renderCarousel() {
  const slide = carouselSlides[currentSlide];
  document.querySelector(".custom-carousel-img").src = slide.img;
  // Animate title and desc
  const titleEl = document.querySelector(".custom-carousel-title");
  const descEl = document.querySelector(".custom-carousel-desc");
  titleEl.classList.remove("animate-top");
  descEl.classList.remove("animate-bottom");
  // Force reflow for restart animation
  void titleEl.offsetWidth;
  void descEl.offsetWidth;
  titleEl.textContent = slide.title;
  descEl.textContent = slide.desc;
  titleEl.classList.add("animate-top");
  descEl.classList.add("animate-bottom");
  //   document.querySelector('.custom-carousel-btn1').textContent = slide.btn1;
  //   document.querySelector('.custom-carousel-btn2').textContent = slide.btn2;
}

function updateProgressBar() {
  const bar = document.querySelector(".custom-carousel-progress");
  bar.style.width = `${progress}%`;
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % carouselSlides.length;
  renderCarousel();
  progress = 0;
  updateProgressBar();
}

function startCarousel() {
  renderCarousel();
  progress = 0;
  updateProgressBar();
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    progress += 100 / (duration / 100);
    if (progress >= 100) {
      nextSlide();
    } else {
      updateProgressBar();
    }
  }, 100);
}

document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".custom-carousel-section")) {
    startCarousel();
  }
});
