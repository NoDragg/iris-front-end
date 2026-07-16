<script setup>
import { useI18n } from 'vue-i18n'
import { useStore, escapeHtml } from '../stores/store'

const { t } = useI18n()
const store = useStore()

function openVodModal(memberId) {
  store.currentVodMemberId = memberId
  store.showVodModal = true
}

function openAddMember() {
  store.editMemberId = ''
  store.editMemberName = ''
  store.editMemberRole = ''
  store.showMemberModal = true
}
</script>

<template>
  <section class="view active">
    <div class="view-head">
      <div>
        <p class="eyebrow">{{ t('vod_review') }}</p>
        <h2>{{ t('member_overview') }}</h2>
      </div>
      <button class="btn btn-primary" @click="openAddMember">{{ t('add_member') }}</button>
    </div>
    <div class="member-grid">
      <template v-if="store.members.length === 0">
        <div class="vod-empty" style="grid-column:1/-1">{{ t('no_members') }}</div>
      </template>
      <template v-else>
        <div v-for="m in store.members" :key="m.id" class="member-card" @click="openVodModal(m.id)">
          <img v-if="m.avatarUrl" :src="m.avatarUrl" class="avatar" alt="" style="object-fit:cover">
          <div v-else class="avatar">{{ m.name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() }}</div>
          <h3 v-html="escapeHtml(m.name)"></h3>
          <p v-html="escapeHtml(m.role)"></p>
          <div class="vod-count">{{ (m.vods || []).length }} {{ t('sent_vods') }}</div>
        </div>
      </template>
    </div>
  </section>
</template>
