// Configuration
const ENABLE_LOGGING = false; // Set to false to disable logging

// Logging helper
function log(message, data = null) {
  if (ENABLE_LOGGING) {
    if (data !== null) {
      console.log(`[Coin Animation] ${message}`, data);
    } else {
      console.log(`[Coin Animation] ${message}`);
    }
  }
}

const coinIcons = [
  'angular.svg',
  'graphql.svg',
  'javascript.svg',
  'jestjsio.svg',
  'kubernetes.svg',
  'nestjs.svg',
  'nodejs.svg',
  'postgresql.svg',
  'typescriptlang.svg',
];
// Define coin states: [text, backgroundColorClass]
const coinStates = coinIcons.map((coinIcon, coinIconIndex) => ({
  front: coinIcon,
  back: coinIcons[coinIconIndex - 1] || coinIcons[coinIcons.length - 1],
  bgColor: 'bg-neo-black',
  isFile: true,
}));

let currentStateIndex = 0;
let flipCount = 0;
const maxFlips = 4;
let rotation = 0;

log('Initializing coin animation');

// Create bouncing animation
function bounceElement() {
  console.log('bounceElement');
  log('Starting bounce animation');
  let posY = 0;
  let velocity = 0;
  let bounceCount = 0;
  const gravity = 0.5;
  const damping = 0.7;
  const startY = 0;

  function animateBounce() {
    velocity += gravity;
    posY += velocity;

    // Floor collision
    if (posY > 0) {
      posY = 0;
      velocity = -velocity * damping;
      bounceCount++;

      log(`Bounce #${bounceCount}, velocity: ${velocity.toFixed(2)}`);

      // Stop bouncing after a few bounces
      if (bounceCount > 3 && Math.abs(velocity) < 0.5) {
        posY = 0;
        velocity = 0;
        bounceCount = 0;

        log('Bouncing stopped, starting next action');
        // After bouncing stops, start the next action
        setTimeout(() => {
          if (flipCount < maxFlips) {
            log(`Flip #${flipCount + 1} starting`);
            flipCoin();
          } else {
            log('Max flips reached, changing content');
            // changeCoinContent();
          }
        }, 300);
        return;
      }
    }

    // coinElement.style.transform = `translateY(${posY}px)`;
    requestAnimationFrame(animateBounce);
  }

  animateBounce();
}

// Flip animation using JavaScript
function animateFlip(duration, onComplete) {
  const coinElement = document.getElementById('coin-element');
  if (!coinElement) {
    return;
  }

  log('Starting flip animation');
  const startTime = Date.now();
  const startRotation = rotation;
  const targetRotation = rotation + 180; // Flip 180 degrees

  function updateFlip() {
    const coinElement = document.getElementById('coin-element');
    if (!coinElement) {
      return;
    }
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-in-out function
    const easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    rotation = startRotation + (targetRotation - startRotation) * easeProgress;
    coinElement.style.transform = `rotateY(${rotation}deg) translateY(0px)`;

    if (progress < 1) {
      requestAnimationFrame(updateFlip);
    } else {
      rotation = targetRotation;
      log('Flip animation complete');
      if (onComplete) onComplete();
    }
  }

  updateFlip();
}

function flipCoin() {
  // Perform flip animation
  animateFlip(600, () => {
    flipCount++;
    log(`Flip completed (${flipCount}/${maxFlips})`);

    if (flipCount < maxFlips) {
      // Continue bouncing and flipping
      log('Continuing with next bounce');
      setTimeout(bounceElement, 300);
    } else {
      // After 4 flips, change content and start over
      log('All flips completed, changing content');
      setTimeout(changeCoinContent, 300);
    }
  });
}

function changeCoinContent(restarting = true) {
  const coinElement = document.getElementById('coin-element');
  if (!coinElement) {
    return;
  }
  // Move to next state
  currentStateIndex = (currentStateIndex + 1) % coinStates.length;
  const nextState = coinStates[currentStateIndex];

  log('Changing coin content', nextState);

  // Update content
  const frontElement = coinElement.querySelector('.coin-front');
  const backElement = coinElement.querySelector('.coin-back');

  if (nextState.isFile) {
    // Render SVG file icons
    frontElement.innerHTML = `<img src="icons/${nextState.front}" alt="${nextState.front.replace('.svg', '')}" class="w-16 h-16" />`;
    backElement.innerHTML = `<img src="icons/${nextState.back}" alt="${nextState.back.replace('.svg', '')}" class="w-16 h-16" />`;
  } else if (nextState.isSvg) {
    frontElement.innerHTML = nextState.front;
    backElement.innerHTML = nextState.back;
    // Reinitialize Lucide icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  } else {
    frontElement.textContent = nextState.front;
    backElement.textContent = nextState.back;
  }

  // Update background color
  coinElement.className = coinElement.className.replace(/bg-neo-\w+/g, nextState.bgColor);

  // Reset flip count
  flipCount = 0;

  // Restart bouncing
  if (restarting) {
    log('Restarting animation sequence');
    setTimeout(bounceElement, 600);
  }
}
