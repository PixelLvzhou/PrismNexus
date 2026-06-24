<template>
  <div class="navbar-left">
    <div class="nav-panel">
      <template v-for="(item, index) in navItems" :key="item.key">
        <button 
          class="nav-btn" 
          :class="{ active: activeNav === item.key }" 
          @click="handleNavClick(item.key)"
          @mouseenter="handleNavHover(item.key)"
        >
          <span class="top-border"></span>
          <span class="border-container"></span>
          <span class="hover-border"></span>
          <span class="btn-inner">
            {{ item.label }}
            <span class="ripple-1"></span>
            <span class="ripple-2"></span>
          </span>
          <span v-if="index < navItems.length - 1" class="nav-divider">|</span>
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import { useTheme } from '@/composables/useTheme';
import { soundManager } from '@/utils/soundManager';

interface NavItem {
  key: string;
  label: string;
}

const { themeColors } = useTheme();

// 导航数据
const defaultNavItems: NavItem[] = [
  { key: 'dashboard', label: '仪表盘' },
  { key: 'data', label: '数据中心' },
  { key: 'settings', label: '系统设置' },
  { key: 'users', label: '用户管理' },
  { key: 'security', label: '安全监控' }
];

const props = defineProps<{
  navItems?: NavItem[];
  defaultActive?: string;
}>();

const emit = defineEmits<{
  (e: 'nav-change', key: string): void;
}>();

const navItems = ref(props.navItems || defaultNavItems);
const activeNav = ref(props.defaultActive || 'dashboard');

const handleNavHover = (key: string) => {
  if (activeNav.value !== key) {
    soundManager.playHoverSound();
  }
};

const handleNavClick = (key: string) => {
  if (activeNav.value === key) {
    return;
  }
  soundManager.playClickSound();
  activeNav.value = '';
  setTimeout(() => {
    activeNav.value = key;
    emit('nav-change', key);
  }, 50);
};
</script>

<style scoped>
.navbar-left {
  display: flex;
}

.nav-panel {
  display: flex;
  align-items: center;
  padding: 0;
  background: transparent;
  border-top: 1px solid #5d6365;
  position: relative;
}

.nav-panel::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #5d6365;
  z-index: 1;
}

.nav-btn {
  position: relative;
  padding: 21px 68px 23px 68px;
  background: transparent;
  border: none;
  color: v-bind('themeColors.secondary');
  font-family: 'Rajdhani', sans-serif;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.3s ease;
}

.btn-inner {
  position: absolute;
  top: 1px;
  left: 0;
  right: 0;
  bottom: 3px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: color-mix(in srgb, v-bind('themeColors.primary') 20%, transparent);
  transform: scaleX(0);
  transform-origin: center;
  transition: none;
  z-index: 0;
}

.nav-btn::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: v-bind('themeColors.primary');
  transform: scaleX(0);
  transform-origin: center;
  transition: none;
  z-index: 10;
}

.nav-btn.active::before {
  transform: scaleX(1);
  transition: transform 0.5s ease;
}

.nav-btn.active::after {
  transform: scaleX(1);
  transition: transform 0.5s ease;
}

.nav-divider {
  position: absolute;
  right: -2px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.35);
  font-size: 18px;
  line-height: 1;
}

.hover-border {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: v-bind('themeColors.primary');
  transform: scaleX(0);
  transform-origin: center;
  transition: none;
  z-index: 9;
  pointer-events: none;
}

.nav-btn:hover:not(.active) .hover-border {
  transform: scaleX(1);
  transition: transform 0.5s ease;
}

.nav-btn.active .hover-border {
  transform: scaleX(0);
  transition: none;
}

.nav-btn.active {
  color: #ffffff;
}

.top-border {
  position: absolute;
  top: -1px;
  left: 0;
  width: 100%;
  height: 1px;
  background: v-bind('themeColors.primary');
  transform: scaleX(0);
  transform-origin: center;
  transition: none;
  z-index: 20;
}

.border-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transform: scaleX(0);
  transform-origin: center;
  transition: none;
  z-index: 20;
  pointer-events: none;
}

.border-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 100%;
  background: v-bind('themeColors.primary');
  transform: scaleX(0.5);
  transform-origin: left;
}

.border-container::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background: v-bind('themeColors.primary');
  transform: scaleX(0.5);
  transform-origin: right;
}

.nav-btn.active .top-border {
  transform: scaleX(1);
  transition: transform 0.5s ease;
}

.nav-btn.active .border-container {
  transform: scaleX(1);
  transition: transform 0.5s ease;
}

.btn-inner .ripple-1 {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at 50% 50%,
    transparent 0%,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 40%,
    rgba(255, 255, 255, 0.25) 50%,
    rgba(255, 255, 255, 0.1) 60%,
    transparent 70%,
    transparent 100%
  );
  animation: ripple 3s ease-in-out infinite;
  opacity: 0;
  filter: blur(2px);
  display: none;
}

.nav-btn.active .btn-inner .ripple-1 {
  display: block;
}

.btn-inner .ripple-2 {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at 50% 50%,
    transparent 0%,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 40%,
    rgba(255, 255, 255, 0.25) 50%,
    rgba(255, 255, 255, 0.1) 60%,
    transparent 70%,
    transparent 100%
  );
  animation: ripple 3s ease-in-out infinite;
  animation-delay: 1.5s;
  opacity: 0;
  filter: blur(2px);
  pointer-events: none;
  display: none;
}

.nav-btn.active .btn-inner .ripple-2 {
  display: block;
}

@keyframes ripple {
  0% {
    transform: scale(0.5) rotate(0deg);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  50% {
    transform: scale(1.8) rotate(15deg);
    opacity: 0.7;
  }
  85% {
    opacity: 0.3;
  }
  100% {
    transform: scale(3) rotate(30deg);
    opacity: 0;
  }
}

@media (max-width: 1024px) {
  .navbar {
    padding: 12px 20px;
  }
  
  .nav-btn {
    padding: 8px 15px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 15px;
    padding: 15px 20px;
  }
  
  .navbar-left {
    width: 100%;
  }
  
  .nav-panel {
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    width: 100%;
  }
  
  .nav-btn {
    padding: 8px 16px;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 12px 15px;
  }
  
  .nav-panel {
    gap: 8px;
    padding: 10px 15px;
  }
  
  .nav-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>