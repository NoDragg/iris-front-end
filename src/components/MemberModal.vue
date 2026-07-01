<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from '../stores/store'

const { t } = useI18n()
const store = useStore()

const memberName = ref('')
const memberRole = ref('')

watch(() => store.showMemberModal, (show) => {
  if (show) {
    memberName.value = store.editMemberName || ''
    memberRole.value = store.editMemberRole || ''
  }
})

function closeModal() {
  store.showMemberModal = false
  store.editMemberId = ''
  store.editMemberName = ''
  store.editMemberRole = ''
}

function save() {
  if (!memberName.value.trim() || !memberRole.value.trim()) return
  if (store.editMemberId) {
    store.updateMember(store.editMemberId, memberName.value.trim(), memberRole.value.trim())
  } else {
    store.addMember(memberName.value.trim(), memberRole.value.trim())
  }
  closeModal()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="store.showMemberModal" class="modal-overlay active" @click.self="closeModal">
      <div class="modal modal-sm">
        <button class="modal-close" @click="closeModal">×</button>
        <h3>{{ store.editMemberId ? t('edit_member_title') : t('add_member_title') }}</h3>
        <form id="memberForm" @submit.prevent="save">
          <input type="hidden" v-model="store.editMemberId">
          <div class="form-row">
            <label>{{ t('name') }}</label>
            <input type="text" v-model="memberName" required>
          </div>
          <div class="form-row">
            <label>{{ t('role') }}</label>
            <input type="text" v-model="memberRole" :placeholder="t('role_placeholder')" required>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">{{ t('save') }}</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
