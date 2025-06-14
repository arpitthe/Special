// Mobile-Optimized Love Letter Script
let highestZ = 1;
let lastHeartTime = 0;
let isMemoryRainActive = false;
let rightClickCount = 0;
const RIGHT_CLICK_LIMIT = 3;
const CORRECT_BIRTHDATE = "04102006"; // DDMMYYYY format
let longPressTimer = null;
const LONG_PRESS_DURATION = 800; // ms

class Paper {
  constructor() {
    this.holdingPaper = false;
    this.currentPaperX = Math.random() * 100 - 50;
    this.currentPaperY = Math.random() * 100 - 50;
    this.rotation = Math.random() * 30 - 15;
    this.paperElement = null;
    this.stellarisAudio = null;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.prevTouchX = 0;
    this.prevTouchY = 0;
  }

  init(paper) {
    this.paperElement = paper;
    this.updateTransform();

    // Preload audio
    this.stellarisAudio = new Audio('images/Stellaris.mp3');

    // Touch event listeners
    paper.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    paper.addEventListener('touchend', this.handleTouchEnd.bind(this));
    paper.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    paper.addEventListener('touchcancel', this.handleTouchEnd.bind(this));

    // Double-tap for memory rain
    paper.addEventListener('dblclick', this.handleDoubleClick.bind(this));

    // Prevent context menu on long press
    paper.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  handleTouchStart(e) {
    e.preventDefault();
    if (this.holdingPaper) return;

    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.prevTouchX = this.touchStartX;
    this.prevTouchY = this.touchStartY;

    // Long press detection (replaces right-click)
    longPressTimer = setTimeout(() => {
      this.handleLongPress();
    }, LONG_PRESS_DURATION);

    // Double-tap detection
    const now = Date.now();
    if (now - lastHeartTime < 300 && this.paperElement.classList.contains('heart')) {
      clearTimeout(longPressTimer);
      this.handleDoubleClick();
    }
    lastHeartTime = now;

    this.holdingPaper = true;
    this.paperElement.style.zIndex = highestZ++;
  }

  handleLongPress() {
    if (this.paperElement.classList.contains('heart')) {
      rightClickCount++;
      if (rightClickCount >= RIGHT_CLICK_LIMIT) {
        this.verifyBirthdate();
      } else {
        this.showSecretMessage(`Secret ${rightClickCount}/${RIGHT_CLICK_LIMIT} ❤️`);
      }
    }
  }

  handleTouchMove(e) {
    if (!this.holdingPaper) return;
    e.preventDefault();

    const touch = e.touches[0];
    const touchMoveX = touch.clientX;
    const touchMoveY = touch.clientY;

    // Cancel long press if movement detected
    if (Math.abs(touchMoveX - this.touchStartX) > 10 ||
        Math.abs(touchMoveY - this.touchStartY) > 10) {
      clearTimeout(longPressTimer);
    }

    const velX = touchMoveX - this.prevTouchX;
    const velY = touchMoveY - this.prevTouchY;

    this.currentPaperX += velX;
    this.currentPaperY += velY;
    this.prevTouchX = touchMoveX;
    this.prevTouchY = touchMoveY;

    this.updateTransform();

    // Heart trail
    if (Date.now() - lastHeartTime > 100) {
      this.createHeartTrail(touchMoveX, touchMoveY);
      lastHeartTime = Date.now();
    }
  }

  handleTouchEnd() {
    clearTimeout(longPressTimer);
    this.holdingPaper = false;
  }

  verifyBirthdate() {
    const userInput = prompt("To unlock this special moment, please enter my birthdate (DDMMYYYY):");

    if (userInput === CORRECT_BIRTHDATE) {
      this.showStarRainVideo();
    } else {
      alert("That's not correct. Try again when you're ready ❤️");
      rightClickCount = RIGHT_CLICK_LIMIT - 1;
    }
  }

  showStarRainVideo() {
    // Hide all elements
    document.querySelectorAll('body > *').forEach(el => {
      if (!['videoContainer', 'loveText', 'unmuteButton'].includes(el.id)) {
        el.style.display = 'none';
      }
    });

    // Create video container
    const videoContainer = document.createElement('div');
    videoContainer.id = 'videoContainer';
    videoContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 99999;
      touch-action: none;
    `;

    // Create video element
    const video = document.createElement('video');
    video.id = 'starRainVideo';
    video.src = 'images/star_rain.mp4';
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
    `;

    videoContainer.appendChild(video);
    document.body.appendChild(videoContainer);

    // Create love text
    const loveText = document.createElement('div');
    loveText.id = 'loveText';
    loveText.textContent = 'LOVE YOU FOREVER';
    loveText.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-family: 'Dancing Script', cursive;
      font-size: clamp(2rem, 8vw, 4rem);
      color: white;
      text-shadow: 0 0 20px #ff69b4;
      opacity: 0;
      z-index: 100000;
      transition: opacity 3s ease-in;
      text-align: center;
      pointer-events: none;
      width: 90%;
    `;

    document.body.appendChild(loveText);

    // Create unmute button
    const unmuteButton = document.createElement('button');
    unmuteButton.id = 'unmuteButton';
    unmuteButton.textContent = '🔇 Tap for Sound';
    unmuteButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 100001;
      background: rgba(0,0,0,0.5);
      color: white;
      border: none;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      font-size: 20px;
      cursor: pointer;
    `;

    document.body.appendChild(unmuteButton);

    // Audio setup
    this.stellarisAudio.loop = true;
    this.stellarisAudio.volume = 0.4;

    // Play audio with user interaction
    const playAudio = () => {
      this.stellarisAudio.play()
        .then(() => {
          unmuteButton.textContent = '🔊';
          unmuteButton.onclick = () => {
            this.stellarisAudio.muted = !this.stellarisAudio.muted;
            unmuteButton.textContent = this.stellarisAudio.muted ? '🔇' : '🔊';
          };
        })
        .catch(e => console.log("Audio play failed:", e));
    };

    // Mobile - require button click
    unmuteButton.onclick = playAudio;

    // Animate text appearance
    setTimeout(() => {
      loveText.style.opacity = '1';
    }, 1000);

    // Reset counter
    rightClickCount = 0;

    // Tap to exit
    videoContainer.addEventListener('touchend', () => {
      videoContainer.remove();
      loveText.remove();
      unmuteButton.remove();
      this.stellarisAudio.pause();
      this.stellarisAudio.currentTime = 0;
      document.querySelectorAll('body > *').forEach(el => {
        el.style.display = '';
      });
    });
  }

  handleDoubleClick() {
    if (this.paperElement.classList.contains('heart') && !isMemoryRainActive) {
      this.createMemoryRain();
    }
  }

  updateTransform() {
    this.paperElement.style.transform = `
      translateX(${this.currentPaperX}px)
      translateY(${this.currentPaperY}px)
      rotateZ(${this.rotation}deg)
    `;
  }

  createHeartTrail(x, y) {
    const heart = document.createElement('div');
    heart.className = 'heart-trail';
    heart.innerHTML = '❤️';
    heart.style.cssText = `
      left: ${x}px;
      top: ${y}px;
      transform: rotate(${Math.random() * 30 - 15}deg);
      font-size: ${Math.random() * 10 + 15}px;
    `;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
  }

  showSecretMessage(text) {
    const existingMsg = this.paperElement.querySelector('.secret-message');
    if (existingMsg) existingMsg.remove();

    const msg = document.createElement('div');
    msg.className = 'secret-message';
    msg.textContent = text;
    this.paperElement.appendChild(msg);

    setTimeout(() => {
      msg.style.transition = 'opacity 1s';
      msg.style.opacity = '0';
      setTimeout(() => msg.remove(), 1000);
    }, 2000);
  }

  createMemoryRain() {
    if (isMemoryRainActive) return;
    isMemoryRainActive = true;

    // Play wind chimes audio (single play)
    const windChimes = new Audio('images/wind_chimes.mp3');
    windChimes.volume = 0.3;
    windChimes.play().catch(e => console.log("Wind chimes audio error:", e));

    const explosionContainer = document.getElementById('photoExplosion');
    const memoryContainer = document.getElementById('memoryRainContainer');

    // Clear containers
    explosionContainer.innerHTML = '';
    memoryContainer.innerHTML = '';
    explosionContainer.style.display = 'block';

    const rect = this.paperElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Create photo explosion
    for (let i = 1; i <= 10; i++) {
      const img = document.createElement('img');
      img.className = 'explosion-photo';
      img.src = `images/photo${i}.jpg`;

      const endX = (Math.random() - 0.5) * 200;
      const endY = Math.random() * -100 - 50;

      img.style.cssText = `
        left: ${centerX - 60}px;
        top: ${centerY - 60}px;
      `;

      explosionContainer.appendChild(img);

      // Animate explosion
      setTimeout(() => {
        img.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';
        img.style.transform = `translate(${endX}px, ${endY}px) scale(0.8)`;
        img.style.opacity = '0';
      }, 50);

      // Create falling photos
      setTimeout(() => {
        const memoryImg = document.createElement('img');
        memoryImg.className = 'memory-photo';
        memoryImg.src = `images/photo${i}.jpg`;
        const rotation = Math.random() * 60 - 30;

        memoryImg.style.cssText = `
          transform: translateY(-100vh) rotate(${rotation}deg);
          opacity: 0;
        `;

        memoryContainer.appendChild(memoryImg);

        // Animate falling
        setTimeout(() => {
          memoryImg.style.transition = 'transform 3s ease-in, opacity 3s ease-in';
          memoryImg.style.transform = `translateY(0) rotate(${rotation}deg)`;
          memoryImg.style.opacity = '0.9';
        }, 100);
      }, 800);
    }

    // Add replay button
    setTimeout(() => {
      const replayBtn = document.createElement('button');
      replayBtn.className = 'memory-replay-btn';
      replayBtn.textContent = 'Replay Memories';
      replayBtn.onclick = () => {
        this.createMemoryRain();
      };
      memoryContainer.appendChild(replayBtn);
      isMemoryRainActive = false;
    }, 3500);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Prevent scrolling on touch devices
  document.body.style.overflow = 'hidden';
  document.body.style.touchAction = 'none';

  document.querySelectorAll('.paper').forEach(paper => {
    new Paper().init(paper);
  });
});