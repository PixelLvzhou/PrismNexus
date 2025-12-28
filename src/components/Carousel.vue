<template>
  <div id="carousel" style="position: relative; width: 100%; height: 30vh; overflow: hidden; touch-action: manipulation;" 
       @dblclick.prevent
       @touchstart="handleTouchStart"
       @touchmove="handleTouchMove"
       @touchend="handleTouchEnd">
    <!-- 轮播图片容器 -->
    <div ref="carouselContainer" style="display: flex; height: 100%;">
      <!-- 轮播图片 -->
      <div v-for="(slide, index) in slides" :key="index" 
           style="width: 100%; height: 100%; flex-shrink: 0;">
        <img 
          :src="slide.image" 
          alt="轮播图 {{ index + 1 }}" 
          style="width: 100%; height: 100%; object-fit: cover;"
        />
      </div>
    </div>

    <!-- 左侧翻页按钮（暂时注释掉） -->
    <!-- <button 
      id="prevBtn" 
      style="position: absolute; top: 50%; left: 20px; transform: translateY(-50%); width: 30px; height: 30px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px rgba(0,0,0,0.3); z-index: 1000; border: none; cursor: pointer; user-select: none; color: #333; font-size: 16px; font-weight: bold;"
      @click="prevSlide"
    >
      &lt;
    </button> -->

    <!-- 右侧翻页按钮（暂时注释掉） -->
    <!-- <button 
      id="nextBtn" 
      style="position: absolute; top: 50%; right: 20px; transform: translateY(-50%); width: 30px; height: 30px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px rgba(0,0,0,0.3); z-index: 1000; border: none; cursor: pointer; user-select: none; color: #333; font-size: 16px; font-weight: bold;"
      @click="nextSlide"
    >
      &gt;
    </button> -->

    <!-- 底部中心指示器 -->
    <div id="indicators" style="position: absolute; bottom: 15px; left: 0; right: 0; display: flex; justify-content: center; gap: 8px; z-index: 1000;">
      <button
        v-for="(_, index) in slides"
        :key="index"
        :style="{
          width: currentIndex === index ? '30px' : '8px',
          height: '8px',
          borderRadius: '4px',
          backgroundColor: currentIndex === index ? 'white' : 'rgba(255, 255, 255, 0.7)',
          border: 'none',
          cursor: 'pointer',
          userSelect: 'none'
        }"
        @click="goToSlide(index)"
      ></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// 轮播图数据类型定义
interface Slide {
  image: string;
}

// 轮播图数据
const slides = ref<Slide[]>([]);
// 加载状态
const isLoading = ref(true);
// 错误信息
const error = ref<string | null>(null);

// 当前轮播图索引
const currentIndex = ref(0);
// 轮播容器引用
const carouselContainer = ref<HTMLElement>();
// 轮播定时器
let carouselTimer: number | null = null;
// 轮播间隔时间（毫秒）
const carouselInterval = 3000;

// 触摸相关变量
const touchStartX = ref(0);
const touchEndX = ref(0);
const minSwipeDistance = 50; // 最小滑动距离，小于这个值不触发翻页

// 从API获取轮播图数据
const fetchCarouselData = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    const response = await fetch('/api/carousel');
    
    if (!response.ok) {
      throw new Error('Failed to fetch carousel data');
    }
    
    const result = await response.json();
    
    if (result.code === 200) {
      slides.value = result.data;
    } else {
      throw new Error(result.message || 'Failed to fetch carousel data');
    }
  } catch (err) {
    console.error('Error fetching carousel data:', err);
    error.value = err instanceof Error ? err.message : 'Failed to fetch carousel data';
    // 加载失败时使用默认图片
    slides.value = [
      { image: 'https://game.gtimg.cn/images/shanhai/web202006/s3_carousel1.jpg' },
      { image: 'https://game.gtimg.cn/images/shanhai/web202006/s3_carousel2.jpg' },
      { image: 'https://game.gtimg.cn/images/shanhai/web202006/s3_carousel4.jpg' },
      { image: 'https://game.gtimg.cn/images/shanhai/web202006/s3_carousel5.jpg' }
    ];
  } finally {
    isLoading.value = false;
  }
};

