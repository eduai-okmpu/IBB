/**
 * PhysicsAccess - Custom Games Module
 */

let mazeGameState = {
    canvas: null,
    ctx: null,
    ball: { x: 50, y: 50, radius: 10, vy: 0, vx: 0 },
    platforms: [],
    isGameOver: false,
    isWin: false,
    animationId: null,
    finishLineY: 460,
    startTime: 0,
    elapsedTime: 0
};

window.initMazeGame = function(containerId) {
    const container = document.querySelector(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="flex flex-col items-center gap-4 animate-fade-in">
            <div style="padding: 1rem; background: #fff7ed; border: 1px dashed #f97316; border-radius: 12px; margin-bottom: 0.5rem; display: flex; align-items: flex-start; gap: 10px; text-align: left; width: 100%; max-width: 400px;">
                <i data-lucide="info" size="20" style="color: #c2410c; margin-top: 3px;"></i>
                <div style="font-size: 0.85rem; color: #9a3412;">
                    <strong>Ойын ережесі:</strong> Допты кедергілерден өткізіп, ең астындағы «FINISH» аймағына жеткізіңіз. <br>
                    <strong>Басқару:</strong> Пернетақтадағы ⬅️ ➡️ бағыттауыштарын немесе төмендегі батырмаларды қолданыңыз.
                </div>
            </div>
            <div id="maze-timer" style="font-size: 1.5rem; font-weight: 800; color: var(--accent-orange);">00:00</div>
            <canvas id="maze-canvas" width="400" height="500" style="background: #fff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); cursor: none;"></canvas>
            <div class="flex gap-4">
                <button class="btn-secondary" onclick="moveMazeBall('left')" style="padding: 1rem;"><i data-lucide="arrow-left"></i></button>
                <button class="btn-secondary" onclick="moveMazeBall('right')" style="padding: 1rem;"><i data-lucide="arrow-right"></i></button>
            </div>
            <div id="maze-status" style="font-weight: 800; min-height: 24px;">Пернелерді немесе батырмаларды қолданыңыз</div>
        </div>
    `;

    mazeGameState.canvas = document.getElementById('maze-canvas');
    mazeGameState.ctx = mazeGameState.canvas.getContext('2d');
    
    // Reset state
    mazeGameState.ball = { x: 200, y: 30, radius: 12, vy: 0, vx: 0 };
    mazeGameState.isGameOver = false;
    mazeGameState.isWin = false;
    mazeGameState.startTime = Date.now();
    
    // Create random platforms
    generatePlatforms();
    
    if (mazeGameState.animationId) cancelAnimationFrame(mazeGameState.animationId);
    gameLoop();
    
    // Controls
    window.addEventListener('keydown', handleMazeKeydown);
    if (window.lucide) lucide.createIcons();
};

function generatePlatforms() {
    mazeGameState.platforms = [];
    const rows = 6;
    const gap = 70;
    for (let i = 1; i < rows; i++) {
        const y = i * gap + 50;
        const holeX = 50 + Math.random() * 300;
        const holeWidth = 80;
        
        // Left part
        mazeGameState.platforms.push({ x: 0, y, w: holeX - holeWidth/2, h: 15 });
        // Right part
        mazeGameState.platforms.push({ x: holeX + holeWidth/2, y, w: 400 - (holeX + holeWidth/2), h: 15 });
    }
}

function handleMazeKeydown(e) {
    if (e.key === 'ArrowLeft') moveMazeBall('left');
    if (e.key === 'ArrowRight') moveMazeBall('right');
}

window.moveMazeBall = function(dir) {
    if (mazeGameState.isWin) return;
    const speed = 6;
    if (dir === 'left') mazeGameState.ball.vx = -speed;
    if (dir === 'right') mazeGameState.ball.vx = speed;
};

function gameLoop() {
    update();
    draw();
    if (!mazeGameState.isWin) {
        mazeGameState.animationId = requestAnimationFrame(gameLoop);
    }
}

function update() {
    if (mazeGameState.isWin) return;

    const b = mazeGameState.ball;
    
    // Gravity simulation
    b.vy += 0.2; // Gravity
    b.y += b.vy;
    b.x += b.vx;
    b.vx *= 0.82; // Friction

    // Boundaries
    if (b.x < b.radius) b.x = b.radius;
    if (b.x > 400 - b.radius) b.x = 400 - b.radius;
    if (b.y < b.radius) b.y = b.radius;

    // Platform collisions
    let onPlatform = false;
    for (const p of mazeGameState.platforms) {
        if (b.x + b.radius > p.x && b.x - b.radius < p.x + p.w &&
            b.y + b.radius > p.y && b.y - b.radius < p.y + p.h) {
            
            // If falling and hitting the top of platform
            if (b.vy > 0 && b.y < p.y + p.h/2) {
                b.y = p.y - b.radius;
                b.vy = 0;
                onPlatform = true;
            } else if (b.vy < 0) { // Hit bottom
                b.y = p.y + p.h + b.radius;
                b.vy = 0;
            }
        }
    }

    // Win condition - reach bottom
    if (b.y > 465) {
        mazeGameState.isWin = true;
        document.getElementById('maze-status').innerText = 'ҚҰТТЫҚТАЙМЫЗ! СІЗ ӨТТІҢІЗ!';
        document.getElementById('maze-status').style.color = '#16a34a';
        if (window.triggerSalute) triggerSalute();
        
        // Trigger completion in UI
        const completeBtn = document.getElementById('maze-complete-btn');
        if (completeBtn) {
            completeBtn.disabled = false;
            completeBtn.style.opacity = '1';
            completeBtn.style.cursor = 'pointer';
        }
    }
    
    // Update timer
    const elapsed = Math.floor((Date.now() - mazeGameState.startTime) / 1000);
    const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const secs = (elapsed % 60).toString().padStart(2, '0');
    const timerElem = document.getElementById('maze-timer');
    if (timerElem) timerElem.innerText = `${mins}:${secs}`;
}

function draw() {
    const { ctx, canvas, ball, platforms } = mazeGameState;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid background (subtle)
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for(let i=0; i<canvas.height; i+=40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    // Draw Platforms
    ctx.fillStyle = '#1e293b';
    for (const p of platforms) {
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.w, p.h, 4);
        ctx.fill();
    }

    // Draw Finish Area
    ctx.fillStyle = 'rgba(22, 163, 74, 0.1)';
    ctx.fillRect(0, 460, 400, 40);
    ctx.strokeStyle = '#16a34a';
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(5, 465, 390, 30);
    ctx.setLineDash([]);
    ctx.fillStyle = '#16a34a';
    ctx.font = 'bold 16px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH', 200, 485);

    // Draw Ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#f26d21';
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(242, 109, 33, 0.5)';
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Ball highlight
    ctx.beginPath();
    ctx.arc(ball.x - 3, ball.y - 3, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
}
