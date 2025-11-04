<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import Services from './pages/services/Services.vue'
import Reviews from './pages/reviews/Reviews.vue'
import Contacts from './pages/contacts/Contacts.vue'
import Hero from './pages/hero/Hero.vue'
import About from './pages/about/About.vue'
import { ABOUT } from '@/assets/data/content'
import Advantages from './pages/advantages/Advantages.vue'
import FAQ from './pages/faq/FAQ.vue'
import Home from './pages/home/Home.vue'
import GlassNav from '@/components/nav/GlassNav.vue'
import FloatingBurger from '@/components/nav/FloatingBurger.vue'

const sections = ['home', 'about', 'services', 'advantages', 'reviews', 'hero', 'faq', 'contacts']

const scrollToSection = (direction: 'next' | 'prev') => {
  const container = document.querySelector('.pages')
  if (!container) return
  const currentScroll = container.scrollTop
  const sectionElements = sections.map(id => document.getElementById(id)).filter(Boolean)
  let currentIndex = 0
  for (let i = 0; i < sectionElements.length; i++) {
    const el = sectionElements[i]
    if (el && el.offsetTop <= currentScroll + 100) {
      currentIndex = i
    }
  }

  const currentSection = sectionElements[currentIndex]
  const threshold = 50

  if (direction === 'prev' && currentSection) {
    const distanceFromTop = currentScroll - currentSection.offsetTop
    if (distanceFromTop > threshold) {
      currentSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
  }

  const targetIndex = direction === 'next'
    ? Math.min(currentIndex + 1, sectionElements.length - 1)
    : Math.max(currentIndex - 1, 0)
  const targetEl = sectionElements[targetIndex]
  if (targetEl) {
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  const target = e.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    return
  }

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      scrollToSection('next')
      break
    case 'ArrowUp':
      e.preventDefault()
      scrollToSection('prev')
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <router-view />
  <GlassNav />
  <FloatingBurger />
  <main class="pages">
    <section id="home" class="screen section">
      <Home />
    </section>
    <section id="about" class="screen section">
      <About :data="ABOUT" />
    </section>
    <section id="services" class="screen section">
      <Services />
    </section>
    <section id="advantages" class="screen section">
      <Advantages />
    </section>
    <section id="reviews" class="screen section">
      <Reviews />
    </section>
    <section id="hero" class="screen section">
      <Hero />
    </section>
    <section id="faq" class="screen section">
      <FAQ />
    </section>
    <section id="contacts" class="screen section">
      <Contacts />
    </section>
  </main>
</template>

<style>
@import '@/styles/colors.css';
html,
body {
  height: 100%;
  margin: 0;
  overflow: hidden;
}

* {
  box-sizing: border-box;
}

.pages {
  height: 100svh;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  scroll-snap-type: y proximity;
  scroll-padding-top: var(--header-h);
  scroll-padding-bottom: 1px;
}

.screen {
  min-height: 100svh;
  scroll-snap-align: start;
  scroll-snap-stop: normal;
}

@supports (-webkit-touch-callout: none) {
  html {
    -webkit-text-size-adjust: 100%;
  }
}

@media (max-width: 900px) {

  input,
  textarea,
  select {
    font-size: 16px !important;
  }
}

.logo, .logo a, .logo img {
    background: none !important;
}
</style>
