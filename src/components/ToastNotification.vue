<template>
  <div class="toast" :class="{ show: store.toast }">{{ store.toast }}</div>
</template>

<script setup>
import { useStore } from '../stores/store'
const store = useStore()
</script>
