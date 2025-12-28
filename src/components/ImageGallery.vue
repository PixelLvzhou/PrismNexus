<template>
  <div class="image-gallery">
    <div v-if="images.length > 0" class="gallery-list">
      <div 
        v-for="(image, index) in images" 
        :key="index"
        class="gallery-list-item"
      >
        <img 
          :src="image.url" 
          :alt="`图片 ${index + 1}`"
          class="gallery-image"
          @click="handleImageClick(image)"
        />
        <button 
          class="delete-btn"
          @click.stop="handleDelete(index)"
          title="删除图片"
        >
          删除
        </button>
      </div>
    </div>
    <div v-else class="empty-gallery">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="#ddd" stroke-width="2"/>
        <circle cx="8.5" cy="8.5" r="1.5" fill="#ddd"/>
        <path d="M16 10L10 16L7 13" stroke="#ddd" stroke-width="2"/>
      </svg>
      <p>暂无上传图片</p>
    </div>
    
    <!-- 图片预览弹窗 - 全屏模式，覆盖整个首页 -->
    <div v-if="previewImage" class="image-preview-overlay" @click="closePreview" @wheel.prevent @touchmove.prevent>
      <div class="preview-container" @click.stop>
        <button class="preview-close" @click="closePreview">×</button>
        <img 
          :src="previewImage.url" 
          :alt="'图片预览'" 
          class="preview-image" 
        />
      </div>
    </div>
    
    <!-- 删除确认对话框 -->
    <div v-if="deleteConfirmVisible" class="confirm-overlay" @click="cancelDelete">
      <div class="confirm-dialog" @click.stop>
        <h3 class="confirm-title">确认删除</h3>
        <p class="confirm-message">您确定要删除这张图片吗？此操作无法撤销。</p>
        <div class="confirm-buttons">
          <button class="cancel-btn" @click="cancelDelete">取消</button>
          <button class="confirm-delete-btn" @click="confirmDelete">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

// 定义图片接口
interface ImageItem {
  url: string
  name?: string
  index?: number
}

// Props
const props = defineProps<{
  images: ImageItem[]
}>()

// Emits
const emit = defineEmits<{
  delete: [index: number]
}>()

// 预览图片状态
const previewImage = ref<ImageItem | null>(null)

// 删除确认相关状态
const deleteConfirmVisible = ref(false)
const imageToDeleteIndex = ref<number | null>(null)

// 处理图片点击事件
const handleImageClick = (image: ImageItem) => {
  // 设置索引以便在预览时显示
  previewImage.value = {
    ...image,
    index: props.images.findIndex(img => img.url === image.url)
  }
  
  // 添加防止背景滚动的类
  document.documentElement.classList.add('image-preview-active')
  
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeyDown)
}

// 处理键盘事件
const handleKeyDown = (e: KeyboardEvent) => {
  // 按Esc键关闭预览
  if (e.key === 'Escape' && previewImage.value) {
    closePreview()
  }
}

// 处理删除事件
const handleDelete = (index: number) => {
  imageToDeleteIndex.value = index
  deleteConfirmVisible.value = true
}

// 确认删除
const confirmDelete = () => {
  if (imageToDeleteIndex.value !== null) {
    emit('delete', imageToDeleteIndex.value)
    deleteConfirmVisible.value = false
    imageToDeleteIndex.value = null
  }
}

// 取消删除
const cancelDelete = () => {
  deleteConfirmVisible.value = false
  imageToDeleteIndex.value = null
}

// 关闭预览
const closePreview = () => {
  // 移除防止背景滚动的类
  document.documentElement.classList.remove('image-preview-active')
  
  // 移除键盘事件监听
  document.removeEventListener('keydown', handleKeyDown)
  
  // 关闭预览
  previewImage.value = null
}

// 当组件卸载时清理事件监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.documentElement.classList.remove('image-preview-active')
})
</script>

<style scoped>
.image-gallery {
  padding: 10px 0;
}

.gallery-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 10px;
}

.gallery-list-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  width: 100%;
}

.gallery-list-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.gallery-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;
}

.gallery-image:hover {
  transform: scale(1.05);
}

.delete-btn {
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
  margin-left: auto;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

.empty-gallery {
  padding: 40px 0;
  text-align: center;
  color: #999;
}

.empty-gallery p {
  margin-top: 12px;
  font-size: 14px;
}

/* 图片预览样式 - 全屏覆盖整个首页 */
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999; /* 确保弹窗在最顶层 */
  overflow: hidden;
  touch-action: none; /* 禁止触摸滑动 */
  animation: fadeIn 0.2s ease-out;
  /* 确保覆盖整个视口，包括滚动条区域 */
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 防止背景滚动的全局样式 */
:root {
  --body-overflow: auto;
}

:root.image-preview-active {
  --body-overflow: hidden;
}

body {
  overflow: var(--body-overflow);
}

/* 确保预览容器完全居中且覆盖整个屏幕 */
.preview-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

/* 优化关闭按钮样式 */
.preview-close {
  position: absolute;
  top: 40px;
  right: 40px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  font-size: 32px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10000;
  backdrop-filter: blur(10px);
  /* 添加阴影效果 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  /* 确保按钮在任何情况下都清晰可见 */
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.preview-close:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.preview-close:active {
  transform: scale(0.95);
}

/* 优化预览图片样式，确保居中且适应不同屏幕 */
.preview-image {
  max-width: 95vw;
  max-height: 85vh;
  width: auto;
  height: auto;
  object-fit: contain;
  animation: zoomIn 0.3s ease-out;
  /* 添加轻微阴影增强视觉效果 */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 响应式设计 - 适配移动设备 */
@media (max-width: 768px) {
  .preview-close {
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    font-size: 28px;
  }
  
  .preview-container {
    padding: 15px;
  }
  
  .preview-image {
    max-width: 95vw;
    max-height: 80vh;
  }
  
  .gallery-list-item {
    padding: 8px;
  }
  
  .gallery-image {
    width: 80px;
    height: 80px;
  }
  
  .delete-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .confirm-dialog {
    padding: 20px;
    margin: 20px;
  }
  
  .confirm-title {
    font-size: 16px;
  }
  
  .confirm-message {
    font-size: 13px;
  }
  
  .cancel-btn,
  .confirm-delete-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}

/* 适配极小屏幕 */
@media (max-width: 480px) {
  .preview-close {
    top: 15px;
    right: 15px;
    width: 36px;
    height: 36px;
    font-size: 24px;
  }
  
  .preview-container {
    padding: 10px;
  }
}

.preview-caption {
  color: white;
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
}

/* 删除确认对话框样式 */
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1600;
}

.confirm-dialog {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: confirmFadeIn 0.2s ease;
}

@keyframes confirmFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.confirm-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.confirm-message {
  font-size: 14px;
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.confirm-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn,
.confirm-delete-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.confirm-delete-btn {
  background-color: #f44336;
  color: white;
}

.confirm-delete-btn:hover {
  background-color: #d32f2f;
}
</style>