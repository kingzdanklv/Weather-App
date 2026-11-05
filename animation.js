// Dynamic Weather Canvas Animation Engine
class WeatherAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.currentType = 'clear';

        this.init();
        window.addEventListener('resize', () => this.resize());
    }

    init() {
        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setWeather(weatherCode) {
        // Map Open-Meteo codes to animation types
        if (weatherCode === 0 || weatherCode === 1) this.currentType = 'clear';
        else if (weatherCode === 2 || weatherCode === 3) this.currentType = 'clouds';
        else if (weatherCode >= 51 && weatherCode <= 67) this.currentType = 'rain';
        else if (weatherCode >= 71 && weatherCode <= 77) this.currentType = 'snow';
        else if (weatherCode >= 95) this.currentType = 'thunder';
        else this.currentType = 'clear';

        this.initParticles();
    }

    initParticles() {
        this.particles = [];
        const count = this.currentType === 'rain' ? 120 : (this.currentType === 'snow' ? 80 : 25);

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 3 + 1,
                speedY: this.currentType === 'rain' ? Math.random() * 10 + 8 : (this.currentType === 'snow' ? Math.random() * 2 + 0.5 : Math.random() * 0.5 + 0.2),
                speedX: this.currentType === 'snow' ? Math.sin(Math.random() * Math.PI) * 1 : (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.7 + 0.3,
                length: Math.random() * 15 + 10
            });
        }

        if (!this.animationId) {
            this.animate();
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((p) => {
            this.ctx.beginPath();

            if (this.currentType === 'rain') {
                this.ctx.strokeStyle = `rgba(186, 230, 253, ${p.opacity})`;
                this.ctx.lineWidth = 1.5;
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x + p.speedX, p.y + p.length);
                this.ctx.stroke();
            } else if (this.currentType === 'snow') {
                this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (this.currentType === 'clouds') {
                this.ctx.fillStyle = `rgba(216, 180, 254, ${p.opacity * 0.15})`;
                this.ctx.arc(p.x, p.y, p.radius * 20, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Clear / Sun ambient glow particles
                this.ctx.fillStyle = `rgba(253, 224, 71, ${p.opacity * 0.3})`;
                this.ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
                this.ctx.fill();
            }

            // Update position
            p.y += p.speedY;
            p.x += p.speedX;

            // Reset when particle goes off screen
            if (p.y > this.canvas.height) {
                p.y = -10;
                p.x = Math.random() * this.canvas.width;
            }
            if (p.x > this.canvas.width) p.x = 0;
            if (p.x < 0) p.x = this.canvas.width;
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

// Global instance handle
let weatherAnimEngine = null;

window.addEventListener('DOMContentLoaded', () => {
    weatherAnimEngine = new WeatherAnimation('weatherCanvas');
});

