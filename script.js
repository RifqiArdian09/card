document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.card-frame');
    const nebula = document.querySelector('.nebula');
    const grid = document.querySelector('.grid-system');
    const body = document.body;

    // --- Interactive Parallax & Tilt ---
    document.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Card Tilt
        const rotateX = (clientY - centerY) / 40;
        const rotateY = (centerX - clientX) / 40;
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

        // Background Parallax
        const moveX = (clientX - centerX) / 100;
        const moveY = (clientY - centerY) / 100;
        nebula.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
        grid.style.transform = `translate(${moveX * 0.5}px, ${moveY * 0.5}px)`;

        // HUD Glitch Effect (Random)
        if (Math.random() > 0.98) {
            body.style.filter = 'hue-rotate(90deg) contrast(1.2)';
            setTimeout(() => body.style.filter = 'none', 50);
        }
    });

    document.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
        card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });

    document.addEventListener('mouseenter', () => {
        card.style.transition = 'none';
    });

    // --- Music Player Logic ---
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const vinylIcon = document.querySelector('.vinyl-icon');
    const bgAudio = document.getElementById('bg-audio');
    const progressBar = document.getElementById('progress');
    const progressContainer = document.getElementById('progress-bar-container');
    const songTitleDisplay = document.querySelector('.track-title');
    
    const playlist = [
        { title: "VANGUARD // MIDNIGHT", src: "sound/Midnight.mp3" },
        { title: "VANGUARD // LET_HIM_COOK", src: "sound/Let Him Cook.mp3" }
    ];
    let currentTrackIndex = 0;
    let isPlaying = false;

    function loadTrack(index) {
        const track = playlist[index];
        bgAudio.src = track.src;
        songTitleDisplay.textContent = track.title;
        progressBar.style.width = '0%';
        
        if (isPlaying) {
            const playPromise = bgAudio.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    isPlaying = false;
                    updateUI();
                });
            }
        }
        updateUI();
    }

    function updateUI() {
        if (isPlaying) {
            playPauseBtn.classList.replace('fa-play', 'fa-pause');
            vinylIcon.style.animationPlayState = 'running';
        } else {
            playPauseBtn.classList.replace('fa-pause', 'fa-play');
            vinylIcon.style.animationPlayState = 'paused';
        }
    }

    if (bgAudio) {
        bgAudio.volume = 0.5;
        loadTrack(currentTrackIndex);
        
        // --- INITIATION LOGIC (Autoplay Solution) ---
        const initBtn = document.getElementById('init-btn');
        const splash = document.getElementById('splash-screen');

        initBtn.addEventListener('click', () => {
            bgAudio.play().then(() => {
                isPlaying = true;
                updateUI();
                
                // Transition UI
                splash.classList.add('fade-out');
                document.body.classList.remove('loading');
                
                setTimeout(() => {
                    splash.style.display = 'none';
                }, 800);
            }).catch(err => {
                console.error("Audio playback failed:", err);
                // Force entry even if audio fails
                splash.classList.add('fade-out');
                document.body.classList.remove('loading');
            });
        });

        bgAudio.addEventListener('timeupdate', () => {
            if (bgAudio.duration) {
                const percent = (bgAudio.currentTime / bgAudio.duration) * 100;
                progressBar.style.width = `${percent}%`;
            }
        });

        bgAudio.addEventListener('ended', () => {
            currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
            loadTrack(currentTrackIndex);
        });

        progressContainer.addEventListener('click', (e) => {
            const width = progressContainer.clientWidth;
            const clickX = e.offsetX;
            bgAudio.currentTime = (clickX / width) * bgAudio.duration;
        });
    }

    playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isPlaying) {
            bgAudio.pause();
        } else {
            bgAudio.play();
        }
        isPlaying = !isPlaying;
        updateUI();
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex);
    });

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrackIndex);
    });

    // --- Dynamic HUD Load Animation ---
    const loadFill = document.querySelector('.hud-bar-fill');
    setInterval(() => {
        const load = 30 + Math.floor(Math.random() * 20);
        loadFill.style.width = `${load}%`;
    }, 2000);

    // --- Code Background ---
    const codeBg = document.getElementById('code-bg');
    if (codeBg) {
        const snippets = [
            'initializing_system_vanguard...',
            'loading_neural_layers_0x42...',
            'access_granted:rifqi_root',
            'bypassing_main_firewall...',
            'core_temp_stable:38c',
            'encryption_key_generated:256bit',
            'scanning_sector_7g_for_threats...',
            'establishing_uplink_via_satellite_idn'
        ];

        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.padding = '40px';
        container.style.fontFamily = 'Fira Code';
        container.style.fontSize = '10px';
        container.style.color = 'rgba(0, 242, 255, 0.1)';
        container.style.lineHeight = '2';
        
        let html = '';
        for (let i = 0; i < 150; i++) {
            const snippet = snippets[Math.floor(Math.random() * snippets.length)];
            html += `<div>[${new Date().toLocaleTimeString()}] ${snippet}</div>`;
        }
        container.innerHTML = html;
        codeBg.appendChild(container);
    }
});
