<template>
  <canvas ref="canvasRef" class="particle-canvas" :class="{ 'container-mode': containerMode }"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useTheme } from '@/composables/useTheme';

const props = defineProps<{
  containerMode?: boolean;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const { themeColors } = useTheme();

interface Particle {
  x: number;
  y: number;
  size: number;
  brightness: number;
  targetBrightness: number;
  speed: number;
  isFlickering: boolean;
  flickerDuration: number;
}

let ctx: CanvasRenderingContext2D | null = null;
let animationId: number | null = null;
let particles: Particle[] = [];

const PARTICLE_SIZE = 3;
const BASE_BRIGHTNESS = 0.3;
const MAX_BRIGHTNESS = 1;
const FLICKER_CHANCE = 0.005;
const PARTICLE_DENSITY = 0.2;
const MIN_SPACING = 12;

function generateRandomParticles(width: number, height: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  
  const gridWidth = Math.floor(width / MIN_SPACING);
  const gridHeight = Math.floor(height / MIN_SPACING);
  
  for (let gy = 0; gy < gridHeight; gy++) {
    for (let gx = 0; gx < gridWidth; gx++) {
      if (Math.random() < PARTICLE_DENSITY) {
        const x = gx * MIN_SPACING + Math.random() * MIN_SPACING * 0.5;
        const y = gy * MIN_SPACING + Math.random() * MIN_SPACING * 0.5;
        points.push({ x, y });
      }
    }
  }
  
  return points;
}

const initCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  resizeCanvas();
  startAnimation();
};

const resizeCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas || !ctx) return;

  if (props.containerMode && canvas.parentElement) {
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  } else {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  initParticles();
};

const initParticles = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const mapPoints = generateRandomParticles(canvas.width, canvas.height);
  
  particles = mapPoints.map((point) => ({
    x: point.x,
    y: point.y,
    size: PARTICLE_SIZE,
    brightness: BASE_BRIGHTNESS,
    targetBrightness: BASE_BRIGHTNESS,
    speed: 0.03 + Math.random() * 0.04,
    isFlickering: false,
    flickerDuration: 0,
  }));
};

const startAnimation = () => {
  const animate = () => {
    updateParticles();
    drawParticles();
    animationId = requestAnimationFrame(animate);
  };
  animate();
};

const updateParticles = () => {
  particles.forEach((particle) => {
    if (!particle.isFlickering && Math.random() < FLICKER_CHANCE) {
      particle.isFlickering = true;
      particle.targetBrightness = BASE_BRIGHTNESS + Math.random() * (MAX_BRIGHTNESS - BASE_BRIGHTNESS);
      particle.flickerDuration = 60 + Math.random() * 120;
    }

    if (particle.isFlickering) {
      particle.flickerDuration--;
      if (particle.flickerDuration <= 0) {
        particle.isFlickering = false;
        particle.targetBrightness = BASE_BRIGHTNESS;
      }
    }

    const brightnessDiff = particle.targetBrightness - particle.brightness;
    particle.brightness += brightnessDiff * particle.speed;
  });
};

const drawParticles = () => {
  if (!ctx || !canvasRef.value) return;

  ctx.fillStyle = themeColors.value.background;
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);

  particles.forEach((particle) => {
    const alpha = particle.brightness;
    
    if (particle.brightness > BASE_BRIGHTNESS + 0.15) {
      const r = parseInt(themeColors.value.primary.slice(1, 3), 16);
      const g = parseInt(themeColors.value.primary.slice(3, 5), 16);
      const b = parseInt(themeColors.value.primary.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } else {
      const grayValue = Math.floor(60 + particle.brightness * 80);
      ctx.fillStyle = `rgba(${grayValue}, ${grayValue}, ${grayValue}, ${alpha})`;
    }

    ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
  });
};

watch(themeColors, () => {
  drawParticles();
}, { deep: true });

onMounted(() => {
  initCanvas();
  window.addEventListener('resize', resizeCanvas);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});
</script>

<style scoped>
.particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.particle-canvas.container-mode {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
</style>
