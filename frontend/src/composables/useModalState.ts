import { ref, computed } from 'vue'

// Global modal states
const navigationModal = ref(false)
const contactModal = ref(false)
const servicesModal = ref(false)

// Computed property to check if any modal is open
const isAnyModalOpen = computed(() =>
  navigationModal.value || contactModal.value || servicesModal.value
)

export function useModalState() {
  return {
    // Individual modal states
    navigationModal,
    contactModal,
    servicesModal,

    // Combined state
    isAnyModalOpen,

    // Helper functions
    setNavigationModal: (open: boolean) => { navigationModal.value = open },
    setContactModal: (open: boolean) => { contactModal.value = open },
    setServicesModal: (open: boolean) => { servicesModal.value = open },
  }
}
