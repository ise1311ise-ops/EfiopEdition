const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const gameOver = document.getElementById("gameOver");

const playBtn = document.getElementById("playBtn");
const restartBtn = document.getElementById("restartBtn");

const scoreText = document.getElementById("score");
const finalScore = document.getElementById("finalScore");
const bestScore = document.getElementById("bestScore");

let W;
let H;

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;

    player.y = H - player.size - 25;
}

window.addEventListener("resize", resize);

const bg = new Image();
bg.src = "fon.png";

const headIdle = new Image();
headIdle.src = "efiop1.png";

const headEat = new Image();
headEat.src = "efiop2.png";

const burgerImg = new Image();
burgerImg.src = "burger.png";

let score = 0;
let playing = false;

let best = Number(localStorage.getItem("best")) || 0;
bestScore.textContent = best;

const player = {
    x: 150,
    y: 0,
    size: 130,
    eating: false,
    timer: 0
};

const burgers = [];

function spawnBurger() {

    burgers.push({

        x: Math.random() * (W - 90),

        y: -100 - Math.random() * 500,

        size: 70,

        speed: 4 + Math.random() * 3

    });

}

function resetGame() {

    burgers.length = 0;

    score = 0;

    scoreText.textContent = "🍔 " + score;

    for (let i = 0; i < 6; i++) {
        spawnBurger();
    }

}

playBtn.onclick = startGame;
restartBtn.onclick = startGame;

function startGame() {

    menu.classList.add("hidden");
    gameOver.classList.add("hidden");

    resetGame();

    playing = true;

}

canvas.addEventListener("touchmove", e => {

    if (!playing) return;

    player.x = e.touches[0].clientX - player.size / 2;

});

canvas.addEventListener("mousemove", e => {

    if (!playing) return;

    player.x = e.clientX - player.size / 2;

});

function update() {

    if (!playing) return;

    if (player.timer > 0) {

        player.timer--;

    } else {

        player.eating = false;

    }

    burgers.forEach(b => {

        b.y += b.speed;

        if (b.y > H + 100) {

            playing = false;

            finalScore.textContent = score;

            if (score > best) {

                best = score;

                localStorage.setItem("best", best);

                bestScore.textContent = best;

            }

            gameOver.classList.remove("hidden");

            return;

        }

        const dx =
            (player.x + player.size / 2) -
            (b.x + b.size / 2);

        const dy =
            (player.y + player.size / 2) -
            (b.y + b.size / 2);

        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 75) {

            score++;

            scoreText.textContent = "🍔 " + score;

            player.eating = true;

            player.timer = 10;

            if (tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred("light");
            }

            b.y = -150;
            b.x = Math.random() * (W - 90);

            if (score % 10 === 0) {

                burgers.forEach(x => x.speed += 0.5);

            }

        }

    });

}
function draw() {

    ctx.clearRect(0, 0, W, H);

    ctx.drawImage(bg, 0, 0, W, H);

    burgers.forEach(b => {

        ctx.drawImage(
            burgerImg,
            b.x,
            b.y,
            b.size,
            b.size
        );

    });

    const head = player.eating ? headEat : headIdle;

    ctx.drawImage(
        head,
        player.x,
        player.y,
        player.size,
        player.size
    );

}

function gameLoop() {

    update();
    draw();

    requestAnimationFrame(gameLoop);

}

function preload() {

    const images = [
        bg,
        headIdle,
        headEat,
        burgerImg
    ];

    let loaded = 0;

    images.forEach(img => {

        if (img.complete) {

            loaded++;

            if (loaded === images.length) {
                resize();
                gameLoop();
            }

        } else {

            img.onload = () => {

                loaded++;

                if (loaded === images.length) {
                    resize();
                    gameLoop();
                }

            };

        }

    });

}

preload();

setInterval(() => {

    if (!playing) return;

    if (burgers.length < 15) {

        spawnBurger();

    }

}, 5000);

document.addEventListener("touchmove", e => {

    e.preventDefault();

}, { passive: false });

window.addEventListener("blur", () => {

    playing = false;

});

window.addEventListener("focus", () => {

    if (menu.classList.contains("hidden") &&
        gameOver.classList.contains("hidden")) {

        playing = true;

    }

});
