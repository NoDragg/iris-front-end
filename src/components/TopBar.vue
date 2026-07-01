<script setup>
import { useI18n } from 'vue-i18n'
import { useStore } from '../stores/store'
import { setLocale } from '../i18n'

const { t } = useI18n()
const store = useStore()

function changeLang(e) {
  setLocale(e.target.value)
}
</script>

<template>
  <header class="topbar">
    <div class="brand">
      <div class="brand-info">
        <div class="brand-mark">
          <span class="aperture-ring"></span>
          <img src="/src/assets/logo.svg" alt="Iris logo" class="brand-logo">
        </div>
        <div class="brand-text">
          <h1>IRIS</h1>
          <p>{{ t('brand_sub') }}</p>
        </div>
      </div>
      <div class="lang-selector-wrap">
        <select class="lang-select" :value="$i18n.locale" @change="changeLang">
          <option value="vi">Tiếng Việt</option>
          <option value="en">English</option>
          <option value="de">Deutsch</option>
          <option value="sl">Slovenščina</option>
          <option value="sv">Svenska</option>
        </select>
      </div>
    </div>
    <nav class="tabs">
      <button class="tab-btn" :class="{ active: store.activeTab === 'overview' }" @click="store.setTab('overview')">
        {{ t('overview') }}
      </button>
      <button class="tab-btn" :class="{ active: store.activeTab === 'schedule' }" @click="store.setTab('schedule')">
        {{ t('schedule') }}
      </button>
      <button class="tab-btn" :class="{ active: store.activeTab === 'addscrim' }" @click="store.setTab('addscrim')">
        {{ t('addscrim') }}
      </button>
      <button class="tab-btn" :class="{ active: store.activeTab === 'profile' }" @click="store.setTab('profile')">
        {{ t('profile') }}
      </button>
      <button class="tab-btn" :class="{ active: store.activeTab === 'history' }" @click="store.setTab('history')">
        {{ t('history') }}
      </button>
    </nav>
  </header>
</template>
