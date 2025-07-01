// More Clouds <3

(() => {
    'use strict';
    
    // Prevent multiple injections
    if (window.moreCloudsInjected) return;
    // if (window.resonantLoveCloudsInjected) return;
    window.moreCloudsInjected = true;
    // window.resonantLoveCloudsInjected = true;

    let clouds = [];
    let cloudImg = null;
    let imageLoaded = false;
    const numClouds = 16;
    let p5Instance = null;
    const TARGET_ALPHA = 0; // fully transparent
    const STYLE_ID = 'more-clouds-style';

    function waitForP5() {
        return new Promise((resolve) => {
            if (window.p5) {
                resolve();
                return;
            }
            
            // Wait for p5.js to be loaded by the manifest
            const checkP5 = () => {
                if (window.p5) {
                    resolve();
                } else {
                    setTimeout(checkP5, 10);
                }
            };
            checkP5();
        });
    }

    function createCloudCanvas() {
        const canvas = document.createElement('div');
        canvas.id = 'more-clouds';
        document.body.appendChild(canvas);
        return canvas;
    }

    function initializeClouds(p) {
        // Get cloud image URL
        const cloudImageUrl = chrome.runtime.getURL('cloud.png');
        
        p.preload = function() {
            cloudImg = p.loadImage(cloudImageUrl, 
                () => {
                    imageLoaded = true;
                    console.log('More Clouds: Cloud image loaded successfully');
                },
                (err) => {
                    console.warn('More Clouds: Could not load cloud image, continuing without clouds:', err);
                    imageLoaded = false;
                }
            );
        };

        p.setup = function() {
            const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
            canvas.parent('more-clouds');
            
            // Initialize clouds with random positions
            clouds = [];
            for (let i = 0; i < numClouds; i++) {
                clouds.push({
                    x: p.random(-200, window.innerWidth + 200),
                    y: p.random(50, window.innerHeight - 200),
                    scale: p.random(0.3, 0.8),
                    speed: p.random(0.2, 0.6),
                    alpha: p.random(100, 180)
                });
            }
        };

        p.draw = function() {
            p.clear(); // Make background transparent
            
            // Draw and animate clouds only if image is loaded
            if (imageLoaded && cloudImg) {
                clouds.forEach((cloud) => {
                    p.push();
                    p.translate(cloud.x, cloud.y);
                    p.scale(cloud.scale);
                    p.tint(255, cloud.alpha);
                    
                    p.image(cloudImg, -cloudImg.width / 2, -cloudImg.height / 2);
                    
                    p.pop();

                    // Move cloud from right to left
                    cloud.x -= cloud.speed;

                    // Reset cloud position when it goes off screen
                    if (cloud.x < -300) {
                        cloud.x = window.innerWidth + 200;
                        cloud.y = p.random(50, window.innerHeight - 200);
                        cloud.scale = p.random(0.3, 0.8);
                        cloud.speed = p.random(0.2, 0.6);
                        cloud.alpha = p.random(100, 180);
                    }
                });
            }
        };

        p.windowResized = function() {
            p.resizeCanvas(window.innerWidth, window.innerHeight);
            
            // Redistribute clouds for new window size
            clouds.forEach(cloud => {
                if (cloud.y > window.innerHeight - 200) {
                    cloud.y = p.random(50, window.innerHeight - 200);
                }
            });
        };
    }

    async function initializeExtension() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Wait for p5.js to be available
            await waitForP5();
            
            // Inject CSS rules now that we know the feature is enabled
            injectCloudStyles();
            
            // Create canvas container
            createCloudCanvas();
            
            // Make all initial backgrounds transparent
            makeAllBackgroundsTransparent();
            // Observe DOM changes for new elements
            observeNewElements();
            
            // Initialize clouds
            await new Promise(resolve => {
                // Small delay to ensure everything is ready
                setTimeout(() => {
                    p5Instance = new p5(initializeClouds);
                    resolve();
                }, 100);
            });

            console.log('More Clouds: Cloud extension initialized successfully');
            
        } catch (error) {
            console.error('More Clouds: Failed to initialize cloud extension:', error);
        }
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        if (p5Instance && p5Instance.windowResized) {
            p5Instance.windowResized();
        }
    });

    function rgbToRgba(rgbStr, alpha) {
        // Expect formats like "rgb(r, g, b)" or "rgba(r, g, b, a)"
        const rgbMatch = rgbStr.match(/rgba?\s*\(([^\)]+)\)/i);
        if (!rgbMatch) return null;
        const parts = rgbMatch[1].split(',').map(s => s.trim());
        if (parts.length < 3) return null;
        const [r, g, b] = parts;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function hexToRgba(hexStr, alpha) {
        let h = hexStr.replace('#', '').trim();
        if (h.length === 3) {
            h = h.split('').map(ch => ch + ch).join('');
        }
        if (h.length !== 6) return null;
        const bigint = parseInt(h, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function convertColorToTransparent(colorStr) {
        if (!colorStr || colorStr === 'transparent' || colorStr === 'rgba(0, 0, 0, 0)') {
            return null; // Already transparent
        }
        if (colorStr.startsWith('rgb')) {
            return rgbToRgba(colorStr, TARGET_ALPHA);
        }
        if (colorStr.startsWith('#')) {
            return hexToRgba(colorStr, TARGET_ALPHA);
        }
        // Skip gradients and images
        if (colorStr.includes('gradient') || colorStr.includes('url(')) {
            return null;
        }
        return null;
    }

    function shouldSkipElement(el) {
        const tag = el.tagName.toLowerCase();
        if (el.id === 'more-clouds' || el.closest('#more-clouds')) return true;
        return tag === 'img' || tag === 'video' || tag === 'canvas';
    }

    function applyTransparencyToElement(el) {
        if (shouldSkipElement(el)) return;
        const style = window.getComputedStyle(el);
        const bg = style.backgroundColor || style.background;
        const newColor = convertColorToTransparent(bg);
        if (newColor) {
            el.style.setProperty('background-color', newColor, 'important');
            // Remove any blur previously set
            el.style.removeProperty('backdrop-filter');
        }
    }

    function makeAllBackgroundsTransparent(root=document.body) {
        if (!root) return;
        applyTransparencyToElement(root);
        root.querySelectorAll('*').forEach(el => applyTransparencyToElement(el));
    }

    function observeNewElements() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        makeAllBackgroundsTransparent(node);
                    }
                });
            });
        });
        observer.observe(document.documentElement || document.body, {
            childList: true,
            subtree: true
        });
    }

    function injectCloudStyles() {
        if (document.getElementById(STYLE_ID)) return; // Already injected
        const link = document.createElement('link');
        link.id = STYLE_ID;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = chrome.runtime.getURL('styles.css');
        document.head.appendChild(link);
    }

    // Initialize based on stored preference
    chrome.storage?.local.get({cloudsEnabled: true}, (data) => {
        if (data.cloudsEnabled) {
            initializeExtension();
        } else {
            console.log('More Clouds: Clouds disabled for this session');
        }
    });
})(); 