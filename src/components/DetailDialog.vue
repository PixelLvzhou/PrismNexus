<template>
  <div v-if="visible" class="detail-overlay">
    <div :class="['detail-dialog', { 'is-closing': isClosing }]">
      <div class="detail-content-wrapper">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTheme } from '@/composables/useTheme';
import { soundManager } from '@/utils/soundManager';

interface Props {
  visible: boolean;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '详情信息'
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:visible', value: boolean): void;
}>();

const { themeColors } = useTheme();
const isClosing = ref(false);

const handleClose = () => {
  soundManager.playClickSound();
  isClosing.value = true;
  setTimeout(() => {
    emit('close');
    emit('update:visible', false);
    isClosing.value = false;
  }, 300);
};

// 监听visible变化，重置isClosing状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    isClosing.value = false;
  }
});

// 暴露handleClose给父组件
defineExpose({ handleClose });
</script>

<style scoped>
.detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.575);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

@keyframes expandFromCenter {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.detail-dialog {
  background: #0f0f0fad;
  border-top: 1px solid #5d5f61;
  border-bottom: 1px solid #5d5f61;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  animation: expandFromCenter 0.3s ease forwards;
  display: flex;
  flex-direction: column;
  position: relative;
}

.detail-dialog.is-closing {
  animation: fadeOut 0.3s ease forwards;
}

.detail-content-wrapper {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
}
</style>
