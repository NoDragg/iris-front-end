<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore, escapeHtml, fmtDateLang } from '../stores/store'

const { t } = useI18n()
const store = useStore()

const filter = ref('all')

const filteredEvents = computed(() => {
  const now = new Date()
  let events = store.store.events.filter(ev => new Date(ev.date + 'T' + ev.endTime) < now)
  if (filter.value !== 'all') events = events.filter(ev => ev.type === filter.value)
  return events.sort((a, b) => new Date(b.date + 'T' + b.startTime) - new Date(a.date + 'T' + a.startTime))
})

const colorMap = {
  Practice: 'var(--green-ok)',
  Scrim: 'var(--red-bright)',
  Tournament: 'var(--gold)',
  Meeting: '#8c9bff',
  Rest: '#9aa0ab'
}

function getParticipantNames(participants) {
  return participants.map(pid => store.store.members.find(m => m.id === pid)?.name).filter(Boolean).join(', ')
}
</script>

<template>
  <section class="view active">
    <div class="view-head">
      <div>
        <p class="eyebrow">{{ t('log') }}</p>
        <h2>{{ t('event_history') }}</h2>
      </div>
      <select class="member-select" v-model="filter">
        <option value="all">{{ t('all_types') }}</option>
        <option value="Practice">Practice</option>
        <option value="Scrim">Scrim</option>
        <option value="Tournament">Tournament</option>
        <option value="Meeting">Meeting</option>
        <option value="Rest">Rest</option>
      </select>
    </div>

    <div v-if="filteredEvents.length === 0" class="history-empty">{{ t('no_history') }}</div>

    <div class="history-list">
      <div v-for="ev in filteredEvents" :key="ev.id" class="history-item" :style="{ borderLeftColor: colorMap[ev.type] || 'var(--border-hair-2)' }">
        <div class="h-date">{{ fmtDateLang(ev.date, store.lang) }}</div>
        <div style="flex:1">
          <div class="h-title">
            <span v-html="escapeHtml(ev.title)"></span>
            <span style="color:var(--text-dim);font-weight:400"> · {{ ev.type }}</span>
          </div>
          <div class="h-meta">
            {{ ev.startTime }}–{{ ev.endTime }}
            <template v-if="ev.location"> · <span v-html="escapeHtml(ev.location)"></span></template>
            <template v-if="ev.participants?.length"> · {{ getParticipantNames(ev.participants) }}</template>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
