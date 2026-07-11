<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  show: Boolean,
  title: String,
  message: String,
  confirmLabel: String
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay active" @click.self="emit('cancel')">
      <div class="modal modal-sm">
        <button class="modal-close" @click="emit('cancel')">×</button>
        <div class="modal-head">
          <h3>{{ title }}</h3>
        </div>
        <p class="confirm-body">{{ message }}</p>
        <div class="modal-foot">
          <button class="btn btn-ghost" @click="emit('cancel')">{{ t('cancel') }}</button>
          <button class="btn btn-danger" @click="emit('confirm')">{{ confirmLabel || t('delete') }}</button>
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
