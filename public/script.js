/* ─────────────────────────────────────────────────────
   HOLOGRAPHIC PROFILE CARD — script.js
───────────────────────────────────────────────────── */
(function () {
    'use strict';

    // ── Custom Cursor ────────────────────────────────
    const dot  = document.createElement('div'); dot.id  = 'cursor-dot';
    const ring = document.createElement('div'); ring.id = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = -100, my = -100, rx = -100, ry = -100;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    (function cursorLoop() {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        dot.style.left  = mx + 'px'; dot.style.top  = my + 'px';
        ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
        requestAnimationFrame(cursorLoop);
    })();

    document.querySelectorAll('a, button, .ctrl, .soc-link').forEach(el => {
        el.addEventListener('mouseenter', () => ring.style.transform = 'translate(-50%,-50%) scale(1.8)');
        el.addEventListener('mouseleave', () => ring.style.transform = 'translate(-50%,-50%) scale(1)');
    });

    // ── WebGL Aurora Background ──────────────────────
    const canvas = document.getElementById('aurora');
    const gl = canvas.getContext('webgl');

    if (gl) {
        const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; gl.viewport(0,0,innerWidth,innerHeight); };
        resize();
        window.addEventListener('resize', resize);

        const vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, `attribute vec2 p; void main(){gl_Position=vec4(p,0,1);}`);
        gl.compileShader(vs);

        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, `
            precision mediump float;
            uniform float t;
            uniform vec2 res;
            uniform vec2 mouse;

            float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }

            float noise(vec2 p){
                vec2 i=floor(p), f=fract(p);
                f=f*f*(3.0-2.0*f);
                return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
                           mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
            }

            float fbm(vec2 p){
                float v=0.0, a=0.5;
                for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.1; a*=0.5; }
                return v;
            }

            void main(){
                vec2 uv = gl_FragCoord.xy / res;
                vec2 m  = mouse / res;

                float n1 = fbm(uv * 2.5 + vec2(t*0.08, t*0.04));
                float n2 = fbm(uv * 3.0 - vec2(t*0.05, t*0.09) + m*0.3);
                float n3 = fbm(uv * 1.8 + vec2(n1*0.6, n2*0.6));

                vec3 col1 = vec3(0.0, 0.15, 0.25);
                vec3 col2 = vec3(0.08, 0.0, 0.18);
                vec3 col3 = vec3(0.0, 0.06, 0.12);

                vec3 col = mix(col1, col2, n3);
                col = mix(col, col3, fbm(uv + t*0.02));
                col += 0.04 * vec3(n1*0.5, n2*0.2, n3);

                // Vignette
                float vign = 1.0 - smoothstep(0.3, 1.2, length(uv - 0.5) * 2.0);
                col *= vign * 0.85;

                gl_FragColor = vec4(col, 1.0);
            }
        `);
        gl.compileShader(fs);

        const prog = gl.createProgram();
        gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); gl.useProgram(prog);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

        const pLoc  = gl.getAttribLocation(prog, 'p');
        const tLoc  = gl.getUniformLocation(prog, 't');
        const rLoc  = gl.getUniformLocation(prog, 'res');
        const mLoc  = gl.getUniformLocation(prog, 'mouse');
        gl.enableVertexAttribArray(pLoc);
        gl.vertexAttribPointer(pLoc, 2, gl.FLOAT, false, 0, 0);

        let auroraMouseX = innerWidth/2, auroraMouseY = innerHeight/2;
        document.addEventListener('mousemove', e => { auroraMouseX = e.clientX; auroraMouseY = e.clientY; });

        let start = performance.now();
        (function auroraLoop() {
            const t = (performance.now() - start) * 0.001;
            gl.uniform1f(tLoc, t);
            gl.uniform2f(rLoc, canvas.width, canvas.height);
            gl.uniform2f(mLoc, auroraMouseX, auroraMouseY);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            requestAnimationFrame(auroraLoop);
        })();
    }

    // ── Leaflet Map ──────────────────────────────────
    const leafMap = L.map('map', {
        zoomControl: false, attributionControl: false,
        dragging: false, scrollWheelZoom: false,
        doubleClickZoom: false, touchZoom: false,
    }).setView([-3.7928, 102.2608], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(leafMap);

    L.marker([-3.7928, 102.2608], {
        icon: L.divIcon({
            html: `<div style="width:10px;height:10px;background:#00f2ff;border-radius:50%;box-shadow:0 0 0 4px rgba(0,242,255,0.2),0 0 15px #00f2ff;"></div>`,
            className: '', iconSize: [10,10], iconAnchor: [5,5],
        })
    }).addTo(leafMap);

    // ── Splash Screen ────────────────────────────────
    const splash  = document.getElementById('splash');
    const bar     = document.getElementById('splash-bar');
    const hint    = document.getElementById('splash-hint');
    const main    = document.getElementById('main');
    const player  = document.getElementById('player');

    // Animate loading bar
    setTimeout(() => { bar.style.width = '100%'; }, 100);

    let splashDone = false;
    setTimeout(() => {
        splashDone = true;
        hint.style.color = 'rgba(255,255,255,0.5)';
    }, 2200);

    function enterSite() {
        if (!splashDone) return;
        splash.classList.add('fade-out');
        setTimeout(() => { splash.style.display = 'none'; }, 1000);
        main.classList.add('visible');
        setTimeout(() => { player.classList.add('visible'); }, 600);

        // Start audio
        loadTrack(currentTrack);
        audio.play().then(() => setPlay(true)).catch(() => setPlay(false));

        // Stagger socials
        document.querySelectorAll('.soc-link').forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(12px)';
            el.style.transition = `opacity 0.4s ${0.3 + i * 0.06}s ease, transform 0.4s ${0.3 + i * 0.06}s cubic-bezier(0.34,1.56,0.64,1)`;
            setTimeout(() => { el.style.opacity = '1'; el.style.transform = ''; }, 20);
        });
    }

    splash.addEventListener('click', enterSite);

    // ── Holographic Card Effect ──────────────────────
    const card     = document.getElementById('card');
    const holo     = document.getElementById('holo');
    const cardEdge = document.getElementById('card-edge');
    const scene    = document.getElementById('card-scene');

    let cardBounds = card.getBoundingClientRect();
    window.addEventListener('resize', () => { cardBounds = card.getBoundingClientRect(); });

    document.addEventListener('mousemove', e => {
        if (!main.classList.contains('visible')) return;
        cardBounds = card.getBoundingClientRect();

        const cx   = cardBounds.left + cardBounds.width  / 2;
        const cy   = cardBounds.top  + cardBounds.height / 2;
        const dx   = e.clientX - cx;
        const dy   = e.clientY - cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const maxD = Math.max(cardBounds.width, cardBounds.height) * 0.8;
        const inside = dist < maxD * 1.5;

        // 3D Tilt
        const rx = -(dy / (cardBounds.height / 2)) * 10;
        const ry =  (dx / (cardBounds.width  / 2)) * 10;
        card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(${inside ? 1.02 : 1})`;

        if (inside) {
            // Holo foil — position relative to card
            const px = ((e.clientX - cardBounds.left) / cardBounds.width)  * 100;
            const py = ((e.clientY - cardBounds.top)  / cardBounds.height) * 100;

            holo.style.background = `
                radial-gradient(circle at ${px}% ${py}%,
                    rgba(255,255,255,0.12) 0%,
                    rgba(0,242,255,0.08)   20%,
                    rgba(255,0,255,0.06)   40%,
                    rgba(57,255,20,0.04)   60%,
                    transparent 70%
                ),
                linear-gradient(
                    ${135 + ry * 2}deg,
                    transparent 40%,
                    rgba(0,242,255,0.04) 50%,
                    transparent 60%
                )
            `;
            holo.style.opacity = '1';

            // Edge shimmer
            cardEdge.style.borderImage = `
                linear-gradient(${135 + ry * 3}deg,
                    rgba(0,242,255,0.5),
                    rgba(255,0,255,0.3),
                    rgba(57,255,20,0.2),
                    rgba(0,242,255,0.5)
                ) 1
            `;
        } else {
            holo.style.opacity = '0';
            cardEdge.style.borderImage = 'none';
        }
    });

    document.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.8s cubic-bezier(0.16,1,0.3,1)';
        card.style.transform = 'rotateX(0) rotateY(0) scale(1)';
        holo.style.opacity = '0';
        setTimeout(() => { card.style.transition = ''; }, 800);
    });

    // ── Audio Player ─────────────────────────────────
    const audio    = document.getElementById('audio');
    const playBtn  = document.getElementById('play-btn');
    const prevBtn  = document.getElementById('prev-btn');
    const nextBtn  = document.getElementById('next-btn');
    const vinyl    = document.getElementById('vinyl');
    const prog     = document.getElementById('prog');
    const progWrap = document.getElementById('prog-wrap');
    const trackName = document.getElementById('track-name');

    const playlist = [
        { title: 'MIDNIGHT',     src: 'sound/Midnight.mp3'     },
        { title: 'LET_HIM_COOK', src: 'sound/Let_Him_Cook.mp3' },
    ];
    let currentTrack = 0, isPlaying = false;

    function loadTrack(i) {
        audio.src = playlist[i].src;
        trackName.textContent = playlist[i].title;
        prog.style.width = '0%';
        if (isPlaying) audio.play().catch(() => {});
    }

    function setPlay(on) {
        isPlaying = on;
        playBtn.classList.toggle('fa-play',  !on);
        playBtn.classList.toggle('fa-pause',  on);
        vinyl.classList.toggle('spin', on);
    }

    audio.volume = 0.5;
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) prog.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
    });
    audio.addEventListener('ended', () => {
        currentTrack = (currentTrack + 1) % playlist.length;
        loadTrack(currentTrack);
    });
    progWrap.addEventListener('click', e => {
        if (audio.duration) audio.currentTime = (e.offsetX / progWrap.clientWidth) * audio.duration;
    });
    playBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (isPlaying) { audio.pause(); setPlay(false); }
        else           { audio.play().then(() => setPlay(true)).catch(() => {}); }
    });
    nextBtn.addEventListener('click', e => { e.stopPropagation(); currentTrack = (currentTrack + 1) % playlist.length; loadTrack(currentTrack); });
    prevBtn.addEventListener('click', e => { e.stopPropagation(); currentTrack = (currentTrack - 1 + playlist.length) % playlist.length; loadTrack(currentTrack); });

})();
