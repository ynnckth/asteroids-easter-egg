(function () {
    document.body.style.overflow = 'hidden';

    const canvas = document.createElement('canvas');
    canvas.id = 'spaceship-game';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '2147483647';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    let spaceship = { x: canvas.width / 2, y: canvas.height / 2, angle: 0, velocityX: 0, velocityY: 0, rotationSpeed: 0 };
    let bullets = [];
    let explosions = [];
    const spaceshipSize = 20;
    const bulletSpeed = 5;
    const explosionDuration = 500; // Explosion lasts 500ms
    const friction = 0.98; // Gradual slowdown factor

    const keyState = { ArrowUp: false, ArrowLeft: false, ArrowRight: false, Space: false };

    document.addEventListener('keydown', (e) => { if (keyState[e.key] !== undefined) keyState[e.key] = true; });
    document.addEventListener('keyup', (e) => { if (keyState[e.key] !== undefined) keyState[e.key] = false; });

    function drawSpaceship() {
        ctx.save();
        ctx.translate(spaceship.x, spaceship.y);
        ctx.rotate(spaceship.angle);

        ctx.beginPath();
        ctx.moveTo(spaceshipSize, 0);
        ctx.lineTo(-spaceshipSize / 2, -spaceshipSize / 2);
        ctx.lineTo(-spaceshipSize / 2, spaceshipSize / 2);
        ctx.closePath();
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        if (keyState.ArrowUp) {
            ctx.beginPath();
            ctx.moveTo(-spaceshipSize / 2, -spaceshipSize / 4);
            ctx.lineTo(-spaceshipSize - 5, 0);
            ctx.lineTo(-spaceshipSize / 2, spaceshipSize / 4);
            ctx.closePath();
            ctx.fillStyle = 'yellow';
            ctx.strokeStyle = 'orange';
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
    }

    function drawBullet(bullet) {
        ctx.save();
        ctx.translate(bullet.x, bullet.y);
        ctx.rotate(bullet.angle);
        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.lineTo(8, 0);
        ctx.strokeStyle = 'lime';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
    }

    function drawExplosion(explosion) {
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 165, 0, ${explosion.alpha})`;
        ctx.fill();
    }

    function updateSpaceship() {
        const movementSpeed = 0.3;
        const rotationSpeed = 0.05;

        if (keyState.ArrowUp) {
            spaceship.velocityX += Math.cos(spaceship.angle) * movementSpeed;
            spaceship.velocityY += Math.sin(spaceship.angle) * movementSpeed;
        }
        if (keyState.ArrowLeft) spaceship.rotationSpeed = -rotationSpeed;
        if (keyState.ArrowRight) spaceship.rotationSpeed = rotationSpeed;

        spaceship.x += spaceship.velocityX;
        spaceship.y += spaceship.velocityY;
        spaceship.angle += spaceship.rotationSpeed;

        spaceship.velocityX *= keyState.ArrowUp ? friction : 1;
        spaceship.velocityY *= keyState.ArrowUp ? friction : 1;
        spaceship.rotationSpeed = 0;

        if (spaceship.x < 0) spaceship.x = canvas.width;
        if (spaceship.x > canvas.width) spaceship.x = 0;
        if (spaceship.y < 0) spaceship.y = canvas.height;
        if (spaceship.y > canvas.height) spaceship.y = 0;
    }

    function updateBullets() {
        bullets.forEach((bullet, index) => {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;

            const elements = [...document.body.querySelectorAll('*')]
                .filter(el => el !== canvas && el.children.length === 0);
            elements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (
                    bullet.x > rect.left && bullet.x < rect.right &&
                    bullet.y > rect.top && bullet.y < rect.bottom
                ) {
                    explosions.push({ x: bullet.x, y: bullet.y, radius: 10, alpha: 1, startTime: Date.now() });
                    el.remove();
                    bullets.splice(index, 1);
                }
            });

            if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
                bullets.splice(index, 1);
            }
        });
    }

    function updateExplosions() {
        const now = Date.now();
        explosions = explosions.filter(explosion => {
            const elapsed = now - explosion.startTime;
            if (elapsed < explosionDuration) {
                explosion.radius += 1;
                explosion.alpha = 1 - elapsed / explosionDuration;
                return true;
            }
            return false;
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !keyState.Space) {
            keyState.Space = true;
            bullets.push({
                x: spaceship.x + Math.cos(spaceship.angle) * spaceshipSize,
                y: spaceship.y + Math.sin(spaceship.angle) * spaceshipSize,
                vx: Math.cos(spaceship.angle) * bulletSpeed,
                vy: Math.sin(spaceship.angle) * bulletSpeed,
                angle: spaceship.angle
            });
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === 'Space') keyState.Space = false;
    });

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawSpaceship();
        bullets.forEach(drawBullet);
        explosions.forEach(drawExplosion);
        updateSpaceship();
        updateBullets();
        updateExplosions();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
})();
