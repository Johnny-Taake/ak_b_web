import { reactive, computed, watch } from 'vue'
import axios from 'axios'
import { useModalState } from './useModalState'

const STORAGE_KEY = 'contactFormDraft_v1'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[\+]?[0-9\s\-\(\)]{7,20}$/

export function useContactForm() {
  const { setContactModal } = useModalState()

  const state = reactive<{
    isOpen: boolean
    loading: boolean
    name: string
    email: string
    phone: string
    message: string
    consent: boolean
    serverOk: boolean | null
    serverMsg: string
    touched: { name: boolean; email: boolean; phone: boolean; message: boolean; consent: boolean }
  }>({
    isOpen: false,
    loading: false,
    name: '',
    email: '',
    phone: '',
    message: '',
    consent: false,
    serverOk: null,
    serverMsg: '',
    touched: { name: false, email: false, phone: false, message: false, consent: false },
  })

  const isEmailValid = computed(() => !!state.email && EMAIL_RE.test(state.email))
  const isPhoneValid = computed(() => !state.phone || PHONE_RE.test(state.phone))
  const canSubmit = computed(() =>
    !!state.name && isEmailValid.value && isPhoneValid.value && state.consent && !state.loading
  )

  function open() {
    state.isOpen = true
    state.serverMsg = ''
    state.serverOk = null
    setContactModal(true)
  }
  function close() {
    state.isOpen = false
    setContactModal(false)
  }
  function markAllTouched() {
    state.touched = { name: true, email: true, phone: true, message: true, consent: true }
  }
  function resetForm() {
    state.name = ''
    state.email = ''
    state.phone = ''
    state.message = ''
    state.consent = false
    state.serverMsg = ''
    state.serverOk = null
    state.touched = { name: false, email: false, phone: false, message: false, consent: false }
    if (typeof window !== 'undefined') {
      try { sessionStorage.removeItem(STORAGE_KEY) } catch { }
    }
  }

  function handleSubmitError(err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
      const s = err.response.status
      if (s === 429) {
        state.serverOk = false
        state.serverMsg = 'Вы уже отправили максимум заявок. Пожалуйста, подождите. Если с вами не свяжутся, вы сможете отправить повторную заявку.'
        return
      }
      if ([400, 401, 403, 404, 409, 422].includes(s)) {
        state.serverOk = false
        state.serverMsg = 'Не удалось отправить заявку. Проверьте данные и попробуйте ещё раз.'
        return
      }
    }
    state.serverOk = false
    state.serverMsg = 'Произошла ошибка. Попробуйте позже.'
  }

  watch(
    () => ({
      name: state.name,
      email: state.email,
      phone: state.phone,
      message: state.message,
      consent: state.consent,
    }),
    (val) => {
      if (typeof window !== 'undefined') {
        try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(val)) } catch { }
      }
    },
    { deep: true }
  )

  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) Object.assign(state, JSON.parse(raw))
    } catch { }
  }

  return {
    state,
    isEmailValid,
    isPhoneValid,
    canSubmit,
    open,
    close,
    markAllTouched,
    resetForm,
    handleSubmitError,
  }
}
