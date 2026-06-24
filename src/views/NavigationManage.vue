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
            <div class="search-container">
              <div class="search-box">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  type="text" 
                  v-model="searchKeyword"
                  placeholder="搜索 ID 或导航名称..."
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

            <div class="nav-header" :style="{ backgroundColor: headerBgColor }">
              <div class="header-item">ID</div>
              <div class="header-item">名称</div>
              <div class="header-item">导航路由</div>
              <div class="header-item">角色</div>
              <div class="header-item">状态</div>
              <div class="header-item">创建时间</div>
              <div class="header-item">最近修改时间</div>
              <div class="header-item">操作</div>
            </div>

            <div 
              v-for="nav in filteredNavigations" 
              :key="nav.id" 
              class="nav-row"
            >
              <div class="nav-item id">{{ nav.id }}</div>
              <div class="nav-item">{{ nav.name }}</div>
              <div class="nav-item">{{ nav.route }}</div>
              <div class="nav-item">
                <div class="role-tags">
                  <span 
                    v-for="(p, idx) in nav.permission" 
                    :key="idx" 
                    :class="['role-badge', p]"
                  >{{ getRoleLabel(p) }}</span>
                </div>
              </div>
              <div class="nav-item">
                <span :class="['status-badge', nav.status ? 'enabled' : 'disabled']">
                  {{ nav.status ? '启用' : '禁用' }}
                </span>
              </div>
              <div class="nav-item">{{ formatDate(nav.created_at) }}</div>
              <div class="nav-item">{{ formatDate(nav.updated_at) }}</div>
              <div class="nav-item actions">
                <button 
                  v-if="hasNavManagePermission"
                  class="action-btn edit" 
                  @click="handleEdit(nav)"
                >编辑</button>
                <button 
                  v-if="hasNavManagePermission"
                  class="action-btn status" 
                  :class="{ 'disabled': !nav.status }"
                  @click="handleStatusClick(nav)"
                >{{ nav.status ? '禁用' : '启用' }}</button>
                <button 
                  v-if="hasNavManagePermission"
                  class="action-btn delete" 
                  @click="handleDeleteClick(nav)"
                >删除</button>
                <span v-if="!hasNavManagePermission && currentRole === 'admin'" class="no-permission-text">无操作权限</span>
                <span v-if="!hasNavManagePermission && currentRole === 'user'" class="no-permission-text">无操作权限</span>
              </div>
            </div>

            <div v-if="filteredNavigations.length === 0" class="empty-state">
              暂无导航数据
            </div>
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
              <div class="permission-selector">
                <label 
                  v-for="role in availableRoles" 
                  :key="role.value" 
                  class="permission-checkbox"
                >
                  <input 
                    type="checkbox" 
                    :checked="formData.permission.includes(role.value)"
                    @change="togglePermission(role.value)"
                  />
                  <span class="checkbox-custom"></span>
                  <span class="checkbox-label">{{ role.label }}</span>
                </label>
              </div>
              <span v-if="formErrors.permission" class="error-message">{{ formErrors.permission }}</span>
            </div>

            <div class="form-group">
              <label>状态</label>
              <div class="status-selector">
                <label class="status-option">
                  <input 
                    type="radio" 
                    name="status" 
                    :checked="formData.status"
                    @change="formData.status = true"
                  />
                  <span>启用</span>
                </label>
                <label class="status-option">
                  <input 
                    type="radio" 
                    name="status" 
                    :checked="!formData.status"
                    @change="formData.status = false"
                  />
                  <span>禁用</span>
                </label>
              </div>
            </div>

            <div class="form-actions">
              <button 
                class="save-btn"
                :class="{ 'loading': isSaving }"
                @click="handleSaveClick"
              >
                <video class="btn-video" autoplay loop muted playsinline>
                  <source src="@/assets/videos/btn-confirmbackground.mp4" type="video/mp4">
                </video>
                <span class="btn-text">{{ isSaving ? '保存中...' : '保存' }}</span>
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
import { applyPermission, queryApplications, cancelApplication, PERMISSION_CODES } from '@/api/permission';

const { themeColors } = useTheme();
const { userInfo, permissions, currentRole, currentUserId, refreshPermissions } = useUserStore();
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
const searchKeyword = ref('');
const isSaving = ref(false);
const showSaveConfirm = ref(false);

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

// 申请记录（按需获取）
const applications = ref<any[]>([]);

// 权限申请相关计算属性
const hasNavManagePermission = computed(() => {
  if (currentRole.value === 'developer') return true;
  const perm = permissions.value.find(p => p.code === 'NAV_MANAGE');
  return perm?.granted === true;
});

const showApplyButton = computed(() => {
  // 开发者不显示申请按钮
  if (currentRole.value === 'developer') return false;
  // 管理员和普通用户始终显示按钮（有权限时显示"权限已开放"）
  return true;
});

