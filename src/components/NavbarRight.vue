<template>
  <div class="navbar-right">
    <div class="action-buttons">
      <button class="action-btn" @click="onEmailClick">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#c0c5ce" width="32" height="32">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
        <span class="tooltip">邮件</span>
      </button>
      <button class="action-btn" @click="onSettingsClick">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#c0c5ce" width="32" height="32">
          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.05-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.05,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47,0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
        </svg>
        <span class="tooltip">设置</span>
      </button>
    </div>
    
    <div class="user-menu">
      <div class="user-info" @click="toggleUserMenu">
        <div class="user-avatar">
          <template v-if="userInfo.avatar_url && userInfo.avatar_url !== '👤'">
            <img :src="userInfo.avatar_url" alt="用户头像" class="avatar-image" />
          </template>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="avatar-icon">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <span class="user-name">{{ userInfo.username || '管理员' }}</span>
      </div>
      <div class="user-dropdown" :class="{ 'user-dropdown-open': showUserMenu }">
        <div class="dropdown-content">
          <div class="dropdown-item" @click="goToProfile">个人信息</div>
          <div class="dropdown-item" @click="goToAccountManage" v-if="isAdmin || isDeveloper || hasAccountManagePermission">账户管理</div>
          <div class="dropdown-item" @click="goToNavigationManage" v-if="isAdmin || isDeveloper || hasNavManagePermission">导航管理</div>
          <div class="dropdown-item" @click="goToPermissionManage" v-if="isDeveloper">权限管理</div>
          <div class="dropdown-item" @click="goToLab">实验室</div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item logout" @click="showLogoutConfirm = true">退出登录</div>
        </div>
      </div>
    </div>
    
    <ConfirmDialog 
      v-model:visible="showLogoutConfirm" 
      message="确定要退出登录吗？" 
      confirmText="退出" 
      cancelText="取消"
      @confirm="handleLogout"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useTheme } from '@/composables/useTheme';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/composables/useUserStore';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const { themeColors } = useTheme();
const { userInfo, permissions, currentRole, initUserInfo, resetUserInfo, isInitialized } = useUserStore();
const router = useRouter();

const showUserMenu = ref(false);
const showLogoutConfirm = ref(false);

const isAdmin = computed(() => currentRole.value === 'admin');
const isDeveloper = computed(() => currentRole.value === 'developer');

const hasAccountManagePermission = computed(() => {
  if (isDeveloper.value) return true;
  const perm = permissions.value.find(p => p.code === 'ACCOUNT_MANAGE');
  return perm?.granted === true;
});

const hasNavManagePermission = computed(() => {
  if (isDeveloper.value) return true;
  const perm = permissions.value.find(p => p.code === 'NAV_MANAGE');
  return perm?.granted === true;
});

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const goToProfile = () => {
  showUserMenu.value = false;
  router.push('/personal-info');
};

const goToAccountManage = () => {
  showUserMenu.value = false;
  router.push('/account-manage');
};

const goToLab = () => {
  showUserMenu.value = false;
  router.push('/lab');
};

const goToNavigationManage = () => {
  showUserMenu.value = false;
  router.push('/navigation-manage');
};

const goToPermissionManage = () => {
  showUserMenu.value = false;
  router.push('/permission-manage');
};

const handleLogout = () => {
  localStorage.removeItem('token');
  resetUserInfo();
  router.push('/login');
};

const onSettingsClick = () => {
  router.push('/settings');
};

const handleClickOutside = (event: MouseEvent) => {
  const userMenu = document.querySelector('.user-menu');
  
  if (userMenu && !userMenu.contains(event.target as Node)) {
    showUserMenu.value = false;
  }
};

onMounted(async () => {
  document.addEventListener('click', handleClickOutside);
  // 如果还未初始化，初始化用户信息（会复用已有的promise）
  if (!isInitialized.value) {
    await initUserInfo();
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn {
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  width: 38px;
  height: 38px;
  position: relative;
}

.action-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.action-btn:hover svg {
  fill: v-bind('themeColors.primary');
}

.action-btn .tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  padding: 4px 10px;
  background-color: rgba(0, 0, 0, 0.85);
  color: #fff;
  font-size: 12px;
  white-space: nowrap;
  border-radius: 4px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
}

.action-btn:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

.user-menu {
  position: relative;
  cursor: pointer;
  z-index: 100;
}

.user-info {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 5px 12px;
  transition: background-color 0.3s ease;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: v-bind('themeColors.primary');
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.avatar-icon {
  width: 18px;
  height: 18px;
  color: #000;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-family: 'Rajdhani', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  line-height: 18px;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 160px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  pointer-events: none;
}

.user-dropdown-open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  pointer-events: auto;
}

.dropdown-content {
  padding: 8px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  font-family: 'Rajdhani', sans-serif;
  font-size: 14px;
  color: v-bind('themeColors.secondary');
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: v-bind('themeColors.primary');
}

.dropdown-item.logout:hover {
  color: #ff4757;
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
}

@media (max-width: 1024px) {
  .navbar-right {
    gap: 12px;
  }
  
  .user-name {
    font-size: 13px;
  }
  
  .user-avatar {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .navbar-right {
    width: 100%;
    justify-content: center;
    gap: 20px;
  }
  
  .user-dropdown {
    right: -50%;
    transform: translateX(50%) translateY(-10px);
  }
  
  .user-dropdown-open {
    transform: translateX(50%) translateY(0);
  }
}

@media (max-width: 480px) {
  .navbar-right {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  
  .user-name {
    font-size: 12px;
  }
}
</style>
