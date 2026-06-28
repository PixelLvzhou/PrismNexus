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
          <div v-if="!isApplicationMode" key="manage" class="content-container">
            <DataTable
              :columns="userColumns"
              :data="users"
              :show-search="true"
              search-placeholder="搜索 ID 或用户名..."
              :show-pagination="true"
              :page-size="PAGE_SIZE"
            >
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
                  <span :class="['role-badge', row.role]">{{ getRoleLabel(row.role) }}</span>
                </div>
              </template>

              <template #cell-status="{ row }">
                <div class="account-item">
                  <span :class="['status-dot', row.status]"></span>
                </div>
              </template>

              <template #cell-permissions="{ row }">
                <div class="account-item">
                  <div class="permission-tags">
                    <button class="detail-btn" @click="showDetailDialog(row)">权限配置</button>
                  </div>
                </div>
              </template>

              <template #empty>暂无账户数据</template>
            </DataTable>
          </div>

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

            <DataTable
              :columns="applicationColumns"
              :data="applications"
              :show-search="false"
              :show-pagination="true"
              :page-size="PAGE_SIZE"
              :total="totalApplications"
              :current-page="currentPage"
              @page-change="handlePageChange"
            >
              <template #cell-permission_code="{ row }">
                <div class="application-item">{{ getPermissionName(row.permission_code) }}</div>
              </template>

              <template #cell-created_at="{ row }">
                <div class="application-item">{{ formatDate(row.created_at) }}</div>
              </template>

              <template #cell-expires_at="{ row }">
                <div class="application-item">{{ formatDate(row.expires_at) }}</div>
              </template>

              <template #cell-approver_name="{ row }">
                <div class="application-item">{{ row.approver_name || '-' }}</div>
              </template>

              <template #cell-status="{ row }">
                <div class="application-item">
                  <span :class="['status-text', row.status]">{{ getStatusLabel(row.status) }}</span>
                </div>
              </template>

              <template #cell-actions="{ row }">
                <div class="application-item actions">
                  <template v-if="row.status === 'pending' && currentRole === 'developer'">
                    <button class="action-btn approve" @click="handleApprove(row)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span class="tooltip">通过</span>
                    </button>
                    <button class="action-btn reject" @click="handleReject(row)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      <span class="tooltip">驳回</span>
                    </button>
                  </template>
                  <template v-else-if="row.status === 'rejected' && row.reject_reason">
                    <span class="reject-reason" @click="handleViewRejectReason(row)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                      <span class="tooltip">查看原因</span>
                    </span>
                  </template>
                  <template v-else>
                    <span class="no-action">-</span>
                  </template>
                </div>
              </template>

              <template #empty>暂无申请记录</template>
            </DataTable>
          </div>
        </Transition>
      </div>
    </div>

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
        <span class="detail-label" style="margin-left: 30px;">状态：</span>
        <span :class="['status-dot', detailDialog.user?.status]" style="position: relative; top: -2px;"></span>
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
import DataTable from '@/components/DataTable.vue';
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
const totalApplications = ref(0);
const currentPage = ref(1);
const PAGE_SIZE = 12;
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

const userColumns = computed(() => [
  { key: 'id', label: 'ID', width: '0.5fr', class: 'id' },
  { key: 'avatar_url', label: '头像', width: '0.5fr', class: 'avatar-cell' },
  { key: 'username', label: '用户名', width: '1fr' },
  { key: 'email', label: '邮箱', width: '1.5fr' },
  { key: 'role', label: '角色', width: '1fr' },
  { key: 'status', label: '状态', width: '1fr', class: 'status-center' },
  { key: 'permissions', label: '权限能力', width: '2fr', class: 'actions' }
]);

