<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";

type NavItem = { label: string; target: string };
const items: NavItem[] = [
  { label: "о компании", target: "#about" },
  { label: "преимущества", target: "#advantages" },
  { label: "услуги", target: "#services" },
  { label: "отзывы", target: "#reviews" },
  { label: "FAQ", target: "#faq" },
  { label: "контакты", target: "#contacts" },
];

const SCROLL_SOLID_THRESHOLD = 24;
const y = ref(0);
const lastY = ref(0);
const direction = ref<"up" | "down" | "none">("none");
const atTop = ref(true);
let ticking = false;

const showSolid = computed(() => y.value > SCROLL_SOLID_THRESHOLD);
const hidden = computed(() => y.value > SCROLL_SOLID_THRESHOLD && direction.value === "down");

const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const newY = window.scrollY || 0;
    atTop.value = newY < 10;
    const dy = newY - lastY.value;
    if (Math.abs(dy) > 4) direction.value = dy > 0 ? "down" : "up";
    lastY.value = newY;
    y.value = newY;
    ticking = false;
  });
};

onMounted(() => {
  lastY.value = window.scrollY || 0;
  atTop.value = lastY.value < 10;
  window.addEventListener("scroll", onScroll, { passive: true });
});
onBeforeUnmount(() => window.removeEventListener("scroll", onScroll));

function goTo(hash: string) {
  const el = document.querySelector(hash);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

const navRef = ref<HTMLElement | null>(null);
const navContainerRef = ref<HTMLElement | null>(null);
const brandRef = ref<HTMLElement | null>(null);
const needsBurger = ref(false);

const WIDTH_TOLERANCE = 8;
let resizeObs: ResizeObserver | null = null;
let rafId: number | null = null;

function measureNavScrollWidth(el: HTMLElement): number {
  const cs = window.getComputedStyle(el);
  const isHidden = cs.display === "none" || el.offsetParent === null;
  if (!isHidden) return el.scrollWidth;
  const prev = el.getAttribute("style") || "";
  el.setAttribute("style", `${prev};position:absolute;visibility:hidden;display:flex;inset:auto;`);
  const w = el.scrollWidth;
  el.setAttribute("style", prev);
  return w;
}

function syncHeaderBurgerMarker(on: boolean) {
  const root = document.documentElement;
  if (on) root.classList.add("has-header-burger");
  else root.classList.remove("has-header-burger");
  window.dispatchEvent(new CustomEvent("header:burger", { detail: { on } }));
}

function checkOverflow() {
  if (!navRef.value || !navContainerRef.value || !brandRef.value) return;
  const nav = navRef.value;
  const container = navContainerRef.value;
  const brand = brandRef.value;

  const gap = parseFloat(getComputedStyle(container).columnGap || "0") || 0;
  const availableWidth = Math.max(0, container.clientWidth - brand.offsetWidth - gap);

  const navContentWidth = measureNavScrollWidth(nav);
  const hysteresis = needsBurger.value ? WIDTH_TOLERANCE : -WIDTH_TOLERANCE;
  const horizontalOverflow = navContentWidth > availableWidth + hysteresis;

  const lh = parseFloat(getComputedStyle(nav).lineHeight || "20") || 20;
  const multiRow = nav.clientHeight > lh * 1.6;

  const next = horizontalOverflow || multiRow;
  if (needsBurger.value !== next) {
    needsBurger.value = next;
    syncHeaderBurgerMarker(next);
  } else {
    syncHeaderBurgerMarker(needsBurger.value);
  }
}

function scheduleCheck() {
  if (rafId != null) return;
  rafId = requestAnimationFrame(() => {
    rafId = null;
    checkOverflow();
  });
}

onMounted(async () => {
  await nextTick();
  checkOverflow();
  if ("ResizeObserver" in window) {
    resizeObs = new ResizeObserver(() => scheduleCheck());
    navContainerRef.value && resizeObs.observe(navContainerRef.value);
    navRef.value && resizeObs.observe(navRef.value);
    brandRef.value && resizeObs.observe(brandRef.value);
  }
  window.addEventListener("resize", scheduleCheck, { passive: true });
  if (document.fonts && "ready" in document.fonts) {
    (document.fonts as any).ready.then(() => scheduleCheck());
  }
});
onBeforeUnmount(() => {
  resizeObs?.disconnect();
  window.removeEventListener("resize", scheduleCheck);
  if (rafId != null) cancelAnimationFrame(rafId);
});
</script>

<template>
  <div class="container">
    <header
      :class="[atTop ? 'absolute top-0 left-0 right-0' : 'sticky top-0', 'z-[100]']"
      :style="{ transform: hidden ? 'translateY(-100%)' : 'translateY(0)', transition: 'transform .22s ease' }"
    >
      <div
        ref="navContainerRef"
        :class="[
          'mx-auto w-full max-w-[min(92vw,1200px)] xl:max-w-[1280px] 2xl:max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-4',
          'flex h-20 items-center justify-between gap-6 mt-5',
          'transition-[background-color,backdrop-filter,box-shadow] duration-300',
          showSolid
            ? 'backdrop-blur-md bg-white/65 supports-[backdrop-filter]:bg-white/40 ring-1 ring-black/10 shadow-[0_8px_30px_rgba(0,0,0,.12)] text-zinc-900'
            : 'bg-transparent text-white',
        ]"
      >
        <div class="brand select-none shrink-0 cursor-pointer" ref="brandRef" @click="goTo('#home')">
          <span class="brand h1 block" style="margin:0;line-height:1">АК БАЛАНС</span>
        </div>

        <nav
          ref="navRef"
          :class="['flex items-center gap-7 text-base transition-opacity', needsBurger ? 'hidden' : 'hidden md:flex']"
        >
          <button
            v-for="it in items"
            :key="it.target"
            class="uppercase tracking-wide hover:opacity-70 transition-opacity whitespace-nowrap"
            style="line-height:1;padding:0"
            :style="{ fontSize: 'var(--text-md)' }"
            @click="goTo(it.target)"
          >
            {{ it.label }}
          </button>
        </nav>

      </div>
    </header>
  </div>
</template>

<style scoped>
.brand{ color:var(--white); }
:where(nav){ text-rendering: optimizeLegibility; }
</style>
