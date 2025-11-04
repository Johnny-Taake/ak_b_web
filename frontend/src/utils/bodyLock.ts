let scrollY = 0;

function getCount(): number {
  return Number(document.body.dataset.lockCount || 0);
}
function setCount(n: number) {
  document.body.dataset.lockCount = String(n);
}

export function lockBody() {
  const current = getCount();
  if (current === 0) {
    scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.classList.add('body-locked');
    document.body.style.top = `-${scrollY}px`;
  }
  setCount(current + 1);
}

export function unlockBody() {
  const current = getCount();
  if (current <= 0) return;

  const next = current - 1;
  setCount(next);

  if (next === 0) {
    document.body.classList.remove('body-locked');
    document.body.style.top = '';
    window.scrollTo(0, scrollY);
  }
}

export function forceUnlockBody() {
  setCount(0);
  document.body.classList.remove('body-locked');
  document.body.style.top = '';
}
