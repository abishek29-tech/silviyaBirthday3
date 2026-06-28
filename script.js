// =====================================================================
// CONFIG — edit these two lines if you want to change the song title
// =====================================================================
const SONG_TITLE = "Our Song"; // <-- change to her favourite song's title

// =====================================================================
// BUNNY DIALOGUE PER SCENE
// =====================================================================
const BUNNY_LINES = {
  gate:     "h-hi... will you come in? 🐰",
  sorry:    "n-no leaving allowed... only yes works here 🥺",
  wish:     "make a wish before you blow it out 🎂",
  song:     "th-this one's her song... tap play 🎵",
  memories: "look... these are some of my favourite moments too 📸",
  video:    "I helped pick this clip myself, hehe 🎬",
  reasons:  "I counted... there's really only 10 reasons. there could've been a hundred 🌷",
  letter:   "this part... I'm not even allowed to read out loud 🙈",
  finale:   "okay... last page. go on, cut it 🔪💜"
};

// =====================================================================
// STATE
// =====================================================================
let candleBlown = false;
let songPlaying = false;

// =====================================================================
// DOM SHORTCUTS
// =====================================================================
const bunny        = document.getElementById('bunny');
const bunnyWrap     = document.getElementById('bunnyWrap');
const speechBubble  = document.getElementById('speechBubble');
const speechText    = document.getElementById('speechText');
const bgMusic       = document.getElementById('bgMusic'); // continuous background track (backsong.mp3)
const bgm           = document.getElementById('bgm');      // her favourite song (song.mp3), song page only

// =====================================================================
// BUNNY SPEAK
// =====================================================================
function bunnySay(text, opts = {}){
  speechText.textContent = text;
  speechBubble.classList.add('show');
  bunny.classList.add('talking');
  if (opts.shy !== false) {
    bunny.classList.add('shy');
    setTimeout(() => bunny.classList.remove('shy'), 1700);
  }
  clearTimeout(bunny._talkTimer);
  bunny._talkTimer = setTimeout(() => {
    bunny.classList.remove('talking');
  }, 1800);
}

function bunnyHop(){
  bunny.classList.add('walking');
  setTimeout(() => bunny.classList.remove('walking'), 500);
}

// =====================================================================
// SCENE NAVIGATION
// =====================================================================
function showScene(name){
  document.querySelectorAll('.scene').forEach(s => {
    s.classList.remove('active');
  });
  const target = document.getElementById('scene-' + name);
  if (target) target.classList.add('active');

  bunnyHop();
  setTimeout(() => {
    bunnySay(BUNNY_LINES[name] || "");
  }, 350);

  // if she navigates away while her favourite song is still playing,
  // stop it and hand control back to the continuous background music.
  if (name !== 'song' && !bgm.paused) {
    bgm.pause();
    resetSongUI();
    resumeBgMusic();
  }

  // if she navigates away while the video is still playing, stop it too
  // (otherwise its sound keeps going underneath the next page — the
  // video's own 'pause' listener below will bring background music back).
  if (name !== 'video' && !herVideo.paused) {
    herVideo.pause();
  }

  // background music starts on the first real tap (browsers require a user
  // gesture) and then just keeps playing across every page on its own.
  if (bgMusic.paused && bgm.paused && herVideo.paused) {
    bgMusic.volume = 0.45;
    bgMusic.play().catch(() => {});
  }

  if (name === 'song') setupSongScene();
}

// =====================================================================
// CLICK DELEGATION FOR data-action BUTTONS
// =====================================================================
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;

  if (action === 'gate-yes') {
    showScene('wish');
  } else if (action === 'gate-no') {
    showScene('sorry');
  } else if (action === 'next') {
    showScene(btn.dataset.next);
  }
});

// =====================================================================
// CAKE / CANDLE — WISH SCENE
// =====================================================================
const flame = document.getElementById('flame');
const cakeHint = document.getElementById('cakeHint');
const wishNextRow = document.getElementById('wishNextRow');

