<template>
  <div v-if="visible" class="confirm-overlay">
    <div :class="['confirm-dialog', { 'is-closing': isClosing }]">
      <div :class="['confirm-message', { 'show': showMessage }]">{{ message }}</div>
      <div class="confirm-buttons">
        <button 
          class="confirm-btn cancel" 
          @click="handleCancel"
          @mouseenter="handleHover"
        >
          <video class="btn-video" autoplay loop muted playsinline>
            <source src="@/assets/videos/btn-cancelbackgroundl.mp4" type="video/mp4">
          </video>
          <span class="btn-text">{{ cancelText }}</span>
        </button>
        <button 
          class="confirm-btn confirm" 
          @click="handleConfirm"
          @mouseenter="handleHover"
        >
          <video class="btn-video" autoplay loop muted playsinline>
            <source src="@/assets/videos/btn-confirmbackground.mp4" type="video/mp4">
          </video>
          <span class="btn-text">{{ confirmText }}</span>
        </button>
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
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: '确认',
  cancelText: '取消'
});

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
  (e: 'update:visible', value: boolean): void;
}>();

const { themeColors } = useTheme();
const isClosing = ref(false);
const showMessage = ref(false);

const handleHover = () => {
  soundManager.playHoverSound();
};

const triggerMessageShow = () => {
  showMessage.value = false;
  setTimeout(() => {
    showMessage.value = true;
  }, 200);
};

const handleConfirm = () => {
  soundManager.playClickSound();
  isClosing.value = true;
  setTimeout(() => {
    emit('confirm');
    emit('update:visible', false);
    isClosing.value = false;
  }, 300);
};

const handleCancel = () => {
  soundManager.playClickSound();
  isClosing.value = true;
  setTimeout(() => {
    emit('cancel');
    emit('update:visible', false);
    isClosing.value = false;
  }, 300);
};

// 监听visible变化，重置isClosing状态并触发消息显示
watch(() => props.visible, (newVal) => {
  if (newVal) {
    isClosing.value = false;
    triggerMessageShow();
  }
});
</script>

<style scoped>
.confirm-overlay {
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

.confirm-dialog {
  background: #0f0f0fad;
  border-top: 1px solid #5d5f61;
  border-bottom: 1px solid #5d5f61;
  width: 100%;
  height: 250px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  animation: expandFromCenter 0.3s ease forwards;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.confirm-dialog.is-closing {
  animation: fadeOut 0.3s ease forwards;
}

.confirm-message {
  font-size: 18px;
  color: v-bind('themeColors.secondary');
  margin-bottom: 50px;
  line-height: 1.6;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.confirm-message.show {
  opacity: 1;
  transform: translateY(0);
}

.confirm-buttons {
  display: flex;
  gap: 40px;
  justify-content: center;
  position: absolute;
  bottom: 25px;
  left: 0;
  right: 0;
}

.confirm-btn {
  padding: 10px 50px;
  border: none;
  border-radius: 0;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Rajdhani', sans-serif;
  width: 300px;
  height: 50px;
  letter-spacing: 10px;
  text-indent: 10px;
  position: relative;
  overflow: hidden;
}

.btn-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
}

.btn-text {
  position: relative;
  z-index: 1;
}

.confirm-btn:hover .btn-video {
  opacity: 0.7;
}

.confirm-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 0;
}

.confirm-btn.cancel {
  background: rgba(22, 23, 24, 0.9);
  color: #bfc2c7;
  border: none;
  box-shadow: inset 0 0 0 0.5px #bfc2c7, 0 3px 0 0 #bfc2c7;
}

.confirm-btn.cancel::before {
  background: #bfc2c7;
}

.confirm-btn.cancel:hover::before {
  opacity: 0.3;
}

.confirm-btn.cancel:hover {
  color: #ffffff;
}

.confirm-btn.confirm {
  background: rgba(13, 24, 15, 0.9);
  color: v-bind('themeColors.primary');
  border: none;
  box-shadow: inset 0 0 0 0.5px v-bind('themeColors.primary'), 0 3px 0 0 v-bind('themeColors.primary');
}

.confirm-btn.confirm::before {
  background: v-bind('themeColors.primary');
}

.confirm-btn.confirm:hover::before {
  opacity: 0.3;
}

.confirm-btn.confirm:hover {
  color: #ffffff;
}
</style>