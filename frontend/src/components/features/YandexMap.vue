<template>
  <div ref="wrapRef" class="ymap-wrap">
    <div ref="mapDiv" :style="mapBoxStyle" class="ymap-box" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { OFFICELOCATION, CONTACTS, ORG_URL } from '@/assets/data/content'
import type { MapProps, YandexMapsAPI } from '@/types'

const props = withDefaults(defineProps<MapProps>(), {
  height: '360px',
  width: '100%',
  zoom: 15,
  openBalloon: false,
  controls: () => ['zoomControl'],
})

declare global { interface Window { ymaps: YandexMapsAPI } }

const mapDiv = ref<HTMLDivElement | null>(null)
const wrapRef = ref<HTMLElement | null>(null)

const mapHeight = ref<number | string>(props.height)
const mapWidth = computed(() =>
  typeof props.width === 'number' ? `${props.width}px` : props.width
)

const apiKey = import.meta.env.VITE_YANDEX_MAP_API_KEY as string
let ymapsPromise: Promise<any> | null = null

function loadYMapsOnce(apiKey: string): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'))
  if (window.ymaps && typeof window.ymaps.ready === 'function') {
    return new Promise(resolve => window.ymaps.ready(() => resolve(window.ymaps)))
  }
  if (ymapsPromise) return ymapsPromise

  ymapsPromise = new Promise((resolve, reject) => {
    const SCRIPT_ID = 'yandex-maps-api'
    if (document.getElementById(SCRIPT_ID)) {
      const check = () => {
        if (window.ymaps && typeof window.ymaps.ready === 'function') {
          window.ymaps.ready(() => resolve(window.ymaps))
        } else setTimeout(check, 100)
      }
      check()
      return
    }
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`
    script.async = true
    script.defer = true
    script.onload = () => {
      const check = () => {
        if (window.ymaps && typeof window.ymaps.ready === 'function') {
          window.ymaps.ready(() => resolve(window.ymaps))
        } else setTimeout(check, 100)
      }
      check()
    }
    script.onerror = () => reject(new Error('Failed to load Yandex Maps API'))
    document.head.appendChild(script)
  })
  return ymapsPromise
}

const mapBoxStyle = computed(() => ({
  width: mapWidth.value,
  height: mapHeight.value,
  border: `1px solid var(--gray-light)`,
  overflow: 'hidden',
}))

const calculateHeight = () => {
  if (typeof window === 'undefined') return
  if (window.innerWidth <= 600) {
    const h = Math.min(Math.max(220, Math.round(window.innerHeight * 0.48)), 320)
    mapHeight.value = h
  } else {
    mapHeight.value = props.height
  }
}

let mapInstance: any = null
let placemark: any = null
let destroyed = false
let ro: ResizeObserver | null = null
let rafId: number | null = null
let pointerMql: MediaQueryList | null = null

const fit = () => {
  if (!mapInstance) return
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    try { mapInstance.container?.fitToViewport?.() } catch { /* noop */ }
  })
}

const enableDesktopScrollZoom = () => {
  if (!mapInstance || typeof window === 'undefined') return
  const isDesktop = window.matchMedia('(pointer:fine)').matches
  try {
    if (isDesktop) mapInstance.behaviors.enable('scrollZoom')
    else mapInstance.behaviors.disable('scrollZoom')
  } catch { /* noop */ }
}

const onResize = () => { calculateHeight(); fit() }

const initMap = async () => {
  if (!apiKey) { console.error('Missing VITE_YANDEX_MAP_API_KEY'); return }
  try {
    const ymaps = await loadYMapsOnce(apiKey)
    if (destroyed || !mapDiv.value) return

    const center: [number, number] = [OFFICELOCATION.lat, OFFICELOCATION.lng]

    mapInstance = new ymaps.Map(
      mapDiv.value,
      { center, zoom: props.zoom, controls: props.controls },
      { suppressMapOpenBlock: true }
    )

    placemark = new ymaps.Placemark(
      center,
      {
        balloonContentHeader: OFFICELOCATION.title,
        balloonContentBody: CONTACTS.address,
        balloonContentFooter: `<a href="${ORG_URL}" target="_blank" rel="noopener noreferrer nofollow" style="color:var(--blue-link);text-decoration:none;">Открыть карточку организации →</a>`,
        hintContent: OFFICELOCATION.title,
      },
      { preset: 'islands#redDotIcon' }
    )

    mapInstance.geoObjects.add(placemark)
    enableDesktopScrollZoom()

    if (props.openBalloon) placemark.balloon.open()

    setTimeout(fit, 0)
  } catch (e) {
    console.error('Map init error:', e)
  }
}

onMounted(() => {
  calculateHeight()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', onResize, { passive: true })

    if ('ResizeObserver' in window && wrapRef.value) {
      ro = new ResizeObserver(fit)
      ro.observe(wrapRef.value)
    }

    pointerMql = window.matchMedia('(pointer:fine)')
      ; (pointerMql.addEventListener ?? pointerMql.addListener).call(pointerMql, 'change', enableDesktopScrollZoom as any)
  }

  initMap()
})

onUnmounted(() => {
  destroyed = true
  ro?.disconnect()
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', onResize)
    if (pointerMql) {
      ; (pointerMql.removeEventListener ?? pointerMql.removeListener).call(pointerMql, 'change', enableDesktopScrollZoom as any)
    }
  }
  if (rafId) cancelAnimationFrame(rafId)
  try { mapInstance?.destroy?.() } catch { /* noop */ }
  mapInstance = null
  placemark = null
})

watch(() => props.openBalloon, (v) => {
  if (!placemark) return
  try {
    if (v) placemark.balloon.open()
    else placemark.balloon.close()
  } catch { /* noop */ }
})

watch(() => props.zoom, (z) => {
  if (!mapInstance) return
  try { mapInstance.setZoom(z) } catch { /* noop */ }
})

watch(() => props.controls, (controls, prev) => {
  if (!mapInstance) return
  const same =
    Array.isArray(controls) &&
    Array.isArray(prev) &&
    controls.length === prev.length &&
    controls.every((c, i) => c === prev[i])
  if (same) return
  try { mapInstance.destroy() } catch { /* noop */ }
  mapInstance = null
  placemark = null
  initMap()
}, { deep: true })

watch(() => props.height, () => {
  if (typeof window === 'undefined') return
  if (window.innerWidth > 600) {
    mapHeight.value = props.height
    fit()
  }
})
watch(() => props.width, () => { fit() })
</script>

<style scoped>
.ymap-wrap {
  width: 100%;
}

.ymap-box {
  display: block;
}
</style>
