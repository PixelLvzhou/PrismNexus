<template>
  <div class="home-container">
    <DynamicParticleBackground />
    
    <nav class="navbar-wrapper">
    <Navbar @nav-change="handleNavChange" />
    <NavbarRight />
  </nav>
    
    <div class="main-content">
      <Weather />
    </div>
    
    <!-- Tab 键侧面板 -->
    <TabSidePanel v-model="showPanel" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Navbar from '@/components/Navbar.vue';
import NavbarRight from '@/components/NavbarRight.vue';
import Weather from '@/components/Weather.vue';
import DynamicParticleBackground from '@/components/DynamicParticleBackground.vue';
import TabSidePanel from '@/components/TabSidePanel.vue';
import { getNavigations } from '@/api/navigation';

const showPanel = ref(false);

const handleNavChange = (key: string) => {
  console.log('导航变化:', key);
  // 后续可以在这里处理导航点击事件
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Tab') {
    event.preventDefault();
    showPanel.value = !showPanel.value;
  }
  
  // 按 ESC 键也可以关闭
  if (event.key === 'Escape' && showPanel.value) {
    showPanel.value = false;
  }
};

const fetchNavigations = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;
  
  try {
    const data = await getNavigations();
    console.log('导航路由查询结果:', data);
  } catch (err) {
    console.error('导航路由查询失败:', err);
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  fetchNavigations();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: hidden;
  font-size: 18px;
}

.navbar-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  margin: 15px auto;
  z-index: 1000;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 0 40px;
  width: 280px;
}

@media (max-width: 1024px) {
  .navbar-wrapper {
    padding: 0 20px;
  }
  
  .main-content {
    padding: 0 20px;
  }
}

@media (max-width: 768px) {
  .navbar-wrapper {
    flex-direction: column;
    gap: 15px;
    padding: 0 20px;
  }
}

@media (max-width: 480px) {
  .navbar-wrapper {
    padding: 0 15px;
  }
  
  .main-content {
    padding: 0 15px;
  }
}
</style>