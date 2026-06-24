import { ref, computed } from 'vue';
import { getMyPermissions } from '@/api/permission';

// 全局用户状态
const userInfo = ref<{
  id: number | null;
  username: string;
  email: string;
  role: string;
  avatar_url: string | null;
  bio: string | null;
}>({
  id: null,
  username: '',
  email: '',
  role: 'user',
  avatar_url: null,
  bio: null
});

const permissions = ref<any[]>([]);
const isInitialized = ref(false);
let initPromise: Promise<void> | null = null;

// 从JWT token解析用户ID
const getUserIdFromToken = (): number | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.id;
  } catch {
    return null;
  }
};

// 初始化用户信息（登录后调用一次）- 添加并发控制
const initUserInfo = async () => {
  // 如果已经初始化，直接返回
  if (isInitialized.value) return;
  
  // 如果正在初始化，返回同一个promise
  if (initPromise) return initPromise;
  
  const token = localStorage.getItem('token');
  if (!token) {
    resetUserInfo();
    return;
  }

  initPromise = (async () => {
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
        userInfo.value = {
          id: data.user?.id || getUserIdFromToken(),
          username: data.user?.username || '',
          email: data.user?.email || '',
          role: data.user?.role || 'user',
          avatar_url: data.user?.avatar_url || null,
          bio: data.user?.bio || null
        };

        if (userInfo.value.role !== 'developer') {
          const permData = await getMyPermissions();
          permissions.value = permData.permissions || [];
        } else {
          permissions.value = [];
        }

        isInitialized.value = true;
      } else {
        resetUserInfo();
      }
    } catch (error) {
      console.error('初始化用户信息失败:', error);
      resetUserInfo();
    } finally {
      initPromise = null;
    }
  })();
  
  return initPromise;
};

// 重置用户信息（退出登录时调用）
const resetUserInfo = () => {
  userInfo.value = {
    id: null,
    username: '',
    email: '',
    role: 'user',
    avatar_url: null,
    bio: null
  };
  permissions.value = [];
  isInitialized.value = false;
  initPromise = null;
};

// 更新用户信息（修改个人信息后调用）
const updateUserInfo = (newInfo: Partial<typeof userInfo.value>) => {
  userInfo.value = { ...userInfo.value, ...newInfo };
};

// 刷新权限（权限变更后调用）
const refreshPermissions = async () => {
  if (userInfo.value.role === 'developer') {
    permissions.value = [];
    return;
  }
  try {
    const permData = await getMyPermissions();
    permissions.value = permData.permissions || [];
  } catch (error) {
    console.error('刷新权限失败:', error);
  }
};

// 检查是否有某权限
const hasPermission = (permissionCode: string): boolean => {
  if (userInfo.value.role === 'developer') return true;
  const perm = permissions.value.find(p => p.code === permissionCode);
  return perm?.granted === true;
};

export function useUserStore() {
  return {
    userInfo: computed(() => userInfo.value),
    permissions: computed(() => permissions.value),
    isInitialized: computed(() => isInitialized.value),
    currentRole: computed(() => userInfo.value.role),
    currentUserId: computed(() => userInfo.value.id),
    initUserInfo,
    resetUserInfo,
    updateUserInfo,
    refreshPermissions,
    hasPermission
  };
}