<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore, addDays, isoDate, mondayOf, escapeHtml } from '../stores/store'

const { t } = useI18n()
const store = useStore()

const days = computed(() => Array.from({ length: 7 }, (_, i) => addDays(store.weekStart, i)))
const weekKey = computed(() => isoDate(store.weekStart))
const today = new Date()

function prevWeek() { store.weekStart = addDays(store.weekStart, -7) }
function nextWeek() { store.weekStart = addDays(store.weekStart, 7) }
function goToday() { store.weekStart = mondayOf(new Date()) }

function openAvailabilityModal(memberId, dayIndex) {
  store.currentAvailMemberId = memberId
  store.currentAvailDayIndex = dayIndex
  store.showAvailabilityModal = true
}

function getAvailability(memberId, dayIndex) {
  return store.getAvailability(weekKey.value, memberId, dayIndex)
}

function editEvent(eventId) {
  store.setTab('addscrim')
  store.editEventId = eventId
}

const CAL_START_HOUR = 6
const CAL_END_HOUR = 24
const PX_PER_HOUR = 60
const totalHeight = (CAL_END_HOUR - CAL_START_HOUR) * PX_PER_HOUR

function getEventStyle(ev) {
  const [sh, sm] = ev.startTime.split(':').map(Number)
  const [eh, em] = ev.endTime.split(':').map(Number)
  let top = (sh + sm / 60 - CAL_START_HOUR) * PX_PER_HOUR
  let bottom = (eh + em / 60 - CAL_START_HOUR) * PX_PER_HOUR
  top = Math.max(0, top)
  bottom = Math.min(totalHeight, bottom)
  const height = Math.max(20, bottom - top)
  return { position: 'absolute', top: top + 'px', height: height + 'px', left: '3px', right: '3px' }
}

function fmtRange(start, locale) {
  const end = addDays(start, 6)
  return `${start.toLocaleDateString(locale, { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(locale, { month: 'short', day: 'numeric' })}, ${end.getFullYear()}`
}

const locale = computed(() => store.lang === 'vi' ? 'vi-VN' : 'en-US')
</script>

<template>
  <section class="view active">
    <div class="view-head">
      <div>
        <p class="eyebrow">{{ t('this_week') }}</p>
        <h2>{{ t('schedule_events') }}</h2>
      </div>
    </div>

    <div class="cal-toolbar">
      <div class="cal-toolbar-left">
        <button class="btn btn-ghost" @click="goToday">{{ t('today') }}</button>
        <button class="btn btn-icon" @click="prevWeek">‹</button>
        <button class="btn btn-icon" @click="nextWeek">›</button>
      </div>
      <div class="cal-range">{{ fmtRange(store.weekStart, locale).toUpperCase() }}</div>
      <div class="schedule-mode-toggle">
        <button class="btn btn-toggle" :class="{ active: store.scheduleMode === 'availability' }" @click="store.scheduleMode = 'availability'">
          {{ t('availability_view') }}
        </button>
        <button class="btn btn-toggle" :class="{ active: store.scheduleMode === 'events' }" @click="store.scheduleMode = 'events'">
          {{ t('events_view') }}
        </button>
      </div>
    </div>

    <div class="calendar-wrap">
      <!-- Availability Grid -->
      <div v-if="store.scheduleMode === 'availability'" class="avail-grid">
        <div class="avail-head-cell">{{ t('member_col') }}</div>
        <template v-for="(d, i) in days" :key="i">
          <div class="avail-head-cell">
            <div>{{ t('day_names')[i] }}</div>
            <div style="font-size:10px;font-weight:normal;margin-top:2px;color:var(--text-muted)">
              {{ d.toLocaleDateString(locale, { month: 'short', day: 'numeric' }) }}
            </div>
          </div>
        </template>

        <template v-if="store.store.members.length === 0">
          <div class="vod-empty" style="grid-column:1/-1;padding:40px 0">{{ t('no_members') }}</div>
        </template>
        <template v-else>
          <template v-for="m in store.store.members" :key="m.id">
            <div class="avail-row-header" @click="store.currentVodMemberId = m.id; store.showVodModal = true">
              <div v-html="escapeHtml(m.name)"></div>
              <span v-html="escapeHtml(m.role)"></span>
            </div>
            <template v-for="(d, i) in days" :key="i">
              <div class="avail-cell" @click="openAvailabilityModal(m.id, i)">
                <template v-if="getAvailability(m.id, i)">
                  <span class="avail-time-slot">
                    {{ String(getAvailability(m.id, i).start).padStart(2, '0') }}:00 – {{ String(getAvailability(m.id, i).end).padStart(2, '0') }}:00
                  </span>
                </template>
                <template v-else>
                  <span class="avail-time-slot not-set">{{ t('not_set') }}</span>
                </template>
              </div>
            </template>
          </template>
        </template>
      </div>

      <!-- Events Calendar -->
      <div v-else class="calendar-grid">
        <div class="cal-corner"></div>
        <template v-for="(d, i) in days" :key="i">
          <div class="cal-day-head" :class="{ today: isoDate(d) === isoDate(today) }">
            <div class="dow">{{ t('day_names')[i] }}</div>
            <div class="dom">{{ d.toLocaleDateString(locale, { month: 'short', day: 'numeric' }) }}</div>
          </div>
        </template>

        <div :style="{ position: 'relative', height: totalHeight + 'px' }">
          <template v-for="h in (CAL_END_HOUR - CAL_START_HOUR)" :key="h">
            <div class="cal-time-label" :style="{ position: 'absolute', top: ((h - 1) * PX_PER_HOUR - 7) + 'px', right: '8px', height: 'auto', border: 'none' }">
              {{ String(h + CAL_START_HOUR - 1).padStart(2, '0') }}:00
            </div>
          </template>
        </div>

        <template v-for="(d, di) in days" :key="di">
          <div class="cal-cell" :class="{ 'today-col': isoDate(d) === isoDate(today) }" :style="{ height: totalHeight + 'px' }">
            <template v-for="ev in store.store.events.filter(e => e.date === isoDate(d))" :key="ev.id">
              <div class="event-card" :class="'type-' + ev.type" :style="getEventStyle(ev)" @click="editEvent(ev.id)">
                <b v-html="escapeHtml(ev.title)"></b>
                <span>{{ ev.startTime }}–{{ ev.endTime }}</span>
              </div>
            </template>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>
