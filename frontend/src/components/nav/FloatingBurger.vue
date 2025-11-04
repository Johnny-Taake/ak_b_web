<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useGlassNav } from "@/composables/useGlassNav";
import { useModalState } from "@/composables/useModalState";

const { open } = useGlassNav();
const { isAnyModalOpen } = useModalState();

const isNarrowDisplay = ref(false);
const showBelowHome = ref(false);
const hasHeaderBurger = ref(false);

let io: IntersectionObserver | null = null;
let resizeHandler: ((e: UIEvent) => void) | null = null;
let headerEvtHandler: ((e: Event) => void) | null = null;
let markerObserver: MutationObserver | null = null;

function checkNarrowDisplay() {
  isNarrowDisplay.value = window.innerWidth <= 768;
}
function readHeaderMarker() {
  hasHeaderBurger.value = document.documentElement.classList.contains("has-header-burger");
}

onMounted(() => {
  checkNarrowDisplay();
  readHeaderMarker();

  headerEvtHandler = (e: Event) => {
    const detail = (e as CustomEvent).detail as { on?: boolean } | undefined;
    if (detail && typeof detail.on === "boolean") hasHeaderBurger.value = detail.on;
    else readHeaderMarker();
  };
  window.addEventListener("header:burger", headerEvtHandler);

  markerObserver = new MutationObserver(readHeaderMarker);
  markerObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  const rootEl = document.querySelector<HTMLElement>(".pages") || undefined;
  const homeEl = document.querySelector<HTMLElement>("#home");

  if (homeEl) {
    io = new IntersectionObserver(
      (entries) => {
        const inView = entries[0]?.isIntersecting ?? false;
        showBelowHome.value = !inView;
      },
      { root: rootEl, threshold: 0.4 }
    );
    io.observe(homeEl);
  } else {
    showBelowHome.value = true;
  }

  resizeHandler = () => checkNarrowDisplay();
  window.addEventListener("resize", resizeHandler, { passive: true });
});

onBeforeUnmount(() => {
  io?.disconnect();
  resizeHandler && window.removeEventListener("resize", resizeHandler);
  headerEvtHandler && window.removeEventListener("header:burger", headerEvtHandler);
  markerObserver?.disconnect();
});

const shouldShow = computed(() => {
  if (isAnyModalOpen.value) return false;

  if (isNarrowDisplay.value) return true;

  return showBelowHome.value || hasHeaderBurger.value;
});
</script>

<template>
  <button
    v-show="shouldShow"
    class="burger-button fixed z-[900] h-12 w-12 rounded-full
           bg-white/30 backdrop-blur-md backdrop-saturate-150 backdrop-contrast-125
           ring-1 ring-black/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,.45),0_6px_20px_rgba(0,0,0,.20)]
           hover:bg-white/40 active:scale-95 transition text-white
           focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/20"
    aria-label="Открыть меню"
    @click="open"
  >
    <span class="sr-only">Открыть меню</span>
    <div class="mx-auto grid w-5 gap-[4px]">
      <span class="block h-[2px] rounded-full bg-gray-800"></span>
      <span class="block h-[2px] rounded-full bg-gray-800"></span>
      <span class="block h-[2px] rounded-full bg-gray-800"></span>
    </div>
  </button>
</template>

<style scoped>
.burger-button{
  position: fixed;
  top: max(2.5rem, env(safe-area-inset-top));
  right: max(1.5rem, env(safe-area-inset-right));
}
@media (min-width:1050px){
  .burger-button{
    top: max(3rem, env(safe-area-inset-top));
    right: max(3rem, env(safe-area-inset-right));
  }
}
</style>
