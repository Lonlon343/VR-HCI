
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
            const bodyGeometry = new THREE.BoxGeometry(6, 4, 5);
            const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 });
            const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
            bodyMesh.position.y = 2; // Center the mesh so its base is at y=0
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
            const roofGeometry = new THREE.BoxGeometry(6.5, 0.5, 5.5);
            const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8 });
            const roofMesh = new THREE.Mesh(roofGeometry, roofMaterial);
            roofMesh.position.y = 4.25; // Position on top of the body
            buildingGroup.add(roofMesh);

            // Door
            const doorGeometry = new THREE.BoxGeometry(1, 2, 0.1);
            const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x4a2a0a });
            const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
            doorMesh.position.set(0, 1, 2.51); // Position at the front bottom
            buildingGroup.add(doorMesh);

            // Windows
            const windowGeometry = new THREE.BoxGeometry(0.8, 1, 0.1);
            const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.7, roughness: 0.1 });
            const windowMesh1 = new THREE.Mesh(windowGeometry, windowMaterial);
            windowMesh1.position.set(-1.8, 3, 2.51); // Left window
            buildingGroup.add(windowMesh1);
            const windowMesh2 = windowMesh1.clone();
            windowMesh2.position.set(1.8, 3, 2.51); // Right window
            buildingGroup.add(windowMesh2);

            // The group itself is the object we attach
            mesh = buildingGroup;
        } else if (data.type === 'plane') {
            const planeGroup = new THREE.Group();
            const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xAAAAAA, roughness: 0.5 });

            // Body of the plane
            const bodyGeometry = new THREE.BoxGeometry(3, 0.5, 0.5);
            const bodyMesh = new THREE.Mesh(bodyGeometry, planeMaterial);
            planeGroup.add(bodyMesh);

            // Main Wings
            const wingGeometry = new THREE.BoxGeometry(1, 0.1, 4);
            const wingMesh = new THREE.Mesh(wingGeometry, planeMaterial);
            planeGroup.add(wingMesh);

            // Tail Fin (Vertical Stabilizer)
            const tailFinGeometry = new THREE.BoxGeometry(0.2, 1, 0.1);
            const tailFinMesh = new THREE.Mesh(tailFinGeometry, planeMaterial);
            tailFinMesh.position.set(-1.4, 0.6, 0);
            planeGroup.add(tailFinMesh);

            // Tail Wings (Horizontal Stabilizers)
            const tailWingGeometry = new THREE.BoxGeometry(0.5, 0.05, 1.5);
            const tailWingMesh = new THREE.Mesh(tailWingGeometry, planeMaterial);
            tailWingMesh.position.set(-1.4, 0.2, 0);
            planeGroup.add(tailWingMesh);

            // The group is the final object
            mesh = planeGroup;
        }

        if (mesh) {
            this.mesh = mesh;
            // Attach the Three.js mesh to the A-Frame entity

            // Enable shadow casting for the mesh and all its children
            this.mesh.traverse(function(node) {
                if (node.isMesh) {
                    node.castShadow = true;
                }
            });
            el.setObject3D('mesh', this.mesh);

            // Only apply rotation to cube and sphere
            if (data.type === 'cube' || data.type === 'sphere') {
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
        title: { default: 'HS Coburg' },
        body: { default: '' },
        url: { default: '' },
        linkLabel: { default: 'Seite öffnen' },
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
            ctx.fillStyle = '#ff755aff';
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
            if (data.type === 'link' && uv.x > 0.15 && uv.x < 0.45 && uv.y > 0.2 && uv.y < 0.4) { // 'Open' button
                window.open(data.url, '_blank', 'noopener');
                // Show a temporary notification panel
                this.showTemporaryNotification('Seite ladet im Browser...');
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
    },

    /**
     * Creates a simple, temporary notification panel that disappears after a delay.
     * @param {string} message The message to display.
     */
    showTemporaryNotification: function(message) {
        const sceneEl = this.el.sceneEl;
        const cameraEl = sceneEl.querySelector('[camera]');

        // Create panel entity
        const notificationEl = document.createElement('a-entity');
        notificationEl.setAttribute('position', '0 -0.2 -1.8'); // Position slightly below center
        notificationEl.setAttribute('look-at', '[camera]');

        // Create text on the panel
        notificationEl.setAttribute('text', {
            value: message,
            align: 'center',
            color: '#FFFFFF',
            width: 2,
            wrapCount: 20
        });

        // Add a simple background plane
        notificationEl.setAttribute('geometry', 'primitive: plane; width: 2; height: 0.2');
        notificationEl.setAttribute('material', 'color: #ff4a4a59; border: 2px solid #ff4a4a59; border radius: 10px;transparent: true; opacity: 0.85');

        cameraEl.appendChild(notificationEl);

        // Remove the notification after a few seconds
        setTimeout(() => notificationEl.parentNode.removeChild(notificationEl), 3000);
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
    openBtn.addEventListener('click', () => {
        if (window.confirm('You are about to open an external link. Do you want to continue?')) {
            window.open(url, '_blank', 'noopener');
            overlay.remove();
        }
    });

    const closeBtn = document.createElement('button'); closeBtn.textContent = 'Close';
    Object.assign(closeBtn.style, { background: 'transparent', color: '#0b1220', border: '1px solid rgba(11,17,32,0.08)', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' });
    closeBtn.addEventListener('click', () => overlay.remove());

    const btns = document.createElement('div'); Object.assign(btns.style, { display: 'flex', gap: '10px', justifyContent: 'center', zIndex: '6', transform: 'translateZ(36px)' });
    btns.appendChild(openBtn); btns.appendChild(closeBtn);
    card.appendChild(btns);

    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}
/**
 * Component to apply a dynamic, wave-like gradient texture to the floor plane.
 */
AFRAME.registerComponent('wavy-gradient-floor', {
    init: function () {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 512;
        this.canvas.height = 512;
        this.ctx = this.canvas.getContext('2d');
        this.texture = new THREE.CanvasTexture(this.canvas);
        this.texture.colorSpace = THREE.SRGBColorSpace;
        this.time = 0;
        
        // Make the texture repeat across the large plane
        this.texture.wrapS = THREE.RepeatWrapping;
        this.texture.wrapT = THREE.RepeatWrapping;

        // Calculate how many times the texture should repeat.
        // We'll assume each texture tile covers a 10x10 meter area.
        const planeWidth = this.el.getAttribute('width');
        const planeHeight = this.el.getAttribute('height');
        this.texture.repeat.set(planeWidth / 100, planeHeight / 100);

        // Apply the canvas texture to the plane's material
        const material = new THREE.MeshStandardMaterial({ map: this.texture });
        this.el.getObject3D('mesh').material = material;
    },
    
    tick: function (time, timeDelta) {
        // Update time for animation
        this.time += timeDelta * 0.0005; // Adjust speed of the wave
        
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Create a linear gradient
        // The gradient's start and end points are shifted using a sine wave to create a gentle rocking motion
        const x1 = width * (0.5 + Math.sin(this.time) * 0.4);
        const y1 = height * (0.5 + Math.cos(this.time) * 0.4);
        const gradient = ctx.createLinearGradient(0, 0, x1, y1);
        gradient.addColorStop(0, '#ffa571ff'); // Light Sky Blue
        gradient.addColorStop(1, '#fd7272ff'); // Steel Blue
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Tell Three.js that the texture needs to be updated
        this.texture.needsUpdate = true;
    }
});

/**
 * Component to make an entity orbit its parent in an elliptical path.
 */
AFRAME.registerComponent('elliptical-orbit', {
    schema: {
        radiusX: { type: 'number', default: 5 }, // Semi-major axis along X
        radiusZ: { type: 'number', default: 3 }, // Semi-minor axis along Z
        speed: { type: 'number', default: 0.5 }, // Radians per second
        offsetY: { type: 'number', default: 0 }  // Vertical offset from parent's center
    },

    init: function () {
        this.angle = 0; // Current angle in radians
    },

    tick: function (time, timeDelta) {
        const data = this.data;
        const el = this.el;

        // Update angle based on speed and timeDelta (convert timeDelta to seconds)
        this.angle += (data.speed * timeDelta) / 1000;

        // Calculate new position using elliptical equations
        const x = data.radiusX * Math.cos(this.angle);
        const z = data.radiusZ * Math.sin(this.angle);
        const y = data.offsetY; // Keep vertical offset constant

        // Set the entity's local position
        el.object3D.position.set(x, y, z);
    }
});

/**
 * Component to create a dynamic sky with a moving gradient.
 */
AFRAME.registerComponent('dynamic-sky', {
    init: function () {
        const skyEl = this.el;

        // Create a canvas to draw the sky texture
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1024; // Use a decent resolution for the sky
        this.canvas.height = 512;
        this.ctx = this.canvas.getContext('2d');
        this.time = 0;

        // Define some clouds
        this.clouds = [];
        for (let i = 0; i < 10; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height * 0.5, // Keep them in the upper half
                size: (Math.random() * 50) + 20,
                speed: (Math.random() * 10) + 5, // Pixels per second
                opacity: Math.random() * 0.3 + 0.4 // Opacity between 0.4 and 0.7
            });
        }

        this.drawSky(0); // Initial draw

        // Create a canvas texture and apply it to the sky material
        const texture = new THREE.CanvasTexture(this.canvas);
        texture.colorSpace = THREE.SRGBColorSpace;

        // The sky primitive might not have its mesh ready immediately.
        // We wait for it to load before we try to apply our custom material.
        skyEl.addEventListener('loaded', () => {
            const mesh = skyEl.getObject3D('mesh');
            if (mesh && mesh.material) {
                mesh.material.map = texture;
                mesh.material.needsUpdate = true;
                this.texture = texture; // Store for tick updates
            }
        });
    },

    tick: function (time, timeDelta) {
        // Guard against running before the texture is ready
        if (!this.ctx || !this.texture) return;

        this.drawSky(timeDelta);

        // Tell Three.js that the texture needs to be updated
        this.texture.needsUpdate = true;
    },

    drawSky: function(timeDelta) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        this.time += timeDelta * 0.00005; // Use a very slow speed for gentle gradient movement

        // Create a moving linear gradient to simulate drifting clouds/haze
        const xOffset = Math.sin(this.time) * width * 0.2;
        const skyGradient = ctx.createLinearGradient(xOffset, 0, width + xOffset, height);
        skyGradient.addColorStop(0, '#ffb47aff');   // Sky Blue
        skyGradient.addColorStop(0.5, '#ADD8E6'); // Light Blue
        skyGradient.addColorStop(1, '#87CEEB');   // Sky Blue again
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, width, height);

        // Draw and update clouds
        this.clouds.forEach(cloud => {
            // Update position
            cloud.x += cloud.speed * (timeDelta / 1000);
            if (cloud.x > width + cloud.size * 2) {
                cloud.x = -cloud.size * 2; // Reset to the left when it goes off-screen
            }

            // Draw the cloud (as a simple circle)
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
            ctx.fill();
            ctx.filter = 'blur(30px)'; // Apply a blur to make it look soft
            ctx.fill();
            ctx.filter = 'none'; // Reset filter
        });
    }
});

