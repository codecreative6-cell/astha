'use strict';

        /* ──────────────────────────────────────────
           LOADER
        ────────────────────────────────────────── */
        const loaderEl = document.getElementById('loader');
        const pctEl = document.getElementById('ldr-pct');
        let pct = 0;
        const pctTimer = setInterval(() => {
            pct = Math.min(pct + Math.ceil(Math.random() * 3 + 1), 100);
            pctEl.textContent = pct + '%';
            if (pct >= 100) clearInterval(pctTimer);
        }, 45);

        setTimeout(() => {
            loaderEl.classList.add('exit');
            document.body.classList.remove('loading');
        }, 3200);

        /* Loader canvas mini-petals */
        (function () {
            const lc = document.getElementById('loader-canvas');
            const lx = lc.getContext('2d');
            lc.width = window.innerWidth;
            lc.height = window.innerHeight;
            const lW = lc.width, lH = lc.height;
            const LC = [[199, 139, 145, .28], [237, 212, 207, .22], [175, 165, 198, .18], [212, 155, 122, .18]];
            const lp = [];
            class LP {
                constructor() { this.r(); }
                r() {
                    this.x = Math.random() * lW;
                    this.y = Math.random() * lH;
                    this.rx = Math.random() * 6 + 2;
                    this.ry = this.rx * (.35 + Math.random() * .28);
                    this.vx = (Math.random() - .5) * .35;
                    this.vy = Math.random() * .45 + .12;
                    this.rot = Math.random() * Math.PI * 2;
                    this.vr = (Math.random() - .5) * .018;
                    this.sw = Math.random() * Math.PI * 2;
                    this.c = LC[Math.floor(Math.random() * LC.length)];
                }
                u() {
                    this.sw += .007; this.x += this.vx + Math.sin(this.sw) * .38;
                    this.y += this.vy; this.rot += this.vr;
                    if (this.y > lH + 20) this.r();
                }
                d() {
                    lx.save(); lx.translate(this.x, this.y); lx.rotate(this.rot);
                    lx.globalAlpha = this.c[3];
                    lx.fillStyle = `rgb(${this.c[0]},${this.c[1]},${this.c[2]})`;
                    lx.beginPath(); lx.ellipse(0, 0, this.rx, this.ry, 0, 0, Math.PI * 2); lx.fill();
                    lx.restore();
                }
            }
            for (let i = 0; i < 28; i++) lp.push(new LP());
            let alive = true;
            (function ll() {
                if (!alive) return;
                lx.clearRect(0, 0, lW, lH);
                lp.forEach(p => { p.u(); p.d(); });
                requestAnimationFrame(ll);
            })();
            setTimeout(() => { alive = false; }, 4500);
        })();


        /* ──────────────────────────────────────────
           SCROLL PROGRESS
        ────────────────────────────────────────── */
        const scrollBar = document.getElementById('scroll-bar');
        window.addEventListener('scroll', () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            scrollBar.style.width = (window.scrollY / max * 100).toFixed(1) + '%';
        }, { passive: true });


        /* ──────────────────────────────────────────
           MAIN CANVAS  (petals + sparkles + bursts)
        ────────────────────────────────────────── */
        const canvas = document.getElementById('petals');
        const ctx = canvas.getContext('2d');
        let W, H;

        const PCOLS = [
            [199, 139, 145, .42], [237, 212, 207, .34],
            [175, 165, 198, .28], [212, 155, 122, .26], [240, 232, 237, .2],
        ];

        /* ── Petal ── */
        class Petal {
            constructor(init) { this.reset(init); }
            reset(init = false) {
                this.x = Math.random() * W;
                this.y = init ? Math.random() * H : -25;
                this.rx = Math.random() * 8 + 3;
                this.ry = this.rx * (.33 + Math.random() * .28);
                this.vx = (Math.random() - .5) * .55;
                this.vy = Math.random() * .6 + .18;
                this.rot = Math.random() * Math.PI * 2;
                this.vr = (Math.random() - .5) * .022;
                this.sw = Math.random() * Math.PI * 2;
                this.svp = .005 + Math.random() * .012;
                this.c = PCOLS[Math.floor(Math.random() * PCOLS.length)];
            }
            update() {
                this.sw += this.svp;
                this.x += this.vx + Math.sin(this.sw) * .48;
                this.y += this.vy;
                this.rot += this.vr;
                if (this.y > H + 25) this.reset();
            }
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y); ctx.rotate(this.rot);
                ctx.globalAlpha = this.c[3];
                ctx.fillStyle = `rgb(${this.c[0]},${this.c[1]},${this.c[2]})`;
                ctx.beginPath(); ctx.ellipse(0, 0, this.rx, this.ry, 0, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }
        }

        /* ── Sparkle (4-point star, twinkle in place) ── */
        const SCOLS = ['255,248,252', '237,212,207', '175,165,198'];
        class Sparkle {
            constructor() { this.reset(true); }
            reset(init = false) {
                this.x = Math.random() * W;
                this.y = init ? Math.random() * H : Math.random() * H;
                this.sz = Math.random() * 1.8 + .7;
                this.life = 0;
                this.max = 100 + Math.random() * 160;
                this.peak = Math.random() * .45 + .1;
                this.ci = Math.floor(Math.random() * SCOLS.length);
            }
            update() { this.life++; if (this.life >= this.max) this.reset(); }
            draw() {
                const t = this.life / this.max;
                const a = this.peak * Math.sin(t * Math.PI);
                if (a < .02) return;
                const s = this.sz;
                ctx.save(); ctx.translate(this.x, this.y);
                ctx.globalAlpha = a;
                ctx.fillStyle = `rgb(${SCOLS[this.ci]})`;
                ctx.beginPath();
                ctx.moveTo(0, -s * 3);
                ctx.quadraticCurveTo(s * .22, -s * .22, s * 3, 0);
                ctx.quadraticCurveTo(s * .22, s * .22, 0, s * 3);
                ctx.quadraticCurveTo(-s * .22, s * .22, -s * 3, 0);
                ctx.quadraticCurveTo(-s * .22, -s * .22, 0, -s * 3);
                ctx.closePath(); ctx.fill();
                ctx.restore();
            }
        }

        /* ── Burst particle (on 11:11 click) ── */
        const bursts = [];
        class Burst {
            constructor(bx, by) {
                this.x = bx; this.y = by;
                const a = Math.random() * Math.PI * 2;
                const sp = Math.random() * 7 + 2;
                this.vx = Math.cos(a) * sp; this.vy = Math.sin(a) * sp;
                this.g = .14;
                this.rx = Math.random() * 6 + 2; this.ry = this.rx * (.35 + Math.random() * .28);
                this.rot = Math.random() * Math.PI * 2; this.vr = (Math.random() - .5) * .14;
                this.life = 0; this.max = 55 + Math.floor(Math.random() * 45);
                this.c = PCOLS[Math.floor(Math.random() * PCOLS.length)];
            }
            update() {
                this.x += this.vx; this.y += this.vy; this.vy += this.g;
                this.vx *= .97; this.rot += this.vr; this.life++;
            }
            draw() {
                const a = this.c[3] * (1 - this.life / this.max);
                if (a < .02) return;
                ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rot);
                ctx.globalAlpha = a;
                ctx.fillStyle = `rgb(${this.c[0]},${this.c[1]},${this.c[2]})`;
                ctx.beginPath(); ctx.ellipse(0, 0, this.rx, this.ry, 0, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }
            get done() { return this.life >= this.max; }
        }

        let petals = [], sparkles = [];

        function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }

        function init() {
            resize();
            petals = Array.from({ length: 38 }, () => new Petal(true));
            sparkles = Array.from({ length: 55 }, () => new Sparkle());
        }

        (function loop() {
            ctx.clearRect(0, 0, W, H);
            sparkles.forEach(s => { s.update(); s.draw(); });
            petals.forEach(p => { p.update(); p.draw(); });
            for (let i = bursts.length - 1; i >= 0; i--) {
                bursts[i].update(); bursts[i].draw();
                if (bursts[i].done) bursts.splice(i, 1);
            }
            requestAnimationFrame(loop);
        })();

        window.addEventListener('resize', resize);
        init();


        /* ──────────────────────────────────────────
           HERO MOUSE PARALLAX
        ────────────────────────────────────────── */
        const heroGlow = document.getElementById('hero-glow');
        document.addEventListener('mousemove', e => {
            const mx = (e.clientX / window.innerWidth - .5) * 30;
            const my = (e.clientY / window.innerHeight - .5) * 30;
            heroGlow.style.transform = `translate(calc(-50% + ${mx}px), calc(-50% + ${my}px))`;
        }, { passive: true });


        /* ──────────────────────────────────────────
           MARQUEE
        ────────────────────────────────────────── */
        const words = [
            'Happy Birthday', '·', 'Astha Batra', '·', 'Birthday Girl', '·',
            'deluluu', '·', 'asthaaaaaa._', '·', '🌸', '·', 'forever young', '·',
        ];
        const mq = document.getElementById('mq');
        [...words, ...words, ...words, ...words].forEach(t => {
            const s = document.createElement('span');
            const isDot = (t === '·' || t === '🌸');
            s.className = isDot ? 'mq-item mq-dot' : 'mq-item';
            s.textContent = t;
            mq.appendChild(s);
        });
        mq.innerHTML += mq.innerHTML;


        /* ──────────────────────────────────────────
           GALLERY  (build + reveal + 3D tilt + lightbox)
        ────────────────────────────────────────── */
        const gallery = document.getElementById('gallery');
        const totalPhotos = 16;
        const photoSrcs = [];

        const galleryWords = [
            'gorgeous ✨', 'stunning 🤍', 'ethereal 🌸', 'magic 🦋', 
            'radiant 💫', 'iconic 🎀', 'beautiful 🌷', 'angelic 🕊️', 
            'flawless 👑', 'dreamy ☁️', 'perfect 💎', 'sweet 🍓', 
            'precious 🧸', 'unreal 🧚‍♀️', 'lovely 💕', 'muse 🧿'
        ];

        for (let i = 1; i <= totalPhotos; i++) {
            const src = `imgs/img (${i}).jpg`;
            photoSrcs.push(src);

            const wrap = document.createElement('div');
            wrap.className = 'photo';
            wrap.dataset.index = i - 1;
            // Staggered reveal delay based on column position
            wrap.style.transitionDelay = `${((i - 1) % 4) * 110 + Math.random() * 60}ms`;

            // Film grain overlay
            const grain = document.createElement('div');
            grain.className = 'film-grain';

            // Bottom gradient
            const grad = document.createElement('div');
            grad.className = 'photo-gradient';

            // Shimmer
            const sh = document.createElement('div');
            sh.className = 'shimmer';

            // MDG tag -> One word message
            const mdg = document.createElement('span');
            mdg.className = 'photo-mdg';
            mdg.textContent = galleryWords[i - 1] || 'magic';

            // Corner glow
            const glow = document.createElement('div');
            glow.className = 'photo-glow';

            // Caption overlay
            const caption = document.createElement('div');
            caption.className = 'photo-caption';
            const numSpan = document.createElement('span');
            numSpan.className = 'photo-caption-num';
            numSpan.textContent = String(i).padStart(2, '0') + ' / ' + totalPhotos;
            const iconSpan = document.createElement('span');
            iconSpan.className = 'photo-caption-icon';
            iconSpan.textContent = '⤢';
            caption.appendChild(numSpan);
            caption.appendChild(iconSpan);

            const img = document.createElement('img');
            img.src = src;
            img.alt = `Astha — memory ${i}`;
            img.loading = 'lazy';
            img.onerror = () => { wrap.style.display = 'none'; };

            wrap.appendChild(img);
            wrap.appendChild(grain);
            wrap.appendChild(grad);
            wrap.appendChild(sh);
            wrap.appendChild(glow);
            wrap.appendChild(mdg);
            wrap.appendChild(caption);
            gallery.appendChild(wrap);
        }

        /* Reveal on scroll */
        const revIO = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('on'); revIO.unobserve(e.target); }
            });
        }, { threshold: .07 });

        document.querySelectorAll('.photo').forEach(el => {
            revIO.observe(el);

            // 3D tilt (desktop only)
            if (!('ontouchstart' in window)) {
                el.addEventListener('mouseenter', () => {
                    el.style.transition = 'transform .14s ease';
                });
                el.addEventListener('mousemove', e => {
                    const r = el.getBoundingClientRect();
                    const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
                    const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
                    el.style.transform = `perspective(520px) rotateX(${-dy * 6}deg) rotateY(${dx * 6}deg) scale(1.04)`;
                    el.style.zIndex = '5';
                });
                el.addEventListener('mouseleave', () => {
                    el.style.transition = 'transform .7s cubic-bezier(.22,1,.36,1)';
                    el.style.transform = '';
                    el.style.zIndex = '';
                });
            }

            // Click to open lightbox
            el.addEventListener('click', () => {
                openLightbox(parseInt(el.dataset.index));
            });
        });


        /* ──────────────────────────────────────────
           LIGHTBOX
        ────────────────────────────────────────── */
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxNum = document.getElementById('lightbox-num');
        const lightboxClose = document.getElementById('lightbox-close');
        const lightboxPrev = document.getElementById('lightbox-prev');
        const lightboxNext = document.getElementById('lightbox-next');
        const lightboxBackdrop = document.getElementById('lightbox-backdrop');
        const lightboxIndicators = document.getElementById('lightbox-indicators');

        let currentLightboxIndex = 0;

        // Build indicator dots
        for (let i = 0; i < totalPhotos; i++) {
            const dot = document.createElement('span');
            dot.className = 'lightbox-ind';
            dot.dataset.index = i;
            dot.addEventListener('click', () => goToLightbox(i));
            lightboxIndicators.appendChild(dot);
        }

        function updateIndicators() {
            document.querySelectorAll('.lightbox-ind').forEach((d, i) => {
                d.classList.toggle('active', i === currentLightboxIndex);
            });
        }

        function openLightbox(index) {
            currentLightboxIndex = index;
            lightboxImg.src = photoSrcs[index];
            lightboxNum.textContent = String(index + 1).padStart(2, '0') + ' / ' + totalPhotos;
            updateIndicators();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }

        function goToLightbox(index) {
            currentLightboxIndex = ((index % totalPhotos) + totalPhotos) % totalPhotos;
            lightboxImg.style.opacity = '0';
            lightboxImg.style.transform = 'scale(.95)';
            setTimeout(() => {
                lightboxImg.src = photoSrcs[currentLightboxIndex];
                lightboxNum.textContent = String(currentLightboxIndex + 1).padStart(2, '0') + ' / ' + totalPhotos;
                updateIndicators();
                lightboxImg.style.opacity = '1';
                lightboxImg.style.transform = 'scale(1)';
            }, 200);
        }

        lightboxImg.style.transition = 'opacity .3s ease, transform .3s ease';

        lightboxClose.addEventListener('click', closeLightbox);
        lightboxBackdrop.addEventListener('click', closeLightbox);
        lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); goToLightbox(currentLightboxIndex - 1); });
        lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); goToLightbox(currentLightboxIndex + 1); });

        document.addEventListener('keydown', e => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') goToLightbox(currentLightboxIndex - 1);
            if (e.key === 'ArrowRight') goToLightbox(currentLightboxIndex + 1);
        });


        /* ──────────────────────────────────────────
           SCROLL REVEALS (eyebrow + subtitle + message)
        ────────────────────────────────────────── */
        const eyeWrap = document.getElementById('eye-wrap');
        const gallerySubtitle = document.getElementById('gallery-subtitle');
        const msgTitle = document.getElementById('msg-title');
        const msgBody = document.getElementById('msg-body');

        const secIO = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                e.target.classList.add('on');
                secIO.unobserve(e.target);
            });
        }, { threshold: .25 });

        [eyeWrap, gallerySubtitle, msgTitle, msgBody].forEach(el => secIO.observe(el));


        /* ──────────────────────────────────────────
           BIRTHDAY MOMENTS REVEALS
        ────────────────────────────────────────── */
        const bdayEyebrow = document.getElementById('bday-eyebrow');
        const bdayTitle = document.getElementById('bday-title');
        const bdaySubtitle = document.getElementById('bday-subtitle');
        const bdayPolaroids = document.querySelectorAll('.bday-polaroid');

        [bdayEyebrow, bdayTitle, bdaySubtitle].forEach(el => secIO.observe(el));
        bdayPolaroids.forEach(p => revIO.observe(p));

        /* Click any polaroid for a burst */
        function makeBurst(cx, cy) {
            for (let i = 0; i < 65; i++) bursts.push(new Burst(cx, cy));
        }
        bdayPolaroids.forEach(p => {
            p.addEventListener('click', e => { makeBurst(e.clientX, e.clientY); });
        });

        /* ──────────────────────────────────────────
           MSG BODY WORD SPLITTING
        ────────────────────────────────────────── */
        function wrapWords(element, startIndex = 0) {
            const childNodes = Array.from(element.childNodes);
            element.innerHTML = '';
            let wordIndex = startIndex;

            childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const words = node.nodeValue.split(/(\s+)/);
                    words.forEach(word => {
                        if (word.trim() === '') {
                            element.appendChild(document.createTextNode(word));
                        } else {
                            const span = document.createElement('span');
                            span.className = 'msg-word';
                            span.style.setProperty('--i', wordIndex);
                            span.textContent = word;
                            element.appendChild(span);
                            wordIndex++;
                        }
                    });
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === 'BR') {
                        element.appendChild(node);
                    } else {
                        const clone = node.cloneNode(false);
                        wordIndex = wrapWords(node, wordIndex);
                        while (node.firstChild) {
                            clone.appendChild(node.firstChild);
                        }
                        element.appendChild(clone);
                    }
                }
            });
            return wordIndex;
        }
        
        const msgBodyEl = document.getElementById('msg-body');
        if (msgBodyEl) {
            wrapWords(msgBodyEl);
        }
