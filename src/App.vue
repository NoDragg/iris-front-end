<script setup>
import { onMounted } from 'vue'
import TopBar from './components/TopBar.vue'
import OverviewView from './components/OverviewView.vue'
import ScheduleView from './components/ScheduleView.vue'
import AddScrimView from './components/AddScrimView.vue'
import ProfileView from './components/ProfileView.vue'
import HistoryView from './components/HistoryView.vue'
import VODModal from './components/VODModal.vue'
import MemberModal from './components/MemberModal.vue'
import AvailabilityModal from './components/AvailabilityModal.vue'
import ToastNotification from './components/ToastNotification.vue'
import { useStore } from './stores/store'

const store = useStore()
onMounted(() => store.init())
</script>

<template>
  <div class="app">
    <TopBar />
    <main class="content">
      <OverviewView v-if="store.activeTab === 'overview'" />
      <ScheduleView v-else-if="store.activeTab === 'schedule'" />
      <AddScrimView v-else-if="store.activeTab === 'addscrim'" />
      <ProfileView v-else-if="store.activeTab === 'profile'" />
      <HistoryView v-else-if="store.activeTab === 'history'" />
    </main>
    <VODModal />
    <MemberModal />
    <AvailabilityModal />
    <ToastNotification />
  </div>
</template>
