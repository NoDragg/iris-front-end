<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore, escapeHtml } from '../stores/store'
import DeleteMemberModal from './DeleteMemberModal.vue'

const { t } = useI18n()
const store = useStore()

const showDeleteModal = ref(false)

const vodTitle = ref('')
const vodUrl = ref('')

const member = computed(() => store.members.find(m => m.id === store.currentVodMemberId))

function closeModal() {
  store.showVodModal = false
  store.currentVodMemberId = null
}

function submitVod() {
  if (!vodTitle.value.trim() || !vodUrl.value.trim() || !store.currentVodMemberId) return
  store.addVod(store.currentVodMemberId, vodTitle.value.trim(), vodUrl.value.trim())
  vodTitle.value = ''
  vodUrl.value = ''
}

function deleteVod(vodId) {
  if (store.currentVodMemberId) store.deleteVod(store.currentVodMemberId, vodId)
}

function openEditMember() {
  if (!member.value) return
  store.editMemberId = member.value.id
  store.editMemberName = member.value.name
  store.editMemberRole = member.value.role
  store.showMemberModal = true
  closeModal()
}

function deleteMember() {
  if (!member.value) return
  showDeleteModal.value = true
}

function confirmDeleteMember() {
  store.deleteMember(member.value.id)
  showDeleteModal.value = false
  closeModal()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="store.showVodModal" class="modal-overlay active" @click.self="closeModal">
      <div class="modal">
        <button class="modal-close" @click="closeModal">×</button>
        <div class="modal-head">
          <h3 v-if="member" v-html="escapeHtml(member.name)"></h3>
          <p v-if="member" v-html="escapeHtml(member.role)"></p>
        </div>
        <div class="vod-body">
          <form class="vod-form" @submit.prevent="submitVod">
            <input type="text" v-model="vodTitle" :placeholder="t('vod_title_placeholder')" required>
            <input type="text" v-model="vodUrl" :placeholder="t('vod_url_placeholder')" required>
            <button type="submit" class="btn btn-primary">{{ t('send_vod') }}</button>
          </form>
          <div class="vod-list">
            <template v-if="member?.vods?.length">
              <div v-for="v in [...member.vods].reverse()" :key="v.id" class="vod-item">
                <div>
                  <a :href="v.url" target="_blank" rel="noopener" v-html="escapeHtml(v.title)"></a>
                  <div class="vod-date">{{ v.date }}</div>
                </div>
                <span class="vod-del" @click="deleteVod(v.id)">✕</span>
              </div>
            </template>
            <div v-else class="vod-empty">{{ t('no_vods') }}</div>
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" @click="openEditMember">{{ t('edit_member_btn') }}</button>
          <button class="btn btn-danger" @click="deleteMember">{{ t('delete_member_btn') }}</button>
        </div>
      </div>
    </div>
  </Teleport>

  <DeleteMemberModal
    :show="showDeleteModal"
    :member-name="member?.name"
    @confirm="confirmDeleteMember"
    @cancel="showDeleteModal = false"
  />
</template>
