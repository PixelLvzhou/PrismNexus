<template>
  <div class="page-container">
    <DynamicParticleBackground />
    <DecorationCanvas 
      button-text="返回首页" 
      :button-width="100" 
      @button-click="goBack" 
    />

    <div class="main-content">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else class="profile-container">
        <div class="profile-card">
          <div class="profile-header">
            <div class="avatar-section">
              <div class="avatar-wrapper" @mouseenter="showUploadOverlay = true" @mouseleave="showUploadOverlay = false">
                <div v-if="userInfo.avatar" class="avatar-image">
                  <img :src="userInfo.avatar" alt="头像" />
                </div>
                <div v-else class="avatar-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                
                <div 
                  class="upload-overlay" 
                  :class="{ 'show': showUploadOverlay }"
                  @click="triggerFileInput"
                >
                  <div class="upload-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </div>
                  <span class="upload-text">{{ userInfo.avatar ? '更换头像' : '上传头像' }}</span>
                </div>
                
                <input 
                  ref="fileInputRef"
                  type="file" 
                  accept="image/*" 
                  class="file-input"
                  @change="handleImageUpload"
                />
              </div>
              
              <div class="avatar-toggle">
                <label class="toggle-switch">
                  <input type="checkbox" v-model="isEditMode" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="info-section">
              <div class="form-group">
                <label>账户名称</label>
                <div class="form-row">
                  <div class="form-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <input 
                    v-model="formData.username" 
                    :disabled="!isEditMode"
                    class="form-input"
                    :class="{ 'disabled': !isEditMode }"
                    :maxlength="11"
                    @input="handleUsernameInput"
                    @blur="validateUsername"
                  />
                </div>
                <span v-if="formErrors.username" class="error-message">{{ formErrors.username }}</span>
              </div>
              
              <div class="form-group">
                <label>邮箱</label>
                <div class="form-row">
                  <div class="form-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <input 
                    v-model="formData.email" 
                    disabled
                    class="form-input disabled"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label>简介</label>
                <div class="form-row">
                  <div class="form-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                  </div>
                  <textarea 
                    v-model="formData.bio" 
                    :disabled="!isEditMode"
                    class="form-textarea"
                    :class="{ 'disabled': !isEditMode }"
                    rows="2"
                    :maxlength="30"
                    @input="handleBioInput"
                    @blur="validateBio"
                  ></textarea>
                </div>
                <span v-if="formErrors.bio" class="error-message">{{ formErrors.bio }}</span>
              </div>
            </div>
          </div>

          <div class="profile-divider"></div>

          <div class="edit-section">
            <Transition name="btn-expand">
              <button 
                v-if="isEditMode"
                class="save-btn"
                :class="{ 'loading': isSaving }"
                @click="handleSaveClick"
              >
                <video class="btn-video" autoplay loop muted playsinline>
                  <source src="@/assets/videos/btn-confirmbackground.mp4" type="video/mp4">
                </video>
                <span class="btn-text">{{ isSaving ? '保存中...' : '保存' }}</span>
              </button>
            </Transition>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog 
      :visible="showConfirmDialog" 
      message="确定要保存修改吗？" 
      @confirm="saveChanges" 
      @update:visible="showConfirmDialog = $event" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import DynamicParticleBackground from '@/components/DynamicParticleBackground.vue';
import DecorationCanvas from '@/components/DecorationCanvas.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const { themeColors } = useTheme();

const router = useRouter();

interface UserInfo {
  username: string;
  email: string;
  bio: string;
  avatar: string | null;
}

interface FormErrors {
  username: string;
  bio: string;
}

const loading = ref(true);
const error = ref('');
const showUploadOverlay = ref(false);
const isEditMode = ref(false);
const isSaving = ref(false);
const showConfirmDialog = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const avatarChanged = ref(false);

const formErrors = reactive<FormErrors>({
  username: '',
  bio: ''
});

const handleUsernameInput = () => {
  let value = formData.username;
  const chineseCount = (value.match(/[\u4e00-\u9fa5]/g) || []).length;
  const otherCount = value.replace(/[\u4e00-\u9fa5]/g, '').length;
  
  if (chineseCount > 6) {
    value = value.slice(0, 6);
  } else if (chineseCount === 0 && otherCount > 11) {
    value = value.slice(0, 11);
  } else {
    const maxOther = 11 - chineseCount * (11 / 6);
    if (otherCount > maxOther) {
      value = value.slice(0, value.length - (otherCount - Math.floor(maxOther)));
    }
  }
  
  formData.username = value;
  
  if (formData.username.trim()) {
    formErrors.username = '';
  }
};

const validateUsername = () => {
  if (!formData.username.trim()) {
    formErrors.username = '账户名称不能为空';
  } else {
    formErrors.username = '';
  }
};

const handleBioInput = () => {
  if (formData.bio.trim()) {
    formErrors.bio = '';
  }
};

const validateBio = () => {
  if (!formData.bio.trim()) {
    formErrors.bio = '简介不能为空';
  } else {
    formErrors.bio = '';
  }
};

const validateForm = (): boolean => {
  formErrors.username = '';
  formErrors.bio = '';
  
  let isValid = true;
  
  if (!formData.username.trim()) {
    formErrors.username = '账户名称不能为空';
    isValid = false;
  }
  
  if (!formData.bio.trim()) {
    formErrors.bio = '简介不能为空';
    isValid = false;
  }
  
  return isValid;
};

const handleSaveClick = () => {
  if (validateForm()) {
    showConfirmDialog.value = true;
  }
};

const userInfo = reactive<UserInfo>({
  username: '',
  email: '',
  bio: '',
  avatar: null
});

const formData = reactive<UserInfo>({
  username: '',
  email: '',
  bio: '',
  avatar: null
});

