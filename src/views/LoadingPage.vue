<template>
  <div class="page-container">
    <DynamicParticleBackground></DynamicParticleBackground>
    <div class="loading-content">
      <div class="logo">
        <div class="triangle">
          <div class="inner-triangle"></div>
        </div>
        <h1>
          <span :style="{ color: themeColors.text }">Secure</span>
          <span :style="{ color: themeColors.primary }"> Access</span>
        </h1>
        <p>Loading System Resources...</p>
      </div>
      
      <!-- 加载状态文字 -->
      <div class="loading-status">
        <span class="loading-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </span>
      </div>
    </div>
    
    <!-- 底部进度条和信息层 -->
    <div class="progress-wrapper">
      <!-- 毛玻璃信息层 -->
      <div class="info-overlay">
        <div class="info-left">
          <div class="info-text">正在加载系统资源，请稍候...</div>
        </div>
        <div class="info-right">
          <div class="progress-percent">{{ progress }}%</div>
        </div>
      </div>
      
      <!-- 进度条 -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ backgroundColor: themeColors.primary, width: `${progress}%` }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import DynamicParticleBackground from '@/components/DynamicParticleBackground.vue';

const router = useRouter();
const { themeColors } = useTheme();

const progress = ref(0);

onMounted(() => {
  const duration = 4000; // 4秒
  const interval = 40; // 每40ms更新一次
  const step = 100 / (duration / interval);
  
  const timer = setInterval(() => {
    progress.value = Math.min(progress.value + step, 100);
    if (progress.value >= 100) {
      clearInterval(timer);
    }
  }, interval);
  
  setTimeout(() => {
    // 加载完成后跳转到首页
    router.replace('/');
  }, duration);
});
</script>

<style scoped>
.page-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.loading-content {
  text-align: center;
  z-index: 1;
  position: relative;
}

.logo {
  margin-bottom: 30px;
}

.triangle {
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
  position: relative;
  background-color: transparent;
  filter: v-bind('`drop-shadow(0 0 10px ${themeColors.primary}A0)`');
  animation: triangle-edge-glow 2s infinite;
}

@keyframes triangle-edge-glow {
  0% {
    filter: v-bind('`drop-shadow(0 0 10px ${themeColors.primary}A0)`');
  }
  50% {
    filter: v-bind('`drop-shadow(0 0 20px ${themeColors.primary}FF) drop-shadow(0 0 30px ${themeColors.primary}80)`');
  }
  100% {
    filter: v-bind('`drop-shadow(0 0 10px ${themeColors.primary}A0)`');
  }
}

.triangle::before {
  content: '';
  position: absolute;
  top: 13px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 50px solid transparent;
  border-right: 50px solid transparent;
  border-bottom: 87px solid v-bind('themeColors.primary');
}

.inner-triangle {
  position: absolute;
  top: 43px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  width: 0;
  height: 0;
  border-left: 25px solid transparent;
  border-right: 25px solid transparent;
  border-bottom: 43px solid v-bind('themeColors.background');
}

.logo h1 {
  font-family: 'Orbitron', 'Rajdhani', '宋体', 'SimSun', serif;
  font-size: 29px;
  font-weight: bold;
  color: v-bind('themeColors.text');
  margin: 0 0 5px;
  text-transform: uppercase;
}

.logo p {
  font-family: 'Rajdhani', '宋体', 'SimSun', serif;
  font-size: 12px;
  color: v-bind('themeColors.secondary');
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.loading-status {
  font-family: 'Rajdhani', '宋体', 'SimSun', serif;
  font-size: 16px;
  color: v-bind('themeColors.primary');
  font-weight: bold;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.dot {
  width: 8px;
  height: 8px;
  background-color: v-bind('themeColors.primary');
  border-radius: 50%;
  animation: dot-bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

.dot:nth-child(3) {
  animation-delay: 0s;
}

@keyframes dot-bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.progress-wrapper {
  position: absolute;
  bottom: 15px;
  left: 0;
  right: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.info-overlay {
  width: 100%;
  height: 40px; /* 进度条高度8px的5倍 */
  background: rgba(30, 30, 30, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  box-sizing: border-box;
  z-index: 1; /* 比进度条低一级 */
}

.info-left {
  display: flex;
  align-items: center;
}

.info-text {
  font-family: 'Rajdhani', sans-serif;
  font-size: 14px;
  color: #c0c0c0;
  font-weight: 500;
}

.info-right {
  display: flex;
  align-items: center;
}

.progress-percent {
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 18px;
  color: #e0e0e0; /* 灰白色 */
  font-weight: bold;
}

.progress-container {
  position: relative;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  z-index: 2; /* 进度条在最上面 */
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: rgba(128, 128, 128, 0.3);
  border-radius: 0;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  width: 0%;
  border-radius: 0;
  transition: width 0.05s linear;
}

@media (max-width: 480px) {
  .progress-container {
    padding: 0 10px;
  }
  
  .logo h1 {
    font-size: 24px;
  }
  
  .triangle {
    width: 80px;
    height: 80px;
  }
  
  .triangle::before {
    top: 10px;
    border-left: 40px solid transparent;
    border-right: 40px solid transparent;
    border-bottom: 69px solid v-bind('themeColors.primary');
  }
  
  .inner-triangle {
    top: 34px;
    border-left: 20px solid transparent;
    border-right: 20px solid transparent;
    border-bottom: 34px solid v-bind('themeColors.background');
  }
}
</style>