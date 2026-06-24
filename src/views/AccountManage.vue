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
      <div v-else class="accounts-container">
        <div class="search-container">
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              v-model="searchKeyword"
              placeholder="搜索 ID 或用户名..."
              class="search-input"
            />
            <button 
              v-if="searchKeyword"
              class="search-clear"
              @click="clearSearch"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <button 
            v-if="showApplyButton"
            class="apply-btn"
            :disabled="applyButtonDisabled"
            @click="handleApplyPermission"
          >
            {{ applyButtonText }}
          </button>
        </div>

        <!-- 申请提示 - 根据申请状态显示不同信息 -->
        <div v-if="applyHintMessage" class="apply-hint">
          <span class="hint-text">{{ applyHintMessage.text }}</span>
          <span v-if="applyHintMessage.status === 'pending'" class="hint-cancel" @click="handleCancelApplication">取消申请</span>
          <span v-else class="hint-cancel" @click="handleApplyPermission">申请</span>
        </div>

        <div class="accounts-header" :style="{ backgroundColor: headerBgColor }">
          <div class="header-item">ID</div>
          <div class="header-item">头像</div>
          <div class="header-item">用户名</div>
          <div class="header-item">邮箱</div>
          <div class="header-item">角色</div>
          <div class="header-item">状态</div>
          <div class="header-item">创建时间</div>
          <div class="header-item">操作</div>
        </div>
        <div 
          v-for="user in paginatedUsers" 
          :key="user.id" 
          class="account-row"
        >
          <div class="account-item id">{{ user.id }}</div>
          <div class="account-item avatar-cell">
            <div class="user-avatar-small">
              <img v-if="user.avatar_url" :src="user.avatar_url" alt="头像" class="avatar-img" />
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="avatar-default">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </div>
          <div class="account-item">{{ user.username }}</div>
          <div class="account-item">{{ user.email }}</div>
          <div class="account-item">
            <span :class="['role-badge', user.role]">{{ user.role === 'developer' ? '开发者' : (user.role === 'admin' ? '管理员' : '普通用户') }}</span>
          </div>
          <div class="account-item">
            <span :class="['status-badge', user.status]">{{ user.status === 'enabled' ? '正常' : '封禁' }}</span>
          </div>
          <div class="account-item">{{ formatDate(user.created_at) }}</div>
          <div class="account-item actions">
            <template v-if="currentRole === 'developer' && user.role !== 'developer'">
              <button 
                v-if="user.role !== 'admin'"
                class="action-btn role-admin" 
                @click="handleSetAdmin(user)"
              >设为管理员</button>
              <button 
                v-if="user.role !== 'user'"
                class="action-btn role-user" 
                @click="handleSetUser(user)"
              >设为普通用户</button>
            </template>
            
            <template v-else-if="currentRole === 'admin' && hasAccountManagePermission && user.role === 'user'">
              <button 
                class="action-btn role-admin" 
                @click="handleSetAdmin(user)"
              >设为管理员</button>
            </template>
            
            <!-- 管理员无权限时显示提示 -->
            <span 
              v-else-if="currentRole === 'admin' && !hasAccountManagePermission && user.role !== 'developer'" 
              class="no-permission-hint"
            >无操作权限</span>
            
            <!-- 普通用户无权限时显示提示 -->
            <span 
              v-else-if="currentRole === 'user' && !hasAccountManagePermission && user.role !== 'developer'" 
              class="no-permission-hint"
            >无操作权限</span>
            
            <button 
              v-if="canShowStatusBtn(user)"
              class="action-btn status" 
              @click="handleStatusClick(user)"
              :class="{ 'disabled': user.status === 'disabled' }"
            >
              {{ user.status === 'enabled' ? '封禁' : '启用' }}
            </button>
            
            <button 
              v-if="canShowDeleteBtn(user)"
              class="action-btn delete" 
              @click="handleDeleteClick(user)"
            >删除</button>
          </div>
        </div>
        
        <div v-if="filteredUsers.length === 0" class="empty-state">
          暂无账户数据
        </div>
      </div>
      
      <div class="pagination-container">
        <button 
          class="pagination-btn prev"
          :disabled="currentPage === 1"
          @click="goToPrevPage"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        
        <div class="pagination-numbers">
          <span 
            v-for="page in totalPages" 
            :key="page"
            class="pagination-number"
            :class="{ active: page === currentPage }"
            @click="goToPage(page)"
          >{{ page }}</span>
        </div>
        
        <button 
          class="pagination-btn next"
          :disabled="currentPage === totalPages"
          @click="goToNextPage"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>

    <ConfirmDialog 
      :visible="confirmDialog.visible"
      :message="confirmDialog.message"
      :confirm-text="confirmDialog.confirmText"
      :cancel-text="confirmDialog.cancelText"
      @confirm="handleConfirm"
      @cancel="closeConfirmDialog"
      @update:visible="confirmDialog.visible = $event"
    />

    <Toast ref="toast" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import { useUserStore } from '@/composables/useUserStore';
