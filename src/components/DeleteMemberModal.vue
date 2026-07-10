<script setup>
import { useI18n } from 'vue-i18n'
import { escapeHtml } from '../stores/store'

const { t } = useI18n()

const props = defineProps({
  show: Boolean,
  memberName: String
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay active" @click.self="emit('cancel')">
      <div class="modal modal-sm">
        <button class="modal-close" @click="emit('cancel')">×</button>
        <div class="modal-head">
          <h3>{{ t('delete_member_btn') }} "<span v-html="escapeHtml(memberName)"></span>"</h3>
        </div>
        <p class="confirm-body">{{ t('confirm_delete_member', { name: memberName }) }}</p>
        <div class="modal-foot">
          <button class="btn btn-ghost" @click="emit('cancel')">{{ t('cancel') }}</button>
          <button class="btn btn-danger" @click="emit('confirm')">{{ t('delete_member_btn') }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.confirm-body {
  margin: 16px 0 0;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.5;
}
</style>
