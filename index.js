
/*
    This script defines an A-Frame component to create and manage custom Three.js objects.
    It replaces the previous manual Three.js scene setup.
*/
/**
 * Component for voice control using the Web Speech API.
 * Attach this to the a-scene element.
 * It adds a microphone button and listens for commands to interact with objects.
 */
AFRAME.registerComponent('voice-control', {
    init: function () {
        const sceneEl = this.el;
        this.isListening = false;

        // Check for browser support for the Web Speech API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('Voice recognition not supported in this browser.');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.lang = 'en-US';
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        this.createVoiceButton();

        // --- Event Handlers for Recognition ---
        this.recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase().trim();
            console.log('Voice command received:', command);
            this.handleCommand(command);
        };

        this.recognition.onspeechend = () => {
            this.stopListening();
        };

        this.recognition.onerror = (event) => {
            console.error('Voice recognition error:', event.error);
            this.stopListening();
        };
    },

    createVoiceButton: function () {
        this.voiceButton = document.createElement('button');
        this.voiceButton.id = 'voice-button';
        this.voiceButton.innerHTML = '&#127908;'; // Microphone emoji
        document.body.appendChild(this.voiceButton);

        this.voiceButton.addEventListener('click', () => {
            if (this.isListening) {
                this.stopListening();
            } else {
                this.startListening();
            }
        });
    },

    startListening: function () {
        if (this.isListening) return;
        this.isListening = true;
        this.recognition.start();
        this.voiceButton.classList.add('listening');
        console.log('Voice recognition started.');
    },

    stopListening: function () {
        if (!this.isListening) return;
        this.isListening = false;
        this.recognition.stop();
        this.voiceButton.classList.remove('listening');
        console.log('Voice recognition stopped.');
    },

    handleCommand: function (command) {
        // Define keywords for actions and objects
        const actionKeywords = ['show', 'open', 'click', 'select'];
        const objectKeywords = {
            'cube': '[custom-object="type: cube"]',
            'sphere': '[custom-object="type: sphere"]',
            'cylinder': '[custom-object="type: cylinder"]',
            'building': '[custom-object="type: building"]'
        };

        let actionFound = null;
        let targetSelector = null;

        // Find which action is being requested
        for (const keyword of actionKeywords) {
            if (command.includes(keyword)) {
                actionFound = 'click'; // All actions will trigger a 'click'
                break;
            }
        }

        // Find which object is being targeted
        for (const objName in objectKeywords) {
            if (command.includes(objName)) {
                targetSelector = objectKeywords[objName];
                break;
            }
        }

        // If both an action and a target are found, execute the action
        if (actionFound && targetSelector) {
            const targetEl = document.querySelector(targetSelector);
            if (targetEl) {
                console.log(`Performing '${actionFound}' on '${targetSelector}'`);
                targetEl.emit('click'); // Programmatically trigger a click event
            } else {
                console.warn(`Target element not found: ${targetSelector}`);
            }
        } else {
            console.log('Command not understood. Try "open the cube" or "show the building".');
        }
    }
});

