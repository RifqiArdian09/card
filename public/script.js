document.addEventListener('DOMContentLoaded', () => {
    const { animate, stagger, inView, scroll } = Motion;

    const splash = document.getElementById('splash');
    const initBtn = document.getElementById('init-btn');
    const mainContent = document.getElementById('main-content');
    const player = document.getElementById('player');
    const cardFrame = document.getElementById('card-frame');
    const profileCard = document.getElementById('profile-card');

    // ── Audio ────────────────────────────────────────────
    const bgAudio = document.getElementById('bg-audio');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const vinylIcon = document.getElementById('vinyl-icon');
    const progressBar = document.getElementById('progress');
    const progressContainer = document.getElementById('progress-bar-container');
    const songTitle = document.getElementById('track-title');

    const playlist = [
        { title: 'MIDNIGHT', src: 'sound/Midnight.mp3' },
        { title: 'LET_HIM_COOK', src: 'sound/Let_Him_Cook.mp3' }
    ];
    let currentTrack = 0;
    let isPlaying = false;

    function loadTrack(index) {
        const track = playlist[index];
        bgAudio.src = track.src;
        songTitle.textContent = track.title;
        progressBar.style.width = '0%';
        if (isPlaying) {
            bgAudio.play().catch(() => {});
        }
    }

    function setPlayState(playing) {
        isPlaying = playing;
        if (playing) {
            playPauseBtn.classList.replace('fa-play', 'fa-pause');
            vinylIcon.classList.add('playing');
            // Glow pulse on vinyl when playing
            animate(vinylIcon, { textShadow: ['0 0 5px #00f2ff', '0 0 25px #00f2ff', '0 0 5px #00f2ff'] }, { duration: 2, repeat: Infinity });
        } else {
            playPauseBtn.classList.replace('fa-pause', 'fa-play');
            vinylIcon.classList.remove('playing');
        }
    }

    bgAudio.volume = 0.5;
    bgAudio.addEventListener('timeupdate', () => {
        if (bgAudio.duration) {
            progressBar.style.width = `${(bgAudio.currentTime / bgAudio.duration) * 100}%`;
        }
    });
    bgAudio.addEventListener('ended', () => {
        currentTrack = (currentTrack + 1) % playlist.length;
        loadTrack(currentTrack);
    });
    progressContainer.addEventListener('click', (e) => {
        if (bgAudio.duration) {
            bgAudio.currentTime = (e.offsetX / progressContainer.clientWidth) * bgAudio.duration;
        }
    });

    playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isPlaying) { bgAudio.pause(); setPlayState(false); }
        else { bgAudio.play().then(() => setPlayState(true)).catch(() => {}); }
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

    // ── Initiation / Splash ──────────────────────────────
    initBtn.addEventListener('click', () => {
        // Start audio
        loadTrack(currentTrack);
        bgAudio.play().then(() => setPlayState(true)).catch(() => {});

        // Animate button then hide splash
        animate(initBtn, { scale: [1, 1.05, 0.95, 1] }, { duration: 0.4 }).then(() => {
            animate(splash, { opacity: 0 }, { duration: 0.8 }).then(() => {
                splash.style.display = 'none';
            });

            // ── Entrance Animations (Motion.js) ──────────
            // Main content fade in + rise
            animate(mainContent, { opacity: [0, 1], y: [40, 0] }, { duration: 0.8, easing: [0.16, 1, 0.3, 1] });

            // Player slide in from bottom-right
            animate(player, { opacity: [0, 1], y: [30, 0], x: [20, 0] }, { duration: 0.8, delay: 0.3, easing: [0.16, 1, 0.3, 1] });

            // Stagger social buttons
            const socialBtns = document.querySelectorAll('.social-btn');
            animate(socialBtns, { opacity: [0, 1], y: [20, 0], scale: [0.8, 1] }, {
                delay: stagger(0.08, { start: 0.6 }),
                duration: 0.5,
                easing: [0.34, 1.56, 0.64, 1]
            });

            // Avatar pop in
            const avatarWrap = document.getElementById('avatar-wrap');
            animate(avatarWrap, { scale: [0.5, 1.1, 1], opacity: [0, 1] }, { duration: 0.7, delay: 0.4, easing: [0.34, 1.56, 0.64, 1] });

            // Name and bio fade in
            animate('h1', { opacity: [0, 1], y: [15, 0] }, { duration: 0.6, delay: 0.55 });
            animate('.font-mono', { opacity: [0, 1], x: [-10, 0] }, { duration: 0.5, delay: 0.65 });
        });
    });

    // ── 3D Card Tilt (Mouse Parallax) ────────────────────
    const card = document.getElementById('profile-card');
    let tiltX = 0, tiltY = 0;

    document.addEventListener('mousemove', (e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;

        // Smooth tilt with Motion
        tiltX = (e.clientY - cy) / 35;
        tiltY = (cx - e.clientX) / 35;

        animate(cardFrame, {
            rotateX: tiltX,
            rotateY: tiltY,
        }, { duration: 0.4, easing: 'ease-out' });
    });

    document.addEventListener('mouseleave', () => {
        animate(cardFrame, { rotateX: 0, rotateY: 0 }, { duration: 0.8, easing: [0.16, 1, 0.3, 1] });
    });

    // ── Social button click ripple ────────────────────────
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            animate(btn, { scale: [1, 0.85, 1.1, 1] }, { duration: 0.4, easing: [0.34, 1.56, 0.64, 1] });
        });
    });

    // ── HUD dynamics ─────────────────────────────────────
    const hudLoad = document.getElementById('hud-load');
    const hudStatus = document.getElementById('hud-status');

    setInterval(() => {
        const load = 30 + Math.floor(Math.random() * 25);
        hudLoad.style.width = `${load}%`;

        // Rare glitch effect
        if (Math.random() > 0.93) {
            const original = hudStatus.textContent;
            hudStatus.textContent = '404: ERR_DETECTED';
            hudStatus.style.color = '#ff00ff';
            hudStatus.style.textShadow = '0 0 10px #ff00ff';
            setTimeout(() => {
                hudStatus.textContent = original;
                hudStatus.style.color = '';
                hudStatus.style.textShadow = '0 0 10px #00f2ff';
            }, 900);
        }
    }, 2500);
});
