import { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';

const DEFAULT_PARTICLE_COUNT = 10;
const DEFAULT_GLOW_COLOR = '255, 51, 102'; // matches --accent-red

const createParticleElement = (x, y, color) => {
    const el = document.createElement('div');
    el.className = 'magic-particle';
    el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
    return el;
};

export default function MagicBentoCard({
    children,
    className = '',
    style,
    as: Tag = 'div',
    particleCount = DEFAULT_PARTICLE_COUNT,
    glowColor = DEFAULT_GLOW_COLOR,
    enableTilt = true,
    enableMagnetism = true,
    clickEffect = true,
    enableParticles = true,
    enableBorderGlow = true,
}) {
    const cardRef = useRef(null);
    const particlesRef = useRef([]);
    const timeoutsRef = useRef([]);
    const isHoveredRef = useRef(false);
    const memoizedParticles = useRef([]);
    const particlesInitialized = useRef(false);
    const magnetismAnimRef = useRef(null);

    const initializeParticles = useCallback(() => {
        if (particlesInitialized.current || !cardRef.current) return;
        const { width, height } = cardRef.current.getBoundingClientRect();
        memoizedParticles.current = Array.from({ length: particleCount }, () =>
            createParticleElement(Math.random() * width, Math.random() * height, glowColor)
        );
        particlesInitialized.current = true;
    }, [particleCount, glowColor]);

    const clearAllParticles = useCallback(() => {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
        magnetismAnimRef.current?.kill();
        particlesRef.current.forEach(p => {
            gsap.to(p, {
                scale: 0,
                opacity: 0,
                duration: 0.3,
                ease: 'back.in(1.7)',
                onComplete: () => p.parentNode?.removeChild(p),
            });
        });
        particlesRef.current = [];
    }, []);

    const animateParticles = useCallback(() => {
        if (!cardRef.current || !isHoveredRef.current) return;
        if (!particlesInitialized.current) initializeParticles();

        memoizedParticles.current.forEach((particle, i) => {
            const tid = setTimeout(() => {
                if (!isHoveredRef.current || !cardRef.current) return;
                const clone = particle.cloneNode(true);
                cardRef.current.appendChild(clone);
                particlesRef.current.push(clone);

                gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
                gsap.to(clone, {
                    x: (Math.random() - 0.5) * 100,
                    y: (Math.random() - 0.5) * 100,
                    rotation: Math.random() * 360,
                    duration: 2 + Math.random() * 2,
                    ease: 'none',
                    repeat: -1,
                    yoyo: true,
                });
                gsap.to(clone, { opacity: 0.3, duration: 1.5, ease: 'power2.inOut', repeat: -1, yoyo: true });
            }, i * 100);
            timeoutsRef.current.push(tid);
        });
    }, [initializeParticles]);

    useEffect(() => {
        const el = cardRef.current;
        if (!el) return;

        const handleMouseEnter = () => {
            isHoveredRef.current = true;
            if (enableParticles) animateParticles();
            if (enableTilt) {
                gsap.to(el, { rotateX: 5, rotateY: 5, duration: 0.3, ease: 'power2.out', transformPerspective: 1000 });
            }
        };

        const handleMouseLeave = () => {
            isHoveredRef.current = false;
            if (enableParticles) clearAllParticles();
            if (enableTilt) gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.3, ease: 'power2.out' });
            if (enableMagnetism) gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: 'power2.out' });
        };

        const handleMouseMove = (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;

            // Update glow CSS vars
            const relX = (x / rect.width) * 100;
            const relY = (y / rect.height) * 100;
            el.style.setProperty('--glow-x', `${relX}%`);
            el.style.setProperty('--glow-y', `${relY}%`);
            el.style.setProperty('--glow-intensity', '1');

            if (enableTilt) {
                gsap.to(el, {
                    rotateX: ((y - cy) / cy) * -8,
                    rotateY: ((x - cx) / cx) * 8,
                    duration: 0.15,
                    ease: 'power2.out',
                    transformPerspective: 1000,
                });
            }

            if (enableMagnetism) {
                magnetismAnimRef.current = gsap.to(el, {
                    x: (x - cx) * 0.04,
                    y: (y - cy) * 0.04,
                    duration: 0.3,
                    ease: 'power2.out',
                });
            }
        };

        const handleMouseLeaveGlow = () => {
            el.style.setProperty('--glow-intensity', '0');
        };

        const handleClick = (e) => {
            if (!clickEffect) return;
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const maxDist = Math.max(
                Math.hypot(x, y),
                Math.hypot(x - rect.width, y),
                Math.hypot(x, y - rect.height),
                Math.hypot(x - rect.width, y - rect.height)
            );

            const ripple = document.createElement('div');
            ripple.style.cssText = `
        position: absolute;
        width: ${maxDist * 2}px;
        height: ${maxDist * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.35) 0%, rgba(${glowColor}, 0.15) 30%, transparent 70%);
        left: ${x - maxDist}px;
        top: ${y - maxDist}px;
        pointer-events: none;
        z-index: 1000;
      `;
            el.appendChild(ripple);
            gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ripple.remove() });
        };

        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
        el.addEventListener('mouseleave', handleMouseLeaveGlow);
        el.addEventListener('mousemove', handleMouseMove);
        el.addEventListener('click', handleClick);

        return () => {
            isHoveredRef.current = false;
            el.removeEventListener('mouseenter', handleMouseEnter);
            el.removeEventListener('mouseleave', handleMouseLeave);
            el.removeEventListener('mouseleave', handleMouseLeaveGlow);
            el.removeEventListener('mousemove', handleMouseMove);
            el.removeEventListener('click', handleClick);
            clearAllParticles();
        };
    }, [animateParticles, clearAllParticles, enableTilt, enableMagnetism, clickEffect, enableParticles, glowColor]);

    const glowClass = enableBorderGlow ? 'magic-bento-glow' : '';

    return (
        <Tag
            ref={cardRef}
            className={`magic-bento-card ${glowClass} ${className}`}
            style={{
                '--glow-color-rgb': glowColor,
                ...style,
            }}
        >
            {children}
        </Tag>
    );
}
