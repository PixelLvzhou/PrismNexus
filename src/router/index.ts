import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

// 导入视图组件
const Home = () => import("@/views/Home.vue");
const Books = () => import("@/views/Books.vue");
const BookContent = () => import("@/views/BookContent.vue");
const ImageGalleryPage = () => import("@/views/ImageGalleryPage.vue");
const ThreeDScene = () => import("@/views/ThreeDScene.vue");

// 定义路由配置
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/books",
    name: "Books",
    component: Books,
  },
  {
    path: "/book/:id",
    name: "BookContent",
    component: BookContent,
    props: true,
  },
  {
    path: "/image-gallery",
    name: "ImageGallery",
    component: ImageGalleryPage,
  },
  {
    path: "/3d-scene",
    name: "ThreeDScene",
    component: ThreeDScene,
  },
];

// 创建路由实例
const router = createRouter({
  // 使用固定的base路径，与vite.config.ts中的配置保持一致
  history: createWebHistory(import.meta.env.BASE_URL || "/"),
  routes,
});

export default router;