function blowOutCandle(flameEl, stageEl){
  if (candleBlown) return;
  candleBlown = true;
  flameEl.classList.add('blown');

  // smoke puffs
  for (let i = 0; i < 4; i++){
    const smoke = document.createElement('div');
    smoke.className = 'smoke';
    smoke.style.left = (45 + Math.random()*10) + '%';
    smoke.style.animationDelay = (i * 0.15) + 's';
    flameEl.parentElement.appendChild(smoke);
    setTimeout(() => smoke.remove(), 2000);
  }

  launchConfetti(document.getElementById('confetti'));
  bunnySay("yayy! happy birthday wish made 🎉✨");

  if (cakeHint) cakeHint.textContent = "wish made 🎉";
  if (wishNextRow) wishNextRow.classList.remove('hidden');
}

flame.addEventListener('click', () => blowOutCandle(flame, document.getElementById('cakeStage')));

// =====================================================================
// VIDEO SCENE — pause background music while the video plays
// =====================================================================
const herVideo = document.getElementById('herVideo');
let suppressVideoPauseHandler = false; // true while pauseAllAudio() is pausing things itself

herVideo.addEventListener('play', () => {
  bgMusic.pause();
});
herVideo.addEventListener('pause', () => {
  if (suppressVideoPauseHandler) return; // app went to background, not a real user pause
  resumeBgMusic();
});
herVideo.addEventListener('ended', () => {
  resumeBgMusic();
});

// =====================================================================
// CONFETTI BURST
// =====================================================================
function launchConfetti(container){
  if (!container) return;
  const colors = ['#c9a8ff', '#ffd6f0', '#7c5cbf', '#ffd479', '#fff8f0'];
  for (let i = 0; i < 40; i++){
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.4;
    const duration = 1.4 + Math.random() * 1.2;
    const rotateStart = Math.random() * 360;
    const drift = (Math.random() - 0.5) * 160;

    piece.style.left = left + '%';
    piece.style.background = color;
    piece.style.opacity = '1';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.transform = `rotate(${rotateStart}deg)`;
    piece.style.transition = `transform ${duration}s cubic-bezier(.2,.6,.4,1), top ${duration}s cubic-bezier(.2,.6,.4,1), opacity ${duration}s ease ${delay}s`;
    container.appendChild(piece);

    requestAnimationFrame(() => {
      setTimeout(() => {
        piece.style.top = '260px';
        piece.style.transform = `translateX(${drift}px) rotate(${rotateStart + 360}deg)`;
        piece.style.opacity = '0';
      }, delay * 1000);
    });

    setTimeout(() => piece.remove(), (duration + delay + 0.2) * 1000);
  }
}

// =====================================================================
// SONG SCENE
// =====================================================================
let songSceneReady = false;
let playBtn, vinyl, arm;

function setupSongScene(){
  document.getElementById('songTitle').textContent = SONG_TITLE;
  if (songSceneReady) return;
  songSceneReady = true;

  playBtn = document.getElementById('playSongBtn');
  vinyl = document.getElementById('vinyl');
  arm = document.getElementById('vinylArm');

  playBtn.addEventListener('click', () => {
    if (!songPlaying) {
      // her song takes over — background music steps aside
      bgMusic.pause();
      bgm.currentTime = 0;
      bgm.volume = 0.8;
      bgm.play()
        .then(() => {
          vinyl.classList.add('spinning');
          arm.classList.add('dropped');
          playBtn.textContent = '⏸ pause';
          songPlaying = true;
          bunnySay("this part always gets me too 🎶");
        })
        .catch(() => {
          bunnySay("hmm, tap play again? 🥺", { shy: false });
          resumeBgMusic();
        });
    } else {
      // manual pause — stop her song and bring the background music back
      bgm.pause();
      resetSongUI();
      resumeBgMusic();
    }
  });

  // her song finishes naturally → don't loop it, just resume background music
  bgm.addEventListener('ended', () => {
    resetSongUI();
    resumeBgMusic();
  });
}

function resumeBgMusic(){
  if (bgMusic.paused) {
    bgMusic.play().catch(() => {});
  }
}

function resetSongUI(){
  songPlaying = false;
  if (playBtn) playBtn.textContent = '▶ play it';
  if (vinyl) vinyl.classList.remove('spinning');
  if (arm) arm.classList.remove('dropped');
}

