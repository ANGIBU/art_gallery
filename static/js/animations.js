// static/js/animations.js

class ParticleWave {
    constructor(canvas, mouseRef, isLightMode) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mouseRef = mouseRef;
        this.isLightMode = isLightMode;
        this.particles = [];
        this.isActive = true;
        this.time = 0;
        this.resize();
        this.init();
        
        this.resizeHandler = () => this.resize();
        window.addEventListener('resize', this.resizeHandler);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.init();
    }

    init() {
        this.particles = [];
        const spacing = 30;
        for (let x = 0; x < this.canvas.width; x += spacing) {
            for (let y = 0; y < this.canvas.height; y += spacing) {
                this.particles.push({
                    x, y,
                    baseX: x,
                    baseY: y,
                    vx: 0,
                    vy: 0
                });
            }
        }
    }

    updateTheme(isLightMode) {
        this.isLightMode = isLightMode;
    }

    animate() {
        if (!this.isActive) return;

        this.time += 2;

        const bg = this.isLightMode ? 'rgba(253, 251, 247, 0.15)' : 'rgba(10, 10, 10, 0.2)';
        this.ctx.fillStyle = bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((p, idx) => {
            const dx = this.mouseRef.current.x - p.x;
            const dy = this.mouseRef.current.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const force = Math.max(0, 200 - dist) / 200;

            if (force > 0) {
                const pushForce = 10;
                p.vx += (dx / (dist + 1)) * force * pushForce;
                p.vy += (dy / (dist + 1)) * force * pushForce;
            }

            p.x += p.vx;
            p.y += p.vy;

            p.vx *= 0.85;
            p.vy *= 0.85;

            const returnForce = 0.15;
            p.x += (p.baseX - p.x) * returnForce;
            p.y += (p.baseY - p.y) * returnForce;

            const hue = (idx * 3 + this.time) % 360;
            
            if (this.isLightMode) {
                this.ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
            } else {
                this.ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
            }
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }

    destroy() {
        this.isActive = false;
        window.removeEventListener('resize', this.resizeHandler);
    }
}

class GravityOrbs {
    constructor(canvas, mouseRef, isLightMode) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mouseRef = mouseRef;
        this.isLightMode = isLightMode;
        this.orbs = [];
        this.gravityPoints = [];
        this.explosions = [];
        this.isActive = true;
        this.draggedPoint = null;
        this.mouseDownTime = 0;
        this.mouseDownPos = { x: 0, y: 0 };
        this.hasMoved = false;
        this.resize();
        this.init();
        
        this.mouseDownHandler = (e) => {
            const x = e.clientX;
            const y = e.clientY;
            this.mouseDownTime = Date.now();
            this.mouseDownPos = { x, y };
            this.hasMoved = false;
            
            for (let gp of this.gravityPoints) {
                const dist = Math.sqrt((gp.x - x) ** 2 + (gp.y - y) ** 2);
                if (dist < gp.radius) {
                    this.draggedPoint = gp;
                    return;
                }
            }
        };
        
        this.mouseMoveHandler = (e) => {
            if (this.draggedPoint) {
                const moveDist = Math.sqrt(
                    (e.clientX - this.mouseDownPos.x) ** 2 + 
                    (e.clientY - this.mouseDownPos.y) ** 2
                );
                
                if (moveDist > 5) {
                    this.hasMoved = true;
                    this.draggedPoint.x = e.clientX;
                    this.draggedPoint.y = e.clientY;
                    this.draggedPoint.life = 200;
                }
            }
        };
        
        this.mouseUpHandler = (e) => {
            const x = e.clientX;
            const y = e.clientY;
            const timeDiff = Date.now() - this.mouseDownTime;
            
            if (this.draggedPoint && !this.hasMoved && timeDiff < 500) {
                if (this.draggedPoint.clicks < 5) {
                    this.draggedPoint.clicks++;
                    this.draggedPoint.radius = 20 + this.draggedPoint.clicks * 20;
                    this.draggedPoint.life = 200;
                    this.explode(this.draggedPoint.x, this.draggedPoint.y, this.draggedPoint.clicks);
                }
            } else if (!this.draggedPoint && timeDiff < 500) {
                const newPoint = {
                    x, y,
                    life: 200,
                    clicks: 1,
                    radius: 40
                };
                this.gravityPoints.push(newPoint);
                this.explode(x, y, 1);
            }
            
            this.draggedPoint = null;
            this.hasMoved = false;
        };
        
        this.canvas.addEventListener('mousedown', this.mouseDownHandler);
        this.canvas.addEventListener('mousemove', this.mouseMoveHandler);
        this.canvas.addEventListener('mouseup', this.mouseUpHandler);
        this.resizeHandler = () => this.resize();
        window.addEventListener('resize', this.resizeHandler);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.init();
    }

    init() {
        this.orbs = [];
        for (let i = 0; i < 100; i++) {
            this.orbs.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: Math.random() * 4 + 2,
                hue: Math.random() * 360,
                floatAngle: Math.random() * Math.PI * 2,
                floatSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }

    explode(x, y, level) {
        const particleCount = 20 + level * 15;
        const explosionRadius = 80 + level * 40;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 4 + level * 1.5;
            this.explosions.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 50,
                maxLife: 50,
                size: 2 + level * 0.8,
                hue: Math.random() * 360,
                radius: explosionRadius
            });
        }
    }

    updateTheme(isLightMode) {
        this.isLightMode = isLightMode;
    }

    animate() {
        if (!this.isActive) return;

        const bg = this.isLightMode ? 'rgba(253, 251, 247, 0.1)' : 'rgba(10, 10, 10, 0.15)';
        this.ctx.fillStyle = bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.gravityPoints = this.gravityPoints.filter(gp => {
            if (!this.draggedPoint || this.draggedPoint !== gp) {
                gp.life--;
            }
            
            const alpha = gp.life / 200;
            const gradient = this.ctx.createRadialGradient(gp.x, gp.y, 0, gp.x, gp.y, gp.radius);
            
            if (this.isLightMode) {
                gradient.addColorStop(0, `rgba(232, 93, 117, ${alpha * 0.5})`);
                gradient.addColorStop(1, `rgba(232, 93, 117, 0)`);
            } else {
                gradient.addColorStop(0, `rgba(255, 100, 200, ${alpha * 0.7})`);
                gradient.addColorStop(1, `rgba(255, 100, 200, 0)`);
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(gp.x, gp.y, gp.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            return gp.life > 0;
        });

        this.explosions = this.explosions.filter(exp => {
            exp.x += exp.vx;
            exp.y += exp.vy;
            exp.vx *= 0.95;
            exp.vy *= 0.95;
            exp.life--;
            
            const alpha = exp.life / exp.maxLife;
            const gradient = this.ctx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, exp.size * 2);
            
            if (this.isLightMode) {
                gradient.addColorStop(0, `hsla(${exp.hue}, 75%, 60%, ${alpha})`);
                gradient.addColorStop(1, `hsla(${exp.hue}, 75%, 60%, 0)`);
            } else {
                gradient.addColorStop(0, `hsla(${exp.hue}, 100%, 60%, ${alpha})`);
                gradient.addColorStop(1, `hsla(${exp.hue}, 100%, 60%, 0)`);
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(exp.x, exp.y, exp.size * 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            return exp.life > 0;
        });

        this.orbs.forEach(orb => {
            orb.floatAngle += orb.floatSpeed;
            orb.vx += Math.cos(orb.floatAngle) * 0.05;
            orb.vy += Math.sin(orb.floatAngle) * 0.05;
            
            this.gravityPoints.forEach(gp => {
                const dx = gp.x - orb.x;
                const dy = gp.y - orb.y;
                const dist = Math.sqrt(dx * dx + dy * dy) + 1;
                const basePower = 200 + (gp.clicks - 1) * 250;
                const force = Math.min((basePower * gp.clicks) / (dist * dist), 4);
                orb.vx += (dx / dist) * force;
                orb.vy += (dy / dist) * force;
            });

            orb.x += orb.vx;
            orb.y += orb.vy;
            orb.vx *= 0.97;
            orb.vy *= 0.97;

            if (orb.x < 0 || orb.x > this.canvas.width) orb.vx *= -0.7;
            if (orb.y < 0 || orb.y > this.canvas.height) orb.vy *= -0.7;

            orb.x = Math.max(0, Math.min(this.canvas.width, orb.x));
            orb.y = Math.max(0, Math.min(this.canvas.height, orb.y));

            const gradient = this.ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius * 2.5);
            
            if (this.isLightMode) {
                gradient.addColorStop(0, `hsla(${orb.hue}, 70%, 60%, 0.7)`);
                gradient.addColorStop(1, `hsla(${orb.hue}, 70%, 60%, 0)`);
            } else {
                gradient.addColorStop(0, `hsla(${orb.hue}, 100%, 60%, 0.9)`);
                gradient.addColorStop(1, `hsla(${orb.hue}, 100%, 60%, 0)`);
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(orb.x, orb.y, orb.radius * 2.5, 0, Math.PI * 2);
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }

    destroy() {
        this.isActive = false;
        this.canvas.removeEventListener('mousedown', this.mouseDownHandler);
        this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
        this.canvas.removeEventListener('mouseup', this.mouseUpHandler);
        window.removeEventListener('resize', this.resizeHandler);
    }
}

class NeuralNetwork {
    constructor(canvas, mouseRef, isLightMode) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mouseRef = mouseRef;
        this.isLightMode = isLightMode;
        this.nodes = [];
        this.connections = [];
        this.isActive = true;
        this.resize();
        this.init();
        this.resizeHandler = () => this.resize();
        window.addEventListener('resize', this.resizeHandler);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.init();
    }

    init() {
        this.nodes = [];
        for (let i = 0; i < 80; i++) {
            this.nodes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                active: 0,
                activeTimer: 0
            });
        }
    }

    updateTheme(isLightMode) {
        this.isLightMode = isLightMode;
    }

    animate() {
        if (!this.isActive) return;

        const bg = this.isLightMode ? 'rgba(253, 251, 247, 0.08)' : 'rgba(10, 10, 10, 0.1)';
        this.ctx.fillStyle = bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;

            if (node.x < 0 || node.x > this.canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > this.canvas.height) node.vy *= -1;

            const dx = this.mouseRef.current.x - node.x;
            const dy = this.mouseRef.current.y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 200) {
                node.active = Math.min(1, node.active + 0.2);
                node.activeTimer = 120;
            } else if (node.activeTimer > 0) {
                node.activeTimer--;
                node.active = node.activeTimer / 120;
            } else {
                node.active = Math.max(0, node.active - 0.05);
            }
        });

        this.nodes.forEach((node1, i) => {
            this.nodes.slice(i + 1).forEach(node2 => {
                const dx = node2.x - node1.x;
                const dy = node2.y - node1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 180) {
                    const opacity = (1 - dist / 180) * 0.7;
                    const activity = Math.max(node1.active, node2.active);
                    
                    if (this.isLightMode) {
                        this.ctx.strokeStyle = `rgba(82, 201, 168, ${opacity * activity * 0.8})`;
                    } else {
                        this.ctx.strokeStyle = `rgba(0, 255, 200, ${opacity * activity})`;
                    }
                    
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(node1.x, node1.y);
                    this.ctx.lineTo(node2.x, node2.y);
                    this.ctx.stroke();
                }
            });

            const size = 3 + node1.active * 7;
            const gradient = this.ctx.createRadialGradient(node1.x, node1.y, 0, node1.x, node1.y, size);
            
            if (this.isLightMode) {
                gradient.addColorStop(0, `rgba(82, 201, 168, ${0.4 + node1.active * 0.4})`);
                gradient.addColorStop(1, `rgba(82, 201, 168, 0)`);
            } else {
                gradient.addColorStop(0, `rgba(0, 255, 200, ${0.5 + node1.active * 0.5})`);
                gradient.addColorStop(1, `rgba(0, 255, 200, 0)`);
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(node1.x, node1.y, size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }

    destroy() {
        this.isActive = false;
        window.removeEventListener('resize', this.resizeHandler);
    }
}

class Tunnel3D {
    constructor(container, mouseRef, isLightMode) {
        this.container = container;
        this.mouseRef = mouseRef;
        this.isLightMode = isLightMode;
        this.isActive = true;
        this.init();
        this.resizeHandler = () => this.resize();
        window.addEventListener('resize', this.resizeHandler);
    }

    init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(this.isLightMode ? 0xfdfbf7 : 0x0a0a0a);
        this.container.appendChild(this.renderer.domElement);

        this.tunnelSegments = [];
        
        for (let i = 0; i < 40; i++) {
            const geometry = new THREE.TorusGeometry(7, 1.8, 20, 100);
            
            let color;
            if (this.isLightMode) {
                color = new THREE.Color().setHSL((i * 7) / 360, 0.65, 0.65);
            } else {
                color = new THREE.Color().setHSL((i * 7) / 360, 1, 0.5);
            }
            
            const material = new THREE.MeshBasicMaterial({
                color: color,
                wireframe: true
            });
            
            const torus = new THREE.Mesh(geometry, material);
            torus.position.z = -i * 4;
            this.scene.add(torus);
            this.tunnelSegments.push(torus);
        }

        this.camera.position.z = 5;
        this.time = 0;
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    updateTheme(isLightMode) {
        this.isLightMode = isLightMode;
        this.renderer.setClearColor(isLightMode ? 0xfdfbf7 : 0x0a0a0a);
        this.tunnelSegments.forEach((segment, i) => {
            if (isLightMode) {
                segment.material.color.setHSL((i * 7) / 360, 0.65, 0.65);
            } else {
                segment.material.color.setHSL((i * 7) / 360, 1, 0.5);
            }
        });
    }

    animate() {
        if (!this.isActive) return;

        this.time += 0.01;

        this.tunnelSegments.forEach((segment, i) => {
            segment.rotation.z += 0.005;
            segment.position.z += 0.15;

            if (segment.position.z > 5) {
                segment.position.z = -195;
            }
        });

        const targetX = (this.mouseRef.current.x / window.innerWidth - 0.5) * 4;
        const targetY = -(this.mouseRef.current.y / window.innerHeight - 0.5) * 4;
        this.camera.position.x += (targetX - this.camera.position.x) * 0.03;
        this.camera.position.y += (targetY - this.camera.position.y) * 0.03;

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.animate());
    }

    destroy() {
        this.isActive = false;
        window.removeEventListener('resize', this.resizeHandler);
        if (this.renderer && this.renderer.domElement && this.container.contains(this.renderer.domElement)) {
            this.container.removeChild(this.renderer.domElement);
        }
    }
}

