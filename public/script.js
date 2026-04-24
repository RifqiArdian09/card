document.addEventListener('DOMContentLoaded', () => {

    // ── tsParticles Neural Network ─────────────────────────────────
    tsParticles.load('tsparticles', {
        fullScreen: false,
        background: { color: { value: '#020204' } },
        fpsLimit: 60,
        interactivity: {
            events: {
                onHover: { enable: true, mode: ['grab', 'bubble'] },
                onClick: { enable: true, mode: 'push' },
                resize: true,
            },
            modes: {
                grab: { distance: 160, links: { opacity: 0.5 } },
                bubble: { distance: 200, size: 6, opacity: 0.8 },
                push: { quantity: 3 },
            },
        },
        particles: {
            number: { value: 80, density: { enable: true, area: 900 } },
            color: { value: ['#00f2ff', '#ff00ff', '#39ff14'] },
            links: {
                enable: true,
                distance: 130,
                color: '#00f2ff',
                opacity: 0.15,
                width: 1,
            },
            move: {
                enable: true,
                speed: 0.6,
                direction: 'none',
                outModes: 'bounce',
            },
            shape: { type: 'circle' },
            opacity: { value: { min: 0.2, max: 0.7 }, animation: { enable: true, speed: 1, sync: false } },
            size: { value: { min: 1, max: 3 } },
        },
        detectRetina: true,
    });

    // ── Leaflet Map ─────────────────────────────────────────────────
    const map = L.map('map', {
        zoomControl: false, attributionControl: false,
        dragging: false, scrollWheelZoom: false,
        doubleClickZoom: false, touchZoom: false,
    }).setView([-3.7928, 102.2608], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);

    const neonIcon = L.divIcon({
        html: `<div style="width:12px;height:12px;background:#00f2ff;border-radius:50%;box-shadow:0 0 12px #00f2ff,0 0 30px #00f2ff;"></div>`,
        className: '', iconSize: [12, 12], iconAnchor: [6, 6],
    });
    L.marker([-3.7928, 102.2608], { icon: neonIcon }).addTo(map);

    // ── Terminal Typing Splash ──────────────────────────────────────
    const terminalLines = document.getElementById('terminal-lines');
    const initBtn       = document.getElementById('init-btn');
    const splash        = document.getElementById('splash');

    const script = [
        { delay: 400,  html: `<div class="t-line"><span class="prompt">visitor@vanguard</span>:<span class="cmd">~$</span> load_profile --user=rifqi</div>` },
        { delay: 900,  html: `<div class="t-line"><span class="ok">✓</span> Connecting to VANGUARD_OS...</div>` },
        { delay: 1400, html: `<div class="t-line"><span class="ok">✓</span> Auth: <span class="val">GRANTED</span></div>` },
        { delay: 1900, html: `<div class="t-line"><span class="prompt">visitor@vanguard</span>:<span class="cmd">~$</span> status --rifqi</div>` },
        { delay: 2400, html: `<div class="t-line">  <span class="key">name</span>:     <span class="val">rifqi ardian</span></div>` },
        { delay: 2700, html: `<div class="t-line">  <span class="key">role</span>:     <span class="val">digital_architect</span></div>` },
        { delay: 3000, html: `<div class="t-line">  <span class="key">node</span>:     <span class="val">bengkulu // IDN</span></div>` },
        { delay: 3300, html: `<div class="t-line">  <span class="key">status</span>:   <span class="ok">online</span></div>` },
        { delay: 3700, html: `<div class="t-line"><span class="ok">✓</span> Profile loaded. Press [INITIATE] to enter.</div>` },
    ];

    let termDone = false;
    script.forEach(({ delay, html }) => {
        setTimeout(() => {
            terminalLines.insertAdjacentHTML('beforeend', html);
            terminalLines.parentElement.scrollTop = 99999;
        }, delay);
    });

    setTimeout(() => {
        initBtn.disabled = false;
        initBtn.textContent = '[ INITIATE_SESSION ]';
        termDone = true;
    }, 4200);

    // ── Initiation ─────────────────────────────────────────────────
    const mainContent = document.getElementById('main-content');
    const player      = document.getElementById('player');

    function launchUI() {
        // Fade out splash
        splash.classList.add('out');
        setTimeout(() => { splash.style.display = 'none'; }, 900);

        // Show card
        mainContent.style.opacity = '1';

        // Show player
        setTimeout(() => { player.classList.add('show'); }, 400);

        // Stagger socials
        const btns = document.querySelectorAll('.soc');
        btns.forEach((btn, i) => {
            btn.style.opacity = '0';
            btn.style.transform = 'translateY(14px) scale(0.85)';
            btn.style.transition = `opacity 0.4s ease ${0.5 + i * 0.07}s, transform 0.4s cubic-bezier(0.34,1.56,0.64,1) ${0.5 + i * 0.07}s`;
            setTimeout(() => {
                btn.style.opacity = '1';
                btn.style.transform = 'translateY(0) scale(1)';
            }, 20);
        });

        // Start music
        loadTrack(currentTrack);
        bgAudio.play().then(() => setPlay(true)).catch(() => setPlay(false));
    }

    initBtn.addEventListener('click', launchUI);

    // ── Audio ──────────────────────────────────────────────────────
    const bgAudio      = document.getElementById('bg-audio');
    const playBtn      = document.getElementById('play-pause-btn');
    const prevBtn      = document.getElementById('prev-btn');
    const nextBtn      = document.getElementById('next-btn');
    const vinyl        = document.getElementById('vinyl-icon');
    const progress     = document.getElementById('progress');
    const progBar      = document.getElementById('progress-bar-container');
    const trackTitle   = document.getElementById('track-title');

    const playlist = [
        { title: 'MIDNIGHT',     src: 'sound/Midnight.mp3'     },
        { title: 'LET_HIM_COOK', src: 'sound/Let_Him_Cook.mp3' },
    ];
    let currentTrack = 0, isPlaying = false;

    function loadTrack(i) {
        bgAudio.src = playlist[i].src;
        trackTitle.textContent = playlist[i].title;
        progress.style.width = '0%';
        if (isPlaying) bgAudio.play().catch(() => {});
    }

    function setPlay(on) {
        isPlaying = on;
        if (on) {
            playBtn.classList.replace('fa-play', 'fa-pause');
            vinyl.classList.add('playing');
        } else {
            playBtn.classList.replace('fa-pause', 'fa-play');
            vinyl.classList.remove('playing');
        }
    }

    bgAudio.volume = 0.5;
    bgAudio.addEventListener('timeupdate', () => {
        if (bgAudio.duration) progress.style.width = `${(bgAudio.currentTime / bgAudio.duration) * 100}%`;
    });
    bgAudio.addEventListener('ended', () => { currentTrack = (currentTrack + 1) % playlist.length; loadTrack(currentTrack); });

    progBar.addEventListener('click', (e) => {
        if (bgAudio.duration) bgAudio.currentTime = (e.offsetX / progBar.clientWidth) * bgAudio.duration;
    });

    playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isPlaying) { bgAudio.pause(); setPlay(false); }
        else           { bgAudio.play().then(() => setPlay(true)).catch(() => {}); }
    });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); currentTrack = (currentTrack + 1) % playlist.length; loadTrack(currentTrack); });
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); currentTrack = (currentTrack - 1 + playlist.length) % playlist.length; loadTrack(currentTrack); });

    // ── 3D Tilt ────────────────────────────────────────────────────
    const frame = document.getElementById('card-frame');
    document.addEventListener('mousemove', (e) => {
        const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
        frame.style.transform = `rotateX(${(e.clientY - cy) / 38}deg) rotateY(${-(e.clientX - cx) / 38}deg)`;
    });
    document.addEventListener('mouseleave', () => {
        frame.style.transition = 'transform 0.8s cubic-bezier(0.16,1,0.3,1)';
        frame.style.transform  = 'rotateX(0) rotateY(0)';
        setTimeout(() => frame.style.transition = 'transform 0.15s linear', 800);
    });

    // ── HUD dynamics ───────────────────────────────────────────────
    const hudLoad   = document.getElementById('hud-load');
    const hudStatus = document.getElementById('hud-status');

    setInterval(() => {
        if (hudLoad) hudLoad.style.width = `${28 + Math.floor(Math.random() * 30)}%`;

        if (Math.random() > 0.94) {
            const orig = hudStatus.textContent;
            hudStatus.textContent = '404: ERR';
            hudStatus.style.color = '#ff00ff';
            hudStatus.style.textShadow = '0 0 10px #ff00ff';
            setTimeout(() => {
                hudStatus.textContent = orig;
                hudStatus.style.color = '';
                hudStatus.style.textShadow = '';
            }, 800);
        }
    }, 2500);
});
