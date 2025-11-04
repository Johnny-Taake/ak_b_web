<template>
  <section class="homepage relative min-h-[100svh] w-full overflow-hidden text-white" aria-label="Home">
    <video v-if="useVideo" autoplay muted loop playsinline @error="handleVideoError"
      class="absolute inset-0 w-full h-full object-cover" :poster="backgroundImage">
      <source :src="backgroundVideo" type="video/mp4">
    </video>
    <div v-if="!useVideo || videoError" class="absolute inset-0 w-full h-full bg-cover bg-center"
      :style="{ backgroundImage: `url(${backgroundImage})` }">
    </div>

    <div class="absolute inset-0 pointer-events-none bg-gradient-to-tr from-black/60 via-black/30 to-transparent z-0">
    </div>

    <FirstPageHeader />
    <div class="relative z-10 mx-auto w-full
         max-w-[min(92vw,1200px)]
         xl:max-w-[1280px]
         2xl:max-w-[1400px]
         px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12
         min-h-[inherit]
         grid grid-rows-[auto,1fr,auto] gap-0" :style="{
          paddingTop: 'var(--home-top)',
          paddingBottom: 'var(--home-bottom)'
        }">
      <div class="flex flex-col gap-4 items-center lg:items-end">
        <h1 class="max-w-[95%] sm:max-w-[600px] md:max-w-[700px]
                   text-center lg:text-right
                   font-serif text-[clamp(22px,6.4vw,28px)] leading-tight sm:text-3xl md:text-4xl lg:text-5xl
                   mt-40 lg:mt-20
                   mb-44 lg:mb-48">
          <span class="block">ПОРЯДОК В ЦИФРАХ,</span>
          <span class="block">РАВНОВЕСИЕ В БИЗНЕСЕ</span>
        </h1>
        <div class="button__cta">
          <ContactCta label="ЗАПИСАТЬСЯ НА КОНСУЛЬТАЦИЮ" :base-url="baseUrl" :openBtnBg="'var(--blue-primary)'"
            :openBtnText="'var(--white)'" />
        </div>
      </div>
      <div aria-hidden="true"></div>
      <div class="pb-3 home-bottom" aria-label="Service categories">
        <div class="flex flex-nowrap items-center justify-between gap-x-4 sm:gap-x-6 text-center">
          <span v-for="t in tags" :key="t" class="tag opacity-90 font-light whitespace-nowrap">
            {{ t }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FirstPageHeader from '@/components/layout/FirstPageHeader.vue'
import ContactCta from '@/components/ui/ContactCta.vue'
import backgroundImage from '@/assets/images/Balance.jpg'
import backgroundVideo from '@/assets/videos/background-home.mov'

const tags = ['Бухгалтерия', 'Налоги', 'Кадры', 'Документы']
const baseUrl = import.meta.env.VITE_APP_API_BASE_URL

const useVideo = ref(true)
const videoError = ref(false)

const handleVideoError = () => {
  videoError.value = true
  useVideo.value = false
}
</script>

<style scoped>
section[aria-label="Home"] {
  --home-top: clamp(112px, 18vh, 220px);
  --home-bottom: clamp(20px, 6vh, 56px);
  min-height: 100svh;
  position: relative;
}

[aria-label="Home"]>.mx-auto {
  min-height: inherit;
}

h1 {
  font-weight: 100;
}

.home-bottom .tag {
  font-size: var(--text-sm);
}

@media (max-height: 700px) {
  .button__cta {
    margin-top: -6rem;
    padding-bottom: 4rem;
  }
}

@media (max-width: 1024px) {
  section[aria-label="Home"] {
    --home-top: clamp(80px, 14vh, 140px);
    --home-bottom: clamp(8px, 3.5vh, 28px);
  }

  video,
  [class*="bg-cover"] {
    object-position: 10.5% center !important;
    background-position-x: 10.5% !important;
  }
}
</style>