import DynamicParticleBackground from '@/components/DynamicParticleBackground.vue';
import DecorationCanvas from '@/components/DecorationCanvas.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import Toast from '@/components/Toast.vue';
import { applyPermission, queryApplications, cancelApplication, PERMISSION_CODES } from '@/api/permission';

const { themeColors } = useTheme();
const { permissions, currentRole, currentUserId, refreshPermissions } = useUserStore();
const router = useRouter();
const toast = ref<InstanceType<typeof Toast> | null>(null);

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  avatar_url?: string;
}

interface ConfirmDialogConfig {
  visible: boolean;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm?: () => void;
}

interface Application {
  id: number;
  applicant_id: number;
  permission_code: string;
  status: string;
}

const users = ref<User[]>([]);
const loading = ref(true);
const error = ref('');
const currentPage = ref(1);
const PAGE_SIZE = 12;
const searchKeyword = ref('');

// 申请记录（按需获取）
const applications = ref<Application[]>([]);

const hasAccountManagePermission = computed(() => {
  if (currentRole.value === 'developer') return true;
  const perm = permissions.value.find(p => p.code === 'ACCOUNT_MANAGE');
  return perm?.granted === true;
});

const showApplyButton = computed(() => {
  // 开发者不显示申请按钮
  if (currentRole.value === 'developer') return false;
  // 管理员和普通用户始终显示按钮（有权限时显示"权限已开放"）
  return true;
});

const currentApplication = computed(() => {
  if (!currentUserId.value) return null;
  return applications.value.find(app =>
    app.applicant_id === currentUserId.value &&
    app.permission_code === 'ACCOUNT_MANAGE' &&
    (app.status === 'pending' || app.status === 'approved' || app.status === 'rejected' || app.status === 'expired' || app.status === 'cancelled')
  ) || null;
});

// 当前是否有待审批的申请
const hasPendingApplication = computed(() => {
  return currentApplication.value?.status === 'pending';
});

// 申请提示信息
const applyHintMessage = computed(() => {
  // 有权限时不显示提示
  if (hasAccountManagePermission.value) return null;
  
  const app = currentApplication.value;
  if (!app) return null;
  
  // 待审批状态
  if (app.status === 'pending') {
    return { status: 'pending', text: '已提交权限申请待审批，可随时' };
  }
  
  // 已驳回状态
  if (app.status === 'rejected') {
    return { status: 'rejected', text: '上次申请已被驳回，可' };
  }
  
  // 已过期状态
  if (app.status === 'expired') {
    return { status: 'expired', text: '上次申请已过期，可' };
  }
  
  // 已取消状态
  if (app.status === 'cancelled') {
    return { status: 'cancelled', text: '上次申请已取消，可' };
  }
  
  return null;
});

const applyButtonDisabled = computed(() => {
  if (!showApplyButton.value) return true;
  if (hasAccountManagePermission.value) return true;
  if (hasPendingApplication.value) return true;
  return false;
});

const applyButtonText = computed(() => {
  if (!showApplyButton.value) return '';
  if (hasAccountManagePermission.value) return '权限已开放';
  if (hasPendingApplication.value) return '已申请';
  return '申请权限';
});

const headerBgColor = computed(() => {
  const color = themeColors.value.primary;
  return hexToRgba(color, 0.2);
});

const hexToRgba = (hex: string, alpha: number): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
  }
  return `rgba(100, 200, 255, ${alpha})`;
};

const filteredUsers = computed(() => {
  if (!searchKeyword.value.trim()) {
    return users.value;
  }
  const keyword = searchKeyword.value.trim().toLowerCase();
  return users.value.filter(user => {
    return user.id.toString().includes(keyword) || 
           user.username.toLowerCase().includes(keyword);
  });
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredUsers.value.length / PAGE_SIZE));
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredUsers.value.slice(start, start + PAGE_SIZE);
});

const goToPrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const goToPage = (page: number) => {
  currentPage.value = page;
};

const clearSearch = () => {
  searchKeyword.value = '';
};

watch(searchKeyword, () => {
  currentPage.value = 1;
});

const confirmDialog = ref<ConfirmDialogConfig>({
  visible: false,
  message: '',
  confirmText: '确认',
  cancelText: '取消',
  onConfirm: undefined
});

const goBack = () => {
  router.push('/');
};

const showConfirmDialog = (config: Omit<ConfirmDialogConfig, 'visible'>) => {
  confirmDialog.value = {
    visible: true,
    message: config.message,
    confirmText: config.confirmText,
    cancelText: config.cancelText,
    onConfirm: config.onConfirm
  };
};

const closeConfirmDialog = () => {
  confirmDialog.value.visible = false;
};

const handleConfirm = () => {
  if (confirmDialog.value.onConfirm) {
    confirmDialog.value.onConfirm();
  }
  closeConfirmDialog();
};

const handleStatusClick = (user: User) => {
  const statusText = user.status === 'enabled' ? '封禁' : '启用';
  showConfirmDialog({
    message: `确定要${statusText}账户 ${user.username} 吗？`,
    confirmText: '确认',
    cancelText: '取消',
    onConfirm: () => toggleStatus(user)
  });
};

const handleSetAdmin = (user: User) => {
  showConfirmDialog({
    message: `确定要将账户 ${user.username} 设为管理员吗？`,
    confirmText: '确认',
    cancelText: '取消',
    onConfirm: () => setUserRole(user, 'admin')
  });
};

const handleSetUser = (user: User) => {
  showConfirmDialog({
    message: `确定要将账户 ${user.username} 设为普通用户吗？`,
    confirmText: '确认',
    cancelText: '取消',
    onConfirm: () => setUserRole(user, 'user')
  });
};

const handleDeleteClick = (user: User) => {
  showConfirmDialog({
    message: `确定要删除账户 ${user.username} 吗？此操作不可恢复。`,
    confirmText: '确认',
    cancelText: '取消',
    onConfirm: () => deleteUser(user)
  });
};

const fetchAccounts = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    error.value = '请先登录';
    loading.value = false;
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/auth/accounts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: 'query' })
    });

    if (response.ok) {
      const data = await response.json();
      users.value = data.users || [];
    } else {
      const errData = await response.json();
      error.value = errData.error || '获取账户列表失败';
    }
  } catch (err) {
    error.value = '网络错误';
  } finally {
    loading.value = false;
  }
};

const canShowStatusBtn = (user: User) => {
  if (currentRole.value === 'developer') {
    return user.role !== 'developer';
  }
  if (currentRole.value === 'admin') {
    return hasAccountManagePermission.value && user.role === 'user';
  }
  if (currentRole.value === 'user') {
    return hasAccountManagePermission.value && user.role === 'user';
  }
  return false;
};

const canShowDeleteBtn = (user: User) => {
  if (currentRole.value === 'developer') {
    return user.role !== 'developer';
  }
  if (currentRole.value === 'admin') {
    return hasAccountManagePermission.value && user.role === 'user';
  }
  if (currentRole.value === 'user') {
    return hasAccountManagePermission.value && user.role === 'user';
  }
  return false;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN');
};

const toggleStatus = async (user: User) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch('http://localhost:3000/api/auth/accounts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'status',
        id: user.id,
        status: user.status === 'enabled' ? 'disabled' : 'enabled'
      })
    });

    if (response.ok) {
      fetchAccounts();
      toast.value?.success('操作成功');
    } else {
      const errData = await response.json();
      toast.value?.error(errData.error || '操作失败');
    }
  } catch (err) {
    toast.value?.error('网络错误');
  }
};

const setUserRole = async (user: User, role: string) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch('http://localhost:3000/api/auth/accounts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'role',
        id: user.id,
        role: role
      })
    });

    if (response.ok) {
      fetchAccounts();
      toast.value?.success('角色设置成功');
    } else {
      const errData = await response.json();
      toast.value?.error(errData.error || '操作失败');
    }
  } catch (err) {
    toast.value?.error('网络错误');
  }
};