class GalaxySpiral {
    constructor(canvas, mouseRef, isLightMode) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mouseRef = mouseRef;
        this.isLightMode = isLightMode;
        this.stars = [];
        this.angle = 0;
        this.isActive = true;
        this.resize();
        this.init();
        this.resizeHandler = () => this.resize();
        window.addEventListener('resize', this.resizeHandler);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.init();
    }

    init() {
        this.stars = [];
        const maxRadius = Math.max(this.canvas.width, this.canvas.height) * 0.6;
        for (let i = 0; i < 600; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * maxRadius + 50;
            this.stars.push({
                angle,
                radius,
                size: Math.random() * 2.5 + 0.5,
                speed: Math.random() * 0.002 + 0.0005,
                hue: Math.random() * 60 + 200,
                brightness: Math.random() * 0.5 + 0.5
            });
        }
    }

    updateTheme(isLightMode) {
        this.isLightMode = isLightMode;
    }

    animate() {
        if (!this.isActive) return;

        const bg = this.isLightMode ? 'rgba(253, 251, 247, 0.06)' : 'rgba(10, 10, 10, 0.08)';
        this.ctx.fillStyle = bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        this.stars.forEach(star => {
            star.angle += star.speed;
            
            const spiralFactor = star.angle * 0.4;
            const x = centerX + Math.cos(star.angle + spiralFactor) * star.radius;
            const y = centerY + Math.sin(star.angle + spiralFactor) * star.radius;

            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, star.size * 4);
            
            if (this.isLightMode) {
                gradient.addColorStop(0, `hsla(${star.hue}, 65%, 60%, ${star.brightness * 0.8})`);
                gradient.addColorStop(1, `hsla(${star.hue}, 65%, 60%, 0)`);
            } else {
                gradient.addColorStop(0, `hsla(${star.hue}, 100%, 70%, ${star.brightness})`);
                gradient.addColorStop(1, `hsla(${star.hue}, 100%, 70%, 0)`);
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, star.size * 4, 0, Math.PI * 2);
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }

    destroy() {
        this.isActive = false;
        window.removeEventListener('resize', this.resizeHandler);
    }
}

