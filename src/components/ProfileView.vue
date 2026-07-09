<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore, escapeHtml } from '../stores/store-api'

const { t } = useI18n()
const store = useStore()

const selectedId = ref('')

watch(() => store.members, () => {
  if (!selectedId.value || !store.members.find(m => m.id === selectedId.value)) {
    selectedId.value = store.members[0]?.id || ''
  }
}, { immediate: true })

const member = computed(() => store.members.find(m => m.id === selectedId.value))
const otherMembers = computed(() => store.members.filter(m => m.id !== selectedId.value))

function updateMeta(field, value) {
  if (member.value) store.updateProfileMeta(member.value.id, field, value)
}

function updateStat(key, value) {
  if (member.value) {
    store.updateProfileStats(member.value.id, { [key]: value })
  }
}

// ── Avatar cropper ──────────────────────────────────────────────
const OUT_SIZE = 160        // ảnh xuất ra (px)
const BOX = 280             // khung crop hiển thị (px)
const cropOpen = ref(false)
const cropSrc = ref('')     // dataURL ảnh gốc
const cropName = ref('')
const uploading = ref(false)
const zoom = ref(1)         // hệ số scale thêm trên minScale
const offset = ref({ x: 0, y: 0 })   // dịch tâm ảnh (px, trong toạ độ BOX)
let imgEl = null            // Image đã load
let minScale = 1            // scale để ảnh phủ kín khung
let drag = null             // { x, y, ox, oy } khi kéo

function handleAvatarUpload(e) {
  const file = e.target.files[0]
  e.target.value = ''       // cho phép chọn lại cùng file
  if (!file || !member.value) return
  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => {
      imgEl = img
      minScale = Math.max(BOX / img.width, BOX / img.height)
      zoom.value = 1
      offset.value = { x: 0, y: 0 }
      cropSrc.value = reader.result
      cropName.value = file.name
      cropOpen.value = true
    }
    img.src = reader.result
  }
  reader.readAsDataURL(file)
}

// scale hiện tại + kích thước ảnh hiển thị trong khung
const dispScale = computed(() => minScale * zoom.value)
const imgStyle = computed(() => {
  if (!imgEl) return {}
  const w = imgEl.width * dispScale.value
  const h = imgEl.height * dispScale.value
  return {
    width: w + 'px',
    height: h + 'px',
    left: (BOX / 2 - w / 2 + offset.value.x) + 'px',
    top: (BOX / 2 - h / 2 + offset.value.y) + 'px'
  }
})

// giữ ảnh luôn phủ kín khung (không lộ mép)
function clampOffset() {
  if (!imgEl) return
  const w = imgEl.width * dispScale.value
  const h = imgEl.height * dispScale.value
  const maxX = Math.max(0, (w - BOX) / 2)
  const maxY = Math.max(0, (h - BOX) / 2)
  offset.value.x = Math.min(maxX, Math.max(-maxX, offset.value.x))
  offset.value.y = Math.min(maxY, Math.max(-maxY, offset.value.y))
}

function onZoom(v) { zoom.value = Number(v); clampOffset() }
function onWheel(e) {
  zoom.value = Math.min(4, Math.max(1, zoom.value - e.deltaY * 0.001))
  clampOffset()
}
function startDrag(e) {
  const p = e.touches ? e.touches[0] : e
  drag = { x: p.clientX, y: p.clientY, ox: offset.value.x, oy: offset.value.y }
}
function onDrag(e) {
  if (!drag) return
  const p = e.touches ? e.touches[0] : e
  offset.value = { x: drag.ox + (p.clientX - drag.x), y: drag.oy + (p.clientY - drag.y) }
  clampOffset()
}
function endDrag() { drag = null }

async function confirmCrop() {
  if (!imgEl || !member.value) return
  uploading.value = true
  try {
    const canvas = document.createElement('canvas')
    canvas.width = OUT_SIZE
    canvas.height = OUT_SIZE
    const ctx = canvas.getContext('2d')
    // ánh xạ từ toạ độ BOX sang OUT_SIZE
    const r = OUT_SIZE / BOX
    const w = imgEl.width * dispScale.value * r
    const h = imgEl.height * dispScale.value * r
    ctx.drawImage(imgEl,
      OUT_SIZE / 2 - w / 2 + offset.value.x * r,
      OUT_SIZE / 2 - h / 2 + offset.value.y * r,
      w, h)
    const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.9))
    if (blob) {
      const f = new File([blob], cropName.value || 'avatar.jpg', { type: 'image/jpeg' })
      await store.uploadAvatar(member.value.id, f)
    }
    cropOpen.value = false
  } finally {
    uploading.value = false
  }
}

function closeCrop() { if (!uploading.value) cropOpen.value = false }

const leaderText = ref('')
const coachText = ref('')
const coachStatus = ref('ok')
const peerStatus = ref('')
const peerStrengths = ref('')
const peerImprove = ref('')
const peerAuthor = ref('')

function addLeaderNote() {
  if (!leaderText.value.trim() || !member.value) return
  store.addLeaderNote(member.value.id, leaderText.value.trim())
  leaderText.value = ''
}

