/**
 * ORILUXCHAIN - Particle System
 * Advanced particle animation for futuristic dashboard
 */

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 50; // Reducido para mejor performance
        this.connectionDistance = 120; // Reducido para menos cálculos
        this.mouse = { x: null, y: null, radius: 120 };
        
        this.colors = {
            gold: 'rgba(255, 215, 0, ',
            cyan: 'rgba(0, 240, 255, ',
            magenta: 'rgba(255, 0, 255, ',
            white: 'rgba(255, 255, 255, '
        };
        
        this.init();
    }
    
    init() {
        this.resize();
        this.createParticles();
        this.setupEventListeners();
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
        
        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }
    
    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(new Particle(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                Math.random() * 2 - 1,
                Math.random() * 2 - 1,
                Math.random() * 2 + 1,
                this.getRandomColor()
            ));
        }
    }
    
    getRandomColor() {
        const colorKeys = Object.keys(this.colors);
        return this.colors[colorKeys[Math.floor(Math.random() * colorKeys.length)]];
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach(particle => {
            particle.update(this.canvas.width, this.canvas.height, this.mouse);
            particle.draw(this.ctx);
        });
        
        // Draw connections
        this.connectParticles();
        
        requestAnimationFrame(() => this.animate());
    }
    
    connectParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.connectionDistance) {
                    const opacity = (1 - distance / this.connectionDistance) * 0.3;
                    this.ctx.strokeStyle = `rgba(255, 215, 0, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
}

class Particle {
    constructor(x, y, vx, vy, size, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.color = color;
        this.baseSize = size;
    }
    
    update(width, height, mouse) {
        // Move particle
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off walls
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
        
        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                const force = (mouse.radius - distance) / mouse.radius;
                const angle = Math.atan2(dy, dx);
                this.vx -= Math.cos(angle) * force * 0.5;
                this.vy -= Math.sin(angle) * force * 0.5;
                this.size = this.baseSize * (1 + force);
            } else {
                this.size = this.baseSize;
            }
        }
        
        // Limit velocity
        const maxSpeed = 2;
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > maxSpeed) {
            this.vx = (this.vx / speed) * maxSpeed;
            this.vy = (this.vy / speed) * maxSpeed;
        }
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + '0.6)';
        ctx.fill();
        
        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color + '0.8)';
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem('particles-canvas');
});
