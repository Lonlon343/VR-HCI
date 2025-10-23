let scene, camera, renderer;
let cube, sphere;
let raycaster, mouse;
let hoveredObject = null; // <-- added: track currently hovered object
// Globale Variablen für die Texturen
let cubeTexture, sphereTexture; 
let sphereVideo, sphereVideoTexture; // <-- added for video sphere
// Globale Variablen für die ursprünglichen Materialien (um sie nach dem Klick-Effekt wiederherzustellen)
let cubeOriginalMaterial, sphereOriginalMaterial; 

// Orbit control state (simple built-in orbiting, no external dependency)
let isPointerDown = false;
let lastPointer = { x: 0, y: 0 };
let spherical = new THREE.Spherical();
const orbitTarget = new THREE.Vector3(0, 0, 0);
const rotateSpeed = 0.005;
const zoomSpeed = 0.02;
const minPhi = 0.15;
const maxPhi = Math.PI - 0.15;
const minRadius = 4;
const maxRadius = 40;

// POV settings
const usePOV = true;                 // enable POV mode
const eyeHeight = 1.7;               // meters (camera Y)
const lookSpeed = 0.0028;            // pointer look sensitivity
const minPitch = -Math.PI / 2 + 0.01;
const maxPitch = Math.PI / 2 - 0.01;

// rotation speed controls (tweak these)
const cubeRotationSpeed = { x: 0.005, y: 0.005 };
const sphereRotationSpeed = { x: 0.005, y: 0.005 };

// Initialize scene
function init() {
    scene = new THREE.Scene();
    // make scene background transparent so a CSS gradient shows through
    scene.background = null;

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    if (usePOV) {
        // set camera to eye height and use YXZ rotation order for yaw/pitch control
        camera.position.set(0, eyeHeight, 0);
        camera.rotation.order = 'YXZ';
    } else {
        camera.position.z = 10;
    }

    const canvas = document.getElementById('canvas');
    // enable alpha so the CSS background gradient is visible behind the canvas
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Ensure correct color space so textures/colors render as expected (prevents dark/black look)
    renderer.outputEncoding = THREE.sRGBEncoding;
    // keep clear alpha = 0 to allow CSS gradient to show through
    renderer.setClearColor(0x000000, 0);

    // set a page-level gradient background (change colors/angle as you like)
    document.body.style.background = 'linear-gradient(135deg, #FF8F8F 20%, #FFE0D1 40%, #f34b4bff 100%)';
    document.body.style.margin = '0'; // ensure canvas covers full window without body gap
    // ensure canvas fills viewport
    canvas.style.display = 'block';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';

    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    loadTexturesAndCreateObjects();

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // initialize spherical from current camera position (orbit around orbitTarget)
    spherical.setFromVector3(camera.position.clone().sub(orbitTarget));

    // pointer + wheel handlers
    renderer.domElement.style.cursor = usePOV ? 'grab' : 'grab';
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onCanvasClick);

    animate();
}

