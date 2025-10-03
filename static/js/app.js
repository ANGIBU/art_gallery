// static/js/app.js

const { useState, useEffect, useRef } = React;

const translations = {
    ko: {
        logo: 'Art Gallery',
        theme: { light: '다크', dark: '라이트' },
        categories: {
            interactive: '체험',
            visual: '감상'
        },
        sections: {
            'particle-wave': { 
                name: '파티클 웨이브', 
                info: '마우스를 움직여 무지개 파동을 생성하세요'
            },
            'gravity-orbs': { 
                name: '중력 구체', 
                info: '클릭하여 폭발을 생성하고 꾹 눌러 이동시키세요'
            },
            'neural-network': { 
                name: '신경망', 
                info: '마우스로 신경망을 활성화하세요'
            },
            'particle-system': { 
                name: '파티클 폭발', 
                info: '클릭하여 파티클을 생성하고 콤보를 쌓으세요'
            },
            'physics-sandbox': {
                name: '물리 샌드박스',
                info: '클릭 또는 드래그하여 도형 생성 | 우클릭: 중력 반전 | 스페이스: 폭발'
            },
            'synth-pad': {
                name: '신디사이저',
                info: '패드를 클릭하여 음을 연주하세요 | R키: 녹음/재생'
            },
            'fluid-paint': {
                name: '플루이드 페인팅',
                info: '마우스를 드래그하여 유체를 그리세요 | 스페이스: 화면 지우기'
            },
            'tunnel-3d': { 
                name: '3D 터널', 
                info: '마우스를 움직여 무한 터널을 탐험하세요'
            },
            'galaxy-spiral': { 
                name: '은하 나선', 
                info: '회전하는 은하를 감상하세요'
            },
            'audio-visual': { 
                name: '오디오 웨이브', 
                info: '마이크를 통해 소리를 시각화합니다'
            }
        }
    },
    en: {
        logo: 'Art Gallery',
        theme: { light: 'Dark', dark: 'Light' },
        categories: {
            interactive: 'Interactive',
            visual: 'Visual'
        },
        sections: {
            'particle-wave': { 
                name: 'Particle Wave', 
                info: 'Move mouse to create rainbow waves'
            },
            'gravity-orbs': { 
                name: 'Gravity Orbs', 
                info: 'Click to create explosions, hold to move'
            },
            'neural-network': { 
                name: 'Neural Net', 
                info: 'Move mouse to activate neural network'
            },
            'particle-system': { 
                name: 'Particle Burst', 
                info: 'Click to create particles and build combo'
            },
            'physics-sandbox': {
                name: 'Physics Sandbox',
                info: 'Click or drag to create shapes | Right-click: Reverse gravity | Space: Explode'
            },
            'synth-pad': {
                name: 'Synthesizer',
                info: 'Click pads to play notes | R key: Record/Play loop'
            },
            'fluid-paint': {
                name: 'Fluid Paint',
                info: 'Drag mouse to paint fluid | Space: Clear screen'
            },
            'tunnel-3d': { 
                name: '3D Tunnel', 
                info: 'Move mouse to explore infinite tunnel'
            },
            'galaxy-spiral': { 
                name: 'Galaxy Spiral', 
                info: 'Watch the rotating galaxy'
            },
            'audio-visual': { 
                name: 'Audio Wave', 
                info: 'Visualize sound through microphone'
            }
        }
    },
    ja: {
        logo: 'Art Gallery',
        theme: { light: 'ダーク', dark: 'ライト' },
        categories: {
            interactive: '体験',
            visual: '鑑賞'
        },
        sections: {
            'particle-wave': { 
                name: 'パーティクル波', 
                info: 'マウスを動かして虹の波を作る'
            },
            'gravity-orbs': { 
                name: '重力球', 
                info: 'クリックして爆発を作り、長押しで移動'
            },
            'neural-network': { 
                name: 'ニューラルネット', 
                info: 'マウスでニューラルネットワークを起動'
            },
            'particle-system': { 
                name: 'パーティクル爆発', 
                info: 'クリックで生成、コンボを積み上げる'
            },
            'physics-sandbox': {
                name: '物理サンドボックス',
                info: 'クリックまたはドラッグで図形生成 | 右クリック: 重力反転 | スペース: 爆発'
            },
            'synth-pad': {
                name: 'シンセサイザー',
                info: 'パッドをクリックして音を演奏 | Rキー: 録音/再生'
            },
            'fluid-paint': {
                name: '流体ペイント',
                info: 'マウスドラッグで流体を描く | スペース: 画面クリア'
            },
            'tunnel-3d': { 
                name: '3Dトンネル', 
                info: 'マウスを動かして無限トンネルを探索'
            },
            'galaxy-spiral': { 
                name: '銀河', 
                info: '回転する銀河を鑑賞'
            },
            'audio-visual': { 
                name: 'オーディオ波', 
                info: 'マイクで音を視覚化'
            }
        }
    },
    zh: {
        logo: 'Art Gallery',
        theme: { light: '暗色', dark: '亮色' },
        categories: {
            interactive: '体验',
            visual: '观赏'
        },
        sections: {
            'particle-wave': { 
                name: '粒子波', 
                info: '移动鼠标创建彩虹波浪'
            },
            'gravity-orbs': { 
                name: '重力球', 
                info: '点击创建爆炸,按住移动'
            },
            'neural-network': { 
                name: '神经网络', 
                info: '移动鼠标激活神经网络'
            },
            'particle-system': { 
                name: '粒子爆炸', 
                info: '点击生成粒子,累积连击'
            },
            'physics-sandbox': {
                name: '物理沙盒',
                info: '点击或拖动生成形状 | 右键: 重力反转 | 空格: 爆发'
            },
            'synth-pad': {
                name: '合成器',
                info: '点击音垫演奏音符 | R键: 录制/播放循环'
            },
            'fluid-paint': {
                name: '流体绘画',
                info: '拖动鼠标绘制流体 | 空格: 清空屏幕'
            },
            'tunnel-3d': { 
                name: '3D隧道', 
                info: '移动鼠标探索无限隧道'
            },
            'galaxy-spiral': { 
                name: '星系螺旋', 
                info: '观赏旋转的星系'
            },
            'audio-visual': { 
                name: '音频波', 
                info: '通过麦克风可视化声音'
            }
        }
    },
    fr: {
        logo: 'Art Gallery',
        theme: { light: 'Sombre', dark: 'Clair' },
        categories: {
            interactive: 'Interactif',
            visual: 'Visuel'
        },
        sections: {
            'particle-wave': { 
                name: 'Vague de Particules', 
                info: 'Bougez souris pour vagues arc-en-ciel'
            },
            'gravity-orbs': { 
                name: 'Orbes de Gravité', 
                info: 'Cliquez pour explosions, maintenez pour bouger'
            },
            'neural-network': { 
                name: 'Réseau Neuronal', 
                info: 'Bougez pour activer réseau neuronal'
            },
            'particle-system': { 
                name: 'Explosion Particules', 
                info: 'Cliquez pour créer, accumulez combo'
            },
            'physics-sandbox': {
                name: 'Bac à Sable Physique',
                info: 'Clic ou glisser pour formes | Clic droit: Gravité inverse | Espace: Exploser'
            },
            'synth-pad': {
                name: 'Synthétiseur',
                info: 'Cliquez pavés pour jouer notes | Touche R: Enregistrer/Jouer'
            },
            'fluid-paint': {
                name: 'Peinture Fluide',
                info: 'Glissez souris pour peindre fluide | Espace: Effacer écran'
            },
            'tunnel-3d': { 
                name: 'Tunnel 3D', 
                info: 'Bougez pour explorer tunnel infini'
            },
            'galaxy-spiral': { 
                name: 'Galaxie Spirale', 
                info: 'Regardez la galaxie rotative'
            },
            'audio-visual': { 
                name: 'Onde Audio', 
                info: 'Visualisez son via microphone'
            }
        }
    }
};

