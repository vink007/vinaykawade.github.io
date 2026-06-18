/**
 * Main JavaScript file for Vinay Kawade's Blog
 * Handles navigation, animations, and interactive elements
 */

document.addEventListener('DOMContentLoaded', function() {
  // Mobile navigation toggle
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  if (navToggle) {
    navToggle.addEventListener('click', function() {
      mainNav.classList.toggle('open');
      
      // Animate hamburger icon
      const spans = this.querySelectorAll('span');
      spans.forEach(span => span.classList.toggle('active'));
    });
  }
  
  // Highlight active navigation item based on current page
  const currentPage = window.location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('.main-nav a');
  
  navLinks.forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage || 
        (currentPage === '' && linkPage === 'index.html') || 
        (currentPage === '/' && linkPage === 'index.html')) {
      link.classList.add('active');
    }
  });
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Offset for fixed header
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Lazy load images
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers without IntersectionObserver support
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
  
  // Add animation classes to elements as they scroll into view
  if ('IntersectionObserver' in window) {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const animationObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          animationObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });
    
    animatedElements.forEach(element => {
      animationObserver.observe(element);
    });
  }
  
  // Lightbox / showcase mode for gallery images
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'))
    .filter(item => item.querySelector('img'));
  const galleryImages = galleryItems.map(item => item.querySelector('img'));

  if (galleryImages.length) {
    // Build the overlay once
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.innerHTML =
      '<button class="lightbox-btn lightbox-close" aria-label="Close showcase"><i class="fas fa-times"></i></button>' +
      '<button class="lightbox-btn lightbox-prev" aria-label="Previous image"><i class="fas fa-chevron-left"></i></button>' +
      '<button class="lightbox-btn lightbox-next" aria-label="Next image"><i class="fas fa-chevron-right"></i></button>' +
      '<figure class="lightbox-figure">' +
      '<img class="lightbox-img" src="" alt="">' +
      '<figcaption class="lightbox-caption"></figcaption>' +
      '</figure>' +
      '<div class="lightbox-counter"></div>';
    document.body.appendChild(lightbox);

    const figure = lightbox.querySelector('.lightbox-figure');
    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const lightboxCounter = lightbox.querySelector('.lightbox-counter');
    let currentIndex = 0;

    function captionFor(img) {
      const item = img.closest('.gallery-item');
      const cap = item && item.querySelector('.caption');
      return cap ? cap.textContent.trim() : (img.getAttribute('alt') || '');
    }

    function showImage(index) {
      currentIndex = (index + galleryImages.length) % galleryImages.length;
      const source = galleryImages[currentIndex];
      figure.classList.add('loading');
      const loader = new Image();
      loader.onload = function() {
        lightboxImg.src = source.src;
        lightboxImg.alt = source.alt || '';
        figure.classList.remove('loading');
      };
      loader.src = source.src;
      lightboxCaption.textContent = captionFor(source);
      lightboxCounter.textContent = (currentIndex + 1) + ' / ' + galleryImages.length;
    }

    function openLightbox(index) {
      showImage(index);
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => openLightbox(index));
    });

    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showImage(currentIndex - 1));
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => showImage(currentIndex + 1));

    // Click on the backdrop (but not the image or buttons) closes it
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target === figure) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
      else if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    });

    // Touch swipe support
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(dx) > 50) showImage(currentIndex + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  // Back to top button
  const backToTopButton = document.querySelector('.back-to-top');
  
  if (backToTopButton) {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.add('show');
      } else {
        backToTopButton.classList.remove('show');
      }
    });
    
    backToTopButton.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});