AFRAME.registerComponent('custom-object', {
    schema: {
        type: { type: 'string', default: 'cube' }
    },

    init: function () {
        const el = this.el; // The A-Frame entity
        const data = this.data; // The component data (e.g., {type: 'cube'})
        let mesh;

        // Create a different Three.js mesh based on the 'type'
        if (data.type === 'cube') {
            const geometry = new THREE.BoxGeometry(4, 2, 2);
            const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
            mesh = new THREE.Mesh(geometry, material);
            // Load texture and apply it on a white canvas background
            new THREE.TextureLoader().load(document.querySelector('#coburg-logo').src, (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = texture.image.width;
                canvas.height = texture.image.height;
                context.fillStyle = '#FFFFFF';
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.drawImage(texture.image, 0, 0);
                material.map = new THREE.CanvasTexture(canvas);
                material.needsUpdate = true;
            });
        } else if (data.type === 'sphere') {
            const geometry = new THREE.SphereGeometry(2, 32, 32);
            const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
            mesh = new THREE.Mesh(geometry, material);
            new THREE.TextureLoader().load(document.querySelector('#co-logo').src, (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = texture.image.width;
                canvas.height = texture.image.height;
                context.fillStyle = '#FFFFFF';
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.drawImage(texture.image, 0, 0);
                material.map = new THREE.CanvasTexture(canvas);
                material.needsUpdate = true;
            });
        } else if (data.type === 'cylinder') {
            const geometry = new THREE.CylinderGeometry(1.5, 1.5, 3, 32);
            const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
            mesh = new THREE.Mesh(geometry, material);
            new THREE.TextureLoader().load(document.querySelector('#coburg-logo').src, (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = texture.image.width;
                canvas.height = texture.image.height;
                context.fillStyle = '#FFFFFF';
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.drawImage(texture.image, 0, 0);
                material.map = new THREE.CanvasTexture(canvas);
                material.needsUpdate = true;
            });
        } else if (data.type === 'building') {
            const buildingGroup = new THREE.Group();

            // Main building block
            const bodyGeometry = new THREE.BoxGeometry(4, 6, 4);
            const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 });
            const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
            bodyMesh.position.y = 3; // Center the mesh so its base is at y=0
            // Load the LCC logo and apply it to the building body
            new THREE.TextureLoader().load(document.querySelector('#LCC-logo').src, (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = texture.image.width;
                canvas.height = texture.image.height;
                context.fillStyle = '#FFFFFF';
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.drawImage(texture.image, 0, 0);
                bodyMaterial.map = new THREE.CanvasTexture(canvas);
                bodyMaterial.needsUpdate = true;
            });
            buildingGroup.add(bodyMesh);

            // Roof
            const roofGeometry = new THREE.BoxGeometry(4.5, 0.5, 4.5);
            const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8 });
            const roofMesh = new THREE.Mesh(roofGeometry, roofMaterial);
            roofMesh.position.y = 6.25; // Position on top of the body
            buildingGroup.add(roofMesh);

            // Door
            const doorGeometry = new THREE.BoxGeometry(1, 2, 0.1);
            const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x4a2a0a });
            const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
            doorMesh.position.set(0, 1, 2.01); // Position at the front bottom
            buildingGroup.add(doorMesh);

            // Windows
            const windowGeometry = new THREE.BoxGeometry(0.8, 1, 0.1);
            const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.7, roughness: 0.1 });
            const windowMesh1 = new THREE.Mesh(windowGeometry, windowMaterial);
            windowMesh1.position.set(-1.2, 4, 2.01); // Left window
            buildingGroup.add(windowMesh1);
            const windowMesh2 = windowMesh1.clone();
            windowMesh2.position.set(1.2, 4, 2.01); // Right window
            buildingGroup.add(windowMesh2);

            // The group itself is the object we attach
            mesh = buildingGroup;
        }

        if (mesh) {
            this.mesh = mesh;
            // Attach the Three.js mesh to the A-Frame entity
            el.setObject3D('mesh', this.mesh);

            // Use A-Frame's animation component for performant, continuous rotation
            // This is much more efficient than using the tick handler.
            el.setAttribute('animation__rotate', {
                property: 'rotation',
                to: '0 360 0',
                loop: true,
                dur: 20000, // A full rotation every 20 seconds
                easing: 'linear'
            });
        }

        // --- Interaction Listeners ---
        el.addEventListener('click', () => {
            // Check if we are in VR mode
            if (this.el.sceneEl.is('vr-mode')) {
                // In VR, create a 3D info panel
                this.createVRPanel();
            } else {
                // On desktop, show the 2D HTML overlay
                const url = el.getAttribute('data-url');
                const message = el.getAttribute('data-message');

                if (url) {
                    showAnimatedLink(url);
                }
                if (message) {
                    showAnimatedMessage(message);
                }
            }

            // Simple click feedback animation for both modes
            this.el.setAttribute('animation__click', { property: 'scale', to: '1.2 1.2 1.2', dur: 200, dir: 'alternate' });
        });

        el.addEventListener('mouseenter', () => {
            el.setAttribute('scale', '1.1 1.1 1.1');
        });

        el.addEventListener('mouseleave', () => {
            el.setAttribute('scale', '1 1 1');
        });
    },

    createVRPanel: function() {
        const sceneEl = this.el.sceneEl;
        // Remove any existing panel first
        const oldPanel = document.querySelector('[info-panel]');
        if (oldPanel && oldPanel.parentNode && !oldPanel.isClosing) {
            oldPanel.isClosing = true;
            oldPanel.setAttribute('animation__close', {
                property: 'scale',
                to: '0.001 0.001 0.001',
                dur: 200,
                easing: 'easeInCubic'
            });
            oldPanel.addEventListener('animationcomplete__close', () => {
                if (oldPanel.parentNode) {
                    oldPanel.parentNode.removeChild(oldPanel);
                }
            }, { once: true });
        }

        const el = this.el;
        const url = el.getAttribute('data-url');
        const message = el.getAttribute('data-message');

        // Create a new entity for the panel
        const panelEl = document.createElement('a-entity');

        // Set the info-panel component properties
        let panelProps = `type: ${url ? 'link' : 'message'};`;
        if (url) {
            panelProps += ` url: ${url};`;
        }
        if (message) {
            panelProps += ` body: ${message};`;
        }
        panelEl.setAttribute('info-panel', panelProps);

        // Position the panel relative to the camera and prepare for animation
        panelEl.setAttribute('position', '0 0 -2');
        panelEl.setAttribute('scale', '0.001 0.001 0.001');

        // Attach the panel to the camera
        const cameraEl = document.querySelector('[camera]');
        cameraEl.appendChild(panelEl);

        // Animate the panel appearing
        panelEl.setAttribute('animation__open', {
            property: 'scale',
            to: '1 1 1',
            dur: 300,
            easing: 'easeOutCubic'
        });
    }
});

