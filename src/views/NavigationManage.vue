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
      <div v-else class="navigation-container">
        <div class="toggle-container">
          <label class="toggle-switch">
            <input type="checkbox" v-model="isEditMode" />
            <span class="toggle-slider">
              <span class="slider-text">{{ isEditMode ? '新增' : '浏览' }}</span>
            </span>
          </label>
        </div>

        <Transition name="fade-slide" mode="out-in">
          <div v-if="!isEditMode" key="list" class="content-container list-container">
            <DataTable
              :columns="columns"
              :data="navigations"
              :show-search="true"
              search-placeholder="搜索 ID 或导航名称..."
              :show-pagination="true"
              :page-size="PAGE_SIZE"
              :total="totalNavigations"
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

              <template #cell-permission="{ row }">
                <div class="nav-item">
                  <div class="role-tags">
                    <span 
                      v-for="(p, idx) in row.permission" 
                      :key="idx" 
                      :class="['role-badge', p]"
                    >{{ getRoleLabel(p) }}</span>
                  </div>
                </div>
              </template>

              <template #cell-status="{ row }">
                <div class="nav-item">
                  <span :class="['status-dot', row.status ? 'enabled' : 'disabled']"></span>
                </div>
              </template>

              <template #cell-created_at="{ row }">
                <div class="nav-item">{{ formatDate(row.created_at) }}</div>
              </template>

              <template #cell-updated_at="{ row }">
                <div class="nav-item">{{ formatRelativeTime(row.updated_at) }}</div>
              </template>

              <template #cell-actions="{ row }">
                <div class="nav-item actions">
                  <button 
                    v-if="hasNavManagePermission"
                    class="action-btn edit" 
                    @click="handleEdit(row)"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    <span class="tooltip">编辑</span>
                  </button>
                  <button 
                    v-if="hasNavManagePermission"
                    class="action-btn status" 
                    :class="{ 'disabled': !row.status }"
                    @click="handleStatusClick(row)"
                  >
                    <svg v-if="row.status" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 2a10 10 0 1 0 10 10H2a10 10 0 0 0 10-10z"></path>
                      <path d="M16 16l-6-6"></path>
                    </svg>
                    <span class="tooltip">{{ row.status ? '禁用' : '启用' }}</span>
                  </button>
                  <button 
                    v-if="hasNavManagePermission"
                    class="action-btn delete" 
                    @click="handleDeleteClick(row)"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    <span class="tooltip">删除</span>
                  </button>
                  <span v-if="!hasNavManagePermission && currentRole === 'admin'" class="no-permission-text">无操作权限</span>
                  <span v-if="!hasNavManagePermission && currentRole === 'user'" class="no-permission-text">无操作权限</span>
                </div>
              </template>

              <template #empty>暂无导航数据</template>
            </DataTable>
          </div>

          <div v-else key="form" class="content-container form-card">
            <div class="form-group">
              <label>导航名称</label>
              <div class="form-row">
                <div class="form-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                </div>
                <input 
                  v-model="formData.name" 
                  class="form-input"
                  placeholder="请输入导航名称"
                  @input="validateName"
                  @blur="validateNameRequired"
                />
              </div>
              <span v-if="formErrors.name" class="error-message">{{ formErrors.name }}</span>
            </div>

            <div class="form-group">
              <label>导航路由</label>
              <div class="form-row">
                <div class="form-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                  </svg>
                </div>
                <input 
                  v-model="formData.route" 
                  class="form-input"
                  placeholder="请输入导航路由，如 /home"
                  @input="validateRoute"
                  @blur="validateRouteRequired"
                />
              </div>
              <span v-if="formErrors.route" class="error-message">{{ formErrors.route }}</span>
            </div>

            <div class="form-group">
              <label>权限角色（多选）</label>
              <div class="permission-tags-grid">
                <div 
                  v-for="role in availableRoles" 
                  :key="role.value"
                  :class="['permission-tag-item', { selected: formData.permission.includes(role.value) }]"
                  @click="togglePermission(role.value)"
                >
                  <span class="tag-name">{{ role.label }}</span>
                  <span :class="['tag-check', { visible: formData.permission.includes(role.value) }]">✓</span>
                </div>
              </div>
              <span v-if="formErrors.permission" class="error-message">{{ formErrors.permission }}</span>
            </div>

            <div class="form-group">
              <label>状态</label>
              <div class="status-selector">
                <div 
                  :class="['status-toggle', 'enabled', { active: formData.status }]"
                  @click="formData.status = true"
                >
                  <span class="status-dot"></span>
                  <span class="status-text">启用</span>
                </div>
                <div 
                  :class="['status-toggle', 'disabled', { active: !formData.status }]"
                  @click="formData.status = false"
                >
                  <span class="status-dot"></span>
                  <span class="status-text">禁用</span>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button 
                class="save-btn"
                :class="{ 'loading': isSaving, 'disabled': !hasNavManagePermission }"
                :disabled="!hasNavManagePermission"
                @click="handleSaveClick"
              >
                <video class="btn-video" autoplay loop muted playsinline>
                  <source src="@/assets/videos/btn-confirmbackground.mp4" type="video/mp4">
                </video>
                <span class="btn-text">{{ hasNavManagePermission ? (isSaving ? '保存中...' : '保存') : '无权限' }}</span>
              </button>
            </div>
          </div>
        </Transition>
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

    <ConfirmDialog 
      :visible="showSaveConfirm"
      message="确定要保存导航信息吗？"
      @confirm="saveNavigation"
      @update:visible="showSaveConfirm = $event"
    />

    <Toast ref="toast" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
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

