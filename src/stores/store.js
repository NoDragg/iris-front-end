import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import api from '../api'
import { i18n } from '../i18n'

// Nguồn dịch duy nhất là i18n (front-end/src/i18n). Store chỉ mượn t() cho toast.
const t = (key, params) => i18n.global.t(key, params)

export const useStore = defineStore('iris', () => {
  const members = ref([])
  const events = ref([])
  const availabilities = reactive({})
  const activeTab = ref('overview')
  const weekStart = ref(mondayOf(new Date()))
  const selectedProfileId = ref(null)
  const currentVodMemberId = ref(null)
  const scheduleMode = ref('availability')
  const toast = ref(null)
  const showVodModal = ref(false)
  const showMemberModal = ref(false)
  const showAvailabilityModal = ref(false)
  const editMemberId = ref('')
  const editMemberName = ref('')
  const editMemberRole = ref('')
  const editEventId = ref(null)
  const currentAvailMemberId = ref(null)
  const currentAvailDayIndex = ref(undefined)
  const loading = ref(false)
  const error = ref(null)

  function toastShow(msg) {
    toast.value = msg
    setTimeout(() => { toast.value = null }, 2200)
  }

  function setTab(tab) { activeTab.value = tab }

  function uid(prefix) {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
  }

  // Load all data from API
  async function loadAll() {
    loading.value = true
    error.value = null
    try {
      const [membersData, eventsData] = await Promise.all([
        api.getMembers(),
        api.getEvents()
      ])
      members.value = membersData || []
      events.value = eventsData || []
      if (members.value.length && !selectedProfileId.value) {
        selectedProfileId.value = members.value[0].id
      }
      // Fetch availabilities for current week + next week
      await loadAllAvailabilities()
    } catch (e) {
      console.error('Load error:', e)
      error.value = t('error')
    } finally {
      loading.value = false
    }
  }

  async function loadAllAvailabilities() {
    try {
      const week1 = isoDate(weekStart.value)
      const week2 = isoDate(addDays(weekStart.value, 7))
      const [avail1, avail2] = await Promise.all([
        api.getAvailability(week1),
        api.getAvailability(week2)
      ])
      mergeAvailability(avail1, week1)
      mergeAvailability(avail2, week2)
    } catch (e) {
      console.error('Load availability error:', e)
    }
  }

  function mergeAvailability(data, weekKey) {
    if (!data) return
    // Backend returns { weekKey, members: [{ memberId, slots: [{dayIndex, start, end}] }] }
    const list = data.members || (Array.isArray(data) ? data : [])
    list.forEach(item => {
      if (!availabilities[weekKey]) availabilities[weekKey] = {}
      if (!availabilities[weekKey][item.memberId]) availabilities[weekKey][item.memberId] = {}
      ;(item.slots || []).forEach(slot => {
        availabilities[weekKey][item.memberId][slot.dayIndex] = { start: slot.start ?? slot.startHour, end: slot.end ?? slot.endHour }
      })
    })
  }

  // Members
  async function addMember(name, role) {
    try {
      const newMember = await api.createMember({ name, role })
      members.value.push(newMember)
      toastShow(t('toast_member_added'))
      return newMember
    } catch (e) {
      console.error('Add member error:', e)
      toastShow(t('error'))
    }
  }

  async function updateMember(id, name, role) {
    try {
      const updated = await api.updateMember(id, { name, role })
      const idx = members.value.findIndex(m => m.id === id)
      if (idx >= 0) members.value[idx] = updated
      toastShow(t('toast_member_updated'))
    } catch (e) {
      console.error('Update member error:', e)
    }
  }

  async function deleteMember(id) {
    try {
      await api.deleteMember(id)
      members.value = members.value.filter(m => m.id !== id)
      events.value.forEach(ev => {
        ev.participants = (ev.participants || []).filter(pid => pid !== id)
      })
      toastShow(t('toast_member_deleted'))
    } catch (e) {
      console.error('Delete member error:', e)
    }
  }

  function getMemberById(id) { return members.value.find(m => m.id === id) }

  // Lazy-load review/vod của 1 member (getMembers không trả kèm)
  async function loadMemberDetails(id) {
    const m = getMemberById(id)
    if (!m) return
    try {
      const [leader, coach, peer, vods] = await Promise.all([
        api.getLeaderNotes(id),
        api.getCoachNotes(id),
        api.getPeerFeedback(id),
        api.getVods(id)
      ])
      m.leaderNotes = leader || []
      m.coachNotes = coach || []
      m.peerFeedback = peer || []
      m.vods = vods || []
    } catch (e) {
      console.error('Load member details error:', e)
    }
  }

  function updateProfileMeta(id, field, value) {
    const m = getMemberById(id)
    if (m) m[field] = field === 'age' ? parseInt(value) || null : value
  }

  async function uploadAvatar(id, file) {
    try {
      const res = await api.uploadAvatar(id, file)
      const m = getMemberById(id)
      if (m && res.avatarUrl) m.avatarUrl = res.avatarUrl
      toastShow(t('toast_member_updated'))
    } catch (e) {
      console.error('Upload avatar error:', e)
    }
  }

  function updateProfileStats(id, stats) {
    const m = getMemberById(id)
    if (m && m.stats) {
      Object.assign(m.stats, stats)
    }
  }

  async function updateStats(id, stats) {
    try {
      const updated = await api.updateStats(id, stats)
      const idx = members.value.findIndex(m => m.id === id)
      if (idx >= 0) members.value[idx] = updated
    } catch (e) {
      console.error('Update stats error:', e)
    }
  }

  // VODs
  async function addVod(memberId, title, url, date) {
    try {
      const vod = await api.addVod(memberId, { title, url, date })
      const m = getMemberById(memberId)
      if (m) {
        m.vods = m.vods || []
        m.vods.unshift(vod)
      }
      toastShow(t('toast_vod_sent'))
    } catch (e) {
      console.error('Add VOD error:', e)
    }
  }

  async function deleteVod(memberId, vodId) {
    try {
      await api.deleteVod(vodId)
      const m = getMemberById(memberId)
      if (m) m.vods = m.vods.filter(v => v.id !== vodId)
    } catch (e) {
      console.error('Delete VOD error:', e)
    }
  }

  // Events
  async function addEvent(payload) {
    try {
      const newEvent = await api.createEvent(payload)
      events.value.push(newEvent)
      toastShow(t('toast_event_added'))
    } catch (e) {
      console.error('Add event error:', e)
    }
  }

  async function updateEvent(id, payload) {
    try {
      const updated = await api.updateEvent(id, payload)
      const idx = events.value.findIndex(e => e.id === id)
      if (idx >= 0) events.value[idx] = updated
      toastShow(t('toast_event_updated'))
    } catch (e) {
      console.error('Update event error:', e)
    }
  }

  async function deleteEvent(id) {
    try {
      await api.deleteEvent(id)
      events.value = events.value.filter(e => e.id !== id)
      toastShow(t('toast_event_deleted'))
    } catch (e) {
      console.error('Delete event error:', e)
    }
  }

  function getEventById(id) { return events.value.find(e => e.id === id) }

  // Availability
  async function setAvailability(weekKey, memberId, dayIndex, start, end) {
    try {
      await api.setAvailability(memberId, {
        week: weekKey,
        slots: [{ dayIndex, startHour: start, endHour: end }]
      })
      if (!availabilities[weekKey]) availabilities[weekKey] = {}
      if (!availabilities[weekKey][memberId]) availabilities[weekKey][memberId] = {}
      availabilities[weekKey][memberId][dayIndex] = { start, end }
      toastShow(t('toast_availability_updated'))
    } catch (e) {
      console.error('Set availability error:', e)
    }
  }

  async function clearAvailability(weekKey, memberId, dayIndex) {
    try {
      await api.deleteAvailabilitySlot(memberId, dayIndex, weekKey)
      if (availabilities[weekKey]?.[memberId]?.[dayIndex]) {
        delete availabilities[weekKey][memberId][dayIndex]
      }
      toastShow(t('toast_availability_cleared'))
    } catch (e) {
      console.error('Clear availability error:', e)
    }
  }

  function getAvailability(weekKey, memberId, dayIndex) {
    return availabilities[weekKey]?.[memberId]?.[dayIndex]
  }

  // Notes
  async function addLeaderNote(memberId, text) {
    try {
      const note = await api.addLeaderNote(memberId, { text })
      const m = getMemberById(memberId)
      if (m) {
        m.leaderNotes = m.leaderNotes || []
        m.leaderNotes.push(note)
      }
    } catch (e) {
      console.error('Add leader note error:', e)
    }
  }

  async function deleteLeaderNote(memberId, noteId) {
    try {
      await api.deleteLeaderNote(noteId)
      const m = getMemberById(memberId)
      if (m) m.leaderNotes = m.leaderNotes.filter(n => n.id !== noteId)
    } catch (e) {
      console.error('Delete leader note error:', e)
    }
  }

  async function addCoachNote(memberId, text, status) {
    try {
      const note = await api.addCoachNote(memberId, { text, status })
      const m = getMemberById(memberId)
      if (m) {
        m.coachNotes = m.coachNotes || []
        m.coachNotes.push(note)
      }
    } catch (e) {
      console.error('Add coach note error:', e)
    }
  }

  async function deleteCoachNote(memberId, noteId) {
    try {
      await api.deleteCoachNote(noteId)
      const m = getMemberById(memberId)
      if (m) m.coachNotes = m.coachNotes.filter(n => n.id !== noteId)
    } catch (e) {
      console.error('Delete coach note error:', e)
    }
  }

  async function addPeerFeedback(memberId, authorId, authorName, status, strengths, improve) {
    try {
      const feedback = await api.addPeerFeedback(memberId, { authorId, authorName, status, strengths, improve })
      const m = getMemberById(memberId)
      if (m) {
        m.peerFeedback = m.peerFeedback || []
        m.peerFeedback.push(feedback)
      }
    } catch (e) {
      console.error('Add peer feedback error:', e)
    }
  }

  async function deletePeerFeedback(memberId, feedbackId) {
    try {
      await api.deletePeerFeedback(feedbackId)
      const m = getMemberById(memberId)
      if (m) m.peerFeedback = m.peerFeedback.filter(p => p.id !== feedbackId)
    } catch (e) {
      console.error('Delete peer feedback error:', e)
    }
  }

  async function saveProfile(memberId) {
    const m = getMemberById(memberId)
    if (!m) return
    try {
      const updated = await api.updateMember(memberId, {
        name: m.name,
        role: m.role,
        position: m.position,
        age: m.age,
        location: m.location,
        rank: m.rank,
        stats: m.stats
      })
      const idx = members.value.findIndex(mem => mem.id === memberId)
      if (idx >= 0) members.value[idx] = updated
      toastShow(t('toast_member_updated'))
    } catch (e) {
      console.error('Save profile error:', e)
    }
  }

  return {
    members, events, availabilities, activeTab, weekStart, selectedProfileId,
    currentVodMemberId, scheduleMode, toast,
    showVodModal, showMemberModal, showAvailabilityModal,
    editMemberId, editMemberName, editMemberRole, editEventId,
    currentAvailMemberId, currentAvailDayIndex,
    loading, error,
    setTab, uid, loadAll, loadAllAvailabilities, toastShow,
    addMember, updateMember, deleteMember, getMemberById, loadMemberDetails, updateStats,
    addVod, deleteVod,
    addEvent, updateEvent, deleteEvent, getEventById,
    setAvailability, clearAvailability, getAvailability,
    addLeaderNote, deleteLeaderNote,
    addCoachNote, deleteCoachNote,
    addPeerFeedback, deletePeerFeedback,
    updateProfileMeta, updateProfileStats,
    uploadAvatar,
    saveProfile
  }
})

function mondayOf(d) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = (day === 0 ? -6 : 1 - day)
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

export { mondayOf }
export function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r }
export function isoDate(d) {
  const dd = new Date(d)
  return `${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, '0')}-${String(dd.getDate()).padStart(2, '0')}`
}
export function sameDate(a, b) { return isoDate(a) === isoDate(b) }

export function fmtRange(start, lang) {
  const end = addDays(start, 6)
  const locales = { vi: 'vi-VN', en: 'en-US' }
  const opts = { month: 'short', day: 'numeric' }
  return `${start.toLocaleDateString(locales[lang] || 'en-US', opts)} – ${end.toLocaleDateString(locales[lang] || 'en-US', opts)}, ${end.getFullYear()}`
}

export function fmtDateLang(iso, lang) {
  const d = new Date(iso + 'T00:00:00')
  const locales = { vi: 'vi-VN', en: 'en-US' }
  return d.toLocaleDateString(locales[lang] || 'en-US', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}
