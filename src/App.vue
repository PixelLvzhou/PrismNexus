<template>
  <div class="min-h-screen">
    <main class="transition-container">
      <Transition name="fade-slide" mode="out-in">
        <router-view :key="$route.fullPath" />
      </Transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { useTheme } from './composables/useTheme';
import { useUserStore } from './composables/useUserStore';

const { themeColors, currentTheme } = useTheme();
const { initUserInfo } = useUserStore();

// 更新CSS变量
const updateCssVariables = () => {
  const root = document.documentElement;
  root.style.setProperty('--theme-primary', themeColors.value.primary);
  root.style.setProperty('--theme-darker-primary', themeColors.value.darkerPrimary);
  root.style.setProperty('--theme-secondary', themeColors.value.secondary);
  root.style.setProperty('--theme-background', themeColors.value.background);
  root.style.setProperty('--theme-text', themeColors.value.text);
  root.style.setProperty('--theme-button-text', themeColors.value.buttonText);
  root.style.setProperty('--theme-grid-color', themeColors.value.gridColor);
  
  // 同时更新背景色
  root.style.backgroundColor = themeColors.value.background;
};

// 初始化和监听主题变化
onMounted(async () => {
  updateCssVariables();
  // 如果有token，初始化用户信息
  const token = localStorage.getItem('token');
  if (token) {
    await initUserInfo();
  }
});

watch(currentTheme, () => {
  updateCssVariables();
}, { immediate: true });
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #0a0a0f;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease-out;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
