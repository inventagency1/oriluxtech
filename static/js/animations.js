/**
 * ORILUXCHAIN - Advanced Animations
 * Micro-interactions and smooth transitions
 */

// Smooth scroll reveal animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.metric-card, .chart-card, .activity-section');
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Holographic card tilt effect
class CardTilt {
    constructor() {
        this.cards = document.querySelectorAll('.metric-card, .wallet-card, .block-item');
        this.init();
    }
    
    init() {
        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => this.handleMouseMove(e, card));
            card.addEventListener('mouseleave', () => this.handleMouseLeave(card));
        });
    }
    
    handleMouseMove(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        
        // Update gradient position
        const gradientX = (x / rect.width) * 100;
        const gradientY = (y / rect.height) * 100;
        card.style.background = `
            radial-gradient(circle at ${gradientX}% ${gradientY}%, 
            rgba(255, 215, 0, 0.1) 0%, 
            rgba(255, 255, 255, 0.03) 50%)
        `;
    }
    
    handleMouseLeave(card) {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        card.style.background = 'rgba(255, 255, 255, 0.03)';
    }
}

// Number counter animation
class CounterAnimation {
    constructor(element, target, duration = 2000) {
        this.element = element;
        this.target = target;
        this.duration = duration;
        this.start = 0;
        this.startTime = null;
    }
    
    animate(timestamp) {
        if (!this.startTime) this.startTime = timestamp;
        const progress = timestamp - this.startTime;
        const percentage = Math.min(progress / this.duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
        const current = Math.floor(this.start + (this.target - this.start) * easeOutQuart);
        
        this.element.textContent = current;
        
        if (percentage < 1) {
            requestAnimationFrame((t) => this.animate(t));
        } else {
            this.element.textContent = this.target;
        }
    }
    
    start() {
        requestAnimationFrame((t) => this.animate(t));
    }
}

// Glitch text effect
class GlitchEffect {
    constructor(element) {
        this.element = element;
        this.text = element.textContent;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
    }
    
    glitch() {
        let iterations = 0;
        const interval = setInterval(() => {
            this.element.textContent = this.text
                .split('')
                .map((char, index) => {
                    if (index < iterations) {
                        return this.text[index];
                    }
                    return this.chars[Math.floor(Math.random() * this.chars.length)];
                })
                .join('');
            
            iterations += 1 / 3;
            
            if (iterations >= this.text.length) {
                clearInterval(interval);
                this.element.textContent = this.text;
            }
        }, 30);
    }
}

// Ripple effect on click
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// Floating animation for icons
function floatingAnimation() {
    const icons = document.querySelectorAll('.metric-icon');
    icons.forEach((icon, index) => {
        icon.style.animation = `float 3s ease-in-out ${index * 0.2}s infinite`;
    });
}

// Add CSS for floating animation
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 215, 0, 0.4);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize animations
document.addEventListener('DOMContentLoaded', () => {
    // Card tilt effect
    new CardTilt();
    
    // Floating icons
    floatingAnimation();
    
    // Add ripple to all buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', createRipple);
    });
    
    // Glitch effect on hover for titles
    document.querySelectorAll('.section-header h1').forEach(title => {
        const glitch = new GlitchEffect(title);
        title.addEventListener('mouseenter', () => glitch.glitch());
    });
    
    // Counter animations for metrics
    const observerForCounters = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                const target = parseInt(entry.target.textContent) || 0;
                const counter = new CounterAnimation(entry.target, target);
                counter.start();
                entry.target.dataset.animated = 'true';
            }
        });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('.metric-value').forEach(el => {
        observerForCounters.observe(el);
    });
});

// Smooth page transitions
function smoothTransition(callback) {
    document.body.style.opacity = '0';
    document.body.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
        callback();
        document.body.style.opacity = '1';
        document.body.style.transform = 'scale(1)';
    }, 300);
}

// Export for use in other modules
window.OriluxAnimations = {
    CounterAnimation,
    GlitchEffect,
    createRipple,
    smoothTransition
};
