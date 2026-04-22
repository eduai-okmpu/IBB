const canvas = document.getElementById('atom-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let dpr = window.devicePixelRatio || 1;

function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
}

window.addEventListener('resize', resize);
resize();

class Electron {
    constructor(color, rx, ry, phi, speed, precession) {
        this.color = color;
        this.rx = rx;
        this.ry = ry;
        this.phi = phi; // Orientation angle
        this.theta = 0; // Position angle on ellipse
        this.speed = speed;
        this.precession = precession;
        this.history = [];
        this.maxHistory = 400; // Adjusted based on user preference
    }

    update() {
        this.theta += this.speed;
        
        // Slightly change orientation over time (precession)
        // User asked for "slightly change direction after one lap"
        // We'll do it continuously for smoothness or check for lap
        if (this.theta >= Math.PI * 2) {
            this.theta -= Math.PI * 2;
            this.phi += this.precession * 20; // Noticeable shift after lap
        }
        this.phi += this.precession;

        // Calculate position
        const x = this.rx * Math.cos(this.theta);
        const y = this.ry * Math.sin(this.theta);

        // Apply 2D rotation for phi
        const rotatedX = x * Math.cos(this.phi) - y * Math.sin(this.phi);
        const rotatedY = x * Math.sin(this.phi) + y * Math.cos(this.phi);

        const posX = width / 2 + rotatedX;
        const posY = height / 2 + rotatedY;

        this.history.push({ x: posX, y: posY });
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }

        return { x: posX, y: posY };
    }

    draw() {
        // Draw trail
        if (this.history.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            for (let i = 0; i < this.history.length - 1; i++) {
                const p1 = this.history[i];
                const p2 = this.history[i + 1];
                const opacity = i / this.history.length;
                ctx.globalAlpha = opacity * 0.4;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }

        // Draw electron sphere
        const last = this.history[this.history.length - 1];
        if (last) {
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            
            const grad = ctx.createRadialGradient(last.x - 2, last.y - 2, 0, last.x, last.y, 6);
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.4, this.color);
            grad.addColorStop(1, this.color);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(last.x, last.y, 6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
        }
    }
}

const electrons = [
    new Electron('#f43f5e', 170, 70, 0, 0.02, 0),
    new Electron('#3b82f6', 170, 70, Math.PI / 3, 0.015, 0),
    new Electron('#a855f7', 170, 70, (Math.PI / 3) * 2, 0.025, 0)
];

let pulse = 0;

function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw Nucleus
    pulse += 0.03;
    const pulseScale = 1 + Math.sin(pulse) * 0.05;
    const nRadius = 45 * pulseScale;
    const cx = width / 2;
    const cy = height / 2;

    ctx.shadowBlur = 40;
    ctx.shadowColor = 'rgba(244, 63, 94, 0.4)';
    
    const nGrad = ctx.createRadialGradient(cx - 10, cy - 10, 0, cx, cy, nRadius);
    nGrad.addColorStop(0, '#fff');
    nGrad.addColorStop(0.4, '#f43f5e');
    nGrad.addColorStop(1, '#9f1239');

    ctx.fillStyle = nGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, nRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Update and Draw Electrons
    electrons.forEach(e => {
        e.update();
        e.draw();
    });

    requestAnimationFrame(animate);
}

animate();