const deleteUser = async (user: User) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch('http://localhost:3000/api/auth/accounts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'delete',
        id: user.id
      })
    });

    if (response.ok) {
      fetchAccounts();
      toast.value?.success('删除成功');
    } else {
      const errData = await response.json();
      toast.value?.error(errData.error || '删除失败');
    }
  } catch (err) {
    toast.value?.error('网络错误');
  }
};

const fetchMyApplications = async () => {
  try {
    const data = await queryApplications({ status: 'all' });
    applications.value = data.applications || [];
  } catch (err: any) {
    console.error('获取申请记录失败:', err.message);
  }
};

const handleApplyPermission = () => {
  showConfirmDialog({
    message: '确定要申请账户管理权限吗？',
    confirmText: '确认',
    cancelText: '取消',
    onConfirm: async () => {
      try {
        await applyPermission('ACCOUNT_MANAGE');
        await fetchMyApplications();
        await refreshPermissions();
        toast.value?.success('申请已提交');
      } catch (err: any) {
        toast.value?.error(err.message || '申请失败');
      }
    }
  });
};

const handleCancelApplication = () => {
  if (!currentApplication.value) return;

  showConfirmDialog({
    message: '确定要取消申请吗？',
    confirmText: '确认',
    cancelText: '取消',
    onConfirm: async () => {
      try {
        await cancelApplication(currentApplication.value!.id);
        await fetchMyApplications();
        toast.value?.success('申请已取消');
      } catch (err: any) {
        toast.value?.error(err.message || '取消失败');
      }
    }
  });
};

