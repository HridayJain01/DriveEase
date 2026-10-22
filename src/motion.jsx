import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
ScrollTrigger.config({ ignoreMobileResize: true }); // phone address bars resizing mid-scroll shouldn't jump the page
gsap.ticker.lagSmoothing(0); // on a slow or backgrounded phone, finish animations on time instead of crawling

export { gsap, ScrollTrigger, SplitText, useGSAP };
export const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Fades and lifts its children into view as they scroll in, one after another.
export function Reveal({ as: Tag = 'div', stagger = 0.08, y = 32, children, ...rest }) {
  const ref = useRef();
  useGSAP(() => {
    if (calm()) return;
    const items = ref.current.dataset.each !== undefined ? ref.current.children : [ref.current];
    gsap.from(items, {
      y, opacity: 0, duration: 1, ease: 'expo.out', stagger,
      scrollTrigger: { trigger: ref.current, start: 'top 90%', once: true },
    });
  }, { scope: ref });
  return <Tag ref={ref} {...rest}>{children}</Tag>;
}

// Splits a headline into lines and slides each one up from behind a mask.
export function useSplitReveal(ref, deps = []) {
  useGSAP(() => {
    if (calm() || !ref.current) return;
    const split = SplitText.create(ref.current, { type: 'lines', mask: 'lines', linesClass: 'line' });
    gsap.from(split.lines, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: 0.1 });
    return () => split.revert();
  }, { dependencies: deps, scope: ref });
}

// Counts a number up from zero when it scrolls into view (dashboard-style readouts).
export function Count({ to, pad = 0 }) {
  const ref = useRef();
  useGSAP(() => {
    const el = ref.current;
    const show = (n) => { el.textContent = String(Math.round(n)).padStart(pad, '0'); };
    if (calm()) return show(to);
    const o = { n: 0 };
    gsap.to(o, { n: to, duration: 1.6, ease: 'power3.out', onUpdate: () => show(o.n), scrollTrigger: { trigger: el, start: 'top 95%', once: true } });
  }, { dependencies: [to], revertOnUpdate: true });
  return <span ref={ref}>{String(to).padStart(pad, '0')}</span>;
}