// 当前申请记录（包含所有状态的申请）
const currentApplication = computed(() => {
  if (!currentUserId.value) return null;
  return applications.value.find(app => 
    app.applicant_id === currentUserId.value &&
    app.permission_code === 'NAV_MANAGE' && 
    (app.status === 'pending' || app.status === 'approved' || app.status === 'rejected' || app.status === 'expired' || app.status === 'cancelled')
  );
});

// 当前是否有待审批的申请
const hasPendingApplication = computed(() => {
  return currentApplication.value?.status === 'pending';
});

// 申请提示信息
const applyHintMessage = computed(() => {
  // 有权限时不显示提示
  if (hasNavManagePermission.value) return null;
  
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

const showApplyRecord = computed(() => {
  // 开发者不需要显示申请记录
  if (currentRole.value === 'developer') return false;
  return currentApplication.value !== null || !hasNavManagePermission.value;
});

const applyButtonDisabled = computed(() => {
  if (!showApplyButton.value) return true;
  if (hasNavManagePermission.value) return true; // 已有权限
  if (hasPendingApplication.value) return true; // 申请中
  return false;
});

const applyButtonText = computed(() => {
  if (!showApplyButton.value) return '';
  if (hasNavManagePermission.value) return '权限已开放';
  if (hasPendingApplication.value) return '已申请';
  return '申请权限';
});

const getPermissionName = (code: string) => {
  return PERMISSION_CODES[code as keyof typeof PERMISSION_CODES]?.name || code;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已驳回',
    expired: '已过期',
    cancelled: '已取消'
  };
  return labels[status] || status;
};

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

const headerBgColor = computed(() => {
  const color = themeColors.value.primary;
  return hexToRgba(color, 0.2);
});

const filteredNavigations = computed(() => {
  if (!searchKeyword.value.trim()) {
    return navigations.value;
  }
  const keyword = searchKeyword.value.trim().toLowerCase();
  return navigations.value.filter(nav => {
    return nav.id.toString().includes(keyword) || 
           nav.name.toLowerCase().includes(keyword);
  });
});

const hexToRgba = (hex: string, alpha: number): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
  }
  return `rgba(100, 200, 255, ${alpha})`;
};

const getRoleLabel = (role: string): string => {
  const found = availableRoles.find(r => r.value === role);
  return found ? found.label : role;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN');
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
  searchKeyword.value = '';
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

const fetchNavigations = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    error.value = '请先登录';
    loading.value = false;
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/navigation/all', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      navigations.value = data.navigations || [];
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

.search-container {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 15px;
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

.no-permission-text {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Rajdhani', sans-serif;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #888888;
  font-size: 16px;
  font-family: 'Rajdhani', sans-serif;
}

.nav-header {
  display: grid;
  grid-template-columns: 0.5fr 1fr 1.5fr 1.5fr 0.8fr 1.5fr 1.5fr 2fr;
  padding: 15px 20px;
  font-weight: 600;
  color: v-bind('themeColors.primary');
  text-align: left;
  border-bottom: 1px solid v-bind('themeColors.primary');
}

.header-item {
  font-family: 'Rajdhani', sans-serif;
}

.nav-row {
  display: grid;
  grid-template-columns: 0.5fr 1fr 1.5fr 1.5fr 0.8fr 1.5fr 1.5fr 2fr;
  padding: 10px 20px;
  border-bottom: 1px solid v-bind('themeColors.primary');
  align-items: center;
  transition: background-color 0.3s ease;
}

.nav-row:hover {
  background: rgba(255, 255, 255, 0.1);
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

.status-badge {
  padding: 4px 12px;
  border-radius: 0;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.enabled {
  background: rgba(52, 211, 153, 0.2);
  color: #34d399;
}

.status-badge.disabled {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.nav-item.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
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
  font-family: 'Rajdhani', sans-serif;
}

.action-btn.edit {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.action-btn.edit:hover {
  background: rgba(59, 130, 246, 0.4);
}

.action-btn.status {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.action-btn.status.disabled {
  background: rgba(52, 211, 153, 0.2);
  color: #34d399;
}

.action-btn.delete {
  background: rgba(220, 38, 38, 0.2);
  color: #dc2626;
}

.action-btn.delete:hover {
  background: rgba(220, 38, 38, 0.4);
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

.permission-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.permission-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.permission-checkbox input {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 1px solid v-bind('themeColors.primary');
  border-radius: 0;
  position: relative;
  transition: all 0.3s ease;
}

.permission-checkbox input:checked + .checkbox-custom {
  background: v-bind('themeColors.primary');
}

.permission-checkbox input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid #000;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label {
  color: v-bind('themeColors.secondary');
  font-size: 14px;
  font-family: 'Rajdhani', sans-serif;
}

.status-selector {
  display: flex;
  gap: 30px;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.status-option input {
  width: 16px;
  height: 16px;
}

.status-option span {
  color: v-bind('themeColors.secondary');
  font-size: 14px;
  font-family: 'Rajdhani', sans-serif;
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

  .nav-header,
  .nav-row {
    grid-template-columns: 1fr 2fr;
    gap: 10px;
  }

  .nav-item.actions {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }
}
</style>