<template>
  <div class="image-gallery-page">
    <NavigationBar />
    <div class="page-content">
      <h1 class="page-title">图片展示</h1>
      <div class="gallery-container">
        <ImageGallery 
          :images="uploadedImages" 
          @delete="handleDeleteImage"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import NavigationBar from '../components/NavigationBar.vue';
import ImageGallery from '../components/ImageGallery.vue';

// 定义图片接口
interface ImageItem {
  url: string
  name: string
  id: string
}

// 已上传图片数组
const uploadedImages = ref<ImageItem[]>([]);

// 从localStorage加载图片
const loadImagesFromLocalStorage = () => {
  try {
    const savedImages = localStorage.getItem('uploadedImages');
    if (savedImages) {
      uploadedImages.value = JSON.parse(savedImages);
    }
  } catch (error) {
    console.warn('无法从localStorage加载图片:', error);
  }
};

// 处理图片删除
const handleDeleteImage = (index: number) => {
  uploadedImages.value.splice(index, 1);
  // 更新localStorage
  try {
    localStorage.setItem('uploadedImages', JSON.stringify(uploadedImages.value));
  } catch (error) {
    console.warn('无法保存到localStorage:', error);
  }
};

// 组件挂载时加载图片
onMounted(() => {
  loadImagesFromLocalStorage();
});
</script>

<style scoped>
.image-gallery-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.gallery-container {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .page-content {
    padding: 15px;
  }
  
  .page-title {
    font-size: 1.5rem;
    margin-bottom: 15px;
  }
  
  .gallery-container {
    padding: 15px;
  }
}
</style>