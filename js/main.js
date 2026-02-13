// Main JavaScript for Tuition Platform

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.querySelector('i').classList.toggle('fa-bars');
            this.querySelector('i').classList.toggle('fa-times');
        });
    }
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileMenuBtn.querySelector('i').classList.remove('fa-times');
                mobileMenuBtn.querySelector('i').classList.add('fa-bars');
            }
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') return;
            
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Set current year in footer
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = currentYear;
    }

    function goBack() {
        window.history.back();
    }
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
    });
    
    // Testimonial slider (simple version)
    let testimonialIndex = 0;
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    
    if (testimonialCards.length > 0) {
        // Initially show all on desktop, implement sliding on mobile
        function updateTestimonialDisplay() {
            if (window.innerWidth <= 768) {
                testimonialCards.forEach((card, index) => {
                    card.style.display = index === testimonialIndex ? 'block' : 'none';
                });
            } else {
                testimonialCards.forEach(card => {
                    card.style.display = 'block';
                });
            }
        }
        
        // Auto rotate testimonials on mobile
        function rotateTestimonials() {
            if (window.innerWidth <= 768) {
                testimonialIndex = (testimonialIndex + 1) % testimonialCards.length;
                updateTestimonialDisplay();
            }
        }
        
        // Initialize
        updateTestimonialDisplay();
        
        // Update on resize
        window.addEventListener('resize', updateTestimonialDisplay);
        
        // Auto rotate every 5 seconds on mobile
        setInterval(rotateTestimonials, 5000);
    }
    
    // Video fallback for mobile
    const heroVideo = document.getElementById('heroVideo');
    if (heroVideo) {
        // Check if mobile and autoplay is not supported
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // For mobile, we could use a poster image instead
            // But for now, just ensure video plays inline
            heroVideo.setAttribute('playsinline', '');
            heroVideo.setAttribute('muted', '');
        }
    }

});