function addCoachNote() {
  if (!coachText.value.trim() || !member.value) return
  store.addCoachNote(member.value.id, coachText.value.trim(), coachStatus.value)
  coachText.value = ''
}

function addPeerFeedback() {
  if (!peerAuthor.value || !peerStatus.value.trim() || !peerStrengths.value.trim() || !peerImprove.value.trim() || !member.value) return
  const author = store.members.find(m => m.id === peerAuthor.value)
  store.addPeerFeedback(member.value.id, peerAuthor.value, author?.name || '', peerStatus.value.trim(), peerStrengths.value.trim(), peerImprove.value.trim())
  peerStatus.value = ''
  peerStrengths.value = ''
  peerImprove.value = ''
}

function deleteNote(type, noteId) {
  if (!member.value) return
  if (type === 'leader') store.deleteLeaderNote(member.value.id, noteId)
  else store.deleteCoachNote(member.value.id, noteId)
}

function deletePeer(feedbackId) {
  if (member.value) store.deletePeerFeedback(member.value.id, feedbackId)
}

const statLabels = computed(() => ({
  aim: t('aim'),
  gameSense: t('gamesense'),
  teamwork: t('teamwork'),
  communication: t('communication')
}))

const statusLabels = computed(() => ({
  ok: t('ok_status'),
  watch: t('watch_status'),
  alert: t('alert_status')
}))
</script>

