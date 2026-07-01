<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore, escapeHtml, isoDate } from '../stores/store'

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

function handleAvatarUpload(e) {
  const file = e.target.files[0]
  if (!file || !member.value) return
  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const size = 160
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      const scale = Math.max(size / img.width, size / img.height)
      const w = img.width * scale
      const h = img.height * scale
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
      member.value.avatar = canvas.toDataURL('image/jpeg', 0.85)
      store.saveStore()
    }
    img.src = reader.result
  }
  reader.readAsDataURL(file)
}

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
        <div class="profile-avatar" v-if="!member.avatar">
          {{ member.name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() }}
        </div>
        <img v-else :src="member.avatar" class="profile-avatar" style="object-fit:cover" alt="">
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
            <div class="stat-bar"><div :style="{ width: member.stats[key] + '%' }"></div></div>
            <input type="range" min="0" max="100" :value="member.stats[key]" @input="updateStat(key, Number($event.target.value))">
          </div>
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
  </section>
</template>
