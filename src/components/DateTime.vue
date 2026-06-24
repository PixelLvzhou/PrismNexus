<template>
  <div class="datetime-panel" :class="{ 'datetime-panel-visible': visible }">
    <div class="date-text">{{ currentDate }}</div>
    <div class="time-text">{{ currentTime }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useTheme } from '@/composables/useTheme';

const { themeColors } = useTheme();
const visible = ref(false);

const currentDate = ref('');
const currentTime = ref('');
let timeInterval: number | null = null;

const updateDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekDay = weekDays[now.getDay()];
  
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  currentDate.value = `${year}-${month}-${day} ${weekDay}`;
  currentTime.value = `${hours}:${minutes}:${seconds}`;
};

onMounted(() => {
  updateDateTime();
  timeInterval = window.setInterval(updateDateTime, 1000);
  
  setTimeout(() => {
    visible.value = true;
  }, 100);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

<style scoped>
.datetime-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 18px 24px;
  min-width: 260px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.6s ease-out;
  opacity: 0;
  transform: translateX(-50px);
}

.datetime-panel-visible {
  opacity: 1;
  transform: translateX(0);
}

.datetime-panel:hover {
  transform: translateX(5px);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.date-text {
  font-family: 'Rajdhani', sans-serif;
  font-size: 13px;
  color: v-bind('themeColors.secondary');
  font-weight: 500;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.time-text {
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 24px;
  color: v-bind('themeColors.primary');
  font-weight: 700;
  letter-spacing: 3px;
  text-shadow: v-bind('`0 0 15px ${themeColors.primary}80`');
}

@media (max-width: 1024px) {
  .datetime-panel {
    padding: 12px 16px;
  }
  
  .time-text {
    font-size: 22px;
  }
}

@media (max-width: 768px) {
  .datetime-panel {
    padding: 15px 20px;
    min-width: 150px;
  }
  
  .time-text {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .datetime-panel {
    width: 90%;
    align-items: center;
    text-align: center;
  }
  
  .date-text {
    font-size: 12px;
  }
  
  .time-text {
    font-size: 18px;
  }
}
</style>