document.addEventListener('DOMContentLoaded', () => {

    // ── Leaflet Map (Bengkulu, Indonesia) ─────────────────────────
    const map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
    }).setView([-3.7928, 102.2608], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
    }).addTo(map);

    // Custom neon marker
    const neonIcon = L.divIcon({
        html: `<div style="width:12px;height:12px;background:#00f2ff;border-radius:50%;box-shadow:0 0 10px #00f2ff, 0 0 25px #00f2ff;"></div>`,
        className: '',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
    });
    L.marker([-3.7928, 102.2608], { icon: neonIcon }).addTo(map);

    const splash       = document.getElementById('splash');
    const initBtn      = document.getElementById('init-btn');
    const mainContent  = document.getElementById('main-content');
    const player       = document.getElementById('player');
    const cardFrame    = document.getElementById('card-frame');

    // ── Audio ──────────────────────────────────────────────────────
    const bgAudio          = document.getElementById('bg-audio');
    const playPauseBtn     = document.getElementById('play-pause-btn');
    const prevBtn          = document.getElementById('prev-btn');
    const nextBtn          = document.getElementById('next-btn');
    const vinylIcon        = document.getElementById('vinyl-icon');
    const progressBar      = document.getElementById('progress');
    const progressContainer= document.getElementById('progress-bar-container');
    const songTitle        = document.getElementById('track-title');

    const playlist = [
        { title: 'MIDNIGHT',      src: 'sound/Midnight.mp3'      },
        { title: 'LET_HIM_COOK',  src: 'sound/Let_Him_Cook.mp3'  }
    ];
    let currentTrack = 0;
    let isPlaying    = false;

    function loadTrack(index) {
        const t = playlist[index];
        bgAudio.src = t.src;
        songTitle.textContent = t.title;
        progressBar.style.width = '0%';
        if (isPlaying) bgAudio.play().catch(() => {});
    }

    function setPlayState(playing) {
        isPlaying = playing;
        if (playing) {
            playPauseBtn.classList.replace('fa-play', 'fa-pause');
            vinylIcon.classList.add('playing');
        } else {
            playPauseBtn.classList.replace('fa-pause', 'fa-play');
            vinylIcon.classList.remove('playing');
        }
    }

    bgAudio.volume = 0.5;

    bgAudio.addEventListener('timeupdate', () => {
        if (bgAudio.duration)
            progressBar.style.width = `${(bgAudio.currentTime / bgAudio.duration) * 100}%`;
    });

    bgAudio.addEventListener('ended', () => {
        currentTrack = (currentTrack + 1) % playlist.length;
        loadTrack(currentTrack);
    });

    progressContainer.addEventListener('click', (e) => {
        if (bgAudio.duration)
            bgAudio.currentTime = (e.offsetX / progressContainer.clientWidth) * bgAudio.duration;
    });

    playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isPlaying) { bgAudio.pause(); setPlayState(false); }
        else           { bgAudio.play().then(() => setPlayState(true)).catch(() => {}); }
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentTrack = (currentTrack + 1) % playlist.length;
        loadTrack(currentTrack);
    });

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrack);
    });

    // ── Splash / Initiation ────────────────────────────────────────
    function showMain() {
        // Hide splash with CSS transition
        splash.style.opacity = '0';
        splash.style.pointerEvents = 'none';
        setTimeout(() => { splash.style.display = 'none'; }, 800);

        // Show main card + player
        mainContent.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1)';
        mainContent.style.transform  = 'translateY(20px)';
        mainContent.style.opacity    = '0';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                mainContent.style.opacity   = '1';
                mainContent.style.transform = 'translateY(0)';
            });
        });

        // Player slides in after short delay
        setTimeout(() => {
            player.style.transition = 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1)';
            player.style.transform  = 'translateY(20px)';
            player.style.opacity    = '0';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    player.style.opacity   = '1';
                    player.style.transform = 'translateY(0)';
                });
            });
        }, 300);

        // Stagger social buttons in
        const btns = document.querySelectorAll('.social-btn');
        btns.forEach((btn, i) => {
            btn.style.opacity   = '0';
            btn.style.transform = 'translateY(16px) scale(0.8)';
            btn.style.transition = `opacity 0.4s ease ${0.5 + i * 0.08}s, transform 0.4s cubic-bezier(0.34,1.56,0.64,1) ${0.5 + i * 0.08}s`;
            setTimeout(() => {
                btn.style.opacity   = '1';
                btn.style.transform = 'translateY(0) scale(1)';
            }, 20);
        });
    }

    initBtn.addEventListener('click', () => {
        // Load and attempt autoplay
        loadTrack(currentTrack);
        bgAudio.play()
            .then(() => setPlayState(true))
            .catch(() => setPlayState(false));  // Silent fail — user can click play

        showMain();
    });

    // ── 3D Card Tilt (Pure CSS transforms) ────────────────────────
    document.addEventListener('mousemove', (e) => {
        const cx = window.innerWidth  / 2;
        const cy = window.innerHeight / 2;
        const rx =  (e.clientY - cy) / 35;
        const ry = -(e.clientX - cx) / 35;
        cardFrame.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        cardFrame.style.transition = 'transform 0.15s linear';
    });

    document.addEventListener('mouseleave', () => {
        cardFrame.style.transition = 'transform 0.8s cubic-bezier(0.16,1,0.3,1)';
        cardFrame.style.transform  = 'rotateX(0deg) rotateY(0deg)';
    });

    // ── Social button click micro-animation ───────────────────────
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.transform = 'scale(0.85)';
            this.style.transition = 'transform 0.1s ease';
            setTimeout(() => {
                this.style.transform = '';
                this.style.transition = 'all 0.3s cubic-bezier(0.175,0.885,0.32,1.275)';
            }, 120);
        });
    });

    // ── HUD dynamics ──────────────────────────────────────────────
    const hudLoad   = document.getElementById('hud-load');
    const hudStatus = document.getElementById('hud-status');

    setInterval(() => {
        if (hudLoad) hudLoad.style.width = `${30 + Math.floor(Math.random() * 25)}%`;

        if (hudStatus && Math.random() > 0.93) {
            const orig = hudStatus.textContent;
            const origColor = hudStatus.style.color;
            const origShadow = hudStatus.style.textShadow;
            hudStatus.textContent   = '404: ERR_DETECTED';
            hudStatus.style.color   = '#ff00ff';
            hudStatus.style.textShadow = '0 0 10px #ff00ff';
            setTimeout(() => {
                hudStatus.textContent      = orig;
                hudStatus.style.color      = origColor;
                hudStatus.style.textShadow = origShadow;
            }, 900);
        }
    }, 2500);
});