// NEUE FUNKTION: Texturen laden und dann Objekte erstellen 
function loadTexturesAndCreateObjects() {
    const loader = new THREE.TextureLoader();

    // Lade Textur für den Würfel (HS Coburg Logo 2)
    cubeTexture = loader.load(
        'HS Coburg logo 2.png',
        // onLoad Callback
        (tex) => {
            // ensure correct encoding
            if (tex) tex.encoding = THREE.sRGBEncoding;

            // Flatten any alpha onto a white background so the cube is not see-through
            if (tex.image) {
                const img = tex.image;
                const w = img.width || 1024;
                const h = img.height || 1024;
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                // paint white background
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, w, h);
                // draw the loaded image on top
                ctx.drawImage(img, 0, 0, w, h);
                // create a new texture without alpha
                cubeTexture = new THREE.CanvasTexture(canvas);
                cubeTexture.encoding = THREE.sRGBEncoding;
                cubeTexture.needsUpdate = true;
            }

            console.log('HS Coburg Logo geladen and flattened to white background');
        },
        undefined,
        (err) => {
            console.error('Fehler beim Laden der HS Coburg Logo Textur:', err);
        }
    );
    
    // --- replaced image sphere texture with a video texture ---
    sphereVideo = document.createElement('video');
    sphereVideo.src = 'WhatsApp Video 2024-07-09 at 11.44.46 PM.mp4';
    sphereVideo.muted = true;              // required for autoplay on many browsers
    sphereVideo.loop = true;
    sphereVideo.playsInline = true;
    sphereVideo.crossOrigin = 'anonymous';

    sphereVideoTexture = new THREE.VideoTexture(sphereVideo);
    sphereVideoTexture.minFilter = THREE.LinearFilter;
    sphereVideoTexture.magFilter = THREE.LinearFilter;
    sphereVideoTexture.format = THREE.RGBFormat;
    sphereVideoTexture.encoding = THREE.sRGBEncoding;

    // Try to autoplay; if blocked, start on first user click
    sphereVideo.play().catch(() => {
        console.warn('Video autoplay prevented — will start on user interaction.');
        const startHandler = () => {
            sphereVideo.play().catch(()=>{});
            renderer.domElement.removeEventListener('click', startHandler);
        };
        renderer.domElement.addEventListener('click', startHandler);
    });

    // Wenn Texturen/Video bereit sind, erstelle die Objekte
    // (cubeTexture load callback already calls createObjects when appropriate in your original code;
    // ensure createObjects is called once both cubeTexture and sphereVideoTexture are available)
    // For simplicity: call createObjects after a short timeout to let cubeTexture load callbacks run.
    setTimeout(createObjects, 150);
}


// Create 3D objects
function createObjects() {
    // ⬇️ WÜRFEL mit Textur und weißem Hintergrund
    const cubeGeometry = new THREE.BoxGeometry(4, 2, 2);
    // Ensure material is opaque and uses the flattened texture
    const cubeMaterial = new THREE.MeshPhongMaterial({
        map: cubeTexture,
        color: 0xffffff,
        transparent: false,
        opacity: 1,
        depthWrite: true
    });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    // position cube to the left-front of the player
    cube.position.set(-8, 0, -8);
    cube.userData = { 
        type: 'cube', 
        name: 'Logo Cube',
        url: 'https://www.hs-coburg.de/studieren/bachelor/wirtschaft/wirtschaftsinformatik-2-0/'
    };
    scene.add(cube);

    // ⬇️ KUGEL mit VIDEO-Textur (Video auf die Kugel gemappt)
    const sphereGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ 
        map: sphereVideoTexture,
        color: 0xffffff,
        side: THREE.FrontSide
    });
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    // position sphere to the right-front of the player
    sphere.position.set(8, 0, -8);
    sphere.userData = { type: 'sphere', name: 'Video Sphere', message: 'Welcome to WI 2.0' };
    scene.add(sphere);
    
    // Speichere die Original-Materialien, um sie nach dem Klick-Effekt wiederherzustellen
    cubeOriginalMaterial = cube.material;
    sphereOriginalMaterial = sphere.material;
}

// Window resize (unverändert)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle clicks
function onCanvasClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const objects = [cube, sphere];
    const intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
        const clicked = intersects[0].object;

        // Farb- und Skalierungsanimation
        // Temporäres Material für den Klick-Effekt (z.B. Weiß, um die Farbe zu ändern)
        const flashMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        
        // Speichere das aktuelle Material, bevor du es überschreibst (falls es schon ein Flash-Material ist)
        const oldMaterial = clicked.material; 

        // Setze das Flash-Material mit einer zufälligen Farbe
        flashMaterial.color.setHex(Math.random() * 0xffffff);
        clicked.material = flashMaterial; 
        
        clicked.scale.setScalar(1.5);
        
        setTimeout(() => {
            clicked.scale.setScalar(1);
            // Material nach dem Klick-Effekt auf das Original-Material (mit Textur) zurücksetzen
            if (clicked.userData.type === 'cube') clicked.material = cubeOriginalMaterial;
            if (clicked.userData.type === 'sphere') clicked.material = sphereOriginalMaterial;
        }, 300); 

        // Wenn die Kugel angeklickt wird, Info-Panel zeigen
        if (clicked.userData.type === 'sphere') {
            showAnimatedMessage(clicked.userData.message);
        }

        // Wenn der Würfel angeklickt wird, zeige spezielles Link-Panel mit komplexerer Animation
        if (clicked.userData.type === 'cube' && clicked.userData.url) {
            showAnimatedLink(clicked.userData.url);
        }
    }
}

