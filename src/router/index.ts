import { createRouter, createWebHashHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

// 导入视图组件
const Home = () => import("@/views/Home.vue");
const LoginRegister = () => import("@/views/LoginRegister.vue");
const LoadingPage = () => import("@/views/LoadingPage.vue");
const PersonalInfo = () => import("@/views/PersonalInfo.vue");
const AccountManage = () => import("@/views/AccountManage.vue");
const NavigationManage = () => import("@/views/NavigationManage.vue");
const PermissionManage = () => import("@/views/PermissionManage.vue");
const Lab = () => import("@/views/Lab.vue");
const Settings = () => import("@/views/Settings.vue");

// 导入用户状态管理
import { useUserStore } from "@/composables/useUserStore";

// 定义路由配置
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "LoginRegister",
    component: LoginRegister,
  },
  {
    path: "/loading",
    name: "LoadingPage",
    component: LoadingPage,
  },
  {
    path: "/personal-info",
    name: "PersonalInfo",
    component: PersonalInfo,
  },
  {
    path: "/account-manage",
    name: "AccountManage",
    component: AccountManage,
    meta: { requiredRoles: ['admin', 'developer'], requiredPermission: 'ACCOUNT_MANAGE' }
  },
  {
    path: "/navigation-manage",
    name: "NavigationManage",
    component: NavigationManage,
    meta: { requiredRoles: ['admin', 'developer'], requiredPermission: 'NAV_MANAGE' }
  },
  {
    path: "/permission-manage",
    name: "PermissionManage",
    component: PermissionManage,
    meta: { requiredRoles: ['developer'] }
  },
  {
    path: "/lab",
    name: "Lab",
    component: Lab,
  },
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem("token");
  const publicRoutes = ["/login", "/loading"];

  if (!token && !publicRoutes.includes(to.path)) {
    next("/login");
    return;
  }

  if (token && to.path === "/login") {
    next("/");
    return;
  }

  if (token && !publicRoutes.includes(to.path)) {
    try {
      // 使用全局用户状态，避免重复调用接口
      const { initUserInfo, isInitialized, currentRole, hasPermission } = useUserStore();
      
      // 如果还未初始化，先初始化
      if (!isInitialized.value) {
        await initUserInfo();
      }
      
      const userRole = currentRole.value;

      // 检查路由权限要求
      if (to.meta.requiredRoles && userRole) {
        const requiredRoles = to.meta.requiredRoles as string[];
        
        // 开发者角色直接通过所有权限检查
        if (userRole === 'developer') {
          return next();
        }
        
        // 检查是否是允许的角色
        if (requiredRoles.includes(userRole)) {
          return next();
        }
        
        // 如果是管理员或普通用户，且路由需要特定权限，检查权限
        if (to.meta.requiredPermission) {
          const requiredPermission = to.meta.requiredPermission as string;
          if (hasPermission(requiredPermission)) {
            return next();
          }
        }
        
        next("/");
        return;
      }
    } catch (error) {
      localStorage.removeItem("token");
      next("/login");
      return;
    }
  }

  next();
});

export default router;