<template>
  <section class="view active">
    <div class="view-head">
      <div>
        <p class="eyebrow">{{ t('profile') }}</p>
        <h2>{{ t('member_profile') }}</h2>
      </div>
      <select class="member-select" v-model="selectedId" v-if="store.members.length">
        <option v-for="m in store.members" :key="m.id" :value="m.id">{{ m.name }}</option>
      </select>
    </div>

    <div v-if="!member" class="vod-empty">{{ t('no_members_profile') }}</div>

    <div v-else class="profile-grid">
      <div class="profile-card">
        <div class="profile-avatar" v-if="!member.avatarUrl">
          {{ member.name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() }}
        </div>
        <img v-else :src="member.avatarUrl" class="profile-avatar" style="object-fit:cover" alt="">
        <label class="avatar-upload">{{ t('change_avatar') }}
          <input type="file" accept="image/*" style="display:none" @change="handleAvatarUpload">
        </label>
        <h3 v-html="escapeHtml(member.name)"></h3>
        <div class="role-tag">{{ member.position || member.role }}</div>

        <div class="profile-meta">
          <div class="meta-row"><span class="k">{{ t('age') }}</span><input type="number" :value="member.age" @change="updateMeta('age', $event.target.value)" min="0"></div>
          <div class="meta-row"><span class="k">{{ t('location_label') }}</span><input type="text" :value="member.location" @change="updateMeta('location', $event.target.value)"></div>
          <div class="meta-row"><span class="k">{{ t('rank') }}</span><input type="text" :value="member.rank" @change="updateMeta('rank', $event.target.value)" placeholder="Radiant"></div>
          <div class="meta-row"><span class="k">{{ t('position') }}</span><input type="text" :value="member.position" @change="updateMeta('position', $event.target.value)"></div>
        </div>

        <div class="stats-block">
          <div v-for="(label, key) in statLabels" :key="key" class="stat-row">
            <div class="stat-row-head"><span>{{ label }}</span><span class="val">{{ member.stats[key] }}</span></div>
            <div class="stat-bar"><div class="stat-fill" :style="{ width: member.stats[key] + '%' }"></div></div>
            <input type="range" min="0" max="100" :value="member.stats[key]" @input="updateStat(key, Number($event.target.value))">
          </div>
          <button class="btn btn-primary save-stats-btn" @click="store.saveProfile(member.id)">
            {{ t('save') }}
          </button>
        </div>
      </div>

      <div class="profile-panels">
        <!-- Leader Review -->
        <div class="panel">
          <h4><span class="dot" style="background:var(--red-bright)"></span>{{ t('leader_review') }}</h4>
          <div class="note-list">
            <template v-if="member.leaderNotes?.length">
              <div v-for="n in [...member.leaderNotes].reverse()" :key="n.id" class="note-item">
                <span class="note-del" @click="deleteNote('leader', n.id)">✕</span>
                <span v-html="escapeHtml(n.text)"></span>
                <span class="note-date">{{ n.date }}</span>
              </div>
            </template>
            <div v-else class="vod-empty">{{ t('no_notes') }}</div>
          </div>
          <form class="note-form" @submit.prevent="addLeaderNote">
            <textarea v-model="leaderText" rows="2" :placeholder="t('leader_note_placeholder')" required></textarea>
            <button type="submit" class="btn btn-primary btn-small">{{ t('add_note') }}</button>
          </form>
        </div>

        <!-- Coach Review -->
        <div class="panel">
          <h4><span class="dot" style="background:var(--gold)"></span>{{ t('coach_review') }}</h4>
          <div class="note-list">
            <template v-if="member.coachNotes?.length">
              <div v-for="n in [...member.coachNotes].reverse()" :key="n.id" class="note-item">
                <span class="note-del" @click="deleteNote('coach', n.id)">✕</span>
                <span class="status-tag" :class="'status-' + n.status">{{ statusLabels[n.status] }}</span>
                <span v-html="escapeHtml(n.text)"></span>
                <span class="note-date">{{ n.date }}</span>
              </div>
            </template>
            <div v-else class="vod-empty">{{ t('no_notes') }}</div>
          </div>
          <form class="note-form" @submit.prevent="addCoachNote">
            <select v-model="coachStatus">
              <option value="ok">{{ statusLabels.ok }}</option>
              <option value="watch">{{ statusLabels.watch }}</option>
              <option value="alert">{{ statusLabels.alert }}</option>
            </select>
            <textarea v-model="coachText" rows="2" :placeholder="t('coach_note_placeholder')" required></textarea>
            <button type="submit" class="btn btn-primary btn-small">{{ t('add_note') }}</button>
          </form>
        </div>

        <!-- Peer Feedback -->
        <div class="panel">
          <h4><span class="dot" style="background:var(--green-ok)"></span>{{ t('peer_review') }}</h4>
          <div class="peer-list">
            <template v-if="member.peerFeedback?.length">
              <div v-for="p in [...member.peerFeedback].reverse()" :key="p.id" class="peer-item">
                <div class="peer-head">
                  <span class="peer-author" v-html="escapeHtml(p.authorName)"></span>
                  <span class="note-del" @click="deletePeer(p.id)">✕</span>
                </div>
                <div class="peer-field"><b>{{ t('in_game_state') }}</b><span v-html="escapeHtml(p.status)"></span></div>
                <div class="peer-field"><b>{{ t('strengths') }}</b><span v-html="escapeHtml(p.strengths)"></span></div>
                <div class="peer-field"><b>{{ t('improve') }}</b><span v-html="escapeHtml(p.improve)"></span></div>
                <div class="note-date">{{ p.date }}</div>
              </div>
            </template>
            <div v-else class="vod-empty">{{ t('no_peer_feedback') }}</div>
          </div>
          <form class="peer-form" @submit.prevent="addPeerFeedback">
            <select v-model="peerAuthor">
              <option value="" disabled>{{ otherMembers.length ? '' : t('no_other_teammates') }}</option>
              <option v-for="o in otherMembers" :key="o.id" :value="o.id">{{ o.name }}</option>
            </select>
            <textarea v-model="peerStatus" rows="2" :placeholder="t('peer_status_placeholder')" required></textarea>
            <textarea v-model="peerStrengths" rows="2" :placeholder="t('peer_strengths_placeholder')" required></textarea>
            <textarea v-model="peerImprove" rows="2" :placeholder="t('peer_improve_placeholder')" required></textarea>
            <button type="submit" class="btn btn-primary btn-small" :disabled="!otherMembers.length">{{ t('add_feedback') }}</button>
          </form>
        </div>
      </div>
    </div>

    <!-- Avatar cropper -->
    <Teleport to="body">
      <div v-if="cropOpen" class="modal-overlay active" @click.self="closeCrop">
        <div class="crop-modal">
          <button class="modal-close" @click="closeCrop">×</button>
          <div class="modal-head"><h3>{{ t('adjust_avatar') }}</h3></div>
          <div
            class="crop-box"
            @mousedown="startDrag" @mousemove="onDrag" @mouseup="endDrag" @mouseleave="endDrag"
            @touchstart.prevent="startDrag" @touchmove.prevent="onDrag" @touchend="endDrag"
            @wheel.prevent="onWheel"
          >
            <img :src="cropSrc" :style="imgStyle" class="crop-img" draggable="false" alt="">
            <div class="crop-ring"></div>
          </div>
          <div class="crop-zoom">
            <span>−</span>
            <input type="range" min="1" max="4" step="0.01" :value="zoom" @input="onZoom($event.target.value)">
            <span>+</span>
          </div>
          <div class="modal-foot">
            <button class="btn btn-ghost" @click="closeCrop" :disabled="uploading">{{ t('cancel') }}</button>
            <button class="btn btn-primary" @click="confirmCrop" :disabled="uploading">
              {{ uploading ? t('uploading') : t('save_avatar') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.crop-modal {
  position: relative;
  background: var(--bg-panel);
  border: 1px solid var(--border-hair);
  border-radius: var(--radius);
  padding: 20px;
  width: 340px;
  max-width: 92vw;
}
.crop-box {
  position: relative;
  width: 280px;
  height: 280px;
  max-width: 100%;
  margin: 8px auto 16px;
  overflow: hidden;
  border-radius: 10px;
  background: #000;
  cursor: grab;
  touch-action: none;
  user-select: none;
}
.crop-box:active { cursor: grabbing; }
.crop-img { position: absolute; pointer-events: none; max-width: none; }
.crop-ring {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, .5);
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, .85);
}
.crop-zoom { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.crop-zoom span { color: var(--text-dim); font-size: 18px; width: 14px; text-align: center; }
.crop-zoom input { flex: 1; }
</style>