const getLanguage = () => {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('ko')) return 'ko';
    if (browserLang.startsWith('ja')) return 'ja';
    if (browserLang.startsWith('zh')) return 'zh';
    if (browserLang.startsWith('fr')) return 'fr';
    return 'en';
};

const App = () => {
    const [activeSection, setActiveSection] = useState('particle-wave');
    const [isLightMode, setIsLightMode] = useState(false);
    const [lang, setLang] = useState(getLanguage());
    const [combo, setCombo] = useState(0);
    const [comboFadeout, setComboFadeout] = useState(false);
    const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        
        const handleTouchMove = (e) => {
            if (e.touches.length > 0) {
                mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        };
        
        const handleTouchStart = (e) => {
            if (e.touches.length > 0) {
                mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchstart', handleTouchStart);
        };
    }, []);

    useEffect(() => {
        if (isLightMode) {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
    }, [isLightMode]);

    const handleComboChange = (newCombo, shouldFadeout) => {
        setCombo(newCombo);
        setComboFadeout(shouldFadeout);
    };

    const t = translations[lang];

    const interactiveSections = [
        'particle-wave',
        'gravity-orbs', 
        'neural-network',
        'particle-system',
        'physics-sandbox',
        'synth-pad',
        'fluid-paint'
    ];

    const visualSections = [
        'tunnel-3d',
        'galaxy-spiral',
        'audio-visual'
    ];

    const handleSectionChange = (sectionId) => {
        setCombo(0);
        setComboFadeout(false);
        
        const oldSection = document.querySelector('.content-section.active');
        if (oldSection && oldSection.id !== sectionId) {
            gsap.to(oldSection, {
                opacity: 0,
                y: -20,
                duration: 0.3,
                onComplete: () => {
                    oldSection.classList.remove('active');
                    setActiveSection(sectionId);
                }
            });
        } else {
            setActiveSection(sectionId);
        }
    };

    return (
        <div className="app-container">
            <header>
                <div className="header-content">
                    <div className="header-top">
                        <div className="logo">{t.logo}</div>
                        <div className="controls">
                            <button 
                                className="theme-toggle"
                                onClick={() => setIsLightMode(!isLightMode)}
                            >
                                {isLightMode ? '🌙 ' + t.theme.light : '☀️ ' + t.theme.dark}
                            </button>
                        </div>
                    </div>
                    <nav className="nav-categories">
                        <div className="nav-category">
                            <button className={`category-toggle ${interactiveSections.includes(activeSection) ? 'active' : ''}`}>
                                {t.categories.interactive}
                            </button>
                            <div className="nav-dropdown">
                                {interactiveSections.map(sectionId => (
                                    <button
                                        key={sectionId}
                                        className={`nav-btn ${activeSection === sectionId ? 'active' : ''}`}
                                        onClick={() => handleSectionChange(sectionId)}
                                    >
                                        {t.sections[sectionId].name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="nav-category">
                            <button className={`category-toggle ${visualSections.includes(activeSection) ? 'active' : ''}`}>
                                {t.categories.visual}
                            </button>
                            <div className="nav-dropdown">
                                {visualSections.map(sectionId => (
                                    <button
                                        key={sectionId}
                                        className={`nav-btn ${activeSection === sectionId ? 'active' : ''}`}
                                        onClick={() => handleSectionChange(sectionId)}
                                    >
                                        {t.sections[sectionId].name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </nav>
                </div>
            </header>
            
            <div className="content-wrapper">
                {[...interactiveSections, ...visualSections].map(sectionId => (
                    <ContentSection
                        key={sectionId}
                        id={sectionId}
                        isActive={activeSection === sectionId}
                        info={t.sections[sectionId].info}
                        mouseRef={mouseRef}
                        isLightMode={isLightMode}
                        onComboChange={handleComboChange}
                    />
                ))}
            </div>
            
            {combo >= 5 && activeSection === 'particle-system' && (
                <div className={`combo-display ${comboFadeout ? 'fadeout' : 'active'}`} key={`${combo}-${comboFadeout}`}>
                    <div>COMBO</div>
                    <div className="combo-number">{combo}</div>
                </div>
            )}
        </div>
    );
};

const ContentSection = ({ id, isActive, info, mouseRef, isLightMode, onComboChange }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const animatorRef = useRef(null);

    useEffect(() => {
        if (!isActive) return;

        const element = document.getElementById(id);
        if (element) {
            element.classList.add('active');
            gsap.fromTo(element,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5 }
            );
        }

        let animator = null;

        if (canvasRef.current) {
            const canvas = canvasRef.current;
            
            switch(id) {
                case 'particle-wave':
                    animator = new ParticleWave(canvas, mouseRef, isLightMode);
                    break;
                case 'gravity-orbs':
                    animator = new GravityOrbs(canvas, mouseRef, isLightMode);
                    break;
                case 'neural-network':
                    animator = new NeuralNetwork(canvas, mouseRef, isLightMode);
                    break;
                case 'galaxy-spiral':
                    animator = new GalaxySpiral(canvas, mouseRef, isLightMode);
                    break;
                case 'audio-visual':
                    animator = new AudioVisualizer(canvas, mouseRef, isLightMode);
                    break;
                case 'particle-system':
                    animator = new ParticleSystem(canvas, mouseRef, isLightMode, onComboChange);
                    break;
                case 'physics-sandbox':
                    animator = new PhysicsSandbox(canvas, mouseRef, isLightMode);
                    break;
                case 'synth-pad':
                    animator = new SynthPad(canvas, mouseRef, isLightMode);
                    break;
                case 'fluid-paint':
                    animator = new FluidPaint(canvas, mouseRef, isLightMode);
                    break;
            }

            if (animator) {
                animatorRef.current = animator;
                animator.animate();
            }
        } else if (containerRef.current && id === 'tunnel-3d') {
            animator = new Tunnel3D(containerRef.current, mouseRef, isLightMode);
            animatorRef.current = animator;
            animator.animate();
        }

        return () => {
            if (animatorRef.current && animatorRef.current.destroy) {
                animatorRef.current.destroy();
            }
        };
    }, [isActive, id]);

    useEffect(() => {
        if (animatorRef.current && animatorRef.current.updateTheme) {
            animatorRef.current.updateTheme(isLightMode);
        }
    }, [isLightMode]);

    return (
        <div 
            id={id} 
            className={`content-section ${isActive ? 'active' : ''}`}
        >
            {id === 'tunnel-3d' ? (
                <div ref={containerRef} className="three-container"></div>
            ) : (
                <canvas ref={canvasRef}></canvas>
            )}
            {isActive && <div className="info-panel">{info}</div>}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);