<template>
  <section class="advantages">
    <div class="container advantages__media" :style="{ backgroundImage: `url(${stonesImage})` }" aria-hidden="true" />

    <div class="advantages__panel" :style="{ backgroundImage: `url(${backgroundImageHorizontal})` }">
      <div class="advantages__inner">
        <h1 class="advantages__title h1 title-wrap mt-3" :style="{ color: 'var(--blue-primary)' }">ПРЕИМУЩЕСТВА</h1>

        <ul class="advantages__list">
          <li v-for="(item, i) in ADVANTAGES.items" :key="i" class="advantages__item">
            <h3 class="text-lg mb-3">{{ item.title }}</h3>
            <p class="text-md stack">{{ item.text }}</p>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ADVANTAGES } from '@/assets/data/content'
import stonesImage from '@/assets/images/Stones.jpg'
import backgroundImageHorizontal from '@/assets/images/background-texture.png'
// import backgroundImageVertical from '@/assets/images/background-texture-vertical.png'
</script>

<style scoped>
.advantages {
  --header: #2b6a86;
  --fg: #141414;

  --rhythm: clamp(18px, 2.4vw, 26px);
  --content-max: 740px;

  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  min-height: 100svh;
  min-height: 100dvh;
  width: 100%;
  overflow: hidden;
}

.advantages__title {
  padding-top: 0.75rem;
}

@media (max-width: 960px) {

}

.advantages__panel {
  padding-right: 3rem;
}

.advantages__media {
  background: center / cover no-repeat;
  min-height: 320px;
}

.advantages__panel {
  color: var(--fg);
  display: grid;
  position: relative;
}

.advantages__panel{
  background-repeat: no-repeat;
  background-position: right center;
  background-size: auto 100%;
}


.advantages__panel::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.advantages__inner {
  align-self: stretch;
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  padding-block: var(--rhythm);
  padding-inline: clamp(20px, 3.2vw, 36px);
  margin-left: clamp(8px, 2.2vw, 24px);
  justify-items: start;
}

.advantages__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  row-gap: var(--rhythm);
  align-content: space-evenly;
  min-height: 100%;
  row-gap: clamp(12px, 2vw, 26px);
}

@media (max-width: 960px) {
  .advantages {
    grid-template-columns: 1fr;
  }

  .advantages__media {
    order: 1;
    background-size: cover;
    background-position: 50% calc(100% - 30%);
    height: 45vh;
    background-repeat: no-repeat;
  }

  .advantages__panel {
    order: 2;
    padding-bottom: 2rem;
    padding-right: 0;
  }

  .advantages__inner {
    margin: 0 auto;
    padding-inline: clamp(16px, 4vw, 24px);
    --content-max: 720px;
  }

  .advantages__title {
    margin-top: 1rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
  }

  .advantages__list {
    row-gap: 2rem;
  }
}

@media (min-width: 961px) {
  .advantages__list {
    row-gap: calc(var(--rhythm) * 0.3);
  }
}

@media (min-width: 961px) {
  .advantages {
    grid-template-columns: 0.4fr 0.6fr;
  }
}
</style>
