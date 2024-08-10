const cursor = document.getElementById("cursor");
const mouse = document.getElementById("mouse");
const scoreDiv = document.getElementById("score");
const difficultyDiv = document.getElementById("difficulty")
let score = 0;
const cursorStyle = cursor.style;
const mouseStyle = mouse.style;
const direction = 0; // 0 = en haut ; 90 = droite ; 180 = bas ; 270 = gauche
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let difficulty = 800;
let pause = 0; // 0 = pas en pause, 1 = en pause
let gameOver = 0 // 0 = pas game over , 1 = gameover




document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        pause = 1;
        console.log('Jeu en pause');
    } else {
        pause = 0;
        console.log('Jeu repris');
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'p' || event.key === 'P') {
        pause = !pause;  
    }
});


document.addEventListener('mousemove', e =>{
    const rect = cursor.getBoundingClientRect();

    const posX = e.clientX;
    const posY = e.clientY;

    cursorX = rect.left + rect.width / 2;
    cursorY = rect.top + rect.height / 2;
    const angle = Math.atan2(posY - cursorY, posX - cursorX) * (180 / Math.PI) + 90;

    mouse.style.left = `${posX}px`;
    mouse.style.top = `${posY}px`;

    if(pause || gameOver){
        return;
    }

    cursor.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, {duration: 5000, fill: "forwards"});



    cursorStyle.transform = `rotate(${angle}deg)`;
    
})

function isCollision(rect1, rect2) {
    return !(rect2.left > rect1.right ||
             rect2.right < rect1.left ||
             rect2.top > rect1.bottom ||
             rect2.bottom < rect1.top);
}

document.addEventListener('click', e => {
    if(pause || gameOver){
        return;
    }
    // Calcul de la direction du laser
    const laserX = e.clientX;
    const laserY = e.clientY;
    const dx = laserX - cursorX;
    const dy = laserY - cursorY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calcul de l'angle de rotation
    const angle = Math.atan2(dy, dx);
    
    // Calculer la position de départ du laser (100px devant le curseur)
    const offset = 40;
    const startX = cursorX + Math.cos(angle) * offset;
    const startY = cursorY + Math.sin(angle) * offset;
    
    // Création du laser
    const laser = document.createElement('div');
    laser.className = 'laser';
    document.body.appendChild(laser);

    // Positionner le laser
    laser.style.left = `${startX}px`;
    laser.style.top = `${startY}px`;
    laser.style.transform = `rotate(${angle * (180 / Math.PI)}deg)`;
    
    function animateLaser() {
        if(pause || gameOver){
            requestAnimationFrame(animateLaser);
            return;
        }
        const speed = 15; // Vitesse du laser
        let currentX = parseFloat(laser.style.left);
        let currentY = parseFloat(laser.style.top);
        let dx = Math.cos(angle) * speed;
        let dy = Math.sin(angle) * speed;

        currentX += dx;
        currentY += dy;
        laser.style.left = `${currentX}px`;
        laser.style.top = `${currentY}px`;

        // Vérifie si le laser est hors de l'écran
        if (currentX < -laser.offsetWidth || currentX > window.innerWidth || currentY < -laser.offsetHeight || currentY > window.innerHeight) {
            laser.remove(); // Supprime le laser quand il est hors de l'écran
        } else {
            // Vérifie les collisions avec les astéroïdes
            const lasers = document.querySelectorAll('.laser');
            const asteroids = document.querySelectorAll('.asteroid-container');
            let collisionDetected = false;

            lasers.forEach(l => {
                //if (collisionDetected) return;

                const laserRect = l.getBoundingClientRect();
                asteroids.forEach(a => {
                    const asteroidRect = a.getBoundingClientRect();
                    if (isCollision(laserRect, asteroidRect)) {
                        l.remove(); // Supprime le laser en cas de collision
                        a.remove(); // Supprime l'astéroïde en cas de collision
                        difficulty -= 30;
                        if (difficulty < 40) difficulty = 40; 
                        updateDifficulty();
                        score += 10;
                        scoreDiv.innerHTML = 'Score : ' + score;
                        collisionDetected = true;
                    }
                });
            });

            
                requestAnimationFrame(animateLaser);
            
        }
    }

    animateLaser();
});

function getRandomAnimation() {
    const animations = ['twinkle', 'twinkle2', 'twinkle3'];
    return animations[Math.floor(Math.random() * animations.length)];
}



function spawnAstar() {
    if(pause || gameOver){
        return;
    }
    window.scrollTo(0, 0);
    const backgroundElement = document.querySelector('.background');
    const starElement = document.createElement('div');
    starElement.className = 'star';
    const animationName = getRandomAnimation();
    const animationDuration = Math.random() * (10 - 5) + 5;
    starElement.style.animation = `${animationName} ${animationDuration}s linear infinite`;
    const x  = Math.random() * window.innerWidth;
    starElement.style.left = `${x}px`;

    backgroundElement.appendChild(starElement);

    function checkVisibility() {
        const rect = starElement.getBoundingClientRect();

        // Vérifie si l'étoile est hors de l'écran
        if (rect.right < 0 || rect.left > window.innerWidth || rect.bottom < 0 || rect.top > window.innerHeight) {
            starElement.remove(); // Supprime l'étoile quand elle est hors de l'écran
        }
    }

    // Vérifiez la visibilité toutes les 100 ms
    const visibilityInterval = setInterval(() => {
        checkVisibility();
    }, 100);

    // Nettoyez l'intervalle lorsqu'il n'y a plus d'étoile
    starElement.addEventListener('animationiteration', () => {
        clearInterval(visibilityInterval);
        checkVisibility();
    });
}

