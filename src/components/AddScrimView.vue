<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore, isoDate, escapeHtml } from '../stores/store'

const { t } = useI18n()
const store = useStore()

const eventId = ref('')
const form = ref({
  title: '',
  type: 'Practice',
  date: isoDate(new Date()),
  startTime: '09:00',
  endTime: '12:00',
  location: '',
  map: '',
  notes: '',
  participants: []
})

const mapPreview = ref('')

onMounted(() => {
  if (store.editEventId) {
    loadEvent(store.editEventId)
  }
})

watch(() => store.editEventId, (newId) => {
  if (newId) loadEvent(newId)
  else resetForm()
})

function loadEvent(id) {
  const ev = store.getEventById(id)
  if (ev) {
    eventId.value = ev.id
    form.value = {
      title: ev.title,
      type: ev.type,
      date: ev.date,
      startTime: ev.startTime,
      endTime: ev.endTime,
      location: ev.location || '',
      map: ev.map || '',
      notes: ev.notes || '',
      participants: [...(ev.participants || [])]
    }
    updateMapPreview()
  }
}

function resetForm() {
  eventId.value = ''
  form.value = { title: '', type: 'Practice', date: isoDate(new Date()), startTime: '09:00', endTime: '12:00', location: '', map: '', notes: '', participants: [] }
  mapPreview.value = ''
}

function updateMapPreview() {
  if (!form.value.map) { mapPreview.value = ''; return }
  const openMapLabel = store.lang === 'vi' ? 'Mở bản đồ trong tab mới ↗' : 'Open map in new tab ↗'
  if (/^https?:\/\//i.test(form.value.map)) {
    mapPreview.value = `<iframe src="${escapeHtml(form.value.map)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      <a href="${escapeHtml(form.value.map)}" target="_blank" rel="noopener">${openMapLabel}</a>`
  } else {
    const q = encodeURIComponent(form.value.map)
    const searchLabel = (store.lang === 'vi' ? 'Tìm' : 'Search') + ` "${escapeHtml(form.value.map)}" ` + (store.lang === 'vi' ? 'trên Google Maps ↗' : 'on Google Maps ↗')
    mapPreview.value = `<a href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener">${searchLabel}</a>`
  }
}

function toggleParticipant(id) {
  const idx = form.value.participants.indexOf(id)
  if (idx === -1) form.value.participants.push(id)
  else form.value.participants.splice(idx, 1)
}

function submit() {
  if (!form.value.title || !form.value.date || !form.value.startTime || !form.value.endTime) return
  if (eventId.value) {
    store.updateEvent(eventId.value, { ...form.value })
  } else {
    store.addEvent({ ...form.value })
  }
  store.editEventId = null
  resetForm()
  store.setTab('schedule')
}

function deleteEvent() {
  if (!eventId.value) return
  if (confirm(t('confirm_delete_event'))) {
    store.deleteEvent(eventId.value)
    store.editEventId = null
    resetForm()
    store.setTab('schedule')
  }
}
</script>

<template>
  <section class="view active">
    <div class="view-head">
      <div>
        <p class="eyebrow">{{ t('schedule_title') }}</p>
        <h2>{{ eventId ? t('edit_event') : t('add_new_event') }}</h2>
      </div>
    </div>
    <form class="scrim-form" @submit.prevent="submit">
      <input type="hidden" v-model="eventId">
      <div class="form-row">
        <label>{{ t('event_title') }}</label>
        <input type="text" v-model="form.title" :placeholder="t('event_title_placeholder')" required>
      </div>
      <div class="form-row two">
        <div>
          <label>{{ t('event_type') }}</label>
          <select v-model="form.type">
            <option value="Practice">{{ t('Practice') || 'Practice' }}</option>
            <option value="Scrim">{{ t('Scrim') || 'Scrim' }}</option>
            <option value="Tournament">{{ t('Tournament') || 'Tournament' }}</option>
            <option value="Meeting">{{ t('Meeting') || 'Meeting' }}</option>
            <option value="Rest">{{ t('Rest') || 'Rest' }}</option>
          </select>
        </div>
        <div>
          <label>{{ t('date') }}</label>
          <input type="date" v-model="form.date" required>
        </div>
      </div>
      <div class="form-row two">
        <div>
          <label>{{ t('start_time') }}</label>
          <input type="time" v-model="form.startTime" required>
        </div>
        <div>
          <label>{{ t('end_time') }}</label>
          <input type="time" v-model="form.endTime" required>
        </div>
      </div>
      <div class="form-row">
        <label>{{ t('location') }}</label>
        <input type="text" v-model="form.location" :placeholder="t('location_placeholder')">
      </div>
      <div class="form-row">
        <label>{{ t('map') }}</label>
        <input type="text" v-model="form.map" @input="updateMapPreview" placeholder="https://maps.google.com/...">
        <div class="map-preview" v-html="mapPreview"></div>
      </div>
      <div class="form-row">
        <label>{{ t('participants') }}</label>
        <div class="participant-picker">
          <template v-if="store.members.length === 0">
            <div class="vod-empty">{{ store.lang === 'vi' ? 'Chưa có thành viên' : 'No members' }}</div>
          </template>
          <template v-else>
            <div v-for="m in store.members" :key="m.id" class="chip" :class="{ selected: form.participants.includes(m.id) }" @click="toggleParticipant(m.id)">
              {{ m.name }}
            </div>
          </template>
        </div>
      </div>
      <div class="form-row">
        <label>{{ t('notes') }}</label>
        <textarea v-model="form.notes" rows="3" :placeholder="t('notes_placeholder')"></textarea>
      </div>
      <div class="form-actions">
        <button v-if="eventId" type="button" class="btn btn-danger" @click="deleteEvent">{{ t('delete_event') }}</button>
        <button type="submit" class="btn btn-primary">{{ t('save_view_schedule') }}</button>
      </div>
    </form>
  </section>
</template>
