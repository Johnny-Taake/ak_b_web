<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, nextTick } from "vue";
import { REVIEWS } from "@/assets/data/content";
import { AUTOPLAY_MS, TRANSITION_MS, SWIPE_THRESHOLD } from "./consts";

const active = ref(0);
const isHover = ref(false);

let lastSwitch = 0;
const canSwitch = () => Date.now() - lastSwitch >= TRANSITION_MS * 0.8;
const markSwitch = () => (lastSwitch = Date.now());

const autoplayMs = ref(AUTOPLAY_MS);
let timer: number | null = null;
const stop = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};
const start = () => {
  stop();
  timer = window.setInterval(() => {
    if (!isHover.value) next();
  }, autoplayMs.value);
};

const len = computed(
  () => (REVIEWS as any).value?.length ?? (REVIEWS as any)?.length ?? 0
);

const next = (byUser = false) => {
  if (!len.value || !canSwitch()) return;
  active.value = (active.value + 1) % len.value;
  markSwitch();
  if (byUser) {
    stop();
    start();
  }
};
const prev = (byUser = false) => {
  if (!len.value || !canSwitch()) return;
  active.value = (active.value - 1 + len.value) % len.value;
  markSwitch();
  if (byUser) {
    stop();
    start();
  }
};

/* swipe */
const startX = ref(0);
const deltaX = ref(0);
const touching = ref(false);
const onTouchStart = (e: TouchEvent) => {
  touching.value = true;
  startX.value = e.touches[0]?.clientX ?? 0;
  deltaX.value = 0;
};
const onTouchMove = (e: TouchEvent) => {
  if (!touching.value) return;
  deltaX.value = (e.touches[0]?.clientX ?? 0) - startX.value;
};
const onTouchEnd = () => {
  touching.value = false;
  if (Math.abs(deltaX.value) > SWIPE_THRESHOLD)
    deltaX.value < 0 ? next(true) : prev(true);
  deltaX.value = 0;
};

/* keyboard */
const onKey = (e: KeyboardEvent) => {
  if (e.key === "ArrowRight") next(true);
  if (e.key === "ArrowLeft") prev(true);
};
onMounted(() => window.addEventListener("keydown", onKey));
onUnmounted(() => window.removeEventListener("keydown", onKey));

const ariaLabel = computed(() =>
  len.value ? `Отзыв ${active.value + 1} из ${len.value}` : "Нет отзывов"
);
const cssVars = computed(() => ({
  "--radius": "20px",
  "--reviews-head": "clamp(72px, 10vh, 110px)",
  "--t": TRANSITION_MS + "ms",
  "--pad-x": "clamp(26px, 5vw, 56px)",
}));

const frameEl = ref<HTMLElement | null>(null);
const measureWrap = ref<HTMLElement | null>(null);
const maxCardHeight = ref(0);

async function measureMax() {
  await nextTick();
  const frame = frameEl.value,
    wrap = measureWrap.value;
  if (!frame || !wrap) return;

  wrap.style.width = frame.clientWidth + "px";

  let maxH = 0;
  wrap.querySelectorAll<HTMLElement>(".mcard").forEach((el) => {
    maxH = Math.max(maxH, el.offsetHeight);
  });
  maxCardHeight.value = maxH;
}

onMounted(() => {
  measureMax();
  window.addEventListener("resize", measureMax);
  start();
});
onUnmounted(() => {
  window.removeEventListener("resize", measureMax);
  stop();
});
</script>

<template>
  <main class="reviewspage">
    <div class="container">
      <h1 class="reviews__title h1 mb-10" :style="{ color: 'var(--blue-primary)' }">
        ОТЗЫВЫ
      </h1>

      <section class="reviews" :style="cssVars">
        <div
          class="carousel-root"
          role="region"
          :aria-label="ariaLabel"
          @mouseenter="isHover = true"
          @mouseleave="isHover = false"
          @touchstart.passive="onTouchStart"
          @touchmove.passive="onTouchMove"
          @touchend.passive="onTouchEnd"
        >
          <div
            class="card-frame"
            :style="maxCardHeight ? { minHeight: maxCardHeight + 'px' } : {}"
            ref="frameEl"
          >
            <button
              class="nav nav--prev"
              @click="prev(true)"
              aria-label="Предыдущий отзыв"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M15 19L8 12l7-7"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <button
              class="nav nav--next"
              @click="next(true)"
              aria-label="Следующий отзыв"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M9 5l7 7-7 7"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>

            <transition name="fade-slide" mode="out-in">
              <article
                :key="active"
                class="testimonial-card live"
                :style="{ '--rim': 'var(--blue-primary)' }"
              >
                <div class="testimonial-body">
                  <p class="testimonial-text">{{ REVIEWS[active]?.text }}</p>
                </div>
                <div class="testimonial-footer">
                  {{ REVIEWS[active]?.author }}, {{ REVIEWS[active]?.position }}
                </div>
              </article>
            </transition>

            <div class="measure-wrap" ref="measureWrap" aria-hidden="true">
              <article v-for="(r, i) in REVIEWS" :key="'m' + i" class="mcard">
                <div class="mbody">
                  <p class="mtext">{{ r.text }}</p>
                </div>
                <div class="mfooter">{{ r.author }}, {{ r.position }}</div>
              </article>
            </div>
          </div>

          <div class="decor" aria-hidden="true">
            <span class="decor-line"></span>
            <svg class="decor-quote" viewBox="0 0 64 40" aria-hidden="true">
              <path
                d="M20 8c-6 0-10 4-10 10 0 5 3 9 8 10-1 4-4 6-8 6v4c10 0 16-6 16-18 0-7-3-12-8-12zM46 8c-6 0-10 4-10 10 0 5 3 9 8 10-1 4-4 6-8 6v4c10 0 16-6 16-18 0-7-3-12-8-12z"
                fill="currentColor"
              />
            </svg>
            <span class="decor-line"></span>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.reviews__title {
  padding-top: 3.1rem;
  text-align: center;
  width: 100%;
}

