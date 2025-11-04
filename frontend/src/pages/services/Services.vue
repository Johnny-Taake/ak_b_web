<template>
  <main class="section">
    <section class="services">
      <div class="container">
        <h1
          class="h1 mb-10 pt-3 pb-3"
          :style="{ color: 'var( --blue-primary)', paddingTop: '3rem' }"
        >
          УСЛУГИ
        </h1>

        <div class="grid">
          <div v-for="(s, i) in services" :key="i" class="cell">
            <button
              class="card"
              :class="{ 'card--active': active === i }"
              type="button"
              @click="open(i)"
              @keydown.enter.prevent="open(i)"
              @keydown.space.prevent="open(i)"
              :aria-label="`Открыть описание услуги: ${s.title}`"
              aria-haspopup="dialog"
              :aria-expanded="active !== null ? 'true' : 'false'"
            >
              <span class="h3">{{ s.title }}</span>
            </button>
          </div>
        </div>

        <Teleport to="body">
          <transition name="fade">
            <div
              v-if="active !== null && current"
              class="modal__backdrop"
              @click.self="closeNow"
            >
              <div
                class="modal glass"
                role="dialog"
                aria-modal="true"
                :aria-labelledby="'svcTitle'"
              >
                <div class="modal__article">
                  <p>{{ current.article }}</p>
                </div>

                <ul class="svc__list">
                  <li v-for="(p, k) in current.points" :key="k">{{ p }}</li>
                </ul>
              </div>
            </div>
          </transition>
        </Teleport>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, type Ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { services } from '@/assets/data/content/services'
import { type Service } from '@/types/service'
import { lockBody, unlockBody } from '@/utils/bodyLock'
import { useModalState } from '@/composables/useModalState'

const { setServicesModal } = useModalState()
const active = ref<number | null>(null)

const svcList = computed<readonly Service[]>(() => {
  return Array.isArray(services)
    ? (services as readonly Service[])
    : (services as Ref<readonly Service[]>).value
})

const current = computed<Service | null>(() =>
  active.value !== null ? svcList.value[active.value] ?? null : null
)

const isOpen = computed(() => active.value !== null)

function open(i: number) {
  if (active.value !== i) {
    active.value = i
    setServicesModal(true)
  }
}
function closeNow() {
  active.value = null
  setServicesModal(false)
}

function onEsc(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) closeNow()
}
onMounted(() => window.addEventListener('keydown', onEsc))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onEsc)
  unlockBody()
})

watch(isOpen, (now, prev) => {
  if (now && !prev) lockBody()
  if (!now && prev) unlockBody()
})
onBeforeUnmount(() => {
  unlockBody()
})
</script>

<style scoped>
.services {
  --tile-radius: clamp(16px, 2.2vw, 28px);
  --tile-border: 1px solid rgba(0, 0, 0, 0.06);

  --blue-700: #1f5e7f;
  --blue-650: #2b6e92;
  --blue-600: #2f789f;

  --c-backdrop: rgba(0, 0, 0, 0.35);
  --c-modal-border: rgba(255, 255, 255, 0.5);

  min-height: 100svh;
}

.services > .container {
  display: flex;
  flex-direction: column;
  min-height: inherit;
}

.services h1 {
  color: var(--blue-primary);
  margin: 0;
}

.services > .container {
  gap: clamp(12px, 2vw, 24px);
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(280px, 1fr));
  gap: clamp(18px, 3vw, 36px);

  width: min(1280px, 100%);
  margin-inline: auto;
  margin-block: auto;

  margin-bottom: 3rem;
  margin-top: 3rem;
}

@media (max-width: 1000px) {
  .grid {
    grid-template-columns: repeat(2, minmax(240px, 1fr));
  }
}

@media (max-width: 700px) {
  .grid {
    grid-template-columns: 1fr;
    row-gap: 10px;
    column-gap: 0;
    padding-top: 1rem;
    padding-bottom: 2rem;
    margin: 0;
  }

  .cell {
    min-height: 0;
  }

  .card {
    min-height: 64px;
    padding-block: 14px;
    padding-inline: 18px;
  }

  .card .h3 {
    font-size: clamp(14px, 4vw, 16px);
  }
}

.cell {
  display: flex;
  min-height: 140px;
}

.card {
  width: 100%;
  min-height: 240px;

  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  border: var(--tile-border);
  border-radius: var(--tile-radius);
  background: var(--blue-700);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);

  transition: box-shadow 0.18s ease, background-color 0.18s ease, transform 0.1s ease;
  will-change: background-color;
}

@media (max-width: 700px) {
  .card {
    min-height: 100px;
  }
}

@media (min-width: 701px) {
  .card {
    padding-block: clamp(22px, 3.8vw, 44px);
    padding-inline: clamp(18px, 3.2vw, 32px);
  }
}

.card .h3 {
  margin: 0;
  color: var(--white);
  font-family: "Evolventa", sans-serif;
  font-weight: 500;
  line-height: 1.2;
  font-size: clamp(16px, 1.8vw, 22px);
  letter-spacing: 0.02em;

  word-break: normal;
  overflow-wrap: normal;
}

.card:hover,
.card:focus-visible {
  background: var(--blue-650);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  outline: none;
}
.card:active,
.card--active {
  background: var(--blue-600);
  transform: none;
}

.modal__backdrop {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  z-index: 1000;
  padding: clamp(12px, 4vw, 24px);
  background: var(--c-backdrop);
  overscroll-behavior: contain;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.modal {
  /* width: min(720px, 96vw); */
  width: min(720px, calc(100% - max(24px, 4vw) * 2));
  max-height: 92svh;

  display: flex;
  flex-direction: column;
  overflow: hidden;
  isolation: isolate;

  background: rgba(255, 255, 255, 0.88);
  border: 1px solid var(--c-modal-border);
  border-radius: 24px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.35);

  backdrop-filter: saturate(130%) blur(2px);
  -webkit-backdrop-filter: saturate(130%) blur(2px);

  animation: modalSlideIn 0.22s ease-out;
}

.modal__article {
  font-size: var(--text-sm);
  padding: 22px 24px 0;
  overflow: auto;
}
.svc__list {
  font-size: var(--text-sm);
  padding: 12px 24px 22px;
  margin: 0;
  list-style: none;
  display: grid;
  gap: 10px;
  overflow: auto;
}
.modal__article p,
.svc__list li {
  color: var(--black);
  line-height: 1.55;
}
.svc__list li {
  position: relative;
  padding-left: 18px;
}
.svc__list li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--black);
  font-weight: 700;
}

.modal__footer {
  display: none !important;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.services h1{
  text-align: center;
  width: 100%;
}
</style>