const applicationColumns = computed(() => [
  { key: 'id', label: 'ID', width: '0.5fr', class: 'id' },
  { key: 'applicant_name', label: '申请人', width: '1fr' },
  { key: 'permission_code', label: '申请权限', width: '1fr' },
  { key: 'created_at', label: '申请时间', width: '1.5fr' },
  { key: 'expires_at', label: '过期时间', width: '1.5fr' },
  { key: 'approver_name', label: '审批人', width: '1fr' },
  { key: 'status', label: '状态', width: '1fr', class: 'status-center' },
  { key: 'actions', label: '操作', width: '1.5fr', class: 'actions' }
]);

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
  // 移除时区信息，将 UTC 时间当作本地时间处理
  const localDateStr = dateStr.replace('Z', '').replace('T', ' ').slice(0, 16);
  return localDateStr.replace(' ', ' ');
};

const formatRelativeTime = (dateStr: string) => {
  if (!dateStr) return '-';
  // 移除时区信息，将 UTC 时间当作本地时间处理
  const localDateStr = dateStr.replace('Z', '').replace('T', ' ');
  const date = new Date(localDateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 60) {
    return `${diffMinutes}分钟之前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays <= 7) {
    return `${diffDays}天前`;
  } else {
    return '7天前';
  }
};

const goBack = () => {
  router.push('/');
};

const showDetailDialog = (user: User) => {
  detailDialog.user = user;
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
    fetchAccounts();
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

watch(isApplicationMode, (newVal) => {
  if (newVal) {
    currentPage.value = 1;
    fetchApplications();
  }
});

watch(selectedStatus, () => {
  currentPage.value = 1;
  fetchApplications(1);
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

const fetchApplications = async (page = 1) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const data = await queryApplications({ 
      status: selectedStatus.value,
      page,
      page_size: PAGE_SIZE
    });
    applications.value = data.applications || [];
    totalApplications.value = data.pagination?.total || 0;
  } catch (err: any) {
    console.error('获取申请列表失败:', err.message);
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchApplications(page);
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

.account-item,
.application-item {
  font-family: 'Rajdhani', sans-serif;
  color: v-bind('themeColors.secondary');
  text-align: left;
}

.account-item.id {
  font-weight: 600;
}

.application-item.id {
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

.status-dot.pending {
  background: linear-gradient(135deg, #eab308 0%, #f59e0b 50%, #d97706 100%);
  animation: yellow-pulse 1.5s ease-in-out infinite;
}

.status-dot.approved {
  background: linear-gradient(135deg, #00ff88 0%, #00cc66 30%, #00aa55 60%, #00ff88 100%);
  animation: green-pulse 1.5s ease-in-out infinite;
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

@keyframes yellow-pulse {
  0%, 100% {
    box-shadow: 0 0 15px rgba(234, 179, 8, 0.7), 0 0 30px rgba(245, 158, 11, 0.5), 0 0 45px rgba(217, 119, 6, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(234, 179, 8, 0.9), 0 0 60px rgba(245, 158, 11, 0.7), 0 0 90px rgba(217, 119, 6, 0.5);
  }
}

/* 申请记录状态文字标签 */
.status-text {
  padding: 4px 12px;
  border-radius: 0;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Rajdhani', sans-serif;
}

.status-text.pending {
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%);
  color: #eab308;
  border: 1px solid rgba(234, 179, 8, 0.5);
}

.status-text.approved {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.2) 100%);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.5);
}

.status-text.rejected {
  background: rgba(255, 255, 255, 0.05);
  color: #9ca3af;
  border: 1px solid rgba(156, 163, 175, 0.5);
}

.status-text.expired {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.5);
}

.status-text.cancelled {
  background: rgba(255, 255, 255, 0.05);
  color: #6b7280;
  border: 1px solid rgba(107, 114, 128, 0.5);
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

.action-btn.approve {
  color: #34d399;
}

.action-btn.approve:hover {
  background: transparent;
}

.action-btn.reject {
  color: #ef4444;
}

.action-btn.reject:hover {
  background: transparent;
}

.no-action {
  color: #888888;
}

.reject-reason {
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
}

.reject-reason:hover {
  text-decoration: underline;
}

.reject-reason svg {
  width: 16px;
  height: 16px;
}

.reject-reason .tooltip {
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

.reject-reason:hover .tooltip {
  opacity: 1;
  visibility: visible;
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
}
</style>