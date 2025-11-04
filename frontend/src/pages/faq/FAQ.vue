<template>
  <section class="faq">
    <div class="container">
      <div class="faq__inner">
        <h2 class="faq__title h1 title-wrap mb-10" :style="{ color: 'var(--white)' }">
          FAQ
        </h2>
        <div class="faq__list">
          <article v-for="(item, i) in items" :key="i" class="faq__item" :ref="el => setItemRef(el, i)">
            <button class="faq__q" type="button" :aria-expanded="isOpen(i)" @click="toggle(i)"
              :ref="el => setQBtnRef(el, i)" :aria-controls="'faq-panel-' + i" :id="'faq-q-' + i">
              <span class="faq__qtext">{{ item.question }}</span>
              <span class="faq__toggle" :class="{ 'is-open': isOpen(i) }" aria-hidden="true"></span>
            </button>

            <div class="faq__answerWrap" :id="'faq-panel-' + i" role="region" :aria-labelledby="'faq-q-' + i" :style="{
              maxHeight: isOpen(i) ? (heights[i] ?? 0) + 'px' : '0px',
              opacity: isOpen(i) ? '1' : '0'
            }" :ref="el => setAnswerRef(el, i)">
              <div class="faq__answer" tabindex="-1" :ref="el => setAnswerFocusRef(el, i)">
                {{ item.answer }}
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { FAQ } from '@/types'
import { FAQContent } from '@/assets/data/content'
import { nextTick, onBeforeUnmount, onMounted, ref, type ComponentPublicInstance } from 'vue'

const props = defineProps<{ items?: FAQ[] }>()
const items = props.items ?? FAQContent

const openIndex = ref<number | null>(null)
const isOpen = (i: number) => openIndex.value === i

const heights = ref<number[]>([])
const answerEls = ref<HTMLElement[]>([])
const answerFocusEls = ref<HTMLElement[]>([])
const itemEls = ref<HTMLElement[]>([])
const qBtnEls = ref<HTMLButtonElement[]>([])

const EXPAND_MS = 300

function toEl(el: Element | ComponentPublicInstance | null): HTMLElement | null {
  return (el as ComponentPublicInstance | null)?.$el
    ? ((el as ComponentPublicInstance).$el as HTMLElement)
    : (el as HTMLElement | null)
}
function setAnswerRef(el: Element | ComponentPublicInstance | null, i: number) {
  const t = toEl(el); if (t) answerEls.value[i] = t
}
function setAnswerFocusRef(el: Element | ComponentPublicInstance | null, i: number) {
  const t = toEl(el); if (t) answerFocusEls.value[i] = t
}
function setItemRef(el: Element | ComponentPublicInstance | null, i: number) {
  const t = toEl(el); if (t) itemEls.value[i] = t
}
function setQBtnRef(el: Element | ComponentPublicInstance | null, i: number) {
  const t = el as HTMLButtonElement | null; if (t) qBtnEls.value[i] = t
}

function measure() {
  heights.value = answerEls.value.map((wrap) => {
    const inner = wrap?.firstElementChild as HTMLElement | null
    return inner ? inner.scrollHeight : 0
  })
}

let ro: ResizeObserver | null = null
onMounted(async () => {
  await nextTick()
  measure()
  ro = new ResizeObserver(measure)
  answerEls.value.forEach((el) => ro!.observe(el))
  window.addEventListener('resize', measure)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', measure)
  ro?.disconnect()
})

const toggle = async (i: number) => {
  const opening = openIndex.value !== i
  openIndex.value = opening ? i : null
  await nextTick()
  measure()

  if (!opening) return

  const itemEl = itemEls.value[i]
  if (itemEl) {
    const rect = itemEl.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const isFullyVisible = rect.top >= 0 && rect.bottom <= viewportHeight

    if (!isFullyVisible) {
      qBtnEls.value[i]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
    }
  }

  window.setTimeout(() => {
    const answerEl = answerFocusEls.value[i]
    if (answerEl) {
      const rect = answerEl.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const isVisible = rect.top >= 0 && rect.bottom <= viewportHeight

      if (!isVisible) {
        answerEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
      }
    }
    requestAnimationFrame(() => {
      (answerFocusEls.value[i] ?? qBtnEls.value[i])?.focus({ preventScroll: true })
    })
  }, EXPAND_MS + 40)
}
</script>

<style scoped>
.faq {
  --chip-hover: rgba(255, 255, 255, .06);
  --chip-border: rgba(255, 255, 255, .12);

  color: var(--white);
  background: var(--blue-primary);

  display: flex;
  flex-direction: column;
  min-height: 100svh;
  overflow: hidden;
}

.faq__title {
  padding-bottom: 1rem;
  padding-top: 3rem;
}

.faq__inner {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.faq__list {
  display: flex;
  flex-direction: column;
  gap: 14px;

  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;

  padding-bottom: 3rem;
  scroll-padding-bottom: 24px;
  scroll-padding-top: var(--header-h, 16px);
}

.faq__item {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  background: transparent;

  scroll-margin-top: var(--header-h, 16px);
  scroll-margin-bottom: 16px;
}

.faq__q {
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: 10px;
  align-items: center;
  width: 100%;
  padding: 14px 12px 14px 18px;
  min-height: 56px;
  text-align: left;
  border: 0;
  color: var(--white);
  cursor: pointer;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .04), rgba(0, 0, 0, .02)),
    rgba(255, 255, 255, 0.02);
  box-shadow: inset 0 0 0 1px var(--chip-border);
  border-radius: 12px;
  transition: background-color .2s ease, box-shadow .2s ease;

  min-width: 0;
}

.faq__q:hover {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .06), rgba(0, 0, 0, .02)),
    var(--chip-hover);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .18);
}

.faq__qtext {
  size: var(--text-lg);
  line-height: 1.45;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}

.faq__toggle {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px var(--chip-border);
  background: rgba(255, 255, 255, .10);
  transition: background-color .25s ease, transform .25s ease;
}

.faq__toggle::before,
.faq__toggle::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 12px;
  height: 2px;
  background: var(--white);
  border-radius: 2px;
  transform: translate(-50%, -50%);
}

.faq__toggle::after {
  transform: translate(-50%, -50%) rotate(90deg);
}

.faq__toggle.is-open {
  background: rgba(255, 255, 255, .18);
}

.faq__toggle.is-open::after {
  opacity: 0;
}

.faq__answerWrap {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  padding: 0 2px;
  transition: max-height .3s ease, opacity .22s ease;
  will-change: max-height, opacity;
}

.faq__answer {
  padding: 10px 16px 16px;
  font-size: var(--text-md);
  line-height: 1.6;
  color: var(--white);
}

.faq__answer:focus-visible {
  outline: 2px solid rgba(255, 255, 255, .45);
  outline-offset: 4px;
  border-radius: 10px;
}

@media (max-width: 640px) {
  .faq__title {
    padding-bottom: 0;
  }

  .faq__q {
    min-height: 52px;
  }

  .faq__qtext {
    font-size: var(--text-md);
  }

  .faq__answer {
    font-size: var(--text-sm);
  }
}
</style>
