<template>
  <div class="contact-cta" :style="cssVars">
    <button
      ref="openBtnRef"
      class="btn btn--primary open-cta"
      type="button"
      @click="open()"
      aria-haspopup="dialog"
      :aria-expanded="state.isOpen ? 'true' : 'false'"
      :style="openCtaStyle"
    >
      {{ label }}
    </button>

    <Teleport to="body">
      <div
        v-if="state.isOpen"
        class="modal__backdrop"
        :style="cssVars"
        @click.self="close()"
      >
        <div
          class="modal glass"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contactTitle"
        >
          <header class="modal__header">
            <h2 id="contactTitle" class="modal__title">Заявка на консультацию</h2>
          </header>

          <form class="form" @submit.prevent="onSubmit">
            <div class="form__row">
              <label class="form__label" for="name">Ваше имя</label>
              <input
                id="name"
                ref="firstFieldRef"
                class="input"
                :class="{ 'is-invalid': state.touched.name && !state.name }"
                type="text"
                v-model.trim="state.name"
                required
                :disabled="state.loading"
                @blur="state.touched.name = true"
              />
              <small
                v-if="state.touched.name && !state.name"
                class="form__hint form__hint--error"
                >Укажите имя</small
              >
            </div>

            <div class="form__row">
              <label class="form__label" for="email">Email</label>
              <input
                id="email"
                class="input"
                :class="{ 'is-invalid': state.touched.email && !isEmailValid }"
                type="email"
                v-model.trim="state.email"
                required
                :disabled="state.loading"
                @blur="state.touched.email = true"
              />
              <small
                v-if="state.touched.email && !isEmailValid"
                class="form__hint form__hint--error"
              >
                Проверьте корректность email
              </small>
            </div>

            <div class="form__row">
              <label class="form__label" for="phone">Телефон (необязательно)</label>
              <input
                id="phone"
                class="input"
                :class="{ 'is-invalid': state.touched.phone && !isPhoneValid }"
                type="tel"
                inputmode="tel"
                autocomplete="tel"
                placeholder="+7 (___) ___-__-__"
                v-model.trim="state.phone"
                :disabled="state.loading"
                @blur="state.touched.phone = true"
              />
              <small
                v-if="state.touched.phone && !isPhoneValid"
                class="form__hint form__hint--error"
              >
                Неверный формат телефона
              </small>
            </div>

            <div class="form__row">
              <label class="form__label" for="message">Сообщение</label>
              <textarea
                id="message"
                class="textarea"
                rows="4"
                v-model.trim="state.message"
                placeholder="Кратко опишите задачу"
                :disabled="state.loading"
                @blur="state.touched.message = true"
                aria-describedby="message-help"
              />
              <small id="message-help" class="form__hint form__hint--muted">
                Можно добавить ссылки на ваши соцсети (например: Max, VK)
              </small>
            </div>

            <label
              class="checkbox"
              :class="{ 'is-invalid': state.touched.consent && !state.consent }"
            >
              <input
                type="checkbox"
                v-model="state.consent"
                required
                :aria-invalid="state.touched.consent && !state.consent ? 'true' : 'false'"
                :disabled="state.loading"
                @blur="state.touched.consent = true"
              />
              <span
                >Я согласен(а) на использование предоставленной информации для обратной
                связи</span
              >
            </label>
            <small
              v-if="state.touched.consent && !state.consent"
              class="form__hint form__hint--error"
            >
              Поставьте галочку согласия
            </small>

            <p
              v-if="state.serverMsg"
              :class="['server-msg', state.serverOk ? 'ok' : 'err']"
            >
              {{ state.serverMsg }}
            </p>

            <footer class="modal__footer">
              <button
                class="btn btn--secondary"
                type="button"
                @click="close()"
                :disabled="state.loading"
              >
                Отмена
              </button>

              <button
                class="btn btn--primary"
                :class="isReady ? 'btn--ready' : 'btn--disabled'"
                type="submit"
                :disabled="state.loading"
              >
                <span v-if="!state.loading">Отправить</span>
                <span v-else class="spinner" aria-hidden="true"></span>
              </button>
            </footer>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const COLORS = {
  INPUT_BORDER: "rgba(0, 0, 0, .12)",
  FOCUS_BORDER: "#7a9cff",
  FOCUS_RING: "rgba(122, 156, 255, .2)",
  ERROR: "#e53935",
  ERROR_BG: "rgba(229, 57, 53, .08)",
  ERROR_RING: "rgba(229, 57, 53, .18)",
  OK: "#2e7d32",
  OK_BG: "rgba(76, 175, 80, .15)",
  OK_BORDER: "rgba(76, 175, 80, .3)",

  BACKDROP: "rgba(0, 0, 0, .35)",
  MODAL_BG: "rgba(255, 255, 255, .4)",
  MODAL_BORDER: "rgba(255, 255, 255, .5)",

  BTN_PRIMARY_FROM: "rgba(52, 52, 53, 0.35)",
  BTN_PRIMARY_TO: "rgba(53, 52, 52, 0.35)",
  BTN_TEXT: "#ffffff",

  BTN_DISABLED_BG: "#f1f3f5",
  BTN_DISABLED_TEXT: "#222222",

  BTN_READY_BG: "#000000",
  BTN_READY_TEXT: "#ffffff",

  CHECK_ACCENT: "#667eea",
};