onMounted(() => {
  fetchAccounts();
  fetchMyApplications();
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
  padding: 20px 40px 40px;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  color: v-bind('themeColors.secondary');
}

.accounts-container {
  background: transparent;
  backdrop-filter: none;
  border-radius: 0;
  overflow: visible;
}

.search-container {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid v-bind('themeColors.primary');
  border-radius: 0;
  padding: 8px 16px;
  width: 300px;
  transition: all 0.3s ease;
}

.search-box:focus-within {
  background: rgba(255, 255, 255, 0.1);
  border-color: v-bind('themeColors.primary');
}

.search-icon {
  width: 18px;
  height: 18px;
  color: v-bind('themeColors.secondary');
  margin-right: 10px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: v-bind('themeColors.primary');
  font-size: 14px;
  font-family: 'Rajdhani', sans-serif;
}

.search-input::placeholder {
  color: v-bind('themeColors.secondary');
  opacity: 0.6;
}

.search-clear {
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  color: v-bind('themeColors.secondary');
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin-left: 8px;
  transition: color 0.2s ease;
}

.search-clear:hover {
  color: v-bind('themeColors.primary');
}

.search-clear svg {
  width: 14px;
  height: 14px;
}

.apply-btn {
  padding: 8px 20px;
  background: rgba(13, 24, 15, 0.9);
  color: v-bind('themeColors.primary');
  border: 1px solid v-bind('themeColors.primary');
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Rajdhani', sans-serif;
  transition: all 0.3s ease;
  letter-spacing: 2px;
}

.apply-btn:hover:not(:disabled) {
  background: v-bind('themeColors.primary');
  color: #1a1a1a;
}

.apply-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.apply-hint {
  margin-bottom: 15px;
  padding: 10px 15px;
  background: rgba(234, 179, 8, 0.1);
  border-left: 3px solid #eab308;
  display: flex;
  align-items: center;
  gap: 5px;
}

.hint-text {
  color: #eab308;
  font-size: 13px;
  font-family: 'Rajdhani', sans-serif;
}

.hint-cancel {
  color: #94a3b8;
  font-size: 13px;
  font-family: 'Rajdhani', sans-serif;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.hint-cancel:hover {
  color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #888888;
  font-size: 16px;
  font-family: 'Rajdhani', sans-serif;
}

.accounts-header {
  display: grid;
  grid-template-columns: 0.5fr 0.5fr 1fr 1.5fr 1fr 1fr 1.5fr 2fr;
  padding: 15px 20px;
  font-weight: 600;
  color: v-bind('themeColors.primary');
  text-align: left;
  border-bottom: 1px solid v-bind('themeColors.primary');
}

.header-item {
  font-family: 'Rajdhani', sans-serif;
}

.account-row {
  display: grid;
  grid-template-columns: 0.5fr 0.5fr 1fr 1.5fr 1fr 1fr 1.5fr 2fr;
  padding: 10px 20px;
  border-bottom: 1px solid v-bind('themeColors.primary');
  align-items: center;
  transition: background-color 0.3s ease;
}

.account-row:hover {
  background: rgba(255, 255, 255, 0.1);
}

.account-row:hover .account-item:nth-child(1),
.account-row:hover .account-item:nth-child(2),
.account-row:hover .account-item:nth-child(3),
.account-row:hover .account-item:nth-child(6) {
  color: v-bind('themeColors.primary');
  transition: color 0.3s ease;
}

.account-item {
  font-family: 'Rajdhani', sans-serif;
  color: v-bind('themeColors.secondary');
  text-align: left;
  transition: color 0.3s ease;
}

.account-item.id {
  font-weight: 600;
}

.avatar-cell {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.user-avatar-small {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-default {
  width: 20px;
  height: 20px;
  color: v-bind('themeColors.primary');
}

.account-item.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

.role-badge, .status-badge {
  padding: 4px 12px;
  border-radius: 0;
  font-size: 12px;
  font-weight: 600;
}

.role-badge.developer {
  background: linear-gradient(135deg, #ffd700 0%, #d4af37 50%, #b8860b 100%);
  color: #1a1a1a;
  font-weight: bold;
}

.role-badge.admin {
  background: linear-gradient(135deg, #dc2626 0%, #9333ea 50%, #dc2626 100%);
  color: #ffffff;
}

.role-badge.user {
  background: linear-gradient(135deg, #0d9488 0%, #4ade80 50%, #0d9488 100%);
  color: #ffffff;
}

.status-badge.enabled {
  background: rgba(52, 211, 153, 0.2);
  color: #34d399;
}

.status-badge.disabled {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 0;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.action-btn.status {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.action-btn.status::before {
  background: rgba(239, 68, 68, 0.4);
}

.action-btn.status:hover::before {
  opacity: 1;
}

.action-btn.status.disabled {
  background: rgba(52, 211, 153, 0.2);
  color: #34d399;
}

.action-btn.status.disabled::before {
  background: rgba(52, 211, 153, 0.4);
}

.action-btn.status.disabled:hover::before {
  opacity: 1;
}

.action-btn.role-admin {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.3) 0%, rgba(147, 51, 234, 0.3) 50%, rgba(220, 38, 38, 0.3) 100%);
  color: #ffffff;
  border: 1px solid rgba(147, 51, 234, 0.5);
}

.action-btn.role-admin:hover {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.5) 0%, rgba(147, 51, 234, 0.5) 50%, rgba(220, 38, 38, 0.5) 100%);
}

.action-btn.role-user {
  background: linear-gradient(135deg, rgba(13, 148, 136, 0.3) 0%, rgba(74, 222, 128, 0.3) 50%, rgba(13, 148, 136, 0.3) 100%);
  color: #ffffff;
  border: 1px solid rgba(74, 222, 128, 0.5);
}

.action-btn.role-user:hover {
  background: linear-gradient(135deg, rgba(13, 148, 136, 0.5) 0%, rgba(74, 222, 128, 0.5) 50%, rgba(13, 148, 136, 0.5) 100%);
}

.action-btn.delete {
  background: rgba(220, 38, 38, 0.2);
  color: #dc2626;
}

.action-btn.delete::before {
  background: rgba(220, 38, 38, 0.4);
}

.action-btn.delete:hover::before {
  opacity: 1;
}

.no-permission-hint {
  color: #888888;
  font-size: 12px;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
}

.pagination-container {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10;
}

.pagination-btn {
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  color: v-bind('themeColors.secondary');
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.pagination-btn svg {
  width: 20px;
  height: 20px;
}

.pagination-btn:hover:not(:disabled) {
  color: v-bind('themeColors.primary');
  transform: scale(1.2);
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: scale(1);
}

.pagination-numbers {
  display: flex;
  gap: 8px;
}

.pagination-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: v-bind('themeColors.secondary');
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-number:hover {
  color: v-bind('themeColors.primary');
}

.pagination-number.active {
  color: v-bind('themeColors.primary');
  text-decoration: underline;
}

@media (max-width: 768px) {
  .main-content {
    padding: 15px 20px 60px;
  }

  .accounts-header,
  .account-row {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .account-item.actions {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }
}
</style>