// =====================================================================
// FINALE — SWIPE TO CUT CAKE
// =====================================================================
const finaleCake = document.getElementById('finaleCake');
const cutLine = document.getElementById('cutLine');
const finaleFlame = document.getElementById('finaleFlame');
const finalMsg = document.getElementById('finalMsg');
let finaleCut = false;
let dragging = false;
let dragStartX = null;

function setupFinale(){
  let tapCount = 0;

  finaleCake.addEventListener('pointerdown', (e) => {
    if (finaleCut) return;
    dragging = true;
    dragStartX = e.clientX;
    finaleCake.setPointerCapture(e.pointerId);
  });

  finaleCake.addEventListener('pointermove', (e) => {
    if (!dragging || finaleCut) return;
    const dx = Math.abs(e.clientX - dragStartX);
    const progress = Math.min(dx / 90, 1);
    cutLine.style.height = (progress * 90) + 'px';
    cutLine.style.opacity = String(progress);

    if (progress >= 1) {
      completeCut();
    }
  });

  finaleCake.addEventListener('pointerup', (e) => {
    dragging = false;
    // tap fallback: if they just tap a couple times instead of swiping, cut anyway
    if (!finaleCut) {
      tapCount++;
      if (tapCount === 1) {
        bunnySay("try swiping across me ✨ or just tap again", { shy: false });
      } else if (tapCount >= 2) {
        completeCut();
      }
    }
  });
  finaleCake.addEventListener('pointercancel', () => { dragging = false; });
}

function completeCut(){
  if (finaleCut) return;
  finaleCut = true;
  dragging = false;

  finaleCake.style.transition = 'transform .25s ease';
  finaleCake.style.transform = 'translateX(-3px) rotate(-1deg)';
  setTimeout(() => {
    finaleCake.style.transform = 'translateX(3px) rotate(1deg)';
  }, 130);
  setTimeout(() => {
    finaleCake.style.transform = 'none';
  }, 260);

  // blow out flame too
  finaleFlame.classList.add('blown');
  launchConfetti(document.getElementById('finaleConfetti'));

  bunny.classList.add('blow-anim');
  bunnySay("happy birthday, Silviya 💜🎉", { shy: false });

  setTimeout(() => {
    finalMsg.classList.remove('hidden');
    launchConfetti(document.getElementById('finaleConfetti'));
  }, 500);

  // little ongoing confetti shower
  let bursts = 0;
  const interval = setInterval(() => {
    launchConfetti(document.getElementById('finaleConfetti'));
    bursts++;
    if (bursts > 3) clearInterval(interval);
  }, 700);
}

setupFinale();

// =====================================================================
// PAUSE EVERYTHING WHEN THE APP / TAB GOES TO THE BACKGROUND
// (fixes music continuing to play after leaving Acode / switching apps /
//  turning the screen off — we remember what was playing and only
//  resume that same thing when she comes back)
// =====================================================================
let wasPlayingBgMusic = false;
let wasPlayingSong = false;
let wasPlayingVideo = false;

function pauseAllAudio(){
  wasPlayingBgMusic = !bgMusic.paused;
  wasPlayingSong = !bgm.paused;
  wasPlayingVideo = !herVideo.paused;

  suppressVideoPauseHandler = true;
  if (wasPlayingBgMusic) bgMusic.pause();
  if (wasPlayingSong) bgm.pause();
  if (wasPlayingVideo) herVideo.pause();
  // release the guard right after, once the synchronous pause calls (and
  // their synchronously-fired 'pause' events) have all gone through
  setTimeout(() => { suppressVideoPauseHandler = false; }, 0);
}

function resumeWhatWasPlaying(){
  if (wasPlayingVideo) {
    herVideo.play().catch(() => {});
  } else if (wasPlayingSong) {
    bgm.play().catch(() => {});
  } else if (wasPlayingBgMusic) {
    bgMusic.play().catch(() => {});
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    pauseAllAudio();
  } else {
    resumeWhatWasPlaying();
  }
});

// extra safety net for some mobile browsers/webviews that don't fire
// visibilitychange reliably when the app is fully closed/switched away
window.addEventListener('pagehide', pauseAllAudio);

// =====================================================================
// INITIAL STATE
// =====================================================================
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => bunnySay(BUNNY_LINES.gate), 500);
});

// random idle ear-perk / look-around could be added here later
