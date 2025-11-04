<template>
  <section ref="heroRef" class="hero">
    <video autoplay muted loop playsinline @error="handleVideoError" class="hero__video" :poster="heroBg">
      <source :src="backgroundVideo" type="video/mp4">
    </video>
    <div v-if="videoError" class="hero__image" :style="{ backgroundImage: `url(${heroBg})` }">
    </div>

    <div class="hero__inner">
      <h1 class="hero__title" >
        ПОМОГАЕМ ВЫСТРАИВАТЬ<span class="br br--narrow"></span>
        СТРУКТУРУ<span class="br br--wide"></span>
        И СДАВАТЬ<span class="br br--narrow"></span>
        ОТЧЕТНОСТЬ ВОВРЕМЯ
      </h1>
    </div>
    <ContactCta :label="'ЗАПИСАТЬСЯ НА КОНСУЛЬТАЦИЮ'" :base-url="baseUrl" class="hero__cta" :openBtnBg="'var(--blue-primary)'" :openBtnText="'var(--white)'" />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ContactCta from '@/components/ui/ContactCta.vue'
import heroBg from '@/assets/images/background-hero.jpg'
import backgroundVideo from '@/assets/videos/background-water.mov'

const baseUrl = import.meta.env.VITE_APP_API_BASE_URL
const heroRef = ref<HTMLElement | null>(null)
const videoError = ref(false)

const handleVideoError = () => {
  videoError.value = true
}

onMounted(() => {
  const img = new Image()
  img.src = heroBg
  img.onload = () => {
    const ratio = img.naturalHeight / img.naturalWidth
    heroRef.value?.style.setProperty('--bg-ratio', String(ratio))
  }
})
</script>

<style scoped>
.hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  --hero-min: 640px;
  --bg-ratio: .5625;
  height: var(--hero-min);
  min-height: 100svh;
  --puddle-x: 50%;
  --puddle-y: 60%;
  --cta-dy: 1vh;
  --title-top: clamp(12px, 8vh, 96px);
  padding: 48px 16px 72px;
}

.hero__video,
.hero__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: var(--puddle-x) var(--puddle-y);
}

.hero__inner {
  max-width: 960px;
  width: min(100%, 960px);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.hero__title {
  position: sticky;
  top: max(var(--title-top), env(safe-area-inset-top));
  z-index: 1;
  margin: 0 auto;
  text-align: center;
  font-family: 'Cormorant Garamond', serif;
  font-weight: 600;
  font-size: clamp(27px, 2.8vw, 44px);
  line-height: 1.2;
  color: var(--white);
  padding-top: 5rem;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: normal;
  -webkit-hyphens: auto;
  hyphens: auto;
}

.br {
  display: none;
}

@media (max-width: 480px) {
  .br--narrow {
    display: block;
  }
}

@media (min-width: 481px) {
  .br--wide {
    display: block;
  }
}

.hero__cta {
  position: absolute;
  left: 50%;
  top: calc(var(--puddle-y) + var(--cta-dy));
  transform: translate(-50%, -50%);
  z-index: 2;
}

@media (max-width: 640px) {
  .hero {
    --title-top: clamp(8px, 7vh, 72px);
  }

}
</style>
