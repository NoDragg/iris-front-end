import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const IRIS_STORE_KEY = 'iris_store_v1'

const TRANSLATIONS = {
  vi: {
    brand_sub: "Valorant Esports — Quản lý Đội tuyển",
    overview: "Tổng quan",
    schedule: "Lịch trình",
    addscrim: "Thêm sự kiện",
    profile: "Hồ sơ",
    history: "Lịch sử",
    vod_review: "Duyệt VOD",
    member_overview: "TỔNG QUAN THÀNH VIÊN",
    add_member: "+ Thêm thành viên",
    no_members: "Chưa có thành viên nào. Bấm \"+ Thêm thành viên\" để tạo hồ sơ VOD đầu tiên.",
    sent_vods: "VOD đã gửi",
    this_week: "Tuần này",
    schedule_events: "LỊCH TẬP & SỰ KIỆN",
    today: "Hôm nay",
    availability_view: "Giờ rảnh thành viên",
    events_view: "Sự kiện chung",
    member_col: "Thành viên",
    not_set: "Trống",
    edit_availability: "Cập nhật giờ rảnh",
    start_hour: "Giờ bắt đầu",
    end_hour: "Giờ kết thúc",
    save: "Lưu",
    clear: "Xóa",
    schedule_title: "Lên lịch",
    add_new_event: "THÊM SỰ KIỆN MỚI",
    edit_event: "CHỈNH SỬA SỰ KIỆN",
    event_title: "Tên sự kiện",
    event_type: "Loại sự kiện",
    date: "Ngày",
    start_time: "Giờ bắt đầu",
    end_time: "Giờ kết thúc",
    location: "Địa điểm",
    map: "Bản đồ (link Google Maps / mã nhúng)",
    participants: "Thành viên tham gia",
    notes: "Ghi chú",
    delete_event: "Xóa sự kiện",
    save_view_schedule: "Lưu & xem lịch",
    member_profile: "PROFILE THÀNH VIÊN",
    no_members_profile: "Chưa có thành viên nào.",
    change_avatar: "Đổi ảnh đại diện",
    age: "Tuổi",
    location_label: "Nơi ở",
    rank: "Rank",
    position: "Vị trí",
    aim: "Aim",
    gamesense: "Game Sense",
    teamwork: "Teamwork",
    communication: "Giao tiếp",
    leader_review: "Leader Review — chuyên môn",
    coach_review: "Coach Review — tâm lý & phong độ",
    peer_review: "Đánh giá từ đồng đội",
    no_notes: "Chưa có ghi chú.",
    no_peer_feedback: "Chưa có đánh giá từ đồng đội.",
    add_note: "Thêm ghi chú",
    add_feedback: "Thêm đánh giá",
    in_game_state: "Trạng thái trong trận",
    strengths: "Điểm mạnh",
    improve: "Điểm cần cải thiện",
    log: "Nhật ký",
    event_history: "LỊCH SỬ SỰ KIỆN",
    all_types: "Tất cả loại",
    no_history: "Chưa có sự kiện nào trong lịch sử.",
    video_title: "Tiêu đề video",
    video_link: "Link video (YouTube / Drive...)",
    send_vod: "Gửi VOD",
    edit_member_btn: "Sửa tên / role",
    delete_member_btn: "Xóa thành viên",
    edit_member_title: "Sửa thành viên",
    add_member_title: "Thêm thành viên",
    name: "Tên",
    role: "Role",
    toast_member_updated: "Đã cập nhật thành viên",
    toast_member_added: "Đã thêm thành viên mới",
    toast_event_updated: "Đã cập nhật sự kiện",
    toast_event_added: "Đã thêm sự kiện",
    toast_event_deleted: "Đã xóa sự kiện",
    toast_member_deleted: "Đã xóa thành viên",
    confirm_delete_member: "Xóa thành viên \"{name}\"? Toàn bộ VOD và hồ sơ liên quan sẽ bị xóa.",
    confirm_delete_event: "Xóa sự kiện này?",
    toast_availability_updated: "Đã cập nhật giờ rảnh",
    toast_availability_cleared: "Đã xóa giờ rảnh",
    toast_vod_sent: "Đã gửi VOD",
    event_title_placeholder: "vd. Scrim vs Paper Rex",
    location_placeholder: "vd. Gaming House / Online Server",
    notes_placeholder: "Ghi chú thêm cho sự kiện...",
    vod_title_placeholder: "Tiêu đề video (vd. Ranked Game 12/06)",
    vod_url_placeholder: "Link video (YouTube / Drive...)",
    role_placeholder: "vd. Duelist / IGL / Coach",
    leader_note_placeholder: "Nhận xét chuyên môn từ Leader...",
    coach_note_placeholder: "Nhận xét tâm lý / phong độ từ Coach...",
    peer_status_placeholder: "Trạng thái trong trận...",
    peer_strengths_placeholder: "Điểm mạnh",
    peer_improve_placeholder: "Điểm cần cải thiện",
    ok_status: "Ổn định",
    watch_status: "Cần theo dõi",
    alert_status: "Cảnh báo",
    err_time_range: "Giờ kết thúc phải lớn hơn giờ bắt đầu!",
    day_names: ['Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'CN']
  },
  en: {
    brand_sub: "Valorant Esports — Team Operations",
    overview: "Overview",
    schedule: "Schedule",
    addscrim: "Add Scrim",
    profile: "Profile",
    history: "History",
    vod_review: "VOD Review",
    member_overview: "MEMBER OVERVIEW",
    add_member: "+ Add Member",
    no_members: "No members yet. Click \"+ Add Member\" to create the first VOD profile.",
    sent_vods: "VODs submitted",
    this_week: "This week",
    schedule_events: "SCHEDULE & EVENTS",
    today: "Today",
    availability_view: "Member Availability",
    events_view: "General Events",
    member_col: "Member",
    not_set: "Empty",
    edit_availability: "Update Availability",
    start_hour: "Start Hour",
    end_hour: "End Hour",
    save: "Save",
    clear: "Clear",
    schedule_title: "Scheduling",
    add_new_event: "ADD NEW EVENT",
    edit_event: "EDIT EVENT",
    event_title: "Event Title",
    event_type: "Event Type",
    date: "Date",
    start_time: "Start Time",
    end_time: "End Time",
    location: "Location",
    map: "Map (Google Maps link / embed code)",
    participants: "Participants",
    notes: "Notes",
    delete_event: "Delete Event",
    save_view_schedule: "Save & View Schedule",
    member_profile: "MEMBER PROFILE",
    no_members_profile: "No members yet.",
    change_avatar: "Change Avatar",
    age: "Age",
    location_label: "Location",
    rank: "Rank",
    position: "Position",
    aim: "Aim",
    gamesense: "Game Sense",
    teamwork: "Teamwork",
    communication: "Communication",
    leader_review: "Leader Review — Technical",
    coach_review: "Coach Review — Psychology & Form",
    peer_review: "Peer Feedback",
    no_notes: "No notes yet.",
    no_peer_feedback: "No peer feedback yet.",
    add_note: "Add Note",
    add_feedback: "Add Feedback",
    in_game_state: "In-game state",
    strengths: "Strengths",
    improve: "Areas of improvement",
    log: "Log",
    event_history: "EVENT HISTORY",
    all_types: "All types",
    no_history: "No events in history.",
    video_title: "Video title",
    video_link: "Video link (YouTube / Drive...)",
    send_vod: "Send VOD",
    edit_member_btn: "Edit Name / Role",
    delete_member_btn: "Delete Member",
    edit_member_title: "Edit Member",
    add_member_title: "Add Member",
    name: "Name",
    role: "Role",
    toast_member_updated: "Member updated",
    toast_member_added: "New member added",
    toast_event_updated: "Event updated",
    toast_event_added: "Event added",
    toast_event_deleted: "Event deleted",
    toast_member_deleted: "Member deleted",
    confirm_delete_member: 'Delete member "{name}"? All VODs and profiles will be deleted.',
    confirm_delete_event: "Delete this event?",
    toast_availability_updated: "Availability updated",
    toast_availability_cleared: "Availability cleared",
    toast_vod_sent: "VOD submitted",
    event_title_placeholder: "e.g., Scrim vs Paper Rex",
    location_placeholder: "e.g., Gaming House / Online Server",
    notes_placeholder: "Additional notes...",
    vod_title_placeholder: "Video title (e.g. Ranked Game 12/06)",
    vod_url_placeholder: "Video URL (YouTube / Drive...)",
    role_placeholder: "e.g. Duelist / IGL / Coach",
    leader_note_placeholder: "Technical feedback from Leader...",
    coach_note_placeholder: "Psychology/form feedback from Coach...",
    peer_status_placeholder: "In-game state...",
    peer_strengths_placeholder: "Strengths",
    peer_improve_placeholder: "Areas of improvement",
    ok_status: "Stable",
    watch_status: "Needs Monitoring",
    alert_status: "Warning",
    err_time_range: "End hour must be greater than start hour!",
    day_names: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  }
}

export const useStore = defineStore('iris', () => {
  const store = ref(loadStore())
  const activeTab = ref('overview')
  const weekStart = ref(mondayOf(new Date()))
  const selectedProfileId = ref(null)
  const currentVodMemberId = ref(null)
  const lang = ref(localStorage.getItem('iris_lang') || 'vi')
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

  const t = (key) => TRANSLATIONS[lang.value]?.[key] || TRANSLATIONS['en']?.[key] || key

  function toastShow(msg) {
    toast.value = msg
    setTimeout(() => { toast.value = null }, 2200)
  }

  function setTab(tab) { activeTab.value = tab }

  function setLang(newLang) {
    lang.value = newLang
    localStorage.setItem('iris_lang', newLang)
  }

  function saveStore() {
    localStorage.setItem(IRIS_STORE_KEY, JSON.stringify(store.value))
  }

  function uid(prefix) {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
  }

  function init() {
    selectedProfileId.value = store.value.members.length ? store.value.members[0].id : null
  }

  // Members
  function addMember(name, role) {
    store.value.members.push({
      id: uid('mem'), name, role, avatar: '', age: '', location: '', rank: '', position: role,
      stats: { aim: 50, gameSense: 50, teamwork: 50, communication: 50 },
      leaderNotes: [], coachNotes: [], peerFeedback: [], vods: []
    })
    saveStore()
    toastShow(t('toast_member_added'))
  }

  function updateMember(id, name, role) {
    const m = store.value.members.find(x => x.id === id)
    if (m) { m.name = name; m.role = role; saveStore(); toastShow(t('toast_member_updated')) }
  }

  function deleteMember(id) {
    store.value.members = store.value.members.filter(x => x.id !== id)
    store.value.events.forEach(ev => { ev.participants = (ev.participants || []).filter(pid => pid !== id) })
    Object.keys(store.value.availabilities).forEach(weekKey => {
      if (store.value.availabilities[weekKey]?.[id]) delete store.value.availabilities[weekKey][id]
    })
    saveStore()
    toastShow(t('toast_member_deleted'))
  }

  function getMemberById(id) { return store.value.members.find(x => x.id === id) }

  // VODs
  function addVod(memberId, title, url) {
    const m = getMemberById(memberId)
    if (m) {
      m.vods = m.vods || []
      m.vods.push({ id: uid('vod'), title, url, date: isoDate(new Date()) })
      saveStore()
      toastShow(t('toast_vod_sent'))
    }
  }

  function deleteVod(memberId, vodId) {
    const m = getMemberById(memberId)
    if (m) { m.vods = m.vods.filter(v => v.id !== vodId); saveStore() }
  }

  // Events
  function addEvent(payload) {
    store.value.events.push({ id: uid('evt'), ...payload })
    saveStore()
    toastShow(t('toast_event_added'))
  }

  function updateEvent(id, payload) {
    const ev = store.value.events.find(x => x.id === id)
    if (ev) { Object.assign(ev, payload); saveStore(); toastShow(t('toast_event_updated')) }
  }

  function deleteEvent(id) {
    store.value.events = store.value.events.filter(x => x.id !== id)
    saveStore()
    toastShow(t('toast_event_deleted'))
  }

  function getEventById(id) { return store.value.events.find(x => x.id === id) }

  // Availability
  function setAvailability(weekKey, memberId, dayIndex, start, end) {
    if (!store.value.availabilities[weekKey]) store.value.availabilities[weekKey] = {}
    if (!store.value.availabilities[weekKey][memberId]) store.value.availabilities[weekKey][memberId] = {}
    store.value.availabilities[weekKey][memberId][dayIndex] = { start, end }
    saveStore()
    toastShow(t('toast_availability_updated'))
  }

  function clearAvailability(weekKey, memberId, dayIndex) {
    if (store.value.availabilities[weekKey]?.[memberId]?.[dayIndex]) {
      delete store.value.availabilities[weekKey][memberId][dayIndex]
      if (!Object.keys(store.value.availabilities[weekKey][memberId]).length) delete store.value.availabilities[weekKey][memberId]
      if (!Object.keys(store.value.availabilities[weekKey]).length) delete store.value.availabilities[weekKey]
      saveStore()
      toastShow(t('toast_availability_cleared'))
    }
  }

  function getAvailability(weekKey, memberId, dayIndex) {
    return store.value.availabilities[weekKey]?.[memberId]?.[dayIndex]
  }

  // Profile
  function updateProfileMeta(id, field, value) {
    const m = getMemberById(id)
    if (m) { m[field] = value; saveStore() }
  }

  function updateProfileStats(id, stats) {
    const m = getMemberById(id)
    if (m) { m.stats = { ...m.stats, ...stats }; saveStore() }
  }

  async function uploadAvatar(id, file) {
    try {
      const res = await api.uploadAvatar(id, file)
      const m = getMemberById(id)
      if (m && res.avatarUrl) { m.avatarUrl = res.avatarUrl; saveStore() }
    } catch (e) {
      console.error('Upload avatar error', e)
    }
  }

  function addLeaderNote(memberId, text) {
    const m = getMemberById(memberId)
    if (m) { m.leaderNotes.push({ id: uid('note'), text, date: isoDate(new Date()) }); saveStore() }
  }

  function deleteLeaderNote(memberId, noteId) {
    const m = getMemberById(memberId)
    if (m) { m.leaderNotes = m.leaderNotes.filter(n => n.id !== noteId); saveStore() }
  }

  function addCoachNote(memberId, text, status) {
    const m = getMemberById(memberId)
    if (m) { m.coachNotes.push({ id: uid('note'), text, status, date: isoDate(new Date()) }); saveStore() }
  }

  function deleteCoachNote(memberId, noteId) {
    const m = getMemberById(memberId)
    if (m) { m.coachNotes = m.coachNotes.filter(n => n.id !== noteId); saveStore() }
  }

  function addPeerFeedback(memberId, authorId, authorName, status, strengths, improve) {
    const m = getMemberById(memberId)
    if (m) {
      m.peerFeedback.push({ id: uid('peer'), authorId, authorName, status, strengths, improve, date: isoDate(new Date()) })
      saveStore()
    }
  }

  function deletePeerFeedback(memberId, feedbackId) {
    const m = getMemberById(memberId)
    if (m) { m.peerFeedback = m.peerFeedback.filter(p => p.id !== feedbackId); saveStore() }
  }

  return {
    store, activeTab, weekStart, selectedProfileId, currentVodMemberId, lang, scheduleMode, toast,
    showVodModal, showMemberModal, showAvailabilityModal,
    editMemberId, editMemberName, editMemberRole, editEventId,
    currentAvailMemberId, currentAvailDayIndex,
    t, setTab, setLang, saveStore, uid,
    init, toastShow,
    addMember, updateMember, deleteMember, getMemberById,
    addVod, deleteVod,
    addEvent, updateEvent, deleteEvent, getEventById,
    setAvailability, clearAvailability, getAvailability,
    updateProfileMeta, updateProfileStats,
    addLeaderNote, deleteLeaderNote,
    addCoachNote, deleteCoachNote,
    addPeerFeedback, deletePeerFeedback,
    uploadAvatar
  }
})

function loadStore() {
  try {
    const raw = localStorage.getItem(IRIS_STORE_KEY)
    if (!raw) return defaultStore()
    const parsed = JSON.parse(raw)
    if (!parsed.members) parsed.members = []
    if (!parsed.events) parsed.events = []
    if (!parsed.availabilities) parsed.availabilities = {}
    return parsed
  } catch (e) {
    console.error('Iris store load error', e)
    return defaultStore()
  }
}

function defaultStore() {
  return { members: [], events: [], availabilities: {} }
}

function mondayOf(d) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = (day === 0 ? -6 : 1 - day)
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

export function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r }
export { mondayOf }
export function isoDate(d) { return d.toISOString().slice(0, 10) }
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