const intervalId = setInterval(spawnAstar, 250);


const objectElement = document.querySelector('.object');

function getRandomAsteroidClass() {
    const asteroidClasses = [
        { border: 'asteroid-border1', inner: 'asteroid-inner1' },
        { border: 'asteroid-border2', inner: 'asteroid-inner2' },
        { border: 'asteroid-border3', inner: 'asteroid-inner3' },
        { border: 'asteroid-border4', inner: 'asteroid-inner4' },
        { border: 'asteroid-border5', inner: 'asteroid-inner5' },
        { border: 'asteroid-border6', inner: 'asteroid-inner6' }
    ];
    return asteroidClasses[Math.floor(Math.random() * asteroidClasses.length)];
}

function spawnAsteroid() {
    if(pause || gameOver){
        return;
    }
    const asteroidClass = getRandomAsteroidClass();
    const asteroidContainer = document.createElement('div');
    asteroidContainer.className = 'asteroid-container';

    const asteroidBorder = document.createElement('div');
    asteroidBorder.className = asteroidClass.border;
    asteroidContainer.appendChild(asteroidBorder);

    const asteroidInner = document.createElement('div');
    asteroidInner.className = asteroidClass.inner;
    asteroidContainer.appendChild(asteroidInner);

    // Positionner l'astéroïde en dehors de l'écran
    let side = Math.floor(Math.random() * 4); // 0: haut, 1: droite, 2: bas, 3: gauche

    switch(side) {
        case 0: // Haut
            asteroidContainer.style.left = `${Math.random() * window.innerWidth}px`;
            asteroidContainer.style.top = `-${asteroidContainer.offsetHeight}px`;
            break;
        case 1: // Droite
            asteroidContainer.style.left = `${window.innerWidth-100}px`;
            asteroidContainer.style.top = `${Math.random() * window.innerHeight}px`;
            break;
        case 2: // Bas
            asteroidContainer.style.left = `${Math.random() * window.innerWidth}px`;
            asteroidContainer.style.top = `${window.innerHeight-100}px`;
            break;
        case 3: // Gauche
            asteroidContainer.style.left = `-${asteroidContainer.offsetWidth}px`;
            asteroidContainer.style.top = `${Math.random() * window.innerHeight}px`;
            break;
    }

    objectElement.appendChild(asteroidContainer);
    moveAsteroid(asteroidContainer, side);
}

function moveAsteroid(asteroidContainer, side) {
    if(pause || gameOver){
        return;
    }
    const speed = 5; // La vitesse de déplacement, ajustez-la comme vous le souhaitez
    
    // Détermine la direction du mouvement en fonction de la position de départ
    const rect = asteroidContainer.getBoundingClientRect();
    let x = parseFloat(asteroidContainer.style.left);
    let y = parseFloat(asteroidContainer.style.top);

    let dx = 0, dy = 0;

    switch(side) {
        case 0: // Haut
            dx = 0;
            dy = speed;
            break;
        case 1: // Droite
            dx = -speed;
            dy = 0;
            break;
        case 2: // Bas
            dx = 0;
            dy = -speed;
            break;
        case 3: // Gauche
            dx = speed;
            dy = 0;
            break;
    }

    function animate() {
        if(pause || gameOver){
            requestAnimationFrame(animate);
            return;
        }
        x += dx;
        y += dy;
        asteroidContainer.style.left = `${x}px`;
        asteroidContainer.style.top = `${y}px`;

        // Vérifie si l'astéroïde est hors de l'écran
        const isOutOfScreen = (
            x < -asteroidContainer.offsetWidth ||
            x > window.innerWidth ||
            y < -asteroidContainer.offsetHeight ||
            y > window.innerHeight
        );

        if (isOutOfScreen) {
            asteroidContainer.remove(); // Supprime l'astéroïde quand il est hors de l'écran
        } else {
            // Vérifie les collisions avec le joueur
            const player = document.getElementById('cursor'); // Correction du sélecteur pour le joueur
            const playerRect = player.getBoundingClientRect();
            const asteroidRect = asteroidContainer.getBoundingClientRect();

            if (isCollision(playerRect, asteroidRect)) {
                gameOverScreen(); // Appel à la fonction de fin de jeu
                player.remove(); // Supprime le joueur quand il est touché par un astéroïde
            } else {
                requestAnimationFrame(animate);
            }
        }
    }
    requestAnimationFrame(animate);
}


function gameOverScreen(){
    gameOver = true; // Défini le jeu en mode Game Over
    const gameOverScreen = document.createElement('div');
    gameOverScreen.className = 'GOscreen';
    gameOverScreen.innerHTML = `<h1>Game Over!</h1> <h4>Score : ` + score + `</h4> <button id="restart">Restart</button>`;
    document.body.appendChild(gameOverScreen);

    const restartButton = document.getElementById('restart');
    restartButton.addEventListener('click', () => {
        location.reload(); 
    });
}

let asteroidIntervalId = setInterval(spawnAsteroid, difficulty);
function updateDifficulty() {
    clearInterval(asteroidIntervalId); // Arrête l'intervalle actuel
    asteroidIntervalId = setInterval(spawnAsteroid, difficulty); // Démarre un nouvel intervalle avec la nouvelle difficulté
}