import {
  ref,
  nextTick,
  onMounted,
  onBeforeUnmount,
  watchEffect,
  computed,
  watch,
} from "vue";
import { useContactForm } from "@/composables/useContactForm";
import { createRequestApi } from "@/api/v1/request";
import type { RequestPayload } from "@/types/api";
import { lockBody, unlockBody } from "@/utils/bodyLock";

const props = defineProps<{
  label?: string;
  baseUrl?: string;
  openBtnBg?: string;
  openBtnText?: string;
}>();

const label = props.label ?? "Записаться на консультацию";

const {
  state,
  isEmailValid,
  isPhoneValid,
  canSubmit,
  open,
  close,
  markAllTouched,
  resetForm,
  handleSubmitError,
} = useContactForm();

const openBtnRef = ref<HTMLButtonElement | null>(null);
const firstFieldRef = ref<HTMLInputElement | null>(null);

const cssVars = computed(() => ({
  "--c-input-border": COLORS.INPUT_BORDER,
  "--c-focus-border": COLORS.FOCUS_BORDER,
  "--c-focus-ring": COLORS.FOCUS_RING,
  "--c-error": COLORS.ERROR,
  "--c-error-bg": COLORS.ERROR_BG,
  "--c-error-ring": COLORS.ERROR_RING,
  "--c-ok": COLORS.OK,
  "--c-ok-bg": COLORS.OK_BG,
  "--c-ok-border": COLORS.OK_BORDER,

  "--c-backdrop": COLORS.BACKDROP,
  "--c-modal-bg": COLORS.MODAL_BG,
  "--c-modal-border": COLORS.MODAL_BORDER,

  "--c-btn-primary-from": COLORS.BTN_PRIMARY_FROM,
  "--c-btn-primary-to": COLORS.BTN_PRIMARY_TO,
  "--c-btn-text": COLORS.BTN_TEXT,

  "--c-btn-disabled-bg": COLORS.BTN_DISABLED_BG,
  "--c-btn-disabled-text": COLORS.BTN_DISABLED_TEXT,

  "--c-btn-ready-bg": COLORS.BTN_READY_BG,
  "--c-btn-ready-text": COLORS.BTN_READY_TEXT,

  "--c-check-accent": COLORS.CHECK_ACCENT,
}));

const openCtaStyle = computed(() => ({
  "--open-bg":
    props.openBtnBg ??
    `linear-gradient(135deg, var(--c-btn-primary-from) 0%, var(--c-btn-primary-to) 100%)`,
  "--open-text": props.openBtnText ?? "var(--c-btn-text)",
}));

const isReady = computed(() => canSubmit.value && !!state.consent && !state.loading);

function onEsc(e: KeyboardEvent) {
  if (e.key === "Escape" && state.isOpen) close();
}
onMounted(() => window.addEventListener("keydown", onEsc));
onBeforeUnmount(() => window.removeEventListener("keydown", onEsc));

watchEffect(async () => {
  if (state.isOpen) {
    await nextTick();
    firstFieldRef.value?.focus();
  }
});

watch(
  () => state.isOpen,
  (now, prev) => {
    if (now && !prev) lockBody();
    if (!now && prev) unlockBody();
  }
);

onBeforeUnmount(() => {
  unlockBody();
});

