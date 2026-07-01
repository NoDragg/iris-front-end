<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore, addDays, isoDate, mondayOf, escapeHtml } from '../stores/store'

const { t } = useI18n()
const store = useStore()

const startHour = ref(9)
const endHour = ref(17)

const member = computed(() => store.store.members.find(m => m.id === store.currentAvailMemberId))
const weekKey = computed(() => isoDate(store.weekStart))
const days = computed(() => Array.from({ length: 7 }, (_, i) => addDays(store.weekStart, i)))

const modalSub = computed(() => {
  if (!member.value || store.currentAvailDayIndex === undefined) return ''
  const d = days.value[store.currentAvailDayIndex]
  const dayName = t('day_names')[store.currentAvailDayIndex]
  return `${t('member_col')}: ${member.value.name} | ${dayName}, ${d.toLocaleDateString(store.lang === 'vi' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
})

watch(() => store.showAvailabilityModal, (show) => {
  if (show && store.currentAvailMemberId && store.currentAvailDayIndex !== undefined) {
    const avail = store.getAvailability(weekKey.value, store.currentAvailMemberId, store.currentAvailDayIndex)
    startHour.value = avail?.start ?? 9
    endHour.value = avail?.end ?? 17
  }
})

function closeModal() {
  store.showAvailabilityModal = false
  store.currentAvailMemberId = null
  store.currentAvailDayIndex = undefined
}

function save() {
  if (endHour.value <= startHour.value) {
    alert(t('err_time_range'))
    return
  }
  store.setAvailability(weekKey.value, store.currentAvailMemberId, store.currentAvailDayIndex, startHour.value, endHour.value)
  closeModal()
}

function clear() {
  store.clearAvailability(weekKey.value, store.currentAvailMemberId, store.currentAvailDayIndex)
  closeModal()
}

function generateHourOptions() {
  return Array.from({ length: 25 }, (_, i) => ({ value: i, label: String(i).padStart(2, '0') + ':00' }))
}
</script>

<template>
  <Teleport to="body">
    <div v-if="store.showAvailabilityModal" class="modal-overlay active" @click.self="closeModal">
      <div class="modal modal-sm">
        <button class="modal-close" @click="closeModal">×</button>
        <h3>{{ t('edit_availability') }}</h3>
        <p style="color:var(--text-muted);font-size:13px;margin:-10px 0 20px 0">{{ modalSub }}</p>
        <form @submit.prevent="save">
          <div class="form-row">
            <label>{{ t('start_hour') }}</label>
            <select class="lang-select" v-model="startHour" style="width:100%">
              <option v-for="h in generateHourOptions()" :key="h.value" :value="h.value">{{ h.label }}</option>
            </select>
          </div>
          <div class="form-row">
            <label>{{ t('end_hour') }}</label>
            <select class="lang-select" v-model="endHour" style="width:100%">
              <option v-for="h in generateHourOptions()" :key="h.value" :value="h.value">{{ h.label }}</option>
            </select>
          </div>
          <div class="form-actions" style="margin-top:20px;display:flex;gap:10px;justify-content:flex-end">
            <button type="button" class="btn btn-ghost" @click="clear">{{ t('clear') }}</button>
            <button type="submit" class="btn btn-primary">{{ t('save') }}</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
