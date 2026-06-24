<template>
  <div class="card-placeholder">
    <div class="card-header" v-if="title">
      <span class="card-title">{{ title }}</span>
    </div>
    <div class="card-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
}>();
</script>

<style scoped>
.card-placeholder {
  background: rgba(30, 30, 30, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  width: 300px;
  height: 300px;
}

.card-header {
  padding: 6px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.card-title {
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #e0e0e0;
}

.card-content {
  padding: 10px;
  position: relative;
  height: calc(100% - 48px);
}
</style>