class AudioVisualizer {
    constructor(canvas, mouseRef, isLightMode) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mouseRef = mouseRef;
        this.isLightMode = isLightMode;
        this.isActive = true;
        this.time = 0;
        this.rotation = 0;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.resize();
        this.setupAudio();
        this.resizeHandler = () => this.resize();
        window.addEventListener('resize', this.resizeHandler);
    }

    async setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            
            const source = this.audioContext.createMediaStreamSource(stream);
            source.connect(this.analyser);
            
            const audioElement = document.createElement('audio');
            audioElement.srcObject = stream;
            
        } catch (err) {
            this.dataArray = new Uint8Array(128);
            for (let i = 0; i < this.dataArray.length; i++) {
                this.dataArray[i] = Math.random() * 128;
            }
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    updateTheme(isLightMode) {
        this.isLightMode = isLightMode;
    }

    animate() {
        if (!this.isActive) return;

        const bg = this.isLightMode ? 'rgba(253, 251, 247, 0.1)' : 'rgba(10, 10, 10, 0.12)';
        this.ctx.fillStyle = bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.time += 0.016;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        if (this.analyser) {
            this.analyser.getByteFrequencyData(this.dataArray);
            const avgVolume = this.dataArray.reduce((a, b) => a + b) / this.dataArray.length;
            this.rotation += (avgVolume / 255) * 0.08;
        } else {
            this.rotation += 0.02;
        }

        const barCount = 80;
        for (let i = 0; i < barCount; i++) {
            const angle = (i / barCount) * Math.PI * 2 + this.rotation;
            const audioValue = this.dataArray ? this.dataArray[i % this.dataArray.length] / 255 : (Math.sin(this.time + i * 0.5) * 0.5 + 0.5);
            
            const wave1 = Math.sin(this.time * 1.5 + i * 0.15) * 80;
            const wave2 = Math.cos(this.time * 2 + i * 0.1) * 50;
            const variation = wave1 + wave2;
            
            const baseRadius = 120 + audioValue * 400;
            const finalRadius = baseRadius + variation;

            const x1 = centerX + Math.cos(angle) * 80;
            const y1 = centerY + Math.sin(angle) * 80;
            const x2 = centerX + Math.cos(angle) * finalRadius;
            const y2 = centerY + Math.sin(angle) * finalRadius;

            const hue = (i * 3.5 + this.time * 40) % 360;
            const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
            
            if (this.isLightMode) {
                gradient.addColorStop(0, `hsla(${hue}, 70%, 55%, 0.8)`);
                gradient.addColorStop(0.5, `hsla(${(hue + 60) % 360}, 70%, 50%, 0.6)`);
                gradient.addColorStop(1, `hsla(${(hue + 120) % 360}, 70%, 45%, 0.3)`);
            } else {
                gradient.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.9)`);
                gradient.addColorStop(0.5, `hsla(${(hue + 60) % 360}, 100%, 55%, 0.7)`);
                gradient.addColorStop(1, `hsla(${(hue + 120) % 360}, 100%, 50%, 0.3)`);
            }
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 4 + audioValue * 2;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }

        requestAnimationFrame(() => this.animate());
    }

    destroy() {
        this.isActive = false;
        if (this.audioContext) {
            this.audioContext.close();
        }
        window.removeEventListener('resize', this.resizeHandler);
    }
}

class ParticleSystem {
    constructor(canvas, mouseRef, isLightMode, comboCallback) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mouseRef = mouseRef;
        this.isLightMode = isLightMode;
        this.particles = [];
        this.isActive = true;
        this.isDragging = false;
        this.clickCount = new Map();
        this.comboCallback = comboCallback;
        this.combo = 0;
        this.comboTimer = null;
        this.fadeoutTimer = null;
        this.resize();
        
        this.clickHandler = (e) => {
            this.combo++;
            
            clearTimeout(this.comboTimer);
            clearTimeout(this.fadeoutTimer);
            
            this.comboCallback(this.combo, false);
            
            this.comboTimer = setTimeout(() => {
                this.fadeoutTimer = setTimeout(() => {
                    this.combo = 0;
                    this.comboCallback(0, false);
                }, 1000);
                this.comboCallback(this.combo, true);
            }, 2000);
            
            const x = e.clientX;
            const y = e.clientY;
            
            const key = `${Math.floor(x / 50)}_${Math.floor(y / 50)}`;
            const count = (this.clickCount.get(key) || 0) + 1;
            this.clickCount.set(key, Math.min(count, 5));
            
            const particleCount = 25 + count * 15;
            const speedMultiplier = 1 + count * 0.3;
            
            for (let i = 0; i < particleCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = (Math.random() * 8 + 2) * speedMultiplier;
                this.particles.push({
                    x, y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 120 + count * 20,
                    maxLife: 120 + count * 20,
                    size: Math.random() * 3 + 1 + count * 0.5,
                    hue: Math.random() * 360,
                    type: count > 2 ? 'star' : 'circle'
                });
            }
            
            setTimeout(() => {
                if (this.clickCount.get(key) > 0) {
                    this.clickCount.set(key, this.clickCount.get(key) - 1);
                }
            }, 2000);
        };
        
        this.mouseDownHandler = () => this.isDragging = true;
        this.mouseUpHandler = () => this.isDragging = false;
        
        this.canvas.addEventListener('click', this.clickHandler);
        this.canvas.addEventListener('mousedown', this.mouseDownHandler);
        this.canvas.addEventListener('mouseup', this.mouseUpHandler);
        this.resizeHandler = () => this.resize();
        window.addEventListener('resize', this.resizeHandler);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    updateTheme(isLightMode) {
        this.isLightMode = isLightMode;
    }

    drawStar(x, y, size, hue, alpha) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const px = Math.cos(angle) * size;
            const py = Math.sin(angle) * size;
            if (i === 0) this.ctx.moveTo(px, py);
            else this.ctx.lineTo(px, py);
        }
        this.ctx.closePath();
        
        if (this.isLightMode) {
            this.ctx.fillStyle = `hsla(${hue}, 70%, 55%, ${alpha})`;
        } else {
            this.ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
        }
        
        this.ctx.fill();
        this.ctx.restore();
    }

    animate() {
        if (!this.isActive) return;

        const bg = this.isLightMode ? 'rgba(253, 251, 247, 0.12)' : 'rgba(10, 10, 10, 0.15)';
        this.ctx.fillStyle = bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.isDragging) {
            const x = this.mouseRef.current.x;
            const y = this.mouseRef.current.y;
            
            for (let i = 0; i < 2; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 6 + 2;
                this.particles.push({
                    x, y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 100,
                    maxLife: 100,
                    size: Math.random() * 3 + 2,
                    hue: Math.random() * 360,
                    type: 'circle'
                });
            }
        }

        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.life--;

            const alpha = p.life / p.maxLife;
            
            if (p.type === 'star') {
                this.drawStar(p.x, p.y, p.size * 2, p.hue, alpha);
            } else {
                const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
                
                if (this.isLightMode) {
                    gradient.addColorStop(0, `hsla(${p.hue}, 70%, 55%, ${alpha})`);
                    gradient.addColorStop(1, `hsla(${p.hue}, 70%, 55%, 0)`);
                } else {
                    gradient.addColorStop(0, `hsla(${p.hue}, 100%, 60%, ${alpha})`);
                    gradient.addColorStop(1, `hsla(${p.hue}, 100%, 60%, 0)`);
                }
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
                this.ctx.fill();
            }

            return p.life > 0;
        });

        requestAnimationFrame(() => this.animate());
    }

    destroy() {
        this.isActive = false;
        clearTimeout(this.comboTimer);
        clearTimeout(this.fadeoutTimer);
        this.canvas.removeEventListener('click', this.clickHandler);
        this.canvas.removeEventListener('mousedown', this.mouseDownHandler);
        this.canvas.removeEventListener('mouseup', this.mouseUpHandler);
        window.removeEventListener('resize', this.resizeHandler);
    }
}

class PhysicsSandbox {
    constructor(canvas, mouseRef, isLightMode) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mouseRef = mouseRef;
        this.isLightMode = isLightMode;
        this.isActive = true;
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;
        this.engine.gravity.y = 1;
        this.bodies = [];
        this.mouseDown = false;
        this.dragStart = null;
        this.trajectoryPoints = [];
        this.headerHeight = 150;
        this.resize();
        this.init();
        
        this.clickHandler = (e) => {
            if (!this.mouseDown) {
                this.dragStart = { x: e.clientX, y: e.clientY };
                this.mouseDown = true;
            }
        };
        
        this.mouseUpHandler = (e) => {
            if (this.mouseDown && this.dragStart) {
                const dx = e.clientX - this.dragStart.x;
                const dy = e.clientY - this.dragStart.y;
                const speed = Math.sqrt(dx * dx + dy * dy);
                
                if (speed > 10) {
                    this.createBody(this.dragStart.x, this.dragStart.y, dx * 0.02, dy * 0.02);
                } else {
                    this.createBody(e.clientX, e.clientY, 0, 0);
                }
                
                this.mouseDown = false;
                this.dragStart = null;
                this.trajectoryPoints = [];
            }
        };
        
        this.contextMenuHandler = (e) => {
            e.preventDefault();
            this.engine.gravity.y *= -1;
        };
        
        this.keyHandler = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.explodeAll();
            }
        };
        
        this.canvas.addEventListener('mousedown', this.clickHandler);
        this.canvas.addEventListener('mouseup', this.mouseUpHandler);
        this.canvas.addEventListener('contextmenu', this.contextMenuHandler);
        window.addEventListener('keydown', this.keyHandler);
        this.resizeHandler = () => this.resize();
        window.addEventListener('resize', this.resizeHandler);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.init();
    }

    init() {
        Matter.World.clear(this.world);
        Matter.Engine.clear(this.engine);
        this.bodies = [];
        
        const ground = Matter.Bodies.rectangle(
            this.canvas.width / 2, 
            this.canvas.height + 25, 
            this.canvas.width, 
            50, 
            { isStatic: true }
        );
        
        const ceiling = Matter.Bodies.rectangle(
            this.canvas.width / 2,
            this.headerHeight - 25,
            this.canvas.width,
            50,
            { isStatic: true }
        );
        
        const leftWall = Matter.Bodies.rectangle(
            -25, 
            this.canvas.height / 2, 
            50, 
            this.canvas.height, 
            { isStatic: true }
        );
        
        const rightWall = Matter.Bodies.rectangle(
            this.canvas.width + 25, 
            this.canvas.height / 2, 
            50, 
            this.canvas.height, 
            { isStatic: true }
        );
        
        Matter.World.add(this.world, [ground, ceiling, leftWall, rightWall]);
    }

    createBody(x, y, vx, vy) {
        if (this.bodies.length >= 100) {
            const oldBody = this.bodies.shift();
            Matter.World.remove(this.world, oldBody.body);
        }
        
        const shapeType = Math.floor(Math.random() * 3);
        const size = Math.random() * 30 + 20;
        const hue = Math.random() * 360;
        let body;
        
        if (shapeType === 0) {
            body = Matter.Bodies.circle(x, y, size, {
                restitution: 0.8,
                friction: 0.05,
                density: 0.001
            });
        } else if (shapeType === 1) {
            body = Matter.Bodies.rectangle(x, y, size * 2, size * 2, {
                restitution: 0.6,
                friction: 0.1,
                density: 0.002
            });
        } else {
            const vertices = [
                { x: 0, y: -size },
                { x: size, y: size },
                { x: -size, y: size }
            ];
            body = Matter.Bodies.fromVertices(x, y, vertices, {
                restitution: 0.5,
                friction: 0.15,
                density: 0.0015
            });
        }
        
        Matter.Body.setVelocity(body, { x: vx, y: vy });
        
        this.bodies.push({
            body: body,
            hue: hue,
            type: shapeType,
            brightness: 1
        });
        
        Matter.World.add(this.world, body);
    }

    explodeAll() {
        this.bodies.forEach(obj => {
            const force = 0.05;
            const angle = Math.random() * Math.PI * 2;
            Matter.Body.applyForce(obj.body, obj.body.position, {
                x: Math.cos(angle) * force,
                y: Math.sin(angle) * force
            });
        });
    }

    updateTheme(isLightMode) {
        this.isLightMode = isLightMode;
    }

    animate() {
        if (!this.isActive) return;
        
        Matter.Engine.update(this.engine, 1000 / 60);
        
        const bg = this.isLightMode ? 'rgba(253, 251, 247, 0.15)' : 'rgba(10, 10, 10, 0.2)';
        this.ctx.fillStyle = bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.bodies.forEach(obj => {
            obj.brightness = Math.max(0.5, obj.brightness * 0.95);
            
            const collisions = Matter.Query.collides(obj.body, this.bodies.map(b => b.body));
            if (collisions.length > 0) {
                obj.brightness = 1.5;
            }
            
            this.ctx.save();
            this.ctx.translate(obj.body.position.x, obj.body.position.y);
            this.ctx.rotate(obj.body.angle);
            
            if (this.isLightMode) {
                this.ctx.fillStyle = `hsla(${obj.hue}, 70%, ${50 * obj.brightness}%, 0.8)`;
                this.ctx.shadowColor = `hsla(${obj.hue}, 70%, 50%, 0.3)`;
            } else {
                this.ctx.fillStyle = `hsla(${obj.hue}, 100%, ${50 * obj.brightness}%, 0.9)`;
                this.ctx.shadowColor = `hsla(${obj.hue}, 100%, 50%, 0.5)`;
            }
            
            this.ctx.shadowBlur = 10;
            
            if (obj.type === 0) {
                const radius = obj.body.circleRadius;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (obj.type === 1) {
                const width = obj.body.bounds.max.x - obj.body.bounds.min.x;
                const height = obj.body.bounds.max.y - obj.body.bounds.min.y;
                this.ctx.fillRect(-width / 2, -height / 2, width, height);
            } else {
                this.ctx.beginPath();
                const vertices = obj.body.vertices;
                this.ctx.moveTo(
                    vertices[0].x - obj.body.position.x,
                    vertices[0].y - obj.body.position.y
                );
                for (let i = 1; i < vertices.length; i++) {
                    this.ctx.lineTo(
                        vertices[i].x - obj.body.position.x,
                        vertices[i].y - obj.body.position.y
                    );
                }
                this.ctx.closePath();
                this.ctx.fill();
            }
            
            this.ctx.restore();
        });
        
        if (this.mouseDown && this.dragStart) {
            const dx = this.mouseRef.current.x - this.dragStart.x;
            const dy = this.mouseRef.current.y - this.dragStart.y;
            
            this.ctx.strokeStyle = this.isLightMode ? 'rgba(232, 93, 117, 0.8)' : 'rgba(255, 0, 110, 0.8)';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([10, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.dragStart.x, this.dragStart.y);
            this.ctx.lineTo(this.mouseRef.current.x, this.mouseRef.current.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
        
        requestAnimationFrame(() => this.animate());
    }

    destroy() {
        this.isActive = false;
        this.canvas.removeEventListener('mousedown', this.clickHandler);
        this.canvas.removeEventListener('mouseup', this.mouseUpHandler);
        this.canvas.removeEventListener('contextmenu', this.contextMenuHandler);
        window.removeEventListener('keydown', this.keyHandler);
        window.removeEventListener('resize', this.resizeHandler);
        Matter.World.clear(this.world);
        Matter.Engine.clear(this.engine);
    }
}

class SynthPad {
    constructor(canvas, mouseRef, isLightMode) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mouseRef = mouseRef;
        this.isLightMode = isLightMode;
        this.isActive = true;
        this.synth = null;
        this.waves = [];
        this.pads = [];
        this.cols = 7;
        this.rows = 5;
        this.recording = false;
        this.loop = [];
        this.loopInterval = null;
        this.scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        this.octaves = [3, 4, 5, 6, 7];
        this.resize();
        this.initAudio();
        
        this.clickHandler = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            for (let pad of this.pads) {
                if (x >= pad.x && x <= pad.x + pad.width &&
                    y >= pad.y && y <= pad.y + pad.height) {
                    this.playNote(pad);
                    break;
                }
            }
        };
        
        this.keyHandler = (e) => {
            if (e.code === 'KeyR') {
                e.preventDefault();
                this.toggleRecording();
            }
        };
        
        this.canvas.addEventListener('click', this.clickHandler);
        window.addEventListener('keydown', this.keyHandler);
        this.resizeHandler = () => this.resize();
        window.addEventListener('resize', this.resizeHandler);
    }

    async initAudio() {
        await Tone.start();
        this.synth = new Tone.PolySynth(Tone.Synth, {
            maxPolyphony: 8,
            oscillator: { type: 'triangle' },
            envelope: {
                attack: 0.02,
                decay: 0.1,
                sustain: 0.3,
                release: 1
            }
        }).toDestination();
        
        this.synth.volume.value = -8;
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.calculatePads();
    }

    calculatePads() {
        this.pads = [];
        const padding = 10;
        const padWidth = (this.canvas.width - padding * (this.cols + 1)) / this.cols;
        const padHeight = (this.canvas.height - padding * (this.rows + 1)) / this.rows;
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const octave = this.octaves[this.rows - 1 - row];
                const note = this.scale[col];
                this.pads.push({
                    x: padding + col * (padWidth + padding),
                    y: padding + row * (padHeight + padding),
                    width: padWidth,
                    height: padHeight,
                    note: note + octave,
                    col: col,
                    row: row,
                    active: false,
                    pulse: 0
                });
            }
        }
    }

    playNote(pad) {
        if (this.synth) {
            this.synth.triggerAttackRelease(pad.note, '8n');
            pad.active = true;
            pad.pulse = 1;
            
            this.waves.push({
                x: pad.x + pad.width / 2,
                y: pad.y + pad.height / 2,
                radius: 0,
                maxRadius: 200,
                life: 60,
                hue: (pad.col * 51 + pad.row * 20) % 360
            });
            
            if (this.recording) {
                this.loop.push({
                    note: pad.note,
                    time: Date.now()
                });
            }
        }
    }

    toggleRecording() {
        this.recording = !this.recording;
        
        if (this.recording) {
            this.loop = [];
        } else if (this.loop.length > 0) {
            this.startLoop();
        }
    }

    startLoop() {
        if (this.loopInterval) {
            clearInterval(this.loopInterval);
        }
        
        const duration = this.loop[this.loop.length - 1].time - this.loop[0].time;
        let index = 0;
        
        this.loopInterval = setInterval(() => {
            const noteData = this.loop[index];
            const pad = this.pads.find(p => p.note === noteData.note);
            if (pad) {
                this.playNote(pad);
            }
            
            index = (index + 1) % this.loop.length;
        }, duration / this.loop.length);
    }

    updateTheme(isLightMode) {
        this.isLightMode = isLightMode;
    }

    animate() {
        if (!this.isActive) return;
        
        const bg = this.isLightMode ? 'rgba(253, 251, 247, 0.2)' : 'rgba(10, 10, 10, 0.25)';
        this.ctx.fillStyle = bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.waves = this.waves.filter(wave => {
            wave.radius += 5;
            wave.life--;
            
            const alpha = wave.life / 60;
            this.ctx.strokeStyle = this.isLightMode 
                ? `hsla(${wave.hue}, 70%, 50%, ${alpha * 0.6})`
                : `hsla(${wave.hue}, 100%, 60%, ${alpha})`;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            return wave.life > 0 && wave.radius < wave.maxRadius;
        });
        
        this.pads.forEach(pad => {
            const baseHue = (pad.col * 51 + pad.row * 20) % 360;
            
            if (pad.active) {
                pad.pulse = Math.max(0, pad.pulse - 0.05);
                if (pad.pulse <= 0) {
                    pad.active = false;
                }
            }
            
            const brightness = 0.5 + pad.pulse * 0.5;
            
            if (this.isLightMode) {
                this.ctx.fillStyle = `hsla(${baseHue}, 70%, ${40 + brightness * 30}%, 0.7)`;
            } else {
                this.ctx.fillStyle = `hsla(${baseHue}, 100%, ${30 + brightness * 40}%, 0.8)`;
            }
            
            this.ctx.fillRect(pad.x, pad.y, pad.width, pad.height);
            
            this.ctx.strokeStyle = this.isLightMode 
                ? 'rgba(82, 201, 168, 0.3)'
                : 'rgba(6, 255, 165, 0.4)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(pad.x, pad.y, pad.width, pad.height);
        });
        
        if (this.recording) {
            this.ctx.fillStyle = this.isLightMode ? 'rgba(232, 93, 117, 0.8)' : 'rgba(255, 0, 110, 0.9)';
            this.ctx.beginPath();
            this.ctx.arc(30, 30, 10, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        requestAnimationFrame(() => this.animate());
    }

    destroy() {
        this.isActive = false;
        if (this.loopInterval) {
            clearInterval(this.loopInterval);
        }
        if (this.synth) {
            this.synth.dispose();
        }
        this.canvas.removeEventListener('click', this.clickHandler);
        window.removeEventListener('keydown', this.keyHandler);
        window.removeEventListener('resize', this.resizeHandler);
    }
}

class FluidPaint {
    constructor(canvas, mouseRef, isLightMode) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mouseRef = mouseRef;
        this.isLightMode = isLightMode;
        this.isActive = true;
        this.particles = [];
        this.velocityField = [];
        this.gridSize = 20;
        this.lastMouse = { x: -1, y: -1 };
        this.colorOffset = 0;
        this.resize();
        this.initVelocityField();
        
        this.keyHandler = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.clear();
            }
        };
        
        window.addEventListener('keydown', this.keyHandler);
        this.resizeHandler = () => this.resize();
        window.addEventListener('resize', this.resizeHandler);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initVelocityField();
    }

    initVelocityField() {
        this.velocityField = [];
        const cols = Math.ceil(this.canvas.width / this.gridSize);
        const rows = Math.ceil(this.canvas.height / this.gridSize);
        
        for (let i = 0; i < rows; i++) {
            this.velocityField[i] = [];
            for (let j = 0; j < cols; j++) {
                this.velocityField[i][j] = { vx: 0, vy: 0 };
            }
        }
    }

    clear() {
        this.particles = [];
        this.initVelocityField();
    }

    updateTheme(isLightMode) {
        this.isLightMode = isLightMode;
    }

    addFluidForce(x, y, dx, dy) {
        const strength = 0.3;
        const radius = 100;
        
        const col = Math.floor(x / this.gridSize);
        const row = Math.floor(y / this.gridSize);
        
        for (let i = -3; i <= 3; i++) {
            for (let j = -3; j <= 3; j++) {
                const r = row + i;
                const c = col + j;
                
                if (r >= 0 && r < this.velocityField.length && 
                    c >= 0 && c < this.velocityField[0].length) {
                    
                    const cellX = c * this.gridSize;
                    const cellY = r * this.gridSize;
                    const dist = Math.sqrt((cellX - x) ** 2 + (cellY - y) ** 2);
                    
                    if (dist < radius) {
                        const force = (1 - dist / radius) * strength;
                        this.velocityField[r][c].vx += dx * force;
                        this.velocityField[r][c].vy += dy * force;
                    }
                }
            }
        }
        
        this.colorOffset += Math.abs(dx) + Math.abs(dy);
        const hue = (this.colorOffset * 2) % 360;
        
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed + dx * 0.5,
                vy: Math.sin(angle) * speed + dy * 0.5,
                size: Math.random() * 15 + 5,
                hue: hue + Math.random() * 60 - 30,
                life: 200,
                maxLife: 200
            });
        }
    }

    animate() {
        if (!this.isActive) return;
        
        const bg = this.isLightMode ? 'rgba(253, 251, 247, 0.03)' : 'rgba(10, 10, 10, 0.05)';
        this.ctx.fillStyle = bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const mx = this.mouseRef.current.x;
        const my = this.mouseRef.current.y;
        
        if (this.lastMouse.x >= 0) {
            const dx = mx - this.lastMouse.x;
            const dy = my - this.lastMouse.y;
            const speed = Math.sqrt(dx * dx + dy * dy);
            
            if (speed > 1) {
                this.addFluidForce(mx, my, dx, dy);
            }
        }
        
        this.lastMouse = { x: mx, y: my };
        
        for (let i = 0; i < this.velocityField.length; i++) {
            for (let j = 0; j < this.velocityField[0].length; j++) {
                this.velocityField[i][j].vx *= 0.98;
                this.velocityField[i][j].vy *= 0.98;
            }
        }
        
        this.particles = this.particles.filter(p => {
            const col = Math.floor(p.x / this.gridSize);
            const row = Math.floor(p.y / this.gridSize);
            
            if (row >= 0 && row < this.velocityField.length && 
                col >= 0 && col < this.velocityField[0].length) {
                p.vx += this.velocityField[row][col].vx;
                p.vy += this.velocityField[row][col].vy;
            }
            
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.99;
            p.vy *= 0.99;
            p.life--;
            
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -0.5;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -0.5;
            
            p.x = Math.max(0, Math.min(this.canvas.width, p.x));
            p.y = Math.max(0, Math.min(this.canvas.height, p.y));
            
            const alpha = p.life / p.maxLife;
            const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            
            if (this.isLightMode) {
                gradient.addColorStop(0, `hsla(${p.hue}, 75%, 55%, ${alpha * 0.6})`);
                gradient.addColorStop(1, `hsla(${p.hue}, 75%, 55%, 0)`);
            } else {
                gradient.addColorStop(0, `hsla(${p.hue}, 100%, 60%, ${alpha * 0.8})`);
                gradient.addColorStop(1, `hsla(${p.hue}, 100%, 60%, 0)`);
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            return p.life > 0;
        });
        
        requestAnimationFrame(() => this.animate());
    }

    destroy() {
        this.isActive = false;
        window.removeEventListener('keydown', this.keyHandler);
        window.removeEventListener('resize', this.resizeHandler);
    }
}