// 更新轮播图位置
const updateCarouselPosition = () => {
  if (carouselContainer.value && slides.value.length > 0) {
    carouselContainer.value.style.transform = `translateX(-${currentIndex.value * 100}%)`;
    carouselContainer.value.style.transition = 'transform 0.5s ease';
  }
};

// 切换到下一张
const nextSlide = () => {
  if (slides.value.length === 0) return;
  currentIndex.value = (currentIndex.value + 1) % slides.value.length;
  updateCarouselPosition();
  resetTimer();
};

// 切换到上一张
const prevSlide = () => {
  if (slides.value.length === 0) return;
  currentIndex.value = (currentIndex.value - 1 + slides.value.length) % slides.value.length;
  updateCarouselPosition();
  resetTimer();
};

// 跳转到指定轮播图
const goToSlide = (index: number) => {
  if (slides.value.length === 0) return;
  currentIndex.value = index;
  updateCarouselPosition();
  resetTimer();
};

// 启动自动轮播
const startAutoPlay = () => {
  if (slides.value.length === 0) return;
  carouselTimer = window.setInterval(() => {
    nextSlide();
  }, carouselInterval);
};

// 重置轮播定时器
const resetTimer = () => {
  if (carouselTimer) {
    clearInterval(carouselTimer);
  }
  startAutoPlay();
};

// 组件挂载时
onMounted(async () => {
  await fetchCarouselData();
  startAutoPlay();
  updateCarouselPosition(); // 初始化位置
});

// 处理触摸开始事件
const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0]?.clientX || 0;
};

// 处理触摸移动事件
const handleTouchMove = (e: TouchEvent) => {
  touchEndX.value = e.touches[0]?.clientX || 0;
};

// 处理触摸结束事件
const handleTouchEnd = () => {
  const diff = touchStartX.value - touchEndX.value;
  
  // 左滑（向右翻页）
  if (diff > minSwipeDistance) {
    nextSlide();
  }
  // 右滑（向左翻页）
  else if (diff < -minSwipeDistance) {
    prevSlide();
  }
  
  // 重置触摸值
  touchStartX.value = 0;
  touchEndX.value = 0;
};

// 组件卸载时
onUnmounted(() => {
  if (carouselTimer) {
    clearInterval(carouselTimer);
  }
});
</script>

<style scoped>
/* 确保轮播图容器样式优先级最高 */
#carousel {
  position: relative !important;
  width: 100% !important;
  height: 30vh !important;
  overflow: hidden !important;
}

/* 轮播容器样式 */
#carousel > div:first-child {
  display: flex !important;
  height: 100% !important;
  transition: transform 0.5s ease !important;
}

/* 翻页按钮样式 - 缩小尺寸 */
#prevBtn,
#nextBtn {
  position: absolute !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  width: 30px !important;
  height: 30px !important;
  background: white !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 0 8px rgba(0,0,0,0.2) !important;
  z-index: 1000 !important;
  border: none !important;
  cursor: pointer !important;
  font-size: 16px !important;
  color: #333 !important;
  font-weight: bold !important;
  user-select: none !important;
}

#prevBtn {
  left: 20px !important;
}

#nextBtn {
  right: 20px !important;
}

/* 指示器容器样式 */
#indicators {
  position: absolute !important;
  bottom: 15px !important;
  left: 0 !important;
  right: 0 !important;
  display: flex !important;
  justify-content: center !important;
  gap: 8px !important;
  z-index: 1000 !important;
}

/* 指示器按钮样式 */
#indicators button {
  border: none !important;
  outline: none !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 移动设备上的按钮调整 */
  #prevBtn,
  #nextBtn {
    width: 25px !important;
    height: 25px !important;
    font-size: 14px !important;
  }
  
  #prevBtn {
    left: 10px !important;
  }
  
  #nextBtn {
    right: 10px !important;
  }
  
  /* 移动设备上的指示器 */
  #indicators {
    gap: 6px !important;
    bottom: 12px !important;
  }
  
  #indicators button {
    height: 6px !important;
  }
  
  #indicators button[style*="width: 30px"] {
    width: 24px !important;
  }
}
</style>