interface Navigation {
  id: number;
  name: string;
  route: string;
  permission: string[];
  status: number;
  created_at: string;
  updated_at: string;
}

interface FormData {
  name: string;
  route: string;
  permission: string[];
  status: boolean;
}

interface FormErrors {
  name: string;
  route: string;
  permission: string;
}

const navigations = ref<Navigation[]>([]);
const loading = ref(true);
const error = ref('');
const isEditMode = ref(false);
const editingNav = ref<Navigation | null>(null);
const shouldClearForm = ref(true);
const isSaving = ref(false);
const showSaveConfirm = ref(false);
const totalNavigations = ref(0);
const currentPage = ref(1);
const PAGE_SIZE = 12;

const formErrors = reactive<FormErrors>({
  name: '',
  route: '',
  permission: ''
});

const availableRoles = [
  { value: 'all', label: '所有用户' },
  { value: 'developer', label: '开发者' },
  { value: 'admin', label: '管理员' },
  { value: 'user', label: '普通用户' }
];

const formData = reactive<FormData>({
  name: '',
  route: '',
  permission: ['all'],
  status: true
});

const applications = ref<any[]>([]);

const hasNavManagePermission = computed(() => {
  if (currentRole.value === 'developer') return true;
  const perm = permissions.value.find(p => p.code === 'NAV_MANAGE');
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
    app.permission_code === 'NAV_MANAGE' && 
    (app.status === 'pending' || app.status === 'approved' || app.status === 'rejected' || app.status === 'expired' || app.status === 'cancelled')
  );
});

const hasPendingApplication = computed(() => {
  return currentApplication.value?.status === 'pending';
});

const applyHintMessage = computed(() => {
  if (hasNavManagePermission.value) return null;
  
  const app = currentApplication.value;
  if (!app) return null;
  
  if (app.status === 'pending') {
    return { status: 'pending', text: '已提交权限申请待审批，可随时' };
  }
  
  return null;
});

const applyButtonDisabled = computed(() => {
  if (!showApplyButton.value) return true;
  if (hasNavManagePermission.value) return true;
  if (hasPendingApplication.value) return true;
  return false;
});

const applyButtonText = computed(() => {
  if (!showApplyButton.value) return '';
  if (hasNavManagePermission.value) return '权限已开放';
  if (hasPendingApplication.value) return '已申请';
  return '申请权限';
});

const columns = computed(() => [
  { key: 'id', label: 'ID', width: '0.5fr', class: 'id' },
  { key: 'name', label: '导航名称', width: '1fr' },
  { key: 'route', label: '导航路由', width: '1.5fr' },
  { key: 'permission', label: '覆盖角色', width: '1.5fr' },
  { key: 'status', label: '状态', width: '0.8fr', class: 'status-center' },
  { key: 'created_at', label: '创建时间', width: '1.5fr' },
  { key: 'updated_at', label: '最近修改时间', width: '1.5fr' },
  { key: 'actions', label: '操作', width: '2fr', class: 'actions' }
]);

watch(isEditMode, (newVal) => {
  formErrors.name = '';
  formErrors.route = '';
  formErrors.permission = '';
  
  if (newVal && shouldClearForm.value) {
    editingNav.value = null;
    formData.name = '';
    formData.route = '';
    formData.permission = ['all'];
    formData.status = true;
  }
  shouldClearForm.value = true;
});

const confirmDialog = ref({
  visible: false,
  message: '',
  confirmText: '确认',
  cancelText: '取消',
  onConfirm: undefined as (() => void) | undefined
});

