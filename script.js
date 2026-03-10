// Instituto do Lago - Premium Interactive Scripts

document.addEventListener('DOMContentLoaded', () => {

    // === Loading Screen ===
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hidden');
            document.body.style.overflow = '';
            initHeroAnimations();
        }, 1400);
    });

    // === Custom Cursor ===
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    if (window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });

        function animateFollower() {
            followerX += (mouseX - followerX) * 0.12;
            followerY += (mouseY - followerY) * 0.12;
            follower.style.left = followerX + 'px';
            follower.style.top = followerY + 'px';
            requestAnimationFrame(animateFollower);
        }
        animateFollower();

        const hoverTargets = document.querySelectorAll('a, button, .btn, .service-card, .team-card, .magnetic, .accordion-header');
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
                follower.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
                follower.classList.remove('hover');
            });
        });
    }

    // === Progress Bar (Topo) ===
    const progressBarTop = document.getElementById('progressBar');
    function updateProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        if (progressBarTop) progressBarTop.style.width = progress + '%';
    }

    // === Navigation & Scroll ===
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
        updateProgress();
    }, { passive: true });

    navToggle?.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
                navToggle?.classList.remove('active');
                navMenu?.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // === Scroll Animations & Counters ===
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-animate]').forEach(el => scrollObserver.observe(el));
    // === Counter Animation (Lógica para os Números) ===
    const counters = document.querySelectorAll('[data-count]');

    const counterObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                // Ativa a animação assim que 10% do número entra no ecrã
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.count);
                    const suffix = el.dataset.suffix || '';
                    const duration = 2000; // Tempo da animação (2 segundos)
                    const start = performance.now();

                    function updateCounter(now) {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        
                        // Efeito de suavização
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = Math.round(eased * target);
                        
                        el.textContent = current + suffix;

                        if (progress < 1) {
                            requestAnimationFrame(updateCounter);
                        }
                    }
                    
                    requestAnimationFrame(updateCounter);
                    counterObserver.unobserve(el); // Anima apenas uma vez
                }
            });
        },
        { 
            threshold: 0.1, // Começa a contar mais cedo para garantir que funciona
            rootMargin: '0px 0px -50px 0px' 
        }
    );

    counters.forEach(el => counterObserver.observe(el));

    // === Accordion para Normas do Estúdio ===
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    // === Gallery Carousel (A tua versão atualizada) ===
    (function initGalleryCarousel() {
        const track       = document.getElementById('galleryTrack');
        const slides      = track ? track.querySelectorAll('.gallery-carousel__slide') : [];
        const dots        = document.querySelectorAll('.gallery-carousel__dot');
        const prevBtn      = document.getElementById('galleryPrev');
        const nextBtn      = document.getElementById('galleryNext');
        const counter      = document.getElementById('galleryCurrentSlide');
        const wrapper      = track ? track.closest('.gallery-carousel__track-wrapper') : null;

        if (!track || slides.length === 0) return;

        const TOTAL        = slides.length;
        const AUTOPLAY_MS  = 5000;
        let current        = 0;
        let autoplayTimer  = null;
        let isPaused       = false;

        const progressBar = document.createElement('div');
        progressBar.className = 'gallery-carousel__progress';
        wrapper.appendChild(progressBar);

        function goTo(index, userTriggered = false) {
            slides[current].classList.remove('is-active');
            dots[current].classList.remove('active');
            dots[current].setAttribute('aria-selected', 'false');

            current = (index + TOTAL) % TOTAL;
            track.style.transform = `translateX(-${current * 100}%)`;

            slides[current].classList.add('is-active');
            dots[current].classList.add('active');
            dots[current].setAttribute('aria-selected', 'true');

            if (counter) counter.textContent = current + 1;
            resetProgress();

            if (userTriggered) {
                clearTimeout(autoplayTimer);
                scheduleNext();
            }
        }

        function resetProgress() {
            progressBar.classList.remove('animating');
            void progressBar.offsetWidth;
            if (!isPaused) progressBar.classList.add('animating');
        }

        function scheduleNext() {
            if (isPaused) return;
            clearTimeout(autoplayTimer);
            autoplayTimer = setTimeout(() => goTo(current + 1), AUTOPLAY_MS);
        }

        slides[current].classList.add('is-active');
        if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1, true));
        if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1, true));

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const idx = parseInt(dot.dataset.index, 10);
                if (idx !== current) goTo(idx, true);
            });
        });

        const section = track.closest('.gallery-carousel');
        if (section) {
            section.addEventListener('mouseenter', () => {
                isPaused = true;
                clearTimeout(autoplayTimer);
                progressBar.classList.remove('animating');
                progressBar.style.width = '0%';
            });
            section.addEventListener('mouseleave', () => {
                isPaused = false;
                scheduleNext();
                resetProgress();
            });
        }

        // Swipe Mobile
        let touchStartX = 0;
        track.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        track.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1, true);
        }, { passive: true });

        // Teclas de seta
        document.addEventListener('keydown', e => {
            if (!section) return;
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                if (e.key === 'ArrowLeft')  goTo(current - 1, true);
                if (e.key === 'ArrowRight') goTo(current + 1, true);
            }
        });

        scheduleNext();
        resetProgress();
    })();

    // === Hero Animations ===
    function initHeroAnimations() {
        document.querySelectorAll('[data-animate="hero"], [data-animate="split-text"]').forEach(el => {
            const delay = parseFloat(el.dataset.delay || 0) * 1000;
            setTimeout(() => el.classList.add('visible'), delay);
        });
    }

    // === RGPD Logic ===
    const cookieBanner = document.getElementById('cookieBanner');
    const privacyModal = document.getElementById('privacyModal');

    if (!localStorage.getItem('cookieConsent')) {
        setTimeout(() => cookieBanner?.classList.add('visible'), 2000);
    }

    document.getElementById('cookieAccept')?.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        cookieBanner.classList.remove('visible');
    });

    document.getElementById('openPrivacy')?.addEventListener('click', () => privacyModal.classList.add('active'));
    document.getElementById('closePrivacy')?.addEventListener('click', () => privacyModal.classList.remove('active'));
// === Footer Normas Toggle ===
const footerNormas      = document.getElementById('footerNormas');
const toggleNormasBtn   = document.getElementById('toggleFooterNormas');
const openNormasLink    = document.getElementById('openNormas');

if (toggleNormasBtn && footerNormas) {
    toggleNormasBtn.addEventListener('click', () => {
        footerNormas.classList.toggle('open');
    });
}

// Link "Normas do Estúdio" no footer abre o painel e faz scroll até lá
if (openNormasLink && footerNormas) {
    openNormasLink.addEventListener('click', (e) => {
        e.preventDefault();
        footerNormas.classList.add('open');
        setTimeout(() => {
            footerNormas.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    });
}
});