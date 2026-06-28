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
        <DataTable
          :columns="columns"
          :data="users"
          :show-search="true"
          search-placeholder="搜索 ID 或用户名..."
          :show-pagination="true"
          :page-size="PAGE_SIZE"
          :total="totalUsers"
          :current-page="currentPage"
          @page-change="handlePageChange"
        >
          <template #search-extra>
                <button 
                  v-if="showApplyButton"
                  class="apply-btn"
                  :disabled="applyButtonDisabled"
                  @click="handleApplyPermission"
                >
                  {{ applyButtonText }}
                </button>
              </template>

              <template #search-bottom>
                <div v-if="applyHintMessage" class="apply-hint">
                  <span class="hint-text">{{ applyHintMessage.text }}</span>
                  <span class="hint-cancel" @click="handleCancelApplication">取消申请</span>
                </div>
              </template>

          <template #cell-id="{ row }">
            <div class="account-item id">{{ row.id }}</div>
          </template>

          <template #cell-avatar_url="{ row }">
            <div class="account-item avatar-cell">
              <div class="user-avatar-small">
                <img v-if="row.avatar_url" :src="row.avatar_url" alt="头像" class="avatar-img" />
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="avatar-default">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            </div>
          </template>

          <template #cell-role="{ row }">
            <div class="account-item">
              <span :class="['role-badge', row.role]">{{ row.role === 'developer' ? '开发者' : (row.role === 'admin' ? '管理员' : '普通用户') }}</span>
            </div>
          </template>

          <template #cell-status="{ row }">
            <div class="account-item">
              <span :class="['status-dot', row.status]"></span>
            </div>
          </template>

          <template #cell-created_at="{ row }">
            <div class="account-item">{{ formatDate(row.created_at) }}</div>
          </template>

          <template #cell-actions="{ row }">
            <div class="account-item actions">
              <template v-if="currentRole === 'developer' && row.role !== 'developer'">
                <button 
                  v-if="row.role !== 'admin'"
                  class="action-btn role-admin" 
                  @click="handleSetAdmin(row)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                  </svg>
                  <span class="tooltip">设为管理员</span>
                </button>
                <button 
                  v-if="row.role !== 'user'"
                  class="action-btn role-user" 
                  @click="handleSetUser(row)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span class="tooltip">设为普通用户</span>
                </button>
              </template>
              
              <template v-else-if="currentRole === 'admin' && hasAccountManagePermission && row.role === 'user'">
                <button 
                  class="action-btn role-admin" 
                  @click="handleSetAdmin(row)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                  </svg>
                  <span class="tooltip">设为管理员</span>
                </button>
              </template>
              
              <span 
                v-else-if="currentRole === 'admin' && !hasAccountManagePermission && row.role !== 'developer'" 
                class="no-permission-hint"
              >无操作权限</span>
              
              <span 
                v-else-if="currentRole === 'user' && !hasAccountManagePermission && row.role !== 'developer'" 
                class="no-permission-hint"
              >无操作权限</span>
              
              <button 
                v-if="canShowStatusBtn(row)"
                class="action-btn status" 
                @click="handleStatusClick(row)"
                :class="{ 'disabled': row.status === 'disabled' }"
              >
                <svg v-if="row.status === 'enabled'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10H2a10 10 0 0 0 10-10z"></path>
                  <path d="M16 16l-6-6"></path>
                </svg>
                <span class="tooltip">{{ row.status === 'enabled' ? '封禁' : '启用' }}</span>
              </button>
              
              <button 
                v-if="canShowDeleteBtn(row)"
                class="action-btn delete" 
                @click="handleDeleteClick(row)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span class="tooltip">删除</span>
              </button>
            </div>
          </template>

          <template #empty>暂无账户数据</template>
        </DataTable>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import { useUserStore } from '@/composables/useUserStore';
import DynamicParticleBackground from '@/components/DynamicParticleBackground.vue';
import DecorationCanvas from '@/components/DecorationCanvas.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import Toast from '@/components/Toast.vue';
import DataTable from '@/components/DataTable.vue';
import { applyPermission, queryApplications, cancelApplication } from '@/api/permission';

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
const totalUsers = ref(0);
const currentPage = ref(1);
const loading = ref(true);
const error = ref('');
const PAGE_SIZE = 12;

const applications = ref<Application[]>([]);

const hasAccountManagePermission = computed(() => {
  if (currentRole.value === 'developer') return true;
  const perm = permissions.value.find(p => p.code === 'ACCOUNT_MANAGE');
  return perm?.granted === true;
});

const showApplyButton = computed(() => {
  if (currentRole.value === 'developer') return false;
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

const hasPendingApplication = computed(() => {
  return currentApplication.value?.status === 'pending';
});

const applyHintMessage = computed(() => {
  if (hasAccountManagePermission.value) return null;
  
  const app = currentApplication.value;
  if (!app) return null;
  
  if (app.status === 'pending') {
    return { status: 'pending', text: '已提交权限申请待审批，可随时' };
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

const columns = computed(() => [
  { key: 'id', label: 'ID', width: '0.5fr', class: 'id' },
  { key: 'avatar_url', label: '头像', width: '0.5fr', class: 'avatar-cell' },
  { key: 'username', label: '用户名', width: '1fr' },
  { key: 'email', label: '邮箱', width: '1.5fr' },
  { key: 'role', label: '角色', width: '1fr' },
  { key: 'status', label: '状态', width: '1fr', class: 'status-center' },
  { key: 'created_at', label: '创建时间', width: '1.5fr' },
  { key: 'actions', label: '操作', width: '2fr', class: 'actions' }
]);

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

const fetchAccounts = async (page = 1) => {
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
      body: JSON.stringify({ type: 'query', page, page_size: PAGE_SIZE })
    });

    if (response.ok) {
      const data = await response.json();
      users.value = data.users || [];
      totalUsers.value = data.pagination?.total || 0;
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

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchAccounts(page);
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
  // 移除时区信息，将 UTC 时间当作本地时间处理
  const localDateStr = dateStr.replace('Z', '').replace('T', ' ').slice(0, 16);
  return localDateStr.replace(' ', ' ');
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
  padding: 10px 15px;
  background: rgba(234, 179, 8, 0.1);
  border-left: 3px solid #eab308;
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
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

.status-dot {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
}

.status-dot.enabled {
  background: linear-gradient(135deg, #00ff88 0%, #00cc66 30%, #00aa55 60%, #00ff88 100%);
  animation: green-pulse 1.5s ease-in-out infinite;
}

.status-dot.disabled {
  background: linear-gradient(135deg, #ff3366 0%, #ff0055 30%, #cc0044 60%, #ff3366 100%);
  animation: red-pulse 1.5s ease-in-out infinite;
}

@keyframes green-pulse {
  0%, 100% {
    box-shadow: 0 0 15px rgba(0, 255, 136, 0.7), 0 0 30px rgba(0, 204, 102, 0.5), 0 0 45px rgba(0, 170, 85, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(0, 255, 136, 0.9), 0 0 60px rgba(0, 204, 102, 0.7), 0 0 90px rgba(0, 170, 85, 0.5);
  }
}

@keyframes red-pulse {
  0%, 100% {
    box-shadow: 0 0 15px rgba(255, 51, 102, 0.7), 0 0 30px rgba(255, 0, 85, 0.5), 0 0 45px rgba(204, 0, 68, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 51, 102, 0.9), 0 0 60px rgba(255, 0, 85, 0.7), 0 0 90px rgba(204, 0, 68, 0.5);
  }
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 0;
  background: transparent !important;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: visible;
}

.action-btn svg {
  width: 20px;
  height: 20px;
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
  z-index: 100;
}

.action-btn:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

.action-btn.status {
  color: #ef4444;
}

.action-btn.status.disabled {
  color: #34d399;
}

.action-btn.role-admin {
  color: #a855f7;
}

.action-btn.role-admin:hover {
  background: transparent;
}

.action-btn.role-user {
  color: #4ade80;
}

.action-btn.role-user:hover {
  background: transparent;
}

.action-btn.delete {
  color: #dc2626;
}

.no-permission-hint {
  color: #888888;
  font-size: 12px;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 600;
}

@media (max-width: 768px) {
  .main-content {
    padding: 15px 20px 60px;
  }
}
</style>