const hasChanges = ref(false);

watch([() => formData.username, () => formData.bio], () => {
  hasChanges.value = formData.username !== userInfo.username || formData.bio !== userInfo.bio;
});

const goBack = () => {
  router.push('/');
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result as string;
    userInfo.avatar = result;
    formData.avatar = result;
    avatarChanged.value = true;
    hasChanges.value = true;
  };
  reader.readAsDataURL(file);
};

const fetchUserInfo = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    error.value = '请先登录';
    loading.value = false;
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.user) {
        userInfo.username = data.user.username || '';
        userInfo.email = data.user.email || '';
        userInfo.bio = data.user.bio || '';
        userInfo.avatar = data.user.avatar_url || null;
        
        formData.username = userInfo.username;
        formData.email = userInfo.email;
        formData.bio = userInfo.bio;
        formData.avatar = userInfo.avatar;
      }
    } else {
      const errData = await response.json();
      error.value = errData.error || '获取用户信息失败';
    }
  } catch (err) {
    error.value = '网络错误';
  } finally {
    loading.value = false;
  }
};

const saveChanges = async () => {
  if (!hasChanges.value) return;

  isSaving.value = true;
  const token = localStorage.getItem('token');
  
  if (!token) {
    alert('请先登录');
    isSaving.value = false;
    return;
  }

  try {
    const updateData: { username?: string; bio?: string; avatar_base64?: string } = {};
    
    if (formData.username !== userInfo.username) {
      updateData.username = formData.username;
    }
    if (formData.bio !== userInfo.bio) {
      updateData.bio = formData.bio;
    }
    if (avatarChanged.value && formData.avatar) {
      updateData.avatar_base64 = formData.avatar;
    }

    const response = await fetch('http://localhost:3000/api/auth/update-profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (response.ok) {
      userInfo.username = formData.username;
      userInfo.bio = formData.bio;
      if (avatarChanged.value) {
        await fetchUserInfo();
      }
      avatarChanged.value = false;
      hasChanges.value = false;
      isEditMode.value = false;
    } else {
      const errData = await response.json();
    }
  } catch (err) {
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  fetchUserInfo();
});
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: hidden;
}

.main-content {
  position: relative;
  z-index: 1;
  padding: 40px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  min-height: calc(100vh - 120px);
}

.loading, .error {
  text-align: left;
  padding: 20px;
  color: v-bind('themeColors.secondary');
}

.profile-container {
  width: 100%;
  max-width: 600px;
}

.profile-card {
  padding-top: 0;
  padding-bottom: 0;
  height: auto;
}

.profile-header {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.avatar-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.avatar-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
  cursor: pointer;
}

.avatar-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
}

.avatar-placeholder svg {
  width: 50px;
  height: 50px;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.upload-overlay.show {
  opacity: 1;
  visibility: visible;
}

.upload-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-bottom: 8px;
}

.upload-icon svg {
  width: 30px;
  height: 30px;
}

.upload-text {
  color: #fff;
  font-size: 12px;
  font-family: 'Rajdhani', sans-serif;
}

.file-input {
  display: none;
}

.avatar-toggle {
  width: 150px;
}

.info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-bottom: 2px solid v-bind('themeColors.primary');
}

.form-group label {
  color: v-bind('themeColors.primary');
  font-size: 14px;
  font-weight: 600;
  font-family: 'Rajdhani', sans-serif;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 10px;
}

.form-icon {
  width: 20px;
  height: 20px;
  color: v-bind('themeColors.primary');
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-icon svg {
  width: 100%;
  height: 100%;
}

.form-input {
  width: 100%;
  padding: 6px 0;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 14px;
  font-family: 'Rajdhani', sans-serif;
  outline: none;
}

.form-input.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-textarea {
  width: 100%;
  padding: 6px 0;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 14px;
  font-family: 'Rajdhani', sans-serif;
  outline: none;
  resize: none;
  min-height: 40px;
}

.form-textarea.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  font-family: 'Rajdhani', sans-serif;
  margin-top: 4px;
  display: block;
}

.profile-divider {
  height: auto;
  background: rgba(255, 255, 255, 0.1);
  margin: 25px 0;
}

.edit-section {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 150px;
  height: 20px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.2);
  transition: 0.3s;
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 20px;
  width: 75px;
  left: 0;
  bottom: 0;
  background: #fff;
  transition: 0.3s;
}

.toggle-switch input:checked + .toggle-slider {
  background: v-bind('themeColors.primary');
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(75px);
}

.save-btn {
  padding: 10px 50px;
  background: rgba(13, 24, 15, 0.9);
  color: v-bind('themeColors.primary');
  border: none;
  border-radius: 0;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Rajdhani', sans-serif;
  width: 420px;
  height: 50px;
  letter-spacing: 10px;
  text-indent: 10px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 0 0.5px v-bind('themeColors.primary'), 0 3px 0 0 v-bind('themeColors.primary');
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

.save-btn:hover:not(:disabled) .btn-video {
  opacity: 0.7;
}

.btn-text {
  position: relative;
  z-index: 1;
}

.save-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: v-bind('themeColors.primary');
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 0;
}

.save-btn:hover:not(:disabled)::before {
  opacity: 0.3;
}

.save-btn:hover:not(:disabled) {
  color: #ffffff;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-expand-enter-active {
  animation: btn-expand-in 0.3s ease forwards;
}

.btn-expand-leave-active {
  animation: btn-expand-out 0.3s ease forwards;
}

@keyframes btn-expand-in {
  0% {
    opacity: 0;
    transform: scaleX(0);
  }
  100% {
    opacity: 1;
    transform: scaleX(1);
  }
}

@keyframes btn-expand-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>