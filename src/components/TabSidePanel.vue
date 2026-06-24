<template>
  <Transition name="slide-right">
    <div v-if="modelValue" class="tab-side-panel" @click.self="closePanel">
      <div class="panel-content">
        <!-- 预留头部区域 -->
        <div class="panel-header">
          <span class="panel-title">快捷功能</span>
          <button class="close-btn" @click="closePanel">&times;</button>
        </div>
        
        <!-- 预留内容区域 - Slot -->
        <div class="panel-body">
          <slot name="default">
            <div class="placeholder-text">功能扩展区域</div>
          </slot>
        </div>
        
        <!-- 预留底部区域 -->
        <div class="panel-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

// 改为通过 prop 控制显示/隐藏
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const visible = ref(props.modelValue);

// 同步 prop 和本地状态
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal;
});

watch(visible, (newVal) => {
  emit('update:modelValue', newVal);
});

const closePanel = () => {
  visible.value = false;
};

const togglePanel = () => {
  visible.value = !visible.value;
};

// 暴露方法供父组件使用
defineExpose({
  open: () => { visible.value = true; },
  close: closePanel,
  toggle: togglePanel
});
</script>

<style scoped>
.tab-side-panel {
  position: fixed;
  right: 0;
  top: 0;
  width: 500px;
  height: 100vh;
  z-index: 999;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  flex-direction: column;
}

.panel-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-title {
  font-family: 'Rajdhani', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.close-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #ffffff;
}

.panel-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.placeholder-text {
  font-family: 'Rajdhani', sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  padding-top: 40px;
}

.panel-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 滑入滑出动画 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.slide-right-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
