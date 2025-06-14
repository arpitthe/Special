// Final Interactive Love Letter with Audio Effects
let highestZ = 1;
let lastHeartTime = 0;
let isMemoryRainActive = false;
let rightClickCount = 0;
const RIGHT_CLICK_LIMIT = 3;
const CORRECT_BIRTHDATE = "04102006"; // DDMMYYYY format

class Paper {
  constructor() {
    this.holdingPaper = false;
    this.currentPaperX = Math.random() * 100 - 50;
    this.currentPaperY = Math.random() * 100 - 50;
    this.rotation = Math.random() * 30 - 15;
    this.paperElement = null;
    this.stellarisAudio = null;
  }

  init(paper) {
    this.paperElement = paper;
    this.updateTransform();

    // Preload stellaris audio
    this.stellarisAudio = new Audio('images/Stellaris.mp3');

    // Event listeners
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    paper.addEventListener('mousedown', this.handleMouseDown.bind(this));
    window.addEventListener('mouseup', this.handleMouseUp.bind(this));
    paper.addEventListener('dblclick', this.handleDoubleClick.bind(this));
    paper.addEventListener('contextmenu', this.handleRightClick.bind(this));
  }

  handleMouseMove(e) {
    if (!this.holdingPaper) return;

    const velX = e.clientX - (this.prevMouseX || e.clientX);
    const velY = e.clientY - (this.prevMouseY || e.clientY);

    this.currentPaperX += velX;
    this.currentPaperY += velY;
    this.prevMouseX = e.clientX;
    this.prevMouseY = e.clientY;

    this.updateTransform();

    // Heart trail
    if (Date.now() - lastHeartTime > 100) {
      this.createHeartTrail(e.clientX, e.clientY);
      lastHeartTime = Date.now();
    }
  }

  handleMouseDown(e) {
    if (e.button === 0) { // Left click
      this.holdingPaper = true;
      this.paperElement.style.zIndex = highestZ++;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    }
  }

  handleRightClick(e) {
    e.preventDefault();
    if (!this.paperElement.classList.contains('heart')) return;

    rightClickCount++;
    if (rightClickCount >= RIGHT_CLICK_LIMIT) {
      this.verifyBirthdate();
    } else {
      this.showSecretMessage(`i love you ${rightClickCount}/${RIGHT_CLICK_LIMIT} times ❤️`);
    }
  }

  verifyBirthdate() {
    const userInput = prompt("To unlock this special moment honey, please enter my birthdate (DDMMYYYY):");

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
      font-size: 4rem;
      color: white;
      text-shadow: 0 0 20px #ff69b4;
      opacity: 0;
      z-index: 100000;
      transition: opacity 3s ease-in;
      text-align: center;
    `;

    document.body.appendChild(loveText);

    // Create unmute button (for mobile)
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

    // Desktop - play immediately
    if (!/Mobi|Android/i.test(navigator.userAgent)) {
      playAudio();
    }

    // Mobile - require button click
    unmuteButton.onclick = playAudio;

    // Animate text appearance
    setTimeout(() => {
      loveText.style.opacity = '1';
    }, 1000);

    // Reset counter
    rightClickCount = 0;

    // Click to exit
    videoContainer.addEventListener('click', () => {
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

  handleMouseUp() {
    this.holdingPaper = false;
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
  document.querySelectorAll('.paper').forEach(paper => {
    new Paper().init(paper);
  });
});