document.addEventListener('DOMContentLoaded', () => {

    // ── Canvas Neural Network Background ──────────────────────────────
    const canvas = document.getElementById('bg-canvas');
    const ctx    = canvas.getContext('2d');
    let W, H, particles;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
        initParticles();
    }

    function initParticles() {
        particles = Array.from({ length: 70 }, () => ({
            x:  Math.random() * W,
            y:  Math.random() * H,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r:  Math.random() * 1.5 + 0.5,
        }));
    }

    function drawParticles() {
        ctx.clearRect(0, 0, W, H);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 130) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0,242,255,${0.08 * (1 - dist/130)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw nodes
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,242,255,0.25)';
            ctx.fill();

            // Move
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;
        });

        requestAnimationFrame(drawParticles);
    }

    window.addEventListener('resize', resize);
    resize();
    drawParticles();

    // ── Leaflet Map ───────────────────────────────────────────────────
    const map = L.map('map', {
        zoomControl: false, attributionControl: false,
        dragging: false, scrollWheelZoom: false,
        doubleClickZoom: false, touchZoom: false,
    }).setView([-3.7928, 102.2608], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);

    const neonIcon = L.divIcon({
        html: `<div style="width:10px;height:10px;background:#00f2ff;border-radius:50%;box-shadow:0 0 12px #00f2ff,0 0 30px #00f2ff;"></div>`,
        className: '', iconSize: [10, 10], iconAnchor: [5, 5],
    });
    L.marker([-3.7928, 102.2608], { icon: neonIcon }).addTo(map);

    // ── Live Clock (WIB = UTC+7) ──────────────────────────────────────
    const clockEl = document.getElementById('live-clock');
    function updateClock() {
        const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
        const hh = String(now.getHours()).padStart(2,'0');
        const mm = String(now.getMinutes()).padStart(2,'0');
        const ss = String(now.getSeconds()).padStart(2,'0');
        clockEl.textContent = `${hh}:${mm}:${ss} WIB`;
    }
    updateClock();
    setInterval(updateClock, 1000);

    // ── Typewriter Bio ────────────────────────────────────────────────
    const bioEl   = document.getElementById('bio-text');
    const bioStr  = 'Synthesizing virtual realities and building the future of code. Specializing in modern web architecture, UI systems, and digital experiences that push boundaries.';
    let bioIdx = 0;

    function typeBio() {
        if (bioIdx < bioStr.length) {
            bioEl.textContent += bioStr[bioIdx++];
            setTimeout(typeBio, 22);
        }
    }

    // ── Skill bars animate in ─────────────────────────────────────────
    function animateSkills() {
        document.querySelectorAll('.skill-fill').forEach(el => {
            setTimeout(() => { el.style.width = el.dataset.w + '%'; }, 200);
        });
    }

    // ── Audio / Playlist ──────────────────────────────────────────────
    const bgAudio   = document.getElementById('bg-audio');
    const ppBtn     = document.getElementById('play-pause-btn');
    const prevBtn   = document.getElementById('prev-btn');
    const nextBtn   = document.getElementById('next-btn');
    const vinyl     = document.getElementById('vinyl');
    const pBar      = document.getElementById('progress');
    const pContainer= document.getElementById('progress-bar-container');
    const titleEl   = document.getElementById('track-title');

    const playlist  = [
        { title: 'MIDNIGHT',     src: 'sound/Midnight.mp3'     },
        { title: 'LET_HIM_COOK', src: 'sound/Let_Him_Cook.mp3' },
    ];
    let trackIdx = 0, playing = false;

    function loadTrack(i) {
        const t = playlist[i];
        bgAudio.src   = t.src;
        titleEl.textContent = t.title;
        pBar.style.width = '0%';
        if (playing) bgAudio.play().catch(() => {});
    }

    function setPlay(state) {
        playing = state;
        ppBtn.classList.toggle('fa-play',  !state);
        ppBtn.classList.toggle('fa-pause',  state);
        vinyl.classList.toggle('playing',   state);
    }

    bgAudio.volume = 0.5;
    bgAudio.addEventListener('timeupdate', () => {
        if (bgAudio.duration)
            pBar.style.width = `${(bgAudio.currentTime / bgAudio.duration) * 100}%`;
    });
    bgAudio.addEventListener('ended', () => { trackIdx = (trackIdx + 1) % playlist.length; loadTrack(trackIdx); });
    pContainer.addEventListener('click', e => {
        if (bgAudio.duration) bgAudio.currentTime = (e.offsetX / pContainer.clientWidth) * bgAudio.duration;
    });

    ppBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (playing) { bgAudio.pause(); setPlay(false); }
        else { bgAudio.play().then(() => setPlay(true)).catch(() => {}); }
    });
    nextBtn.addEventListener('click', e => { e.stopPropagation(); trackIdx=(trackIdx+1)%playlist.length; loadTrack(trackIdx); });
    prevBtn.addEventListener('click', e => { e.stopPropagation(); trackIdx=(trackIdx-1+playlist.length)%playlist.length; loadTrack(trackIdx); });

    // ── Splash → Reveal ───────────────────────────────────────────────
    document.getElementById('init-btn').addEventListener('click', () => {
        // Audio start
        loadTrack(trackIdx);
        bgAudio.play().then(() => setPlay(true)).catch(() => {});

        // Hide splash
        const splash = document.getElementById('splash');
        splash.classList.add('out');
        setTimeout(() => splash.style.display = 'none', 900);

        // Show app
        const app = document.getElementById('app');
        setTimeout(() => app.classList.add('visible'), 100);

        // Show player
        setTimeout(() => document.getElementById('player').classList.add('visible'), 500);

        // Typewriter bio
        setTimeout(typeBio, 600);

        // Skill bars
        setTimeout(animateSkills, 700);
    });

    // ── 3D Mouse Tilt ─────────────────────────────────────────────────
    const app = document.getElementById('app');
    document.addEventListener('mousemove', e => {
        const cx = window.innerWidth  / 2;
        const cy = window.innerHeight / 2;
        const rx =  (e.clientY - cy) / 40;
        const ry = -(e.clientX - cx) / 40;
        app.style.transform    = `rotateX(${rx}deg) rotateY(${ry}deg)`;
        app.style.transition   = 'transform 0.12s linear';
        app.style.perspective  = '1200px';
    });
    document.addEventListener('mouseleave', () => {
        app.style.transform  = 'rotateX(0) rotateY(0)';
        app.style.transition = 'transform 0.9s cubic-bezier(0.16,1,0.3,1)';
    });
});