/**
 * Component to create a 3D panel for displaying information in VR.
 * It draws text and buttons onto a canvas and uses it as a texture.
 */
AFRAME.registerComponent('info-panel', {
    schema: {
        type: { default: 'message', oneOf: ['message', 'link'] },
        title: { default: 'Information' },
        body: { default: '' },
        url: { default: '' },
        linkLabel: { default: 'Open Page' },
        width: { default: 2 },
        height: { default: 1 }
    },

    init: function () {
        const el = this.el;
        const data = this.data;
        el.isClosing = false; // Flag to prevent multiple close animations

        // Create canvas
        const canvas = document.createElement('canvas');
        const canvasWidth = 1024;
        const canvasHeight = 512;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');

        // --- Draw panel content ---
        // Background
        ctx.fillStyle = 'rgba(18, 22, 30, 0.95)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 56px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(data.type === 'link' ? 'Wirtschaftsinformatik 2.0' : data.title, canvasWidth / 2, 100);

        // Body
        ctx.fillStyle = '#e6eef9';
        ctx.font = '40px sans-serif';
        ctx.fillText(data.body || data.url, canvasWidth / 2, 220);

        // Buttons
        ctx.font = 'bold 40px sans-serif';
        if (data.type === 'link') {
            ctx.fillStyle = '#0b67ff';
            ctx.fillRect(162, 350, 300, 80); // Open button bg
            ctx.fillStyle = '#ffffff';
            ctx.fillText(data.linkLabel, 312, 405);
        }
        ctx.fillStyle = '#333';
        ctx.fillRect(562, 350, 300, 80); // Close button bg
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Close', 712, 405);

        // Create texture and apply to a plane
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const geometry = new THREE.PlaneGeometry(data.width, data.height);
        const plane = new THREE.Mesh(geometry, material);
        el.setObject3D('mesh', plane);

        // --- Add interaction ---
        el.classList.add('interactive'); // Make the panel itself clickable
        el.addEventListener('click', (evt) => {
            if (el.isClosing) return; // Prevent actions if already closing

            const uv = evt.detail.intersection.uv;
            // Check if click was on the "Open" button area (left side)
            if (data.type === 'link' && uv.x > 0.15 && uv.x < 0.45 && uv.y > 0.2 && uv.y < 0.4) {
                window.open(data.url, '_blank');
            }

            // Animate closing and then remove the panel
            el.isClosing = true;
            el.setAttribute('animation__close', {
                property: 'scale',
                to: '0.001 0.001 0.001',
                dur: 200,
                easing: 'easeInCubic'
            });

            el.addEventListener('animationcomplete__close', () => {
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            }, { once: true });
        });
    }
});

