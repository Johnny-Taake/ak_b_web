import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useModalState } from './useModalState'

const isOpen = ref(false)
const { setNavigationModal } = useModalState()

function lockBody() {
  document.body.classList.add('body-locked')
}
function unlockBody() {
  document.body.classList.remove('body-locked')
}
function open() {
  if (isOpen.value) return
  isOpen.value = true
  setNavigationModal(true)
  lockBody()
}
function close() {
  if (!isOpen.value) return
  isOpen.value = false
  setNavigationModal(false)
  unlockBody()
}
function toggle() {
  isOpen.value ? close() : open()
}

export function useGlassNav() {
  // закрытие по ESC
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
  }
  onMounted(() => window.addEventListener('keydown', onKey))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

  return { isOpen, open, close, toggle }
}
