<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        :class="['toast-item', toast.type]"
      >
        <span class="toast-icon">{{ getIcon(toast.type) }}</span>
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" @click="removeToast(toast.id)">&times;</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const toasts = ref<Toast[]>([]);
let toastId = 0;
let timers = new Map<number, ReturnType<typeof setTimeout>>();

const addToast = (message: string, type: Toast['type'] = 'info', duration = 3000) => {
  const id = ++toastId;
  toasts.value.push({ id, message, type });
  
  if (duration > 0) {
    const timer = setTimeout(() => {
      removeToast(id);
    }, duration);
    timers.set(id, timer);
  }
};

const removeToast = (id: number) => {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  const index = toasts.value.findIndex(t => t.id === id);
  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
};

const getIcon = (type: Toast['type']) => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  return icons[type];
};

const success = (message: string, duration?: number) => addToast(message, 'success', duration);
const error = (message: string, duration?: number) => addToast(message, 'error', duration);
const warning = (message: string, duration?: number) => addToast(message, 'warning', duration);
const info = (message: string, duration?: number) => addToast(message, 'info', duration);

defineExpose({
  success,
  error,
  warning,
  info
});

onUnmounted(() => {
  timers.forEach(timer => clearTimeout(timer));
});
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: rgba(20, 20, 20, 0.95);
  border-radius: 0;
  font-family: 'Rajdhani', sans-serif;
  font-size: 14px;
  font-weight: 600;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.3s ease;
}

.toast-icon {
  font-size: 16px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-message {
  flex: 1;
}

.toast-close {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.toast-close:hover {
  color: rgba(255, 255, 255, 0.8);
}

.toast-item.success {
  border-color: rgba(52, 211, 153, 0.3);
  color: #34d399;
}

.toast-item.success .toast-icon {
  background: rgba(52, 211, 153, 0.2);
  border-radius: 50%;
}

.toast-item.error {
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.toast-item.error .toast-icon {
  background: rgba(239, 68, 68, 0.2);
  border-radius: 50%;
}

.toast-item.warning {
  border-color: rgba(251, 191, 36, 0.3);
  color: #fbbf24;
}

.toast-item.warning .toast-icon {
  background: rgba(251, 191, 36, 0.2);
  border-radius: 50%;
}

.toast-item.info {
  border-color: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.toast-item.info .toast-icon {
  background: rgba(59, 130, 246, 0.2);
  border-radius: 50%;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>