/**
 * Creates a button attached to the camera that is only visible in VR mode
 * and allows the user to exit VR.
 */
AFRAME.registerComponent('exit-vr-button', {
    init: function () {
        const el = this.el;
        const sceneEl = el.sceneEl;

        // --- Create the button's appearance ---
        const buttonPlane = document.createElement('a-plane');
        buttonPlane.setAttribute('width', 0.6);
        buttonPlane.setAttribute('height', 0.2);
        buttonPlane.setAttribute('color', '#ff8888d4');
        buttonPlane.setAttribute('opacity', 0.8);
        buttonPlane.setAttribute('class', 'interactive'); // So raycasters can hit it

        const buttonText = document.createElement('a-text');
        buttonText.setAttribute('value', 'Leave VR');
        buttonText.setAttribute('align', 'center');
        buttonText.setAttribute('width', 1);
        buttonText.setAttribute('position', '0 0 0.01');

        // Assemble the button
        el.appendChild(buttonPlane);
        el.appendChild(buttonText);

        // Position the button in the user's view
        el.setAttribute('position', '-0.8 -0.8 -1.5'); // Bottom-left corner, in front of camera
        el.setAttribute('rotation', '-15 15 0');

        // --- Logic for visibility and interaction ---
        el.setAttribute('visible', sceneEl.is('vr-mode')); // Set initial visibility

        this.onEnterVR = () => el.setAttribute('visible', true);
        this.onExitVR = () => el.setAttribute('visible', false);
        this.onClick = () => sceneEl.exitVR();

        sceneEl.addEventListener('enter-vr', this.onEnterVR);
        sceneEl.addEventListener('exit-vr', this.onExitVR);
        el.addEventListener('click', this.onClick);

        // Hover effect
        el.addEventListener('mouseenter', () => buttonPlane.setAttribute('color', '#ff4444ff'));
        el.addEventListener('mouseleave', () => buttonPlane.setAttribute('color', '#2222220b'));
    },

    remove: function () {
        // Clean up event listeners when the component is removed
        const sceneEl = this.el.sceneEl;
        sceneEl.removeEventListener('enter-vr', this.onEnterVR);
        sceneEl.removeEventListener('exit-vr', this.onExitVR);
        this.el.removeEventListener('click', this.onClick);
    }
});
