<template>
  <div class="page-container">
    <DynamicParticleBackground />
    <DecorationCanvas 
      button-text="返回首页" 
      :button-width="100" 
      @button-click="goBack" 
    />

    <div class="main-content">
      <div class="settings-container">
        <h1 class="settings-title">设置</h1>
        <p class="settings-desc">此页面功能正在开发中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import DynamicParticleBackground from '@/components/DynamicParticleBackground.vue';
import DecorationCanvas from '@/components/DecorationCanvas.vue';

const router = useRouter();

const goBack = () => {
  router.push('/');
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.main-content {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.settings-container {
  text-align: center;
}

.settings-title {
  font-size: 32px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20px;
}

.settings-desc {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
}
</style>