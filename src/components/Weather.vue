<template>
  <div class="weather-panel" :class="{ 'weather-panel-visible': visible }">
    <div class="weather-city">{{ weatherData.city }}</div>
    <div class="weather-main">
      <span class="weather-icon">{{ weatherData.icon }}</span>
      <span class="weather-temp">{{ weatherData.temperature }}°C</span>
    </div>
    <div class="weather-info">
      <span class="weather-condition">{{ weatherData.condition }}</span>
      <div class="weather-details">
        <span class="weather-detail">湿度 {{ weatherData.humidity }}%</span>
        <span class="weather-detail">{{ weatherData.windDirection }}风 {{ weatherData.windPower }}</span>
        <span class="weather-detail">风速 {{ weatherData.windSpeed }}km/h</span>
      </div>
    </div>
    <div class="weather-update-time">
      <span class="update-label">更新时间:</span>
      <span class="update-time">{{ weatherData.updateTime }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useTheme } from '@/composables/useTheme';
import { getWeatherWithLocation, type WeatherData as WeatherDataType } from '@/api/weather';

const { themeColors } = useTheme();
const visible = ref(false);
let weatherInterval: number | null = null;

const weatherData = ref<WeatherDataType>({
  city: '正在定位...',
  temperature: 24,
  condition: '未知',
  humidity: 50,
  windDirection: '未知',
  windPower: '未知',
  windSpeed: 0,
  icon: '🌡️',
  updateTime: new Date().toLocaleString('zh-CN'),
  source: '默认数据'
});

const fetchWeather = async () => {
  try {
    const data = await getWeatherWithLocation();
    weatherData.value = data;
  } catch (error) {
    console.error('获取天气失败:', error);
    // 保持默认兜底数据
  }
};

onMounted(() => {
  fetchWeather();
  weatherInterval = window.setInterval(fetchWeather, 30 * 60 * 1000); // 每30分钟刷新
  
  setTimeout(() => {
    visible.value = true;
  }, 100);
});

onUnmounted(() => {
  if (weatherInterval) {
    clearInterval(weatherInterval);
  }
});
</script>

<style scoped>
.weather-panel {
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

.weather-panel-visible {
  opacity: 1;
  transform: translateX(0);
}

.weather-panel:hover {
  transform: translateX(5px);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.weather-city {
  font-family: 'Rajdhani', sans-serif;
  font-size: 13px;
  color: v-bind('themeColors.secondary');
  font-weight: 500;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.weather-main {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.weather-icon {
  font-size: 28px;
}

.weather-temp {
  font-family: 'Orbitron', 'Rajdhani', sans-serif;
  font-size: 26px;
  color: v-bind('themeColors.primary');
  font-weight: 700;
  text-shadow: v-bind('`0 0 15px ${themeColors.primary}80`');
}

.weather-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.weather-condition {
  font-family: 'Rajdhani', sans-serif;
  font-size: 14px;
  color: v-bind('themeColors.text');
  font-weight: 600;
}

.weather-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.weather-detail {
  font-family: 'Rajdhani', sans-serif;
  font-size: 12px;
  color: v-bind('themeColors.secondary');
  font-weight: 500;
}

.weather-update-time {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  font-family: 'Rajdhani', sans-serif;
  font-size: 11px;
  color: v-bind('themeColors.secondary');
  opacity: 0.7;
}

.update-label {
  font-weight: 400;
}

.update-time {
  font-weight: 500;
}

@media (max-width: 1024px) {
  .weather-panel {
    padding: 12px 16px;
  }
  
  .weather-temp {
    font-size: 24px;
  }
}

@media (max-width: 768px) {
  .weather-panel {
    padding: 15px 20px;
    min-width: 150px;
  }
  
  .weather-temp {
    font-size: 22px;
  }
}

@media (max-width: 480px) {
  .weather-panel {
    width: 90%;
    align-items: center;
    text-align: center;
  }
  
  .weather-city {
    font-size: 12px;
  }
  
  .weather-icon {
    font-size: 24px;
  }
  
  .weather-temp {
    font-size: 20px;
  }
  
  .weather-condition {
    font-size: 13px;
  }
  
  .weather-detail {
    font-size: 11px;
  }
  
  .weather-update-time {
    font-size: 10px;
  }
}
</style>