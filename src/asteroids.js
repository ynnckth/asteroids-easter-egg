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

    let spaceship = { x: canvas.width / 2, y: canvas.height / 2, angle: 0 };
    let bullets = [];
    let explosions = [];
    const spaceshipSize = 20;
    const bulletSpeed = 5;
    const explosionDuration = 500; // Explosion lasts 500ms
    const targetDistanceThreshold = spaceshipSize * 4; // Distance threshold for hitting elements

    const keyState = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, Space: false };

    document.addEventListener('keydown', (e) => { if (keyState[e.key] !== undefined) keyState[e.key] = true; });
    document.addEventListener('keyup', (e) => { if (keyState[e.key] !== undefined) keyState[e.key] = false; });

    function createExplosion(x, y) {
        explosions.push({ x, y, radius: 0, alpha: 1, startTime: Date.now() });
    }

    function drawSpaceship() {
        ctx.save();
        ctx.translate(spaceship.x, spaceship.y);
        ctx.rotate(spaceship.angle);

        // Draw the triangle spaceship
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

        // Draw afterburner when accelerating
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
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
    }

    function drawExplosion(explosion) {
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 165, 0, ${explosion.alpha})`; // Orange with fading alpha
        ctx.fill();
    }

    function updateSpaceship() {
        const movementSpeed = 4; // Increased speed for faster movement

        if (keyState.ArrowUp) {
            spaceship.x += Math.cos(spaceship.angle) * movementSpeed;
            spaceship.y += Math.sin(spaceship.angle) * movementSpeed;
        }
        if (keyState.ArrowLeft) spaceship.angle -= 0.05;
        if (keyState.ArrowRight) spaceship.angle += 0.05;

        // Prevent spaceship from going out of bounds
        if (spaceship.x < 0) spaceship.x = canvas.width;
        if (spaceship.x > canvas.width) spaceship.x = 0;
        if (spaceship.y < 0) spaceship.y = canvas.height;
        if (spaceship.y > canvas.height) spaceship.y = 0;
    }

    function updateBullets() {
        bullets.forEach((bullet, index) => {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;

            // Check for collisions with elements at a distance
            const elements = [...document.body.querySelectorAll('*')]
                .filter(el => el !== canvas && el.children.length === 0); // Exclude container elements
            elements.forEach(el => {
                const rect = el.getBoundingClientRect();
                const elCenterX = (rect.left + rect.right) / 2;
                const elCenterY = (rect.top + rect.bottom) / 2;

                const distance = Math.sqrt((bullet.x - elCenterX) ** 2 + (bullet.y - elCenterY) ** 2);
                if (distance < targetDistanceThreshold && bullet.x > rect.left && bullet.x < rect.right && bullet.y > rect.top && bullet.y < rect.bottom) {
                    createExplosion(elCenterX, elCenterY);
                    bullets.splice(index, 1);
                    el.remove(); // Remove the element after explosion
                }
            });

            // Remove bullets that are offscreen
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
                explosion.radius += 1; // Increase the explosion size
                explosion.alpha = 1 - elapsed / explosionDuration; // Fade out
                return true;
            }
            return false;
        });
    }

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

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !keyState.Space) {
            keyState.Space = true;
            const angle = spaceship.angle;
            bullets.push({
                x: spaceship.x + Math.cos(angle) * spaceshipSize,
                y: spaceship.y + Math.sin(angle) * spaceshipSize,
                vx: Math.cos(angle) * bulletSpeed,
                vy: Math.sin(angle) * bulletSpeed,
            });
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === 'Space') keyState.Space = false;
    });

    gameLoop();
})();

