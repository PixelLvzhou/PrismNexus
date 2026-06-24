<template>
  <div class="theme-switcher">
    <div 
      class="theme-button" 
      :class="{ 'theme-button-active': localShowMenu }" 
      @click="handleToggleMenu"
      :style="{ color: themeColors.primary }"
    >
      Prism Switch
    </div>
    <div class="theme-menu" :class="{ 'theme-menu-open': localShowMenu }">
      <div 
        v-for="(color, theme) in themes" 
        :key="theme"
        class="theme-item"
        @click="handleSwitchTheme(theme)"
        :style="{ color: color.primary }"
      >
        <div class="theme-item-icon" :style="{ borderBottomColor: color.primary }">
          <div class="theme-item-inner-icon"></div>
        </div>
        {{ theme }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useTheme } from '@/composables/useTheme';

const { closeThemeMenu, switchTheme, themes, themeColors } = useTheme();

const localShowMenu = ref(false);

const handleToggleMenu = () => {
  localShowMenu.value = !localShowMenu.value;
};

const handleSwitchTheme = (theme: string) => {
  switchTheme(theme);
  localShowMenu.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  const themeSwitcher = document.querySelector('.theme-switcher');
  if (themeSwitcher && !themeSwitcher.contains(event.target as Node)) {
    localShowMenu.value = false;
  }
};

onMounted(() => {
  localShowMenu.value = false;
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.theme-switcher {
  position: relative;
  width: 120px;
}

.theme-switcher.position-absolute {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
}

.theme-button {
  width: 100%;
  text-align: right;
  font-family: 'Orbitron', 'Rajdhani', '宋体', 'SimSun', serif;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  padding: 5px 10px;
  transition: color 0.3s ease;
  box-sizing: border-box;
}

.theme-button-active {
  border-bottom: 1px solid rgba(128, 128, 128, 0.3);
}

.theme-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0;
  background-color: transparent;
  border: none;
  min-width: 100%;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
  pointer-events: none;
  text-align: right;
}

.theme-menu-open {
  max-height: 200px;
  transition: max-height 0.3s ease-in;
  pointer-events: auto;
}

.theme-item {
  padding: 8px 12px;
  color: #fff;
  font-family: 'Orbitron', 'Rajdhani', '宋体', 'SimSun', serif;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  background-color: transparent;
  text-align: right;
  margin-left: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.theme-item:hover {
  background-color: rgba(128, 128, 128, 0.2);
}

.theme-item-icon {
  position: relative;
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.theme-item-icon::before {
  content: '';
  position: absolute;
  top: 1px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 10px solid;
  transition: border-bottom-color 0.3s ease;
}

.theme-item-inner-icon {
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  width: 0;
  height: 0;
  border-left: 3px solid transparent;
  border-right: 3px solid transparent;
  border-bottom: 5px solid #000;
  transition: border-bottom-color 0.3s ease;
}
</style>