// --- MODAL/POPUP FUNCTIONS (from original file, largely unchanged) ---
// These functions create and manage the 2D HTML popups for information and links.
function showAnimatedMessage(message) {
    let existing = document.getElementById('animated-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'animated-overlay';
    Object.assign(overlay.style, { position: 'fixed', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', zIndex: '10000', overflow: 'hidden' });
    document.body.appendChild(overlay);

    const stage = document.createElement('div');
    Object.assign(stage.style, { width: '680px', maxWidth: '92%', height: '260px', perspective: '1200px', display: 'flex', alignItems: 'center', justifyContent: 'center' });
    overlay.appendChild(stage);

    const card = document.createElement('div');
    Object.assign(card.style, {
        position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d',
        borderRadius: '16px', background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(245,245,246,0.98))',
        boxShadow: '0 30px 80px rgba(5,10,30,0.55)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', cursor: 'default'
    });
    stage.appendChild(card);

    const title = document.createElement('div'); title.textContent = 'Information';
    Object.assign(title.style, { fontSize: '20px', fontWeight: '700', marginBottom: '6px', color: '#0b1220', zIndex: '2', transform: 'translateZ(30px)' });
    card.appendChild(title);

    const content = document.createElement('div');
    Object.assign(content.style, { fontSize: '18px', lineHeight: '1.4', color: '#111', maxWidth: '86%', textAlign: 'center', zIndex: '2', transform: 'translateZ(30px)' });
    card.appendChild(content);

    const btn = document.createElement('button'); btn.textContent = 'Close';
    Object.assign(btn.style, { position: 'absolute', right: '18px', top: '14px', zIndex: '6', padding: '8px 12px', borderRadius: '10px', border: 'none', background: '#0b1220', color: '#fff', cursor: 'pointer', transform: 'translateZ(40px)' });
    card.appendChild(btn);

    let i = 0;
    content.textContent = '';
    const speed = 40;
    (function typeStep(){
        if (i < message.length) {
            content.textContent += message.charAt(i++);
            setTimeout(typeStep, speed);
        }
    })();

    btn.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

function showAnimatedLink(url) {
    let existing = document.getElementById('link-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'link-overlay';
    Object.assign(overlay.style, { position: 'fixed', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,10,20,0.6)', zIndex: '10000', overflow: 'hidden' });
    document.body.appendChild(overlay);

    const stage = document.createElement('div');
    Object.assign(stage.style, { width: '560px', maxWidth: '92%', height: '300px', perspective: '1200px', display: 'flex', alignItems: 'center', justifyContent: 'center' });
    overlay.appendChild(stage);

    const card = document.createElement('div');
    Object.assign(card.style, { position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', borderRadius: '16px', background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(245,245,246,0.98))', boxShadow: '0 30px 80px rgba(5,10,30,0.55)', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'default' });
    stage.appendChild(card);

    const title = document.createElement('div'); title.textContent = 'Wirtschaftsinformatik 2.0';
    Object.assign(title.style, { fontSize: '20px', fontWeight: '700', marginTop: '4px', color: '#0b1220', zIndex: '6', transform: 'translateZ(30px)' });
    card.appendChild(title);

    const urlLine = document.createElement('div'); urlLine.textContent = url;
    Object.assign(urlLine.style, { fontSize: '12px', color: '#355168', wordBreak: 'break-all', marginBottom: '16px', zIndex: '6', transform: 'translateZ(30px)' });
    card.appendChild(urlLine);

    const openBtn = document.createElement('button'); openBtn.textContent = 'Open page';
    Object.assign(openBtn.style, { background: '#0b67ff', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' });
    openBtn.addEventListener('click', () => { window.open(url, '_blank', 'noopener'); overlay.remove(); });

    const closeBtn = document.createElement('button'); closeBtn.textContent = 'Close';
    Object.assign(closeBtn.style, { background: 'transparent', color: '#0b1220', border: '1px solid rgba(11,17,32,0.08)', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' });
    closeBtn.addEventListener('click', () => overlay.remove());

    const btns = document.createElement('div'); Object.assign(btns.style, { display: 'flex', gap: '10px', justifyContent: 'center', zIndex: '6', transform: 'translateZ(36px)' });
    btns.appendChild(openBtn); btns.appendChild(closeBtn);
    card.appendChild(btns);

    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}
