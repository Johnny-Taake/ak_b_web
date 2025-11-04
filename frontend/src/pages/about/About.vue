<script setup lang="ts">
import type { About } from "@/types";
import aboutLogo from "@/assets/images/logo_texture.png";
import backgroundImage from "@/assets/images/background-texture.png";

defineProps<{ data: About }>();
</script>

<template>
  <main class="aboutpage">
    <section class="about" :style="{ backgroundImage: `url(${backgroundImage})` }">
      <div class="about__topline" aria-hidden="true"></div>

      <div class="about__inner">
        <div class="about__left">
          <h1 class="about__title h1 title-wrap mb-10">О КОМПАНИИ</h1>
          <div class="about__text text-md stack">
            <p v-for="(p, i) in data.articles" :key="i">{{ p }}</p>
          </div>
        </div>

        <div class="about__right">
          <img class="about__image" :src="aboutLogo" alt="Логотип" loading="lazy" />
        </div>

        <div class="about__stats">
          <div class="aboutstats__item">
            <div class="aboutstats__value">100+</div>
            <div class="aboutstats__label">КОМПАНИЙ В ПОРТФОЛИО</div>
          </div>

          <div class="aboutstats__item">
            <div class="aboutstats__value">20</div>
            <div class="aboutstats__label">ЛЕТ ОПЫТА</div>
          </div>

          <div class="aboutstats__item">
            <div class="aboutstats__value">24/7</div>
            <div class="aboutstats__label">КЛИЕНТСКАЯ ПОДДЕРЖКА</div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.about {
  --about-line: rgba(0, 0, 0, 0.08);
  --header-h: var(--app-header-h, 80px);
  position: relative;
  color: var(--black);
  overflow: hidden;
  min-height: max(720px, 100dvh);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.about__inner {
  max-width: 1320px;
  margin: 0 auto;
  min-height: inherit;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: minmax(520px, 1fr) auto;
  grid-template-areas: "left right" "stats stats";
  padding: 0;
}

.about__left {
  grid-area: left;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 3rem 20px 40px 40px;
  min-height: 0;
  overflow: hidden;
}

.about__right {
  grid-area: right;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  align-self: end;
  padding: 3rem 32px 0 5px;
  min-height: 0;
}

.about__stats {
  --pad-top: clamp(16px, 4vh, 48px);
  --pad-bottom: clamp(24px, 6vh, 80px);
  --pad-inline: clamp(12px, 4vw, 40px);
  --gap: clamp(8px, 2.5vw, 24px);

  grid-area: stats;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  align-items: center;
  justify-items: center;
  gap: var(--gap);

  padding-top: var(--pad-top);
  padding-bottom: var(--pad-bottom);
  padding-inline: var(--pad-inline);
}

@media (max-height: 800px) {
  .about__stats {
    --pad-top: clamp(12px, 2vh, 24px);
    --pad-bottom: clamp(16px, 3vh, 32px);
    --gap: clamp(6px, 1.5vh, 16px);
  }

  .aboutstats__value {
    font-size: clamp(36px, 5.5vw, 56px);
  }
}

@media (min-width: 1600px) and (min-height: 900px) {
  .about__stats {
    --pad-top: clamp(24px, 5vh, 64px);
    --pad-bottom: clamp(32px, 6vh, 96px);
    --gap: clamp(12px, 2vw, 20px);
  }
}

.about__topline {
  position: absolute;
  inset-inline: 0;
  top: 0;
  height: 6px;
  background: var(--about-line);
}

.about__title {
  color: var(--blue-primary);
}

.about__text {
  display: grid;
  gap: 22px;
  max-width: 62ch;
  font-size: var(--text-md);
  line-height: 1.6;
  color: var(--black);
  overflow-y: auto;
  padding-right: 10px;
}

.about__text :deep(p) {
  color: var(--black);
}

.about__text::-webkit-scrollbar {
  width: 6px;
}

.about__text::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.about__text::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.about__text::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.about__image {
  width: 100%;
  height: auto;
  max-height: calc(100% - 3rem);
  object-fit: contain;
  user-select: none;
  pointer-events: none;
}

.aboutstats__item {
  text-align: center;
}

.aboutstats__value {
  font-family: "Inter", sans-serif;
  font-size: clamp(48px, 6vw, 72px);
  line-height: 1;
  font-weight: 300;
  letter-spacing: 0.02em;
  margin-bottom: 12px;
  color: var(--black);
}

.aboutstats__label {
  font-size: var(--text-sm);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  line-height: 1.4;
  color: #0a0a0a;
  font-weight: 500;
}

@media (max-width: 1050px) {
  .about {
    height: auto;
  }

  .about__title {
    padding-top: 1.5rem;
  }

  .about__inner {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    grid-template-areas: "left" "right" "stats";
    gap: 24px;
  }

  .about__left {
    padding: 24px 16px 0 16px;
    overflow: visible;
  }

  .about__text {
    overflow: visible;
    max-width: 100%;
    gap: 1rem;
    padding-right: 0;
  }

  .about__right {
    order: 2;
    padding: 0 16px;
    height: auto;
    align-self: auto;
    align-items: center;
  }

  .about__image {
    margin-top: 0;
    max-height: 300px;
  }

  .about__stats {
    row-gap: 16px;
    padding: 0 16px 24px;
    justify-items: stretch;
  }

  .aboutstats__label {
    max-width: none;
    white-space: normal;
  }

  .aboutstats__value {
    font-size: 42px;
  }
}

@media (max-width: 730px) {
  .about__stats {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1200px) {
  .about__right {
    align-self: center;
  }
  .about__image {
    max-height: 560px;
  }
}
</style>
