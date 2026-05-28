import { createRouter, createWebHashHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

// 导入视图组件
const Home = () => import("@/views/Home.vue");
const LoginRegister = () => import("@/views/LoginRegister.vue");

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
];

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const publicRoutes = ["/login"];

  // 已登录访问登录页 → 跳首页
  if (token && to.path === "/login") {
    next("/");
  }
  // 未登录访问非公开页 → 跳登录
  else if (!token && !publicRoutes.includes(to.path)) {
    next("/login");
  } else {
    next();
  }
});

export default router;
