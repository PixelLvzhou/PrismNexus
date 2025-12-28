<template>
  <div class="glass-text-container py-4 px-4 mx-4 rounded-xl">
    <div class="buttons-scroll-container">
      <div class="buttons-wrapper">
        <button class="function-btn btn-1" @click="openUploadDialog">图片上传</button>
        <button class="function-btn btn-2" @click="$emit('go-to-books')">图书阅读</button>
        <button class="function-btn btn-3" @click="goToImageGallery">图片展示</button>
        <button class="function-btn btn-4">图文浏览</button>
      </div>
    </div>
  </div>
  
  <!-- 图片上传弹窗 -->
  <ImageUploadDialog 
    :is-visible="isUploadDialogVisible" 
    @close="closeUploadDialog" 
    @upload="handleImageUpload"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ImageUploadDialog from './ImageUploadDialog.vue'

// 定义组件事件
const emit = defineEmits(['go-to-books']);

// 路由实例
const router = useRouter();

// 响应式数据
const isUploadDialogVisible = ref(false)

// 定义图片接口
interface ImageItem {
  url: string
  name: string
  id: string
}

// 已上传图片数组
const uploadedImages = ref<ImageItem[]>([])

// 打开上传弹窗
const openUploadDialog = () => {
  isUploadDialogVisible.value = true
}

// 关闭上传弹窗
const closeUploadDialog = () => {
  isUploadDialogVisible.value = false
}

// 跳转到图片展示页面
const goToImageGallery = () => {
  router.push('/image-gallery')
}

// 处理图片上传
const handleImageUpload = (file: File) => {
  // 在实际应用中，这里应该调用后端API上传图片
  // 现在我们使用FileReader来模拟上传成功后的结果
  const reader = new FileReader()
  reader.onload = (e) => {
    const imageUrl = e.target?.result as string
    const newImage: ImageItem = {
      url: imageUrl,
      name: file.name,
      id: Date.now().toString() // 生成唯一ID
    }
    uploadedImages.value.push(newImage)
    
    // 保存到localStorage，以便刷新页面后仍然显示
    saveImagesToLocalStorage()
  }
  reader.readAsDataURL(file)
}

// 处理图片删除
const handleDeleteImage = (index: number) => {
  uploadedImages.value.splice(index, 1)
  // 更新localStorage
  saveImagesToLocalStorage()
}

// 保存图片到localStorage
const saveImagesToLocalStorage = () => {
  try {
    localStorage.setItem('uploadedImages', JSON.stringify(uploadedImages.value))
  } catch (error) {
    console.warn('无法保存到localStorage:', error)
  }
}

// 从localStorage加载图片
const loadImagesFromLocalStorage = () => {
  try {
    const savedImages = localStorage.getItem('uploadedImages')
    if (savedImages) {
      uploadedImages.value = JSON.parse(savedImages)
    }
  } catch (error) {
    console.warn('无法从localStorage加载图片:', error)
  }
}

// 组件挂载时加载图片
loadImagesFromLocalStorage()

// 暴露图片数据给父组件
defineExpose({
  uploadedImages,
  handleDeleteImage
})
</script>

<style scoped>
/* 毛玻璃效果文本容器样式 */
.glass-text-container {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.18);
  margin: 10px;
}

/* 功能按钮区域样式 */
.buttons-scroll-container {
  width: 100%;
  overflow-x: auto;
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
  padding: 20px;
}

/* 隐藏滚动条 */
.buttons-scroll-container::-webkit-scrollbar {
  display: none;
}

.buttons-wrapper {
  display: flex;
  gap: 15px;
  min-width: min-content;
}

.function-btn {
  width: 100px;
  height: 45px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: default;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  text-align: center;
  padding: 0 5px;
}

/* 按钮文本渐变色效果 */
.function-btn {
  background: linear-gradient(135deg, #ffffff, #e0e0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  /* 为了让渐变文本可见，给按钮添加实际背景色 */
  position: relative;
}

.function-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}

.function-btn.btn-1::before {
  background-color: #4caf50;
}

.function-btn.btn-2::before {
  background-color: #2196f3;
}

.function-btn.btn-3::before {
  background-color: #ff9800;
}

.function-btn.btn-4::before {
  background-color: #9c27b0;
}

/* 移动端优化 */
@media (max-width: 768px) {
  /* 移动端按钮适配 */
  .function-btn {
    width: 80px;
    height: 38px;
    font-size: 12px;
  }
  
  /* 移动端调整padding */
  .buttons-scroll-container {
    padding: 15px;
  }
}
</style>