const getRoleLabel = (role: string): string => {
  const found = availableRoles.find(r => r.value === role);
  return found ? found.label : role;
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

const validateName = () => {
  if (!formData.name.trim()) {
    return;
  }
  
  const nameLength = formData.name.length;
  const charCount = formData.name.split('').reduce((count, char) => {
    return count + (char.match(/[\u4e00-\u9fa5]/) ? 2 : 1);
  }, 0);
  
  if (nameLength > 6) {
    formErrors.name = '导航名称最多支持6个汉字';
  } else if (charCount > 15) {
    formErrors.name = '导航名称最多支持15个字符';
  } else {
    formErrors.name = '';
  }
};

const validateNameRequired = () => {
  if (!formData.name.trim()) {
    formErrors.name = '导航名称不能为空';
  }
};

const validateRoute = () => {
  if (!formData.route.trim()) {
    return;
  }
  
  formErrors.route = '';
};

const validateRouteRequired = () => {
  if (!formData.route.trim()) {
    formErrors.route = '导航路由不能为空';
  }
};

const togglePermission = (role: string) => {
  const index = formData.permission.indexOf(role);
  if (index > -1) {
    formData.permission.splice(index, 1);
  } else {
    formData.permission.push(role);
  }
  validatePermission();
};

const validatePermission = () => {
  formErrors.permission = '';
  
  if (!formData.permission || formData.permission.length === 0) {
    return;
  }
};

const clearSearch = () => {
};

const goBack = () => {
  router.push('/');
};

const showConfirmDialog = (config: { message: string; confirmText?: string; cancelText?: string; onConfirm?: () => void }) => {
  confirmDialog.value = {
    visible: true,
    message: config.message,
    confirmText: config.confirmText || '确认',
    cancelText: config.cancelText || '取消',
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

const handleEdit = (nav: Navigation) => {
  shouldClearForm.value = false;
  editingNav.value = nav;
  formData.name = nav.name;
  formData.route = nav.route;
  formData.permission = [...nav.permission];
  formData.status = nav.status === 1;
  isEditMode.value = true;
};

const cancelEdit = () => {
  editingNav.value = null;
  formData.name = '';
  formData.route = '';
  formData.permission = [];
  formData.status = true;
  isEditMode.value = false;
};

const handleStatusClick = (nav: Navigation) => {
  const statusText = nav.status ? '禁用' : '启用';
  showConfirmDialog({
    message: `确定要${statusText}导航「${nav.name}」吗？`,
    onConfirm: () => toggleNavigationStatus(nav)
  });
};

const handleDeleteClick = (nav: Navigation) => {
  showConfirmDialog({
    message: `确定要删除导航「${nav.name}」吗？此操作不可恢复。`,
    onConfirm: () => deleteNavigation(nav)
  });
};

const fetchNavigations = async (page = 1) => {
  const token = localStorage.getItem('token');
  if (!token) {
    error.value = '请先登录';
    loading.value = false;
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/navigation/all?page=${page}&page_size=${PAGE_SIZE}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      navigations.value = data.navigations || [];
      totalNavigations.value = data.pagination?.total || 0;
    } else {
      const errData = await response.json();
      error.value = errData.error || '获取导航列表失败';
    }
  } catch (err) {
    error.value = '网络错误';
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchNavigations(page);
};

const validateForm = (): boolean => {
  formErrors.name = '';
  formErrors.route = '';
  formErrors.permission = '';

  if (!formData.name.trim()) {
    formErrors.name = '导航名称不能为空';
  } else {
    const nameLength = formData.name.length;
    const charCount = formData.name.split('').reduce((count, char) => {
      return count + (char.match(/[\u4e00-\u9fa5]/) ? 2 : 1);
    }, 0);
    
    if (nameLength > 6) {
      formErrors.name = '导航名称最多支持6个汉字';
    } else if (charCount > 15) {
      formErrors.name = '导航名称最多支持15个字符';
    }
  }

  if (!formData.route.trim()) {
    formErrors.route = '导航路由不能为空';
  }

  if (formData.permission.length === 0) {
    formErrors.permission = '请至少选择一个权限角色';
  }

  return !formErrors.name && !formErrors.route && !formErrors.permission;
};

const handleSaveClick = () => {
  if (validateForm()) {
    showSaveConfirm.value = true;
  }
};

const saveNavigation = async () => {
  isSaving.value = true;
  const token = localStorage.getItem('token');
  
  if (!token) {
    toast.value?.warning('请先登录');
    isSaving.value = false;
    return;
  }

  try {
    const url = editingNav.value 
      ? `http://localhost:3000/api/navigation/${editingNav.value.id}`
      : 'http://localhost:3000/api/navigation';
    
    const method = editingNav.value ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: formData.name,
        route: formData.route,
        permission: formData.permission,
        status: formData.status
      })
    });

    if (response.ok) {
      showSaveConfirm.value = false;
      cancelEdit();
      fetchNavigations();
      toast.value?.success('保存成功');
    } else {
      const errData = await response.json();
      toast.value?.error(errData.error || '保存失败');
    }
  } catch (err) {
    toast.value?.error('网络错误');
  } finally {
    isSaving.value = false;
  }
};

