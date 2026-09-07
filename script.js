(function(){
  // ---------- frame geometry (matches the PNG exactly, no matter the screen size) ----------
  const IMG_W = 941, IMG_H = 1672;
  // dashed-border safe zone, as % of the image itself (measured from the artwork)
  const SAFE = { left: 12, right: 88, top: 12, bottom: 88 };

  const stage = document.getElementById('stage');
  const frameInner = document.getElementById('frameInner');

  function layout(){
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scale = Math.min(vw / IMG_W, vh / IMG_H);
    const w = IMG_W * scale;
    const h = IMG_H * scale;
    const left = (vw - w) / 2;
    const top = (vh - h) / 2;

    stage.style.width = w + 'px';
    stage.style.height = h + 'px';
    stage.style.left = left + 'px';
    stage.style.top = top + 'px';

    frameInner.style.left = (SAFE.left) + '%';
    frameInner.style.top = (SAFE.top) + '%';
    frameInner.style.width = (SAFE.right - SAFE.left) + '%';
    frameInner.style.height = (SAFE.bottom - SAFE.top) + '%';
  }

  window.addEventListener('resize', layout);
  window.addEventListener('orientationchange', layout);
  layout();

  // ---------- screen navigation (crossfade) ----------
  const screens = Array.from(document.querySelectorAll('.screen'));
  const total = screens.length;
  let index = 0;

  const progress = document.getElementById('progress');
  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');
  const audio = document.getElementById('bgAudio');
  const musicBtn = document.getElementById('musicBtn');
  const startOverlay = document.getElementById('startMusicOverlay');
  const openBtn = document.getElementById('openBtn');
  const songPlayBtn = document.getElementById('songPlayBtn');
  const songPlayIcon = document.getElementById('songPlayIcon');
  const songPlayLabel = document.getElementById('songPlayLabel');

  screens.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    progress.appendChild(dot);
  });
  const dots = Array.from(progress.children);

  function goTo(i){
    index = Math.max(0, Math.min(total - 1, i));
    screens.forEach((s, si) => s.classList.toggle('active', si === index));
    dots.forEach((d, di) => d.classList.toggle('active', di === index));
    backBtn.disabled = index === 0;
    nextBtn.disabled = index === total - 1;
    syncSongButton();
  }

  nextBtn.addEventListener('click', () => goTo(index + 1));
  backBtn.addEventListener('click', () => goTo(index - 1));

  let touchStartX = null;
  document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, {passive:true});
  document.addEventListener('touchend', e => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      if (dx < 0) goTo(index + 1); else goTo(index - 1);
    }
    touchStartX = null;
  }, {passive:true});

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') goTo(index + 1);
    if (e.key === 'ArrowLeft') goTo(index - 1);
  });

  // ---------- music ----------
  function playMusic(){
    audio.play().then(() => {
      musicBtn.classList.add('playing');
      startOverlay.classList.remove('show');
      syncSongButton();
    }).catch(() => {
      startOverlay.classList.add('show');
    });
  }
  function pauseMusic(){
    audio.pause();
    musicBtn.classList.remove('playing');
    syncSongButton();
  }
  musicBtn.addEventListener('click', () => { if (audio.paused) playMusic(); else pauseMusic(); });
  startOverlay.addEventListener('click', () => playMusic());
  openBtn.addEventListener('click', () => { playMusic(); goTo(1); });

  function syncSongButton(){
    if (!songPlayBtn) return;
    if (!audio.paused) {
      songPlayIcon.textContent = '❚❚';
      songPlayLabel.textContent = 'Pause Our Song';
    } else {
      songPlayIcon.textContent = '▶';
      songPlayLabel.textContent = 'Play Our Song';
    }
  }
  songPlayBtn.addEventListener('click', () => { if (audio.paused) playMusic(); else pauseMusic(); });

  // ---------- countdown ----------
  const target = new Date('2026-10-01T19:00:00');
  const elDays = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMins = document.getElementById('cd-mins');
  const elSecs = document.getElementById('cd-secs');
  function pad(n){ return String(n).padStart(2, '0'); }
  function tick(){
    const now = new Date();
    let diff = target - now;
    if (diff < 0) diff = 0;
    elDays.textContent = pad(Math.floor(diff / 86400000));
    elHours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    elMins.textContent = pad(Math.floor((diff % 3600000) / 60000));
    elSecs.textContent = pad(Math.floor((diff % 60000) / 1000));
  }
  tick();
  setInterval(tick, 1000);

  // ---------- RSVP ----------
  const rsvpYes = document.getElementById('rsvpYes');
  const rsvpNo = document.getElementById('rsvpNo');
  const rsvpResponse = document.getElementById('rsvpResponse');
  rsvpYes.addEventListener('click', () => {
    rsvpResponse.textContent = "Thank you — we can't wait to celebrate with you ♡";
    rsvpYes.disabled = true; rsvpNo.disabled = true;
  });
  rsvpNo.addEventListener('click', () => {
    rsvpResponse.textContent = "We'll miss you — thank you for letting us know.";
    rsvpYes.disabled = true; rsvpNo.disabled = true;
  });

  goTo(0);
})();
