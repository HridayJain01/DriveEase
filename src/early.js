// Pages arrive drawn before the app has loaded, so someone on a slow phone may type or tap in that moment.
// index.html keeps the taps. Once the page is live, this hands everything over to React.

// Typed or chosen text is on screen but unknown to React, so tell it now.
function reportEarlyInput() {
  document.querySelectorAll('#root input, #root textarea, #root select').forEach((el) => {
    if (el.tagName === 'SELECT') {
      if ([...el.options].some((o) => o.selected !== o.defaultSelected)) el.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (el.type === 'radio' || el.type === 'checkbox') {
      if (el.checked !== el.defaultChecked) { el.checked = !el.checked; el.click(); }
    } else if (el.value !== el.defaultValue) {
      // React ignores an event if the value matches what it last saw, so its record is reset first.
      const typed = el.value;
      el.value = el.defaultValue;
      Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set.call(el, typed);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
}

let done = false;
export function handOverEarlyActions() {
  if (done) return;
  done = true;
  reportEarlyInput();
  setTimeout(() => (window.__taps || []).splice(0).forEach((button) => { if (button.isConnected) button.click(); })); // after React has taken in the input
}