const toggleNavigationStatus = async (nav: Navigation) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`http://localhost:3000/api/navigation/${nav.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: !nav.status
      })
    });

    if (response.ok) {
      fetchNavigations();
      toast.value?.success('状态更新成功');
    } else {
      const errData = await response.json();
      toast.value?.error(errData.error || '操作失败');
    }
  } catch (err) {
    toast.value?.error('网络错误');
  }
};

const deleteNavigation = async (nav: Navigation) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`http://localhost:3000/api/navigation/${nav.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      fetchNavigations();
      toast.value?.success('删除成功');
    } else {
      const errData = await response.json();
      toast.value?.error(errData.error || '删除失败');
    }
  } catch (err) {
    toast.value?.error('网络错误');
  }
};

onMounted(() => {
  fetchNavigations();
  fetchMyApplications();
});

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
    message: '确定要申请导航管理权限吗？',
    confirmText: '确认',
    cancelText: '取消',
    onConfirm: async () => {
      try {
        await applyPermission('NAV_MANAGE');
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

.navigation-container {
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
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
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
  transform: translateY(calc(-50% + 2px));
  font-family: 'Rajdhani', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  pointer-events: none;
  transition: transform 0.3s ease-out;
  backface-visibility: hidden;
  will-change: transform;
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
  transform: translateY(calc(-50% + 2px)) translateX(100%);
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

.list-container {
  background: transparent;
}

.apply-btn {
  margin-left: 20px;
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

.no-permission-text {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Rajdhani', sans-serif;
}

.nav-item {
  font-family: 'Rajdhani', sans-serif;
  color: v-bind('themeColors.secondary');
  text-align: left;
  transition: color 0.3s ease;
}

.nav-item.id {
  font-weight: 600;
}

.role-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.role-badge {
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

.role-badge.all {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #6366f1 100%);
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
  animation: green-pulse 3s ease-in-out infinite;
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

.nav-item.actions {
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

.action-btn.edit {
  color: #3b82f6;
}

.action-btn.edit:hover {
  background: transparent;
}

.action-btn.status {
  color: #ef4444;
}

.action-btn.status.disabled {
  color: #34d399;
}

.action-btn.delete {
  color: #dc2626;
}

.action-btn.delete:hover {
  background: transparent;
}

.form-card {
  padding: 0;
  max-width: 600px;
  height: 500px;
}

.form-title {
  font-family: 'Rajdhani', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: v-bind('themeColors.primary');
  margin-bottom: 25px;
  text-align: center;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 20px;
  border-bottom: 2px solid v-bind('themeColors.primary');
  padding-bottom: 10px;
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

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  font-family: 'Rajdhani', sans-serif;
  margin-top: 4px;
  display: block;
}

.permission-tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.permission-tag-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 15px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 120px;
  flex-shrink: 0;
  box-sizing: border-box;
  position: relative;
  height: 35px;
  line-height: 24px;
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

.permission-tag-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.permission-tag-item:hover::before {
  border-color: v-bind('themeColors.primary');
}

.permission-tag-item.selected {
  background: rgba(52, 211, 153, 0.2);
}

.permission-tag-item.selected::before {
  border-color: #34d399;
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

.status-selector {
  display: flex;
  gap: 30px;
}

.status-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-toggle .status-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.2);
}

.status-toggle.active.enabled .status-dot {
  background: linear-gradient(135deg, #00ff88 0%, #00cc66 30%, #00aa55 60%, #00ff88 100%);
  animation: green-pulse 1.5s ease-in-out infinite;
}

.status-toggle.active.disabled .status-dot {
  background: linear-gradient(135deg, #ff3366 0%, #ff0055 30%, #cc0044 60%, #ff3366 100%);
  animation: red-pulse 1.5s ease-in-out infinite;
}

.status-toggle .status-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  font-weight: 600;
  font-family: 'Rajdhani', sans-serif;
}

.status-toggle.active.enabled .status-text {
  color: #34d399;
}

.status-toggle.active.disabled .status-text {
  color: #ef4444;
}

.form-actions {
  display: flex;
  justify-content: flex-start;
  margin-top: 30px;
}

.cancel-btn {
  padding: 10px 30px;
  background: rgba(22, 23, 24, 0.9);
  color: #bfc2c7;
  border: 1px solid #bfc2c7;
  border-radius: 0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Rajdhani', sans-serif;
}

.cancel-btn:hover {
  background: rgba(191, 194, 199, 0.2);
  color: #fff;
}

.save-btn {
  width: 100%;
  padding: 10px 0;
  background: rgba(13, 24, 15, 0.9);
  color: v-bind('themeColors.primary');
  border: none;
  border-radius: 0;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Rajdhani', sans-serif;
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

@media (max-width: 768px) {
  .main-content {
    padding: 15px 20px;
  }
}
</style>