let detachFocusScroll: null | (() => void) = null;
watch(
  () => state.isOpen,
  async (isOpen) => {
    if (!isOpen) {
      if (detachFocusScroll) {
        detachFocusScroll();
        detachFocusScroll = null;
      }
      return;
    }
    await nextTick();
    const formEl = document.querySelector(".modal .form") as HTMLElement | null;
    if (!formEl) return;

    const handler = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.matches("input, textarea, select")) {
        setTimeout(() => {
          (t.closest(".form__row") ?? t).scrollIntoView({
            block: "start",
            inline: "nearest",
            behavior: "smooth",
          });
        }, 50);
      }
    };
    formEl.addEventListener("focusin", handler, { passive: true });
    detachFocusScroll = () => formEl.removeEventListener("focusin", handler as any);
  }
);

async function onSubmit() {
  if (!canSubmit.value || state.loading) {
    markAllTouched();

    requestAnimationFrame(() => {
      const consentLabel = document.querySelector(
        ".checkbox.is-invalid"
      ) as HTMLElement | null;
      const firstInvalid =
        consentLabel ?? (document.querySelector(".is-invalid") as HTMLElement | null);
      if (firstInvalid)
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });

      if (!state.consent) {
        const consentInput = document.querySelector(
          '.checkbox input[type="checkbox"]'
        ) as HTMLElement | null;
        consentInput?.focus();
      }
    });

    return;
  }

  state.loading = true;
  state.serverMsg = "";

  try {
    const payload: RequestPayload = {
      subject: `Заявка на консультацию — ${state.name} <${state.email}>`,
      message: `Имя: ${state.name}\nEmail: ${state.email}${
        state.phone ? `\nТелефон: ${state.phone}` : ""
      }\n\nСообщение:\n${state.message || "—"}`,
    };

    const apiBase = props.baseUrl ?? import.meta.env.VITE_APP_API_BASE_URL;
    const api = createRequestApi(apiBase);
    await api.sendEmail(payload);

    state.serverOk = true;
    state.serverMsg = "Заявка отправлена! Мы свяжемся с вами в ближайшее время.";
    setTimeout(() => {
      resetForm();
      close();
      state.loading = false;
    }, 900);
  } catch (err) {
    handleSubmitError(err);
    state.loading = false;
  }
}

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onEsc);
  document.body.classList.remove("modal-open");
});
</script>

<style scoped>
.contact-cta {
  display: inline-block;
}

.modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: clamp(12px, 4vw, 24px);
  background: var(--c-backdrop);
  overscroll-behavior: contain;
}

.modal {
  width: min(640px, 92vw);
  max-height: 92svh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  background: var(--c-modal-bg);
  border: 1px solid var(--c-modal-border);
  border-radius: 24px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  animation: modalSlideIn 0.3s ease-out;
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
  justify-content: space-between;
  padding: 12px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.35);
  flex: 0 0 auto;
}

.modal__title {
  margin: 0;
  flex: 1;
  text-align: center;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--black);
}

.form {
  flex: 1 1 auto;
  min-height: 0;
  padding: 16px 18px 18px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  scroll-padding-top: 18px;
}

.modal__footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 14px 18px max(18px, env(safe-area-inset-bottom));
  margin-top: 0;
  flex: 0 0 auto;
}
.modal__footer .btn {
  min-width: 180px;
  height: 46px;
}

.spinner {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-right-color: transparent;
  display: inline-block;
  vertical-align: -3px;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.form__row {
  display: grid;
  gap: 8px;
  margin-bottom: 14px;
  scroll-margin-top: 18px;
}

.form__label {
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--black);
  text-align: left;
}
.form__hint {
  font-size: var(--text-xs);
}
.form__hint--muted {
  color: var(--c-text-muted);
}
.form__hint--error {
  color: var(--c-error);
}

.input,
.textarea {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--c-input-border);
  background: rgba(255, 255, 255, 0.9);
  padding: 12px 14px;
  font-size: var(--text-sm);
  color: var(--black);
  transition: all 0.2s ease;
  resize: none;
  overflow-y: auto;
  max-height: 40vh;
  -webkit-overflow-scrolling: touch;
}
.input:focus,
.textarea:focus {
  outline: none;
  border-color: var(--c-focus-border);
  box-shadow: 0 0 0 4px var(--c-focus-ring);
  background: #fff;
  transform: translateY(-1px);
}
.input.is-invalid,
.textarea.is-invalid {
  border-color: var(--c-error) !important;
  box-shadow: 0 0 0 3px var(--c-error-ring) !important;
}

.checkbox {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
  padding: 12px;
  border-radius: 12px;
  transition: background 0.2s ease;
  cursor: pointer;
}
.checkbox:hover {
  background: rgba(0, 0, 0, 0.03);
}
.checkbox.is-invalid {
  background: var(--c-error-bg);
  border: 2px solid var(--c-error);
  box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.12);
  scroll-margin: 12vh;
}
.checkbox input[type="checkbox"] {
  margin-top: 2px;
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--c-check-accent);
}
.checkbox input[type="checkbox"]:focus-visible {
  outline: 2px solid var(--c-error);
  outline-offset: 2px;
}
.checkbox span {
  font-size: var(--text-xs);
  color: var(--black);
  line-height: 1.5;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 999px;
  padding: 12px 20px;
  font-size: var(--text-xs);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.2s ease,
    background 0.2s ease, color 0.2s ease;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn--primary {
  --btn-hover-transform: translateY(-2px);
  --btn-active-transform: translateY(0);

  background: linear-gradient(
    135deg,
    var(--c-btn-primary-from) 0%,
    var(--c-btn-primary-to) 100%
  );
  color: var(--c-btn-text);
  font-weight: 500;
  padding: 13px 28px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}
.btn--primary:hover:not(:disabled) {
  transform: var(--btn-hover-transform);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
}
.btn--primary:active:not(:disabled) {
  transform: var(--btn-active-transform);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.btn--primary.btn--ready {
  background: #fff;
  color: #111;
  border: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
}
.btn--primary.btn--ready:hover:not(:disabled) {
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.28);
}

.btn--primary.btn--disabled {
  background: linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #6b7280;
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: none;
}
.btn--primary.btn--disabled:hover,
.btn--primary.btn--disabled:active {
  transform: none;
  box-shadow: none;
}

.btn--secondary {
  background: #f1f3f5;
  color: #222;
}

.contact-cta > .open-cta {
  background: var(--open-bg) !important;
  color: var(--open-text) !important;

  padding-block: clamp(15px, 1.35vw, 20px);
  padding-inline: clamp(28px, 2.6vw, 40px);
  min-height: unset;

  line-height: 1.05;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;

  --btn-hover-transform: scale(1.03);
  --btn-active-transform: scale(0.99);

  box-sizing: border-box;
  white-space: nowrap;
  max-width: 100%;
  font-size: var(--text-lg);

  box-shadow: none !important;
  transition: transform 0.15s ease, background 0.2s ease, color 0.2s ease;
  will-change: transform;
  transform-origin: center;

  outline: 2px solid transparent;
  outline-offset: 3px;
}
.contact-cta > .open-cta:hover:not(:disabled) {
  transform: scale(1.03);
}
.contact-cta > .open-cta:active:not(:disabled) {
  transform: scale(0.99);
}
.contact-cta > .open-cta:focus-visible {
  outline-color: currentColor;
}

@media (prefers-reduced-motion: reduce) {
  .contact-cta > .open-cta {
    transition: none;
  }
  .contact-cta > .open-cta:hover:not(:disabled),
  .contact-cta > .open-cta:active:not(:disabled) {
    transform: none;
  }
}

@media (min-width: 1024px) {
  .contact-cta > .open-cta:hover:not(:disabled) {
    transform: scale(1.04);
  }
}

@media (max-width: 420px) {
  .contact-cta > .open-cta {
    font-size: var(--text-sm);
    padding-block: 12px;
    padding-inline: 18px;
    min-height: 36px;
  }
}

.server-msg {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: var(--text-sm);
  text-align: center;
}
.server-msg.ok {
  background: var(--c-ok-bg, #e6f4ea);
  color: var(--c-ok, #08110b);
  border: 1px solid var(--c-ok-border, #a7d7c5);
  font-weight: 500;
}
.server-msg.err {
  background: var(--c-error-bg);
  color: var(--c-error);
  border: 1px solid rgba(229, 57, 53, 0.3);
}

@media (max-width: 640px) {
  .modal {
    border-radius: 18px;
    width: 94vw;
    max-height: calc(100svh - 12px);
  }
  .input,
  .textarea {
    font-size: var(--text-sm);
  }

  .modal__footer {
    --gap: 10px;
    padding: 14px clamp(16px, 5vw, 24px) max(18px, env(safe-area-inset-bottom));
    gap: var(--gap);
    flex-wrap: wrap;
  }
  .modal__footer .btn {
    min-width: 0;
    flex: 1 1 calc(50% - var(--gap) / 2);
    height: 40px;
    padding: 0 14px;
    font-size: var(--text-sm);
  }
}
@media (max-width: 360px) {
  .modal__footer .btn {
    flex-basis: 100%;
  }
}

@keyframes cta-pop-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
    filter: saturate(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: saturate(1);
  }
}
</style>