// Zeigt ein animiertes Info-Panel (unverändert)
function showAnimatedMessage(message) {
    // remove old panel
    let existing = document.getElementById('animated-overlay');
    if (existing) existing.remove();

    // overlay
    const overlay = document.createElement('div');
    overlay.id = 'animated-overlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        inset: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)',
        zIndex: '10000',
        overflow: 'hidden'
    });
    document.body.appendChild(overlay);

    // stage with perspective for 3D feeling
    const stage = document.createElement('div');
    Object.assign(stage.style, {
        width: '680px',
        maxWidth: '92%',
        height: '260px',
        perspective: '1200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });
    overlay.appendChild(stage);

    // card (3D)
    const card = document.createElement('div');
    Object.assign(card.style, {
        position: 'relative',
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
        borderRadius: '16px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(245,245,246,0.98))',
        boxShadow: '0 30px 80px rgba(5,10,30,0.55)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'default'
    });
    stage.appendChild(card);

    // lightning canvas (border animator) - pointer-events:none so interactions pass through
    const lightCanvas = document.createElement('canvas');
    lightCanvas.style.position = 'absolute';
    lightCanvas.style.inset = '0';
    lightCanvas.style.width = '100%';
    lightCanvas.style.height = '100%';
    lightCanvas.style.pointerEvents = 'none';
    lightCanvas.style.zIndex = '5';
    card.appendChild(lightCanvas);
    const ctx = lightCanvas.getContext('2d');

    // inner content
    const title = document.createElement('div');
    title.textContent = 'Information';
    Object.assign(title.style, {
        fontSize: '20px',
        fontWeight: '700',
        marginBottom: '6px',
        color: '#0b1220',
        zIndex: '2',
        transform: 'translateZ(30px)'
    });
    card.appendChild(title);

    const content = document.createElement('div');
    content.style.fontSize = '18px';
    content.style.lineHeight = '1.4';
    content.style.color = '#111';
    content.style.maxWidth = '86%';
    content.style.textAlign = 'center';
    content.style.zIndex = '2';
    content.style.transform = 'translateZ(30px)';
    card.appendChild(content);

    // close button
    const btn = document.createElement('button');
    btn.textContent = 'Close';
    Object.assign(btn.style, {
        position: 'absolute',
        right: '18px',
        top: '14px',
        zIndex: '6',
        padding: '8px 12px',
        borderRadius: '10px',
        border: 'none',
        background: '#0b1220',
        color: '#fff',
        cursor: 'pointer',
        transform: 'translateZ(40px)'
    });
    card.appendChild(btn);

    // sheen layer for 3D gloss
    const sheen = document.createElement('div');
    Object.assign(sheen.style, {
        position: 'absolute',
        inset: '0',
        background: 'linear-gradient(120deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02))',
        mixBlendMode: 'overlay',
        zIndex: '3',
        pointerEvents: 'none',
        transform: 'translateZ(20px)'
    });
    card.appendChild(sheen);

    // typing effect
    let i = 0;
    content.textContent = '';
    const speed = 40;
    let typingTimer = null;
    function typeStep() {
        if (i < message.length) {
            content.textContent += message.charAt(i++);
            typingTimer = setTimeout(typeStep, speed);
        } else {
            // done
        }
    }
    typeStep();

    // interactive tilt (mouse move)
    function onCardMouseMove(e) {
        const r = card.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = (e.clientX - cx) / r.width;
        const dy = (e.clientY - cy) / r.height;
        const tiltX = clamp(dy * 12, -12, 12);
        const tiltY = clamp(-dx * 18, -18, 18);
        const scale = 1.02;
        card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`;
    }
    function onCardLeave() {
        card.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
    }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    card.addEventListener('mousemove', onCardMouseMove);
    card.addEventListener('mouseleave', onCardLeave);

    // lightning animation variables
    let rafId = null;
    let lastTime = 0;
    const DPR = Math.max(1, window.devicePixelRatio || 1);

    function resizeCanvas() {
        const r = lightCanvas.getBoundingClientRect();
        lightCanvas.width = Math.floor(r.width * DPR);
        lightCanvas.height = Math.floor(r.height * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resizeCanvas();
    // redraw on resize
    const resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
    });
    resizeObserver.observe(card);

    // generate border points (perimeter) and animate noise along them
    function makePerimeterPoints(w, h, step) {
        const pts = [];
        // top
        for (let x = 0; x <= w; x += step) pts.push([x, 0]);
        // right
        for (let y = step; y <= h; y += step) pts.push([w, y]);
        // bottom
        for (let x = w - step; x >= 0; x -= step) pts.push([x, h]);
        // left
        for (let y = h - step; y > 0; y -= step) pts.push([0, y]);
        return pts;
    }

    // lightning draw routine
    function drawLightning(time) {
        const now = time / 1000;
        const r = lightCanvas.getBoundingClientRect();
        const w = r.width;
        const h = r.height;
        ctx.clearRect(0, 0, w, h);

        // ambient soft border glow
        ctx.save();
        ctx.lineWidth = 6;
        ctx.strokeStyle = 'rgba(255,140,140,0.06)';
        ctx.shadowColor = 'rgba(255,140,140,0.12)';
        ctx.shadowBlur = 24;
        roundRectStroke(ctx, 3, 3, w - 6, h - 6, 14);
        ctx.restore();

        // dynamic jagged lightning loop (multiple strokes with additive blending)
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const segments = 3;
        for (let s = 0; s < segments; s++) {
            const hue = 6 + s * 8;
            ctx.lineWidth = 2 + s * 1.2;
            ctx.strokeStyle = `rgba(255,${120 + s * 20},${120 + s * 10},${0.8 - s * 0.22})`;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 14 + s * 6;
            drawJaggedBorder(ctx, w, h, now * (0.6 + s * 0.4) + s * 3, s);
        }
        ctx.restore();

        rafId = requestAnimationFrame(drawLightning);
    }

    // helper: draw jagged path around rect
    function drawJaggedBorder(ctx, w, h, t, seedOffset) {
        const step = Math.max(8, Math.round(Math.min(w, h) / 30));
        const pts = makePerimeterPoints(w, h, step);
        ctx.beginPath();
        for (let i = 0; i < pts.length; i++) {
            const [x0, y0] = pts[i];
            // noise using simple sin+rand seeded by index and time
            const phase = (i / pts.length) * Math.PI * 2 + t + seedOffset;
            const amp = 6 + 4 * Math.sin(i * 0.17 + t * 1.4 + seedOffset);
            const nx = x0 + Math.sin(phase * 1.3 + i * 0.6) * amp;
            const ny = y0 + Math.cos(phase * 1.1 + i * 0.4) * amp;
            if (i === 0) ctx.moveTo(nx, ny); else ctx.lineTo(nx, ny);
        }
        ctx.closePath();
        ctx.stroke();
    }

    function roundRectStroke(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.stroke();
    }

    // start animation
    rafId = requestAnimationFrame(drawLightning);

    // open/close interactions
    function closeOverlay() {
        card.removeEventListener('mousemove', onCardMouseMove);
        card.removeEventListener('mouseleave', onCardLeave);
        resizeObserver.disconnect();
        if (rafId) cancelAnimationFrame(rafId);
        clearTimeout(typingTimer);
        overlay.remove();
    }
    btn.addEventListener('click', closeOverlay);

    // also close on outside click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeOverlay();
    });
}

// neues, komplexeres Pop-up für den Würfel (öffnet Link)
function showAnimatedLink(url) {
    // Remove previous
    let existing = document.getElementById('link-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'link-overlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        inset: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10,10,20,0.6)',
        zIndex: '10000',
        overflow: 'hidden'
    });
    document.body.appendChild(overlay);

    // stage with perspective (same as sphere panel)
    const stage = document.createElement('div');
    Object.assign(stage.style, {
        width: '560px',
        maxWidth: '92%',
        height: '300px',
        perspective: '1200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });
    overlay.appendChild(stage);

    // card (3D) - match sphere panel styling
    const card = document.createElement('div');
    Object.assign(card.style, {
        position: 'relative',
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
        borderRadius: '16px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(245,245,246,0.98))',
        boxShadow: '0 30px 80px rgba(5,10,30,0.55)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'default'
    });
    stage.appendChild(card);

    // lightning canvas (border animator)
    const lightCanvas = document.createElement('canvas');
    Object.assign(lightCanvas.style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: '5'
    });
    card.appendChild(lightCanvas);
    const ctx = lightCanvas.getContext('2d');

    // emblem (CO)
    const emblem = document.createElement('div');
    Object.assign(emblem.style, {
        width: '64px',
        height: '64px',
        margin: '0 auto 14px auto',
        borderRadius: '12px',
        background: 'linear-gradient(135deg,#e06b80,#ffb37a)',
        boxShadow: '0 8px 20px rgba(224,107,128,0.28)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: '700',
        transform: 'translateZ(30px)'
    });
    emblem.textContent = 'CO';
    card.appendChild(emblem);

    // title & description
    const title = document.createElement('div');
    title.textContent = 'Wirtschaftsinformatik 2.0';
    Object.assign(title.style, {
        fontSize: '20px',
        fontWeight: '700',
        marginTop: '4px',
        color: '#0b1220',
        zIndex: '6',
        transform: 'translateZ(30px)'
    });
    card.appendChild(title);

    const desc = document.createElement('div');
    desc.textContent = 'Öffne die Programmseite für Details:';
    Object.assign(desc.style, {
        fontSize: '15px',
        margin: '8px 0 10px 0',
        color: '#23314a',
        zIndex: '6',
        transform: 'translateZ(30px)'
    });
    card.appendChild(desc);

    const urlLine = document.createElement('div');
    urlLine.textContent = url;
    Object.assign(urlLine.style, {
        fontSize: '12px',
        color: '#355168',
        wordBreak: 'break-all',
        marginBottom: '16px',
        zIndex: '6',
        transform: 'translateZ(30px)'
    });
    card.appendChild(urlLine);

    // buttons
    const btns = document.createElement('div');
    Object.assign(btns.style, {
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        zIndex: '6',
        transform: 'translateZ(36px)'
    });

    const openBtn = document.createElement('button');
    openBtn.textContent = 'Open page';
    Object.assign(openBtn.style, {
        background: '#0b67ff',
        color: '#fff',
        border: 'none',
        padding: '10px 16px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: '600',
        boxShadow: '0 8px 18px rgba(11,103,255,0.18)'
    });
    btns.appendChild(openBtn);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    Object.assign(closeBtn.style, {
        background: 'transparent',
        color: '#0b1220',
        border: '1px solid rgba(11,17,32,0.08)',
        padding: '10px 14px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: '600'
    });
    btns.appendChild(closeBtn);

    card.appendChild(btns);

    // sheen layer for gloss
    const sheen = document.createElement('div');
    Object.assign(sheen.style, {
        position: 'absolute',
        inset: '0',
        background: 'linear-gradient(120deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02))',
        mixBlendMode: 'overlay',
        zIndex: '3',
        pointerEvents: 'none',
        transform: 'translateZ(20px)'
    });
    card.appendChild(sheen);

    // typing effect for url
    let i = 0;
    urlLine.textContent = '';
    const speed = 20;
    let typingTimer = null;
    function typeStep() {
        if (i < url.length) {
            urlLine.textContent += url.charAt(i++);
            typingTimer = setTimeout(typeStep, speed);
        }
    }
    typeStep();

    // interactive tilt (same as sphere panel)
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function onCardMouseMove(e) {
        const r = card.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = (e.clientX - cx) / r.width;
        const dy = (e.clientY - cy) / r.height;
        const tiltX = clamp(dy * 12, -12, 12);
        const tiltY = clamp(-dx * 18, -18, 18);
        const scale = 1.02;
        card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`;
    }
    function onCardLeave() {
        card.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
    }
    card.addEventListener('mousemove', onCardMouseMove);
    card.addEventListener('mouseleave', onCardLeave);

    // lightning animator (same approach)
    let rafId = null;
    const DPR = Math.max(1, window.devicePixelRatio || 1);

    function resizeCanvas() {
        const r = lightCanvas.getBoundingClientRect();
        lightCanvas.width = Math.floor(r.width * DPR);
        lightCanvas.height = Math.floor(r.height * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(card);

    function makePerimeterPoints(w, h, step) {
        const pts = [];
        for (let x = 0; x <= w; x += step) pts.push([x, 0]);
        for (let y = step; y <= h; y += step) pts.push([w, y]);
        for (let x = w - step; x >= 0; x -= step) pts.push([x, h]);
        for (let y = h - step; y > 0; y -= step) pts.push([0, y]);
        return pts;
    }

    function drawJaggedBorder(ctx, w, h, t, seedOffset) {
        const step = Math.max(8, Math.round(Math.min(w, h) / 30));
        const pts = makePerimeterPoints(w, h, step);
        ctx.beginPath();
        for (let i = 0; i < pts.length; i++) {
            const [x0, y0] = pts[i];
            const phase = (i / pts.length) * Math.PI * 2 + t + seedOffset;
            const amp = 6 + 4 * Math.sin(i * 0.17 + t * 1.4 + seedOffset);
            const nx = x0 + Math.sin(phase * 1.3 + i * 0.6) * amp;
            const ny = y0 + Math.cos(phase * 1.1 + i * 0.4) * amp;
            if (i === 0) ctx.moveTo(nx, ny); else ctx.lineTo(nx, ny);
        }
        ctx.closePath();
        ctx.stroke();
    }

    function roundRectStroke(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.stroke();
    }

    function drawLightning(time) {
        const now = time / 1000;
        const r = lightCanvas.getBoundingClientRect();
        const w = r.width;
        const h = r.height;
        ctx.clearRect(0, 0, w, h);

        // ambient soft border glow
        ctx.save();
        ctx.lineWidth = 6;
        ctx.strokeStyle = 'rgba(255,140,140,0.06)';
        ctx.shadowColor = 'rgba(255,140,140,0.12)';
        ctx.shadowBlur = 24;
        roundRectStroke(ctx, 3, 3, w - 6, h - 6, 14);
        ctx.restore();

        // dynamic jagged lightning loop (multiple strokes with additive blending)
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const segments = 3;
        for (let s = 0; s < segments; s++) {
            ctx.lineWidth = 2 + s * 1.2;
            ctx.strokeStyle = `rgba(255,${120 + s * 20},${120 + s * 10},${0.8 - s * 0.22})`;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 14 + s * 6;
            drawJaggedBorder(ctx, w, h, now * (0.6 + s * 0.4) + s * 3, s);
        }
        ctx.restore();

        rafId = requestAnimationFrame(drawLightning);
    }

    rafId = requestAnimationFrame(drawLightning);

    // entrance animation
    requestAnimationFrame(() => {
        card.animate([
            { transform: 'rotateX(12deg) translateY(24px) scale(0.94)', opacity: 0 },
            { transform: 'rotateX(-6deg) translateY(-6px) scale(1.02)', opacity: 1 },
            { transform: 'rotateX(0deg) translateY(0) scale(1)', opacity: 1 }
        ], { duration: 480, easing: 'cubic-bezier(.2,.9,.18,1)', fill: 'forwards' });
        emblem.animate([
            { transform: 'translateZ(30px) scale(0.9) rotate(0deg)' },
            { transform: 'translateZ(30px) scale(1.06) rotate(8deg)' },
            { transform: 'translateZ(30px) scale(1) rotate(0deg)' }
        ], { duration: 800, easing: 'ease-out' });
    });

    // actions
    openBtn.addEventListener('click', () => {
        window.open(url, '_blank', 'noopener');
        closeOverlay();
    });
    closeBtn.addEventListener('click', closeOverlay);

    function closeOverlay() {
        card.removeEventListener('mousemove', onCardMouseMove);
        card.removeEventListener('mouseleave', onCardLeave);
        resizeObserver.disconnect();
        if (rafId) cancelAnimationFrame(rafId);
        clearTimeout(typingTimer);
        overlay.remove();
    }

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeOverlay();
    });
}

// pointer handlers
function onPointerDown(e) {
    // don't start look/drag if clicking with non-primary button
    if (e.button && e.button !== 0) return;
    isPointerDown = true;
    lastPointer.x = e.clientX;
    lastPointer.y = e.clientY;
    renderer.domElement.style.cursor = 'grabbing';
    // prevent default to avoid text selection / unwanted native drag
    e.preventDefault();
}

function onPointerMove(e) {
    if (!isPointerDown) return;
    const deltaX = e.clientX - lastPointer.x;
    const deltaY = e.clientY - lastPointer.y;
    lastPointer.x = e.clientX;
    lastPointer.y = e.clientY;

    if (usePOV) {
        // rotate camera: yaw around Y, pitch around X
        camera.rotation.y -= deltaX * lookSpeed;
        camera.rotation.x -= deltaY * lookSpeed;
        // clamp pitch
        camera.rotation.x = Math.max(minPitch, Math.min(maxPitch, camera.rotation.x));
    } else {
        // existing orbit behavior (update spherical angles)
        spherical.theta -= deltaX * rotateSpeed;
        spherical.phi -= deltaY * rotateSpeed;
        spherical.phi = Math.max(minPhi, Math.min(maxPhi, spherical.phi));
    }
}

function onPointerUp() {
    isPointerDown = false;
    renderer.domElement.style.cursor = 'grab';
}

function onWheel(e) {
    e.preventDefault();
    const delta = e.deltaY;
    if (usePOV) {
        // move camera forward/back relative to its local -Z axis
        const move = delta * 0.01; // tweak speed here
        // translate along camera's local Z (negative Z is forward)
        camera.translateZ(move);
        // keep camera roughly at eye height
        camera.position.y = eyeHeight;
    } else {
        spherical.radius += delta * zoomSpeed;
        spherical.radius = Math.max(minRadius, Math.min(maxRadius, spherical.radius));
    }
}

// New hover handler: raycast from mouse and update hoveredObject
function onPointerHover(e) {
    // ignore hover while dragging
    if (isPointerDown) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const objects = [cube, sphere].filter(Boolean);
    const intersects = raycaster.intersectObjects(objects, false);

    const newHover = (intersects.length > 0) ? intersects[0].object : null;

    if (newHover !== hoveredObject) {
        // clear previous
        if (hoveredObject) {
            hoveredObject.userData.targetScale = hoveredObject.userData.baseScale || 1;
        }

        // set new hovered
        hoveredObject = newHover;
        if (hoveredObject) {
            hoveredObject.userData.targetScale = (hoveredObject.userData.baseScale || 1) * 1.12;
            renderer.domElement.style.cursor = 'pointer';
        } else {
            renderer.domElement.style.cursor = usePOV ? 'grab' : 'grab';
        }
    }
}

// Animate loop (unverändert except camera update to follow spherical)
function animate() {
    requestAnimationFrame(animate);

    if (!usePOV) {
        // update camera from spherical orbit around orbitTarget
        const offset = new THREE.Vector3().setFromSpherical(spherical);
        camera.position.copy(orbitTarget).add(offset);
        camera.lookAt(orbitTarget);
    } else {
        // ensure camera stays at eye height (prevent accidental Y drift)
        camera.position.y = eyeHeight;
        // camera.rotation already controlled by pointer
    }

    // smooth scale lerp helper
    function smoothScale(obj) {
        if (!obj) return;
        const target = obj.userData.targetScale || obj.userData.baseScale || 1;
        const cur = obj.scale.x;
        const next = THREE.MathUtils.lerp(cur, target, 0.14);
        obj.scale.setScalar(next);
    }

    // subtle hover-based orientation (tilt toward cursor) - only small effect
    function hoverTilt(obj) {
        if (!obj) return;
        const isHovered = (obj === hoveredObject);
        if (!isHovered) return;
        // small, temporary tilt based on mouse position
        const tiltX = -mouse.y * 0.12; // pitch
        const tiltY = mouse.x * 0.25;  // yaw offset
        // interpolate rotation offset to avoid jumps
        obj.rotation.x = THREE.MathUtils.lerp(obj.rotation.x, obj.rotation.x * 0.98 + tiltX * 0.02, 0.08);
        obj.rotation.y = THREE.MathUtils.lerp(obj.rotation.y, obj.rotation.y * 0.98 + tiltY * 0.02, 0.08);
    }

    // apply rotations and hover reactions
    cube.rotation.x += cubeRotationSpeed.x;
    cube.rotation.y += cubeRotationSpeed.y;
    smoothScale(cube);
    hoverTilt(cube);

    sphere.rotation.x += sphereRotationSpeed.x;
    sphere.rotation.y += sphereRotationSpeed.y;
    smoothScale(sphere);
    hoverTilt(sphere);

    renderer.render(scene, camera);
}

window.addEventListener('load', init);