<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore, addDays, isoDate, mondayOf, escapeHtml } from '../stores/store'

const { t, tm, locale } = useI18n()
const store = useStore()

const startTime = ref('09:00')
const endTime = ref('17:00')

function toHHMM(dec) {
  const h = Math.floor(dec)
  const m = Math.round((dec - h) * 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
function toDecimal(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h + m / 60
}

const member = computed(() => store.members.find(m => m.id === store.currentAvailMemberId))
const weekKey = computed(() => isoDate(store.weekStart))
const days = computed(() => Array.from({ length: 7 }, (_, i) => addDays(store.weekStart, i)))

const modalSub = computed(() => {
  if (!member.value || store.currentAvailDayIndex === undefined) return ''
  const d = days.value[store.currentAvailDayIndex]
  const dayName = (tm('day_names') || [])[store.currentAvailDayIndex]
  return `${t('member_col')}: ${member.value.name} | ${dayName}, ${d.toLocaleDateString(locale.value === 'vi' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
})

watch(() => store.showAvailabilityModal, (show) => {
  if (show && store.currentAvailMemberId && store.currentAvailDayIndex !== undefined) {
    const avail = store.getAvailability(weekKey.value, store.currentAvailMemberId, store.currentAvailDayIndex)
    startTime.value = toHHMM(avail?.start ?? 9)
    endTime.value = toHHMM(avail?.end ?? 17)
  }
})

function closeModal() {
  store.showAvailabilityModal = false
  store.currentAvailMemberId = null
  store.currentAvailDayIndex = undefined
}

function save() {
  const s = toDecimal(startTime.value)
  const e = toDecimal(endTime.value)
  if (e <= s) {
    alert(t('err_time_range'))
    return
  }
  store.setAvailability(weekKey.value, store.currentAvailMemberId, store.currentAvailDayIndex, s, e)
  closeModal()
}

function clear() {
  store.clearAvailability(weekKey.value, store.currentAvailMemberId, store.currentAvailDayIndex)
  closeModal()
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
            <input type="time" class="time-native" v-model="startTime" step="60">
          </div>
          <div class="form-row">
            <label>{{ t('end_hour') }}</label>
            <input type="time" class="time-native" v-model="endTime" step="60">
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

<style scoped>
.time-native {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  background: var(--bg-input);
  border: 1px solid var(--border-hair-2);
  border-radius: 8px;
  padding: 8px 12px;
}
.time-native:hover {
  border-color: var(--red-primary);
}
</style>