.reviews {
  min-height: calc(100svh - var(--header-h, 80px) - var(--reviews-head));
  min-height: calc(100dvh - var(--header-h, 80px) - var(--reviews-head));
  display: flex;
  flex-direction: column;
  padding-bottom: 0;
}

.carousel-root {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.card-frame {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  margin-bottom: clamp(12px, 2.5vh, 20px);
}

.testimonial-card {
  position: absolute;
  inset: 0;
  background: var(--white);
  border: 2px solid var(--rim, var(--blue-primary));
  border-radius: var(--radius);
  box-shadow: inset 0 0 0 1px var(--rim, var(--blue-primary)),
    0 0 0 1px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  padding: clamp(18px, 2.4vw, 28px) var(--pad-x);
}

.testimonial-body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
}
.testimonial-text {
  margin: 0;
  font-size: var(--text-sm);
  color: #334155;
  word-break: normal;
  overflow-wrap: break-word;
  hyphens: auto;
  text-wrap: pretty;
}

.testimonial-footer {
  margin-top: clamp(8px, 1vw, 12px);
  flex: 0 0 auto;
  text-align: left;
  font-size: var(--text-sm);
  font-weight: 600;
  color: #334155;
}

.reviews {
  --nav-inset-x: clamp(8px, calc(var(--pad-x) * 0.35), 20px);

  --nav-w: clamp(26px, 1.7vw, 32px);
  --nav-h: clamp(96px, 18vh, 144px);
}

.nav {
  position: absolute;
  top: 50%;
  width: var(--nav-w);

  height: min(var(--nav-h), calc(100% - 2 * var(--pad-x)));

  display: grid;
  place-items: center;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  background-image: var(--glass-grad);
  color: var(--blue-primary);
  box-shadow: var(--glass-shadow);
  cursor: pointer;
  z-index: 3;

  transform: translateY(-50%);
  backdrop-filter: saturate(140%) blur(var(--glass-blur));
  -webkit-backdrop-filter: saturate(140%) blur(var(--glass-blur));

  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease,
    background-color 0.18s ease, color 0.18s ease;
}

.nav--prev {
  left: var(--nav-inset-x);
}
.nav--next {
  right: var(--nav-inset-x);
}

.nav::after {
  content: "";
  position: absolute;
  inset: -12px -14px;
  border-radius: 28px;
}

.nav:hover {
  transform: translateY(-50%) scale(1.05);
  box-shadow: var(--glass-shadow-hover);
  filter: saturate(1.06);
}
.nav:active {
  transform: translateY(-50%) scale(0.97);
  box-shadow: var(--glass-shadow);
}

@media (max-width: 640px) {
  .testimonial-card {
    padding-left: max(var(--pad-x), calc(var(--nav-inset-x) + var(--nav-w) + 12px));
    padding-right: max(var(--pad-x), calc(var(--nav-inset-x) + var(--nav-w) + 12px));
  }

  .testimonial-text {
    font-size: var(--text-xs);
  }
  .testimonial-footer {
    font-size: var(--text-xs);
  }
}

@media (max-width: 640px) and (max-height: 700px) {
  .testimonial-text {
    font-size: var(--text-xs);
  }
  .testimonial-footer {
    font-size: var(--text-xs);
  }

  .reviews {
    min-height: calc(100dvh - var(--header-h, 80px) - (var(--reviews-head) * 0.9));
  }
}

@media (max-width: 360px) {
  .testimonial-card {
    padding-left: max(var(--pad-x), calc(var(--nav-inset-x) + var(--nav-w) + 16px));
    padding-right: max(var(--pad-x), calc(var(--nav-inset-x) + var(--nav-w) + 16px));
  }
}

.measure-wrap {
  position: fixed;
  left: -99999px;
  top: 0;
  visibility: hidden;
  pointer-events: none;
}
.mcard {
  box-sizing: border-box;
  width: 100%;
  border: 2px solid transparent;
  border-radius: var(--radius);
  padding: clamp(18px, 2.4vw, 28px) var(--pad-x);
}
.mbody {
  display: flex;
  align-items: center;
}
.mtext {
  margin: 0;
  font-size: var(--text-sm);
}
.mfooter {
  margin-top: clamp(8px, 1vw, 12px);
  font-size: var(--text-sm);
  font-weight: 600;
}

.decor {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(14px, 2.5vw, 28px);
  padding-bottom: clamp(10px, 1.8vw, 22px);
}
.decor-line {
  height: 2px;
  width: min(280px, 40vw);
  background: var(--black);
  border-radius: 2px;
  opacity: 0.95;
}

@media (max-width: 400px) {
  .decor-line {
    width: min(100px, 60vw);
  }
}

.decor-quote {
  width: clamp(40px, 7.5vw, 60px);
  height: auto;
  color: var(--black);
  display: block;
  transform: translateY(2px);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity var(--t, 260ms) ease, transform var(--t, 260ms) ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
