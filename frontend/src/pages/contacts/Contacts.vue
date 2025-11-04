<script setup lang="ts">
import YandexMap from "@/components/features/YandexMap.vue";
import { CONTACTS } from "@/assets/data/content";
import { isValidPhone, formatPhone } from "@/utils/phone";
import { isValidEmail } from "@/utils/email";
</script>

<template>
  <section class="contacts-section">
    <div class="contacts container">
      <div class="contacts__map">
        <YandexMap
          :width="'100%'"
          :height="'var(--contacts-map-h)'"
          :controls="['zoomControl']"
          :openBalloon="false"
        />
      </div>

      <div class="contacts__content">
        <h1 class="h1 contacts__title" :style="{ color: 'var(--blue-primary)' }">
          КОНТАКТЫ
        </h1>

        <div class="contacts__row">
          <div class="contacts__label">АДРЕС:</div>
          <div class="contacts__value">{{ CONTACTS.address }}</div>
        </div>

        <div class="contacts__row">
          <div class="contacts__label">E-MAIL:</div>
          <div class="contacts__value">
            <a
              v-if="isValidEmail(CONTACTS.email)"
              class="contacts__link"
              :href="`mailto:${CONTACTS.email}`"
            >
              {{ CONTACTS.email }}
            </a>
          </div>
        </div>

        <div class="contacts__row">
          <div class="contacts__label">ТЕЛЕФОН:</div>
          <div class="contacts__value contacts__phones">
            <template v-for="phone in CONTACTS.phones" :key="phone">
              <a
                v-if="isValidPhone(phone)"
                class="contacts__link"
                :href="`tel:${formatPhone(phone)}`"
              >
                {{ phone }}
              </a>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="h2 contacts__tagline">КОМПЛЕКСНОЕ СОПРОВОЖДЕНИЕ ВАШЕГО БИЗНЕСА</div>
  </section>
</template>

<style scoped>
.contacts-section {
  padding-top: 3rem;
  overflow-x: clip;
  --contacts-map-h: clamp(260px, 40vh, 420px);
}

@media (max-width: 800px) {
  .contacts-section {
    padding-top: 3rem;
  }
}

.contacts {
  display: grid;
  grid-template-columns: clamp(360px, 45vw, 620px) minmax(0, 1fr);
  gap: 28px 40px;
  align-items: start;
  overflow-x: clip;
  grid-template-areas: "map content";
  padding-bottom: 2rem;
}

.contacts > * {
  min-width: 0;
}

.contacts__map {
  background: var(--white);
  touch-action: none;
  width: 100%;
  overflow: hidden;
}

.contacts__map :deep(> *) {
  height: clamp(260px, 40vh, 420px) !important;
}

@media (min-width: 801px) {
  .contacts__map :deep(> *) {
    height: clamp(420px, 55vh, 580px) !important;
  }
}

.contacts__content {
  grid-area: content;
  min-width: 0;
}

@media (max-width: 800px) {
  .contacts {
    grid-template-columns: 1fr;
    gap: 24px;
    grid-template-areas:
      "content"
      "map";
  }

  .contacts__map {
    padding-top: 2rem;
  }
}

.contacts__title {
  margin-bottom: 2rem;
}

@media (max-width: 800px) {
  .contacts__title {
    margin-bottom: 1rem;
  }
}

.contacts__row {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 10px 18px;
  align-items: start;
  padding: 15px 0;
}

.contacts__label {
  font-size: var(--text-lg);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.contacts__value {
  line-height: 1.5;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.contacts__phones {
  display: grid;
  gap: 8px;
}

.contacts__link {
  display: inline-block;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-thickness: 1px;
  max-width: 100%;
  overflow-wrap: anywhere;
}

.contacts__link:hover {
  opacity: 0.85;
}

.contacts__tagline {
  padding-bottom: 2rem;
  padding-top: 2rem;
  text-align: center;
  letter-spacing: 0.04em;
  opacity: 0.9;
  word-break: break-word;
}

@media (min-width: 801px) {
  .contacts-section {
    min-height: 100svh;
    display: grid;
    grid-template-rows: 1fr auto;
  }

  .contacts {
    align-items: stretch;
    padding-bottom: 0;
    min-height: 0;
  }

  .contacts__map {
    height: 100%;
    min-height: 0;
    --contacts-map-h: 100%;
  }

  .contacts__map :deep(> *) {
    height: 100% !important;
  }

  .contacts__tagline {
    align-self: end;
    margin-top: 0;
  }

  .contacts__row {
    display: block;
    padding: clamp(12px, 1.6vh, 18px) 0;
  }

  .contacts__label {
    display: block;
    margin-bottom: 8px;
    letter-spacing: 0.02em;
  }

  .contacts__value {
    display: block;
    line-height: 1.55;
  }

  .contacts__phones {
    display: grid;
    gap: 6px;
  }
}
</style>
