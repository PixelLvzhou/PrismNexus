<template>
  <div class="page-container">
    <DynamicParticleBackground />
    <DecorationCanvas 
      button-text="返回首页" 
      :button-width="100" 
      @button-click="goBack" 
    />
    <div class="test-area">
      <CardPlaceholder title="主题切换组件">
        <ThemeSwitcher></ThemeSwitcher>
      </CardPlaceholder>
      <CardPlaceholder title="星空背景">
        <DynamicParticleBackground :containerMode="true" />
      </CardPlaceholder>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import DynamicParticleBackground from '@/components/DynamicParticleBackground.vue';
import DecorationCanvas from '@/components/DecorationCanvas.vue';
import CardPlaceholder from '@/components/CardPlaceholder.vue';
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';

const router = useRouter();

const goBack = () => {
  router.push('/');
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: hidden;
}

.test-area {
  width: 100%;
  min-height: calc(100vh - 80px);
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  padding: 0 40px;
  display: grid;
  grid-template-columns: repeat(auto-fill, 300px);
  gap: 10px;
  justify-content: flex-start;
}
</style>