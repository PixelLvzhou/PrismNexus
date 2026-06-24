<template>
  <div class="decoration-wrapper" :style="{ '--theme-primary': themeColors.primary, '--theme-darker-primary': themeColors.darkerPrimary }">
    <canvas
      ref="canvasRef"
      class="decoration-canvas"
      @click="handleClick"
    ></canvas>
    <div 
      v-if="buttonText" 
      class="button-container"
      @click="handleButtonClick"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <span class="arrow" :style="{ transform: `translateX(${arrowOffset}px)` }">←</span>
      <span class="button-text">{{ buttonText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { useTheme, themes } from '@/composables/useTheme';

const props = withDefaults(defineProps<{
  buttonText?: string;
  buttonWidth?: number;
}>(), {
  buttonText: '',
  buttonWidth: 100,
});

const emit = defineEmits<{
  (e: 'button-click'): void;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const { themeColors, currentTheme } = useTheme();

const arrowOffset = ref(0);
let animationFrameId: number | null = null;

const animateOffset = (start: number, end: number, duration: number = 200) => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  const startTime = performance.now();
  
  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    
    arrowOffset.value = start + (end - start) * easeProgress;
    
    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate);
    }
  };
  
  animationFrameId = requestAnimationFrame(animate);
};

const buttonArea = ref({
  x: 14,
  y: 0,
  width: props.buttonWidth,
  height: 30,
});

const drawShape = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const containerWidth = canvas.parentElement?.clientWidth || 800;
  canvas.width = containerWidth;
  canvas.height = 30;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 使用 themes 对象和 currentTheme 获取颜色
  const color = themes[currentTheme.value].primary;
  console.log('Drawing shape, color:', color, 'currentTheme:', currentTheme.value);
  const lineHeight = 3;
  const blockWidth = 175;
  const blockHeight = 30;
  const slopeStartX = 135;

  ctx.fillStyle = color;
  ctx.fillRect(0, blockHeight - lineHeight, canvas.width, lineHeight);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(slopeStartX, 0);
  ctx.lineTo(blockWidth, blockHeight);
  ctx.lineTo(0, blockHeight);
  ctx.closePath();
  ctx.fill();
};

const handleClick = () => {};

const handleButtonClick = () => {
  emit('button-click');
};

const handleMouseEnter = () => {
  animateOffset(arrowOffset.value, -4);
};

const handleMouseLeave = () => {
  animateOffset(arrowOffset.value, 0);
};

onMounted(() => {
  console.log('DecorationCanvas mounted, currentTheme:', currentTheme.value);
  console.log('themeColors.primary:', themeColors.primary);
  drawShape();
  window.addEventListener('resize', drawShape);
});

watch(currentTheme, async () => {
  console.log('watch: currentTheme changed, calling drawShape');
  await nextTick();
  drawShape();
});
</script>

<style scoped>
.decoration-wrapper {
  margin: 30px 40px 15px;
  position: relative;
}

.decoration-canvas {
  display: block;
  width: 100%;
  height: 30px;
  cursor: pointer;
  position: relative;
  z-index: 1;
}

.button-container {
  position: absolute;
  top: 0;
  left: 14px;
  display: flex;
  align-items: center;
  height: 30px;
  cursor: pointer;
  z-index: 10;
}

.arrow {
  font-size: 26px;
  font-weight: bold;
  color: var(--theme-darker-primary);
  transition: transform 0.2s ease-out;
  margin-right: 4px;
  position: relative;
  top: -2px;
}

.button-text {
  font-family: 'Rajdhani', sans-serif;
  font-size: 14px;
  font-weight: bold;
  color: var(--theme-darker-primary);
  position: relative;
  top: 2px;
}
</style>
