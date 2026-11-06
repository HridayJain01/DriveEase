import { useEffect, useRef } from 'react';

// Nothing here holds up the first screen. Reveals are plain CSS (see "Scroll reveal" in styles.css),
// and GSAP, which drives the parallax and pinned story, only downloads once someone starts scrolling.

export const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

let ready;
let scrollTrigger;
const loadGsap = () => (ready ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true }); // phone address bars resizing mid-scroll shouldn't jump the page
  gsap.ticker.lagSmoothing(0); // on a slow or backgrounded phone, finish animations on time instead of crawling
  scrollTrigger = ScrollTrigger;
  return { gsap, ScrollTrigger };
}).catch((e) => { ready = null; throw e; }));

// Re-measures scroll animations after the layout changes. Does nothing until GSAP has loaded.
export const refreshScroll = () => scrollTrigger?.refresh();

// Runs a GSAP setup the first time the visitor scrolls. It may return a clean-up function.
export function useScrollEffect(setup, scope) {
  useEffect(() => {
    if (calm()) return undefined;
    let gone = false;
    let context;
    const start = () => loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (!gone) context = gsap.context(() => setup(gsap, ScrollTrigger), scope.current);
    }).catch(() => {}); // the page still works without the effect
    if (scrollY > 0) start();
    else addEventListener('scroll', start, { once: true, passive: true });
    return () => { gone = true; removeEventListener('scroll', start); context?.revert(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

// Fades and lifts its children into view as they scroll in, one after another.
export function Reveal({ as: Tag = 'div', className = '', children, ...rest }) {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    [...el.children].forEach((child, i) => child.style.setProperty('--i', i));
    const seen = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add('in'); seen.disconnect(); }
    }, { rootMargin: '0px 0px -8% 0px' });
    seen.observe(el);
    return () => seen.disconnect();
  }, []);
  return <Tag ref={ref} className={`reveal ${className}`.trim()} {...rest}>{children}</Tag>;
}
