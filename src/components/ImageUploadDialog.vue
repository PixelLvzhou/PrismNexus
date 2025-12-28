<template>
  <div v-if="isVisible" class="upload-dialog-overlay" @click.self="handleClose">
    <div class="upload-dialog">
      <div class="dialog-header">
        <h3>上传图片</h3>
        <button class="close-btn" @click="handleClose">×</button>
      </div>
      <div class="dialog-content">
        <div class="upload-area">
          <input 
            type="file" 
            id="fileInput"
            ref="fileInput" 
            accept="image/*" 
            @change="handleFileChange"
            class="file-input"
          />
          <label for="fileInput" class="upload-label">
            <div v-if="!selectedFile" class="upload-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#ccc" stroke-width="2"/>
                <path d="M2 17L12 22L22 17" stroke="#ccc" stroke-width="2"/>
                <path d="M2 12L12 17L22 12" stroke="#ccc" stroke-width="2"/>
              </svg>
              <p>点击或拖拽图片到此处上传</p>
              <p class="file-tip">支持 JPG、PNG、GIF 格式，最大 5MB</p>
            </div>
            <div v-else class="selected-file">
              <img :src="previewUrl" alt="预览" class="preview-image" />
              <p>{{ selectedFile.name }}</p>
            </div>
          </label>
        </div>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="handleClose">取消</button>
          <button 
            class="upload-btn" 
            @click="handleUpload"
            :disabled="!selectedFile || isUploading"
          >
            {{ isUploading ? '上传中...' : '上传' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props
const props = defineProps<{
  isVisible: boolean
}>()

// Emits
const emit = defineEmits<{
  close: []
  upload: [file: File]
}>()

// 响应式数据
const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const previewUrl = ref('')
const isUploading = ref(false)

// 处理文件选择
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    // 验证文件类型和大小
    if (!file.type.startsWith('image/')) {
      alert('请选择有效的图片文件')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB')
      return
    }
    
    selectedFile.value = file
    
    // 生成预览图
    const reader = new FileReader()
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// 处理上传
const handleUpload = async () => {
  if (!selectedFile.value) return
  
  isUploading.value = true
  
  try {
    // 模拟上传延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 触发上传事件，传递文件对象
    emit('upload', selectedFile.value)
    
    // 重置状态
    resetState()
    handleClose()
  } catch (error) {
    console.error('上传失败:', error)
    alert('上传失败，请重试')
  } finally {
    isUploading.value = false
  }
}

// 关闭弹窗
const handleClose = () => {
  resetState()
  emit('close')
}

// 重置状态
const resetState = () => {
  selectedFile.value = null
  previewUrl.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.upload-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.upload-dialog {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.dialog-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.dialog-content {
  padding: 20px;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  transition: border-color 0.2s;
}

.upload-area:hover {
  border-color: #4a90e2;
}

.file-input {
  display: none;
}

.upload-label {
  display: block;
  cursor: pointer;
}

.upload-placeholder p {
  margin: 10px 0 5px 0;
  color: #666;
}

.file-tip {
  font-size: 12px !important;
  color: #999 !important;
}

.selected-file img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
  margin-bottom: 10px;
}

.dialog-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn,
.upload-btn {
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #333;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.upload-btn {
  background-color: #4a90e2;
  color: white;
}

.upload-btn:hover:not(:disabled) {
  background-color: #357abd;
}

.upload-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>