<script setup lang="ts">
import { computed, ref, nextTick, watch, onMounted, onBeforeUnmount } from "vue";
import { useGlassNav } from "@/composables/useGlassNav";

type NavItem = { label: string; target: string };

const items: NavItem[] = [
  { label: "Главная", target: "#home" },
  { label: "О компании", target: "#about" },
  { label: "Услуги", target: "#services" },
  { label: "Преимущества", target: "#advantages" },
  { label: "Отзывы", target: "#reviews" },
  { label: "FAQ", target: "#faq" },
  { label: "Контакты", target: "#contacts" },
];

const { isOpen, close } = useGlassNav();

const cssVars = computed(() => ({
  "--c-backdrop": "rgba(0, 0, 0, .35)",
  "--c-modal-bg": "rgba(255, 255, 255, .3)",
  "--c-modal-border": "rgba(255, 255, 255, .4)",
  "--btn-height": "44px",
  "--btn-min-width": "160px",
}));

const firstItemRef = ref<HTMLButtonElement | null>(null);
const sectionRefs = ref<Record<string, HTMLElement>>({});

onMounted(() => {
  items.forEach(item => {
    const el = document.querySelector(item.target);
    if (el) {
      sectionRefs.value[item.target] = el as HTMLElement;
    }
  });
});

onBeforeUnmount(() => {
  sectionRefs.value = {};
});

watch(isOpen, async (v) => {
  if (!v) return;
  await nextTick();
  firstItemRef.value?.focus();
});

function goTo(hash: string) {
  const el = sectionRefs.value[hash];
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  close();
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal__backdrop" :style="cssVars" @click.self="close">
      <div class="modal glass" role="dialog" aria-modal="true" aria-labelledby="navTitle">
        <header class="modal__header">
          <h2 id="navTitle" class="modal__title">Меню</h2>
        </header>
        <div class="modal__content">
          <div class="menu">
            <button
              v-for="(it, i) in items"
              :key="it.target"
              class="btn menu__btn"
              @click="goTo(it.target)"
              :ref="i === 0 ? 'firstItemRef' : undefined"
            >
              {{ it.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal__backdrop {
  position: fixed;
  inset: 0;
  background: var(--c-backdrop);
  display: grid;
  place-items: center;
  z-index: 1000;
  padding: clamp(12px, 4vw, 24px);
  overscroll-behavior: contain;
}

.modal {
  width: min(420px, 92vw);
  max-height: 92svh;
  display: flex;
  flex-direction: column;
  background: var(--c-modal-bg);
  border: 1px solid var(--c-modal-border);
  border-radius: 24px;
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
  box-shadow: none;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.35);
  flex: 0 0 auto;
}

.modal__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--c-text);
  text-align: center;
}

.modal__content {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  padding:  40px 18px 40px;
}

.modal__footer {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 14px 18px max(18px, env(safe-area-inset-bottom));
  flex: 0 0 auto;
  flex-wrap: nowrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 999px;
  padding: 12px 20px;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.2s ease, background 0.2s ease,
    color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  box-shadow: none;
}

.menu {
  display: grid;
  gap: 10px;
  align-items: center;
  justify-items: center;
}

.modal.glass .menu .menu__btn {
  width: 80%;
  justify-content: center;
  font-size: var(--text-sm);
  padding-block: 10px;
  background: rgba(255, 255, 255, 0.45) !important;
  color: var(--c-text);
  border: 1px solid rgba(255, 255, 255, 0.45) !important;
  backdrop-filter: blur(12px) saturate(160%);
  -webkit-backdrop-filter: blur(12px) saturate(160%);
  border-radius: 999px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.modal.glass .menu .menu__btn:hover {
  background: rgba(255, 255, 255, 0.55) !important;
  border-color: rgba(255, 255, 255, 0.55) !important;
  transform: translateY(-2px);
}

.modal.glass .menu .menu__btn:active {
  background: rgba(255, 255, 255, 0.45) !important;
  transform: translateY(0);
}

</style>
