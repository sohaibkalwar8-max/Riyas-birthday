// ELEMENTS
const startBtn = document.getElementById("startBtn");
const homePage = document.getElementById("homePage");
const birthdayPage = document.getElementById("birthdayPage");

const song = document.getElementById("birthdaySong");
const subtitle = document.getElementById("subtitle");
const musicStatus = document.getElementById("musicStatus");
const musicTime = document.getElementById("musicTime");

const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");

let fireworks = [];
let particles = [];
let animationFrame;
let fireworkStart = 0;
let fireworksActive = false;
let started = false;

// EDIT YOUR SUBTITLES HERE
// Time is in seconds.
// Replace these example lines with your song's actual words.
const subtitles = [
  { time: 0, text: "A little birthday magic is waiting for you... ♡" },
  { time: 5, text: "Happy Birthday to you... ♥" },
  { time: 10, text: "May all your wishes come true ✨" },
  { time: 15, text: "You deserve all the happiness in the world ♡" },
  { time: 20, text: "Today is your special day ♥" },
  { time: 25, text: "Keep smiling, keep shining ✨" }
];

let lastSubtitle = -1;

// CREATE FLOATING HEARTS
function createHearts(containerId, count) {
  const container = document.getElementById(containerId);

  for (let i = 0; i < count; i++) {
    const heart = document.createElement("span");

    heart.className = "heart-particle";
    heart.textContent = Math.random() > 0.5 ? "♥" : "♡";

    heart.style.left = Math.random() * 100 + "%";
    heart.style.fontSize = (12 + Math.random() * 23) + "px";
    heart.style.animationDuration = (7 + Math.random() * 10) + "s";
    heart.style.animationDelay = (-Math.random() * 12) + "s";

    container.appendChild(heart);
  }
}

createHearts("hearts", 22);
createHearts("backgroundHearts", 12);

// CANVAS SIZE
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);

  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// RANDOM HELPERS
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// CREATE FIREWORK
function launchFirework() {
  const x = random(30, window.innerWidth - 30);
  const y = random(50, window.innerHeight * 0.55);

  const colors = [
    "#ff4f91",
    "#ffb4d5",
    "#b98aff",
    "#fff0f6",
    "#ffca80"
  ];

  const color = colors[
    Math.floor(Math.random() * colors.length)
  ];

  const count = Math.floor(random(40, 75));

  for (let i = 0; i < count; i++) {
    const angle = Math.PI * 2 * i / count;
    const speed = random(1, 4.5);

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      radius: random(1, 2.5),
      color
    });
  }
}

// FIREWORKS ANIMATION
function animateFireworks(timestamp) {
  if (!fireworksActive) return;

  const elapsed = timestamp - fireworkStart;

  ctx.clearRect(
    0, 0, window.innerWidth, window.innerHeight
  );

  // Fireworks last for around 8 seconds
  if (elapsed < 8000 && Math.random() < 0.10) {
    launchFirework();
  }

  particles = particles.filter(p => p.alpha > 0.03);

  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.018;
    p.vx *= 0.99;
    p.alpha -= 0.012;

    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = p.color;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  if (elapsed < 8000) {
    animationFrame = requestAnimationFrame(
      animateFireworks
    );
  } else {
    fireworksActive = false;
    particles = [];
    ctx.clearRect(
      0, 0, window.innerWidth, window.innerHeight
    );
  }
}

// START FIREWORKS
function startFireworks() {
  cancelAnimationFrame(animationFrame);

  particles = [];
  fireworkStart = performance.now();
  fireworksActive = true;

  launchFirework();
  launchFirework();

  animationFrame = requestAnimationFrame(
    animateFireworks
  );
}

// SUBTITLES
function updateSubtitle() {
  if (song.paused) return;

  const currentTime = song.currentTime;
  let index = -1;

  for (let i = 0; i < subtitles.length; i++) {
    if (currentTime >= subtitles[i].time) {
      index = i;
    } else {
      break;
    }
  }

  if (index !== -1 && index !== lastSubtitle) {
    lastSubtitle = index;

    subtitle.style.opacity = "0";

    setTimeout(() => {
      subtitle.textContent = subtitles[index].text;
      subtitle.style.opacity = "1";
    }, 180);
  }
}

// FORMAT MUSIC TIME
function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "00:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return (
    String(mins).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0")
  );
}

song.addEventListener("timeupdate", () => {
  musicTime.textContent = formatTime(song.currentTime);
  updateSubtitle();
});

song.addEventListener("ended", () => {
  musicStatus.textContent = "Birthday song finished ♡";
  subtitle.textContent = "Sending you lots of love ♥";
});

song.addEventListener("error", () => {
  musicStatus.textContent = "Song file not found";
});

// CLICK HERE
startBtn.addEventListener("click", async () => {
  if (started) return;

  started = true;

  homePage.classList.remove("active");
  birthdayPage.classList.add("active");

  musicStatus.textContent = "Playing your birthday song...";
  subtitle.textContent = "A little birthday magic is waiting for you... ♡";

  lastSubtitle = -1;

  startFireworks();

  // Music starts directly from the button click
  try {
    await song.play();
  } catch (error) {
    musicStatus.textContent =
      "Music could not start. Check song.mp3";
  }
});