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
      <div v-else class="permission-container">
        <div class="toggle-container">
          <label class="toggle-switch">
            <input type="checkbox" v-model="isApplicationMode" />
            <span class="toggle-slider">
              <span class="slider-text">{{ isApplicationMode ? '权限申请' : '权限管理' }}</span>
            </span>
          </label>
        </div>

        <Transition name="fade-slide" mode="out-in">
          <!-- 权限管理容器 -->
          <div v-if="!isApplicationMode" key="manage" class="content-container">
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
            </div>

            <div class="accounts-header" :style="{ backgroundColor: headerBgColor }">
              <div class="header-item">ID</div>
              <div class="header-item">头像</div>
              <div class="header-item">用户名</div>
              <div class="header-item">邮箱</div>
              <div class="header-item">角色</div>
              <div class="header-item">状态</div>
              <div class="header-item">权限能力</div>
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
                <span :class="['role-badge', user.role]">{{ getRoleLabel(user.role) }}</span>
              </div>
              <div class="account-item">
                <span :class="['status-badge', user.status]">{{ user.status === 'enabled' ? '正常' : '封禁' }}</span>
              </div>
              <div class="account-item">
                <div class="permission-tags">
                  <button class="detail-btn" @click="showDetailDialog(user)">权限配置</button>
                </div>
              </div>
            </div>

            <div v-if="filteredUsers.length === 0" class="empty-state">
              暂无账户数据
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

          <!-- 权限申请容器 - 仅开发者可见 -->
          <div v-else key="apply" class="content-container application-mode">
            <div class="filter-container">
              <span class="filter-label">状态筛选：</span>
              <div class="filter-buttons">
                <button 
                  v-for="status in statusFilters" 
                  :key="status.value"
                  :class="['filter-btn', { active: selectedStatus === status.value }]"
                  @click="selectedStatus = status.value"
                >
                  {{ status.label }}
                </button>
              </div>
            </div>

            <div class="applications-header" :style="{ backgroundColor: headerBgColor }">
              <div class="header-item">申请人</div>
              <div class="header-item">申请权限</div>
              <div class="header-item">申请时间</div>
              <div class="header-item">过期时间</div>
              <div class="header-item">审批人</div>
              <div class="header-item">状态</div>
              <div class="header-item">操作</div>
            </div>

            <div 
              v-for="app in filteredApplications" 
              :key="app.id" 
              class="application-row"
            >
              <div class="application-item">{{ app.applicant_name }}</div>
              <div class="application-item">{{ getPermissionName(app.permission_code) }}</div>
              <div class="application-item">{{ formatDate(app.created_at) }}</div>
              <div class="application-item">{{ formatDate(app.expires_at) }}</div>
              <div class="application-item">{{ app.approver_name || '-' }}</div>
              <div class="application-item">
                <span :class="['status-badge', app.status]">{{ getStatusLabel(app.status) }}</span>
              </div>
              <div class="application-item actions">
                <template v-if="app.status === 'pending' && currentRole === 'developer'">
                  <button class="action-btn approve" @click="handleApprove(app)">通过</button>
                  <button class="action-btn reject" @click="handleReject(app)">驳回</button>
                </template>
                <template v-else-if="app.status === 'rejected' && app.reject_reason">
                  <span class="reject-reason" @click="handleViewRejectReason(app)">查看原因</span>
                </template>
                <template v-else>
                  <span class="no-action">-</span>
                </template>
              </div>
            </div>

            <div v-if="filteredApplications.length === 0" class="empty-state">
              暂无申请记录
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- 详情弹框 -->
    <DetailDialog 
      :visible="detailDialog.visible"
      :title="detailDialog.title"
      @update:visible="detailDialog.visible = $event"
      @close="closeDetailDialog"
    >
    <div class="detail-main">
      <div class="detail-user-line">
        <span class="detail-label">用户名：</span>
        <span class="detail-value">{{ detailDialog.user?.username }}</span>
        <span class="detail-label" style="margin-left: 30px;">角色：</span>
        <span :class="['role-badge', detailDialog.user?.role]">{{ getRoleLabel(detailDialog.user?.role) }}</span>
      </div>
      <div class="detail-permissions-section">
        <div class="detail-permissions-title">权限分配</div>
        <div class="permission-tags-grid">
          <div 
            v-for="perm in allPermissions" 
            :key="perm.code"
            :class="['permission-tag-item', { selected: detailDialog.selectedPermissions.includes(perm.code), disabled: detailDialog.user?.role === 'developer' }]"
            @click="detailDialog.user?.role !== 'developer' && togglePermission(perm.code)"
          >
            <span class="tag-name">{{ perm.name }}</span>
            <span :class="['tag-check', { visible: detailDialog.selectedPermissions.includes(perm.code) }]">✓</span>
          </div>
        </div>
      </div>
      <div class="detail-actions">
        <button 
          class="confirm-btn cancel" 
          @click="closeDetailDialog"
          @mouseenter="soundManager.playHoverSound()"
        >
          <video class="btn-video" autoplay loop muted playsinline>
            <source src="@/assets/videos/btn-cancelbackgroundl.mp4" type="video/mp4">
          </video>
          <span class="btn-text">取消</span>
        </button>
        <button 
          class="confirm-btn confirm" 
          @click="handleGrantPermission"
          @mouseenter="soundManager.playHoverSound()"
        >
          <video class="btn-video" autoplay loop muted playsinline>
            <source src="@/assets/videos/btn-confirmbackground.mp4" type="video/mp4">
          </video>
          <span class="btn-text">确定</span>
        </button>
      </div>
    </div>
    </DetailDialog>

    <!-- 驳回原因弹框 -->
    <DetailDialog 
      :visible="rejectDialog.visible"
      title="填写驳回原因"
      @update:visible="rejectDialog.visible = $event"
      @close="closeRejectDialog"
    >
      <div class="reject-form">
        <textarea 
          v-model="rejectDialog.reason"
          class="reject-textarea"
          placeholder="请输入驳回原因..."
          rows="4"
        ></textarea>
        <div class="reject-buttons">
          <button 
            class="reject-btn cancel" 
            @click="closeRejectDialog"
            @mouseenter="soundManager.playHoverSound()"
          >
            <video class="btn-video" autoplay loop muted playsinline>
              <source src="@/assets/videos/btn-cancelbackgroundl.mp4" type="video/mp4">
            </video>
            <span class="btn-text">取消</span>
          </button>
          <button 
            class="reject-btn confirm" 
            @click="submitReject"
            @mouseenter="soundManager.playHoverSound()"
          >
            <video class="btn-video" autoplay loop muted playsinline>
              <source src="@/assets/videos/btn-confirmbackground.mp4" type="video/mp4">
            </video>
            <span class="btn-text">确定</span>
          </button>
        </div>
      </div>
    </DetailDialog>

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
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import DynamicParticleBackground from '@/components/DynamicParticleBackground.vue';
import DecorationCanvas from '@/components/DecorationCanvas.vue';
import DetailDialog from '@/components/DetailDialog.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import Toast from '@/components/Toast.vue';
import { queryApplications, approveApplication, rejectApplication, grantPermission, PERMISSION_CODES } from '@/api/permission';
import { soundManager } from '@/utils/soundManager';

const { themeColors } = useTheme();
const router = useRouter();
const toast = ref<InstanceType<typeof Toast> | null>(null);

interface Permission {
  code: string;
  name: string;
  granted: boolean;
  granted_at?: string;
  granted_by?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  avatar_url?: string;
  permissions: Permission[];
}

interface Application {
  id: number;
  applicant_id: number;
  applicant_name: string;
  permission_code: string;
  status: string;
  approver_id?: number;
  approver_name?: string;
  reject_reason?: string;
  expires_at: string;
  created_at: string;
}

const loading = ref(true);
const error = ref('');
const currentRole = ref('user');
const users = ref<User[]>([]);
const applications = ref<Application[]>([]);
const searchKeyword = ref('');
const currentPage = ref(1);
const PAGE_SIZE = 10;
const isApplicationMode = ref(false);
const selectedStatus = ref('all');
const selectedApplication = ref<Application | null>(null);

const statusFilters = [
  { label: '全部', value: 'all' },
  { label: '待审批', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
  { label: '已过期', value: 'expired' },
  { label: '已取消', value: 'cancelled' }
];

const detailDialog = reactive({
  visible: false,
  title: '权限配置',
  user: null as User | null,
  selectedPermissions: [] as string[]
});

// 获取所有权限编码列表
const allPermissions = computed(() => {
  return Object.values(PERMISSION_CODES).map(p => ({
    code: p.code,
    name: p.name
  }));
});

const rejectDialog = reactive({
  visible: false,
  reason: ''
});

const confirmDialog = reactive({
  visible: false,
  message: '',
  confirmText: '确认',
  cancelText: '取消',
  onConfirm: undefined as (() => void) | undefined
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

const filteredApplications = computed(() => {
  if (selectedStatus.value === 'all') {
    return applications.value;
  }
  return applications.value.filter(app => app.status === selectedStatus.value);
});

const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    developer: '开发者',
    admin: '管理员',
    user: '普通用户'
  };
  return labels[role] || role;
};

const getPermissionName = (code: string): string => {
  return PERMISSION_CODES[code as keyof typeof PERMISSION_CODES]?.name || code;
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已驳回',
    expired: '已过期',
    cancelled: '已取消'
  };
  return labels[status] || status;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN');
};

const clearSearch = () => {
  searchKeyword.value = '';
};

const goBack = () => {
  router.push('/');
};

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

const showDetailDialog = (user: User) => {
  detailDialog.user = user;
  // 初始化选中状态为用户已有的权限
  detailDialog.selectedPermissions = user.permissions
    .filter(p => p.granted)
    .map(p => p.code);
  detailDialog.visible = true;
};

const closeDetailDialog = () => {
  detailDialog.visible = false;
  detailDialog.user = null;
  detailDialog.selectedPermissions = [];
};

const togglePermission = (code: string) => {
  const index = detailDialog.selectedPermissions.indexOf(code);
  if (index === -1) {
    detailDialog.selectedPermissions.push(code);
  } else {
    detailDialog.selectedPermissions.splice(index, 1);
  }
};

const handleGrantPermission = async () => {
  if (!detailDialog.user) return;

  try {
    await grantPermission(detailDialog.user.id, detailDialog.selectedPermissions);
    closeDetailDialog();
    fetchAccounts(); // 刷新账户列表
    toast.value?.success('权限配置成功');
  } catch (err: any) {
    toast.value?.error(err.message || '操作失败');
  }
};

const closeRejectDialog = () => {
  rejectDialog.visible = false;
  rejectDialog.reason = '';
};

const showConfirmDialog = (config: { message: string; confirmText?: string; cancelText?: string; onConfirm?: () => void }) => {
  confirmDialog.visible = true;
  confirmDialog.message = config.message;
  confirmDialog.confirmText = config.confirmText || '确认';
  confirmDialog.cancelText = config.cancelText || '取消';
  confirmDialog.onConfirm = config.onConfirm;
};

const closeConfirmDialog = () => {
  confirmDialog.visible = false;
};

const handleConfirm = () => {
  if (confirmDialog.onConfirm) {
    confirmDialog.onConfirm();
  }
  closeConfirmDialog();
};

const handleApprove = async (app: Application) => {
  showConfirmDialog({
    message: `确定要通过「${app.applicant_name}」的「${getPermissionName(app.permission_code)}」申请吗？`,
    onConfirm: async () => {
      try {
        await approveApplication(app.id);
        await fetchApplications();
        await fetchAccounts();
        toast.value?.success('审批成功');
      } catch (err: any) {
        toast.value?.error(err.message || '操作失败');
      }
    }
  });
};

const handleReject = (app: Application) => {
  selectedApplication.value = app;
  rejectDialog.visible = true;
};

const handleViewRejectReason = (app: Application) => {
  showConfirmDialog({
    message: `驳回原因：${app.reject_reason || '无'}`,
    confirmText: '确定',
    cancelText: ''
  });
};

const submitReject = async () => {
  if (!rejectDialog.reason.trim()) {
    toast.value?.warning('请填写驳回原因');
    return;
  }
  
  if (!selectedApplication.value) return;

  try {
    await rejectApplication(selectedApplication.value.id, rejectDialog.reason);
    closeRejectDialog();
    await fetchApplications();
    await fetchAccounts();
    toast.value?.success('驳回成功');
  } catch (err: any) {
    toast.value?.error(err.message || '操作失败');
  }
};

watch(searchKeyword, () => {
  currentPage.value = 1;
});

watch(isApplicationMode, (newVal) => {
  if (newVal) {
    fetchApplications();
  }
});

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
      currentRole.value = data.currentRole || 'user';
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

const fetchApplications = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const data = await queryApplications({ status: 'all' });
    applications.value = data.applications || [];
  } catch (err: any) {
    console.error('获取申请列表失败:', err.message);
  }
};

onMounted(() => {
  fetchAccounts();
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

.permission-container {
  width: 100%;
}

.toggle-container {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
  height: 26px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 200px;
  height: 26px;
  user-select: none;
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
  display: flex;
  align-items: center;
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 100%;
  width: 50%;
  left: 0;
  top: 0;
  background: #fff;
  transition: 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slider-text {
  position: absolute;
  z-index: 2;
  left: 0;
  top: 50%;
  width: 50%;
  transform: translateY(-50%);
  font-family: 'Rajdhani', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  pointer-events: none;
  transition: transform 0.3s ease-out;
  text-align: center;
}

.toggle-switch input:checked + .toggle-slider {
  background: v-bind('themeColors.primary');
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(100%);
}

.toggle-switch input:checked + .toggle-slider .slider-text {
  color: #1a1a1a;
  transform: translateY(-50%) translateX(100%);
}

.content-container {
  transition: all 0.3s ease-out;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease-out;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.search-container {
  display: flex;
  justify-content: flex-start;
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

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #888888;
  font-size: 16px;
  font-family: 'Rajdhani', sans-serif;
}

.accounts-header,
.applications-header {
  display: grid;
  padding: 15px 20px;
  font-weight: 600;
  color: v-bind('themeColors.primary');
  text-align: left;
  border-bottom: 1px solid v-bind('themeColors.primary');
}

.accounts-header {
  grid-template-columns: 0.5fr 0.5fr 1fr 1.5fr 1fr 1fr 2fr;
}

.applications-header {
  grid-template-columns: 1fr 1fr 1.5fr 1.5fr 1fr 1fr 1.5fr;
}

.header-item {
  font-family: 'Rajdhani', sans-serif;
}

.account-row,
.application-row {
  display: grid;
  padding: 10px 20px;
  border-bottom: 1px solid v-bind('themeColors.primary');
  align-items: center;
  transition: background-color 0.3s ease;
}

.account-row {
  grid-template-columns: 0.5fr 0.5fr 1fr 1.5fr 1fr 1fr 2fr;
}

.application-row {
  grid-template-columns: 1fr 1fr 1.5fr 1.5fr 1fr 1fr 1.5fr;
}

.account-row:hover,
.application-row:hover {
  background: rgba(255, 255, 255, 0.1);
}

.account-item,
.application-item {
  font-family: 'Rajdhani', sans-serif;
  color: v-bind('themeColors.secondary');
  text-align: left;
}

.account-item.id {
  font-weight: 600;
}

.avatar-cell {
  display: flex;
  align-items: center;
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

.role-badge, .status-badge {
  padding: 4px 12px;
  border-radius: 0;
  font-size: 12px;
  font-weight: 600;
}

.role-badge.developer {
  background: linear-gradient(135deg, #ffd700 0%, #d4af37 50%, #b8860b 100%);
  color: #1a1a1a;
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

.status-badge.pending {
  background: rgba(234, 179, 8, 0.2);
  color: #eab308;
}

.status-badge.approved {
  background: rgba(52, 211, 153, 0.2);
  color: #34d399;
}

.status-badge.rejected {
  background: rgba(148, 163, 164, 0.2);
  color: #94a3b8;
}

.status-badge.expired {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.status-badge.cancelled {
  background: rgba(148, 163, 164, 0.2);
  color: #94a3b8;
}

.permission-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.permission-badge {
  padding: 2px 8px;
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  font-size: 11px;
  border-radius: 0;
  font-weight: 600;
}

.detail-btn {
  padding: 2px 8px;
  background: rgba(139, 92, 246, 0.2);
  color: #8b5cf6;
  border: none;
  border-radius: 0;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  margin-left: 4px;
}

.detail-btn:hover {
  background: rgba(139, 92, 246, 0.4);
}

.account-item.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

.application-item.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

.action-btn {
  padding: 4px 10px;
  border: none;
  border-radius: 0;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Rajdhani', sans-serif;
}

.action-btn.approve {
  background: rgba(52, 211, 153, 0.2);
  color: #34d399;
}

.action-btn.approve:hover {
  background: rgba(52, 211, 153, 0.4);
}

.action-btn.reject {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.action-btn.reject:hover {
  background: rgba(239, 68, 68, 0.4);
}

.no-action {
  color: #888888;
}

.reject-reason {
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
}

.reject-reason:hover {
  text-decoration: underline;
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

.filter-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.filter-label {
  color: v-bind('themeColors.primary');
  font-size: 14px;
  font-weight: 600;
  margin-right: 12px;
  font-family: 'Rajdhani', sans-serif;
}

.filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid v-bind('themeColors.primary');
  color: v-bind('themeColors.secondary');
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Rajdhani', sans-serif;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.filter-btn.active {
  background: v-bind('themeColors.primary');
  color: #1a1a1a;
}

/* Detail Dialog Content */
.detail-content {
  text-align: left;
}

.detail-main{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.detail-user-line {
  width: 600px;
  display: flex;
  align-items: center;
  margin: 0 auto;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(93, 95, 97, 0.5);
}

.detail-label {
  color: v-bind('themeColors.primary');
  font-weight: 600;
  font-family: 'Rajdhani', sans-serif;
}

.detail-value {
  color: v-bind('themeColors.secondary');
  font-family: 'Rajdhani', sans-serif;
}

.detail-permissions-section {
  width: 600px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-bottom: 80px;
}

.detail-permissions-title {
  padding: 10px 0;
  box-sizing: border-box;
  color: v-bind('themeColors.primary');
  font-weight: 600;
  font-size: 14px;
  font-family: 'Rajdhani', sans-serif;
  text-align: left;
}

.permission-tags-grid {
  height: 92px;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-bottom: 10px;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.permission-tags-grid::-webkit-scrollbar {
  display: none;
}

.permission-tag-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 15px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background-color 0.3s ease;
  min-width: 140px;
  flex-shrink: 0;
  box-sizing: border-box;
  position: relative;
  height: 40px;
  line-height: 30px;
}

.permission-tag-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px solid #5d5f61;
  pointer-events: none;
  transition: border-color 0.3s ease;
}

.permission-tag-item:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.permission-tag-item:hover:not(.disabled)::before {
  border-color: v-bind('themeColors.primary');
}

.permission-tag-item.selected {
  background: rgba(52, 211, 153, 0.2);
}

.permission-tag-item.selected::before {
  border-color: #34d399;
}

.permission-tag-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tag-name {
  color: v-bind('themeColors.secondary');
  font-size: 13px;
  font-weight: 600;
  font-family: 'Rajdhani', sans-serif;
}

.permission-tag-item.selected .tag-name {
  color: #34d399;
}

.tag-check {
  color: #34d399;
  font-size: 14px;
  font-weight: bold;
  margin-left: 8px;
  width: 16px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tag-check.visible {
  opacity: 1;
}

.detail-actions {
  display: flex;
  gap: 40px;
  justify-content: center;
  position: absolute;
  bottom: 25px;
  left: 0;
  right: 0;
}

.detail-actions .confirm-btn {
  padding: 10px 50px;
  border: none;
  border-radius: 0;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Rajdhani', sans-serif;
  width: 300px;
  height: 50px;
  letter-spacing: 10px;
  text-indent: 10px;
  position: relative;
  overflow: hidden;
}

.detail-actions .btn-video {
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

.detail-actions .btn-text {
  position: relative;
  z-index: 1;
}

.detail-actions .confirm-btn:hover .btn-video {
  opacity: 0.7;
}

.detail-actions .confirm-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 0;
}

.detail-actions .confirm-btn.cancel {
  background: rgba(22, 23, 24, 0.9);
  color: #bfc2c7;
  border: none;
  box-shadow: inset 0 0 0 0.5px #bfc2c7, 0 3px 0 0 #bfc2c7;
}

.detail-actions .confirm-btn.cancel::before {
  background: #bfc2c7;
}

.detail-actions .confirm-btn.cancel:hover::before {
  opacity: 0.3;
}

.detail-actions .confirm-btn.cancel:hover {
  color: #ffffff;
}

.detail-actions .confirm-btn.confirm {
  background: rgba(13, 24, 15, 0.9);
  color: v-bind('themeColors.primary');
  border: none;
  box-shadow: inset 0 0 0 0.5px v-bind('themeColors.primary'), 0 3px 0 0 v-bind('themeColors.primary');
}

.detail-actions .confirm-btn.confirm::before {
  background: v-bind('themeColors.primary');
}

.detail-actions .confirm-btn.confirm:hover::before {
  opacity: 0.3;
}

.detail-actions .confirm-btn.confirm:hover {
  color: #ffffff;
}

/* Reject Dialog */
.reject-form {
  width: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  margin: 0 auto;
}

.reject-textarea {
  width: 400px;
  height: 100px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid v-bind('themeColors.primary');
  color: v-bind('themeColors.secondary');
  font-size: 14px;
  font-family: 'Rajdhani', sans-serif;
  resize: vertical;
  outline: none;
  margin: 0 auto;
}

.reject-textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.reject-textarea:focus {
  background: rgba(255, 255, 255, 0.1);
}

.reject-buttons {
  display: flex;
  gap: 40px;
  justify-content: center;
  margin-top: 15px;
}

.reject-btn {
  padding: 10px 50px;
  border: none;
  border-radius: 0;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Rajdhani', sans-serif;
  width: 300px;
  height: 50px;
  letter-spacing: 10px;
  text-indent: 10px;
  position: relative;
  overflow: hidden;
}

.reject-btn .btn-video {
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

.reject-btn .btn-text {
  position: relative;
  z-index: 1;
}

.reject-btn:hover .btn-video {
  opacity: 0.7;
}

.reject-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 0;
}

.reject-btn.cancel {
  background: rgba(22, 23, 24, 0.9);
  color: #bfc2c7;
  border: none;
  box-shadow: inset 0 0 0 0.5px #bfc2c7, 0 3px 0 0 #bfc2c7;
}

.reject-btn.cancel::before {
  background: #bfc2c7;
}

.reject-btn.cancel:hover::before {
  opacity: 0.3;
}

.reject-btn.cancel:hover {
  color: #ffffff;
}

.reject-btn.confirm {
  background: rgba(13, 24, 15, 0.9);
  color: v-bind('themeColors.primary');
  border: none;
  box-shadow: inset 0 0 0 0.5px v-bind('themeColors.primary'), 0 3px 0 0 v-bind('themeColors.primary');
}

.reject-btn.confirm::before {
  background: v-bind('themeColors.primary');
}

.reject-btn.confirm:hover::before {
  opacity: 0.3;
}

.reject-btn.confirm:hover {
  color: #ffffff;
}

@media (max-width: 768px) {
  .main-content {
    padding: 15px 20px 60px;
  }

  .accounts-header,
  .account-row {
    grid-template-columns: 1fr 1fr;
  }

  .applications-header,
  .application-row {
    grid-template-columns: 1fr 1fr;
  }

  .account-item.actions,
  .application-item.actions {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }
}
</style>
