# PrismNexus

一个基于 Vue 3 + TypeScript 构建的现代化前端应用框架，提供丰富的 UI 组件和交互功能。

[![Vue](https://img.shields.io/badge/Vue-3.5+-green.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2+-yellow.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1+-purple.svg)](https://tailwindcss.com/)

## ✨ 功能特性

- 🎨 **主题切换** - 支持深色/浅色主题切换
- 🌐 **路由管理** - 基于 Vue Router 的页面路由
- 🔐 **用户认证** - 登录注册与权限管理
- 🎬 **动画效果** - GSAP 驱动的流畅动画
- 🔔 **消息提示** - Toast 和对话框组件
- 🎵 **音效反馈** - 交互音效支持

## 🛠️ 技术栈

| 分类      | 技术          | 版本     |
| ------- | ----------- | ------ |
| 框架      | Vue         | 3.5+   |
| 语言      | TypeScript  | 5.9+   |
| 构建工具    | Vite        | 7.2+   |
| 样式      | TailwindCSS | 4.1+   |
| 样式预处理   | Less        | 4.4+   |
| 路由      | Vue Router  | 4.6+   |
| HTTP 请求 | Axios       | 1.16+  |
| 动画      | GSAP        | 3.15+  |
| 3D 渲染   | Three.js    | 0.181+ |
| 地图      | Leaflet     | 1.9+   |

## 📁 项目结构

```
src/
├── api/              # API 接口层
│   ├── auth.ts       # 认证相关接口
│   ├── permission.ts # 权限管理接口
│   └── weather.ts    # 天气接口
├── assets/           # 静态资源
│   ├── icons/        # 图标文件
│   ├── sounds/       # 音效文件
│   ├── styles/       # 全局样式
│   └── videos/       # 视频文件
├── components/       # 公共组件
│   ├── CardPlaceholder.vue       # 卡片占位
│   ├── ConfirmDialog.vue         # 确认对话框
│   ├── DateTime.vue              # 日期时间组件
│   ├── DecorationCanvas.vue      # 装饰画布
│   ├── DetailDialog.vue          # 详情对话框
│   ├── DynamicParticleBackground.vue # 动态粒子背景
│   ├── Navbar.vue                # 导航栏
│   ├── NavbarRight.vue           # 右侧导航
│   ├── TabSidePanel.vue          # 侧边面板
│   ├── ThemeSwitcher.vue         # 主题切换器
│   ├── Toast.vue                 # 消息提示
│   └── Weather.vue               # 天气组件
├── composables/      # 组合式函数
│   ├── useTheme.ts   # 主题管理
│   └── useUserStore.ts # 用户状态管理
├── router/           # 路由配置
│   └── index.ts      # 路由定义
├── utils/            # 工具函数
│   └── soundManager.ts # 音效管理器
├── views/            # 页面视图
│   ├── AccountManage.vue         # 账户管理
│   ├── Home.vue                  # 首页
│   ├── Lab.vue                   # 实验室
│   ├── LoadingPage.vue           # 加载页面
│   ├── LoginRegister.vue         # 登录注册
│   ├── NavigationManage.vue      # 导航管理
│   ├── PermissionManage.vue      # 权限管理
│   ├── PersonalInfo.vue          # 个人信息
│   └── Settings.vue              # 设置页面
├── App.vue           # 根组件
├── main.ts           # 入口文件
└── style.css         # 全局样式
```

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📜 可用脚本

| 脚本        | 描述               |
| --------- | ---------------- |
| `dev`     | 启动开发服务器，监听所有网络接口 |
| `build`   | 构建生产版本           |
| `preview` | 预览构建结果           |

## 📡 API 接口

项目包含以下核心 API 模块：

- **auth.ts** - 用户认证接口（登录、注册、登出）
- **permission.ts** - 权限管理接口
- **weather.ts** - 天气数据接口

## 🧩 核心组件

| 组件                        | 描述              |
| ------------------------- | --------------- |
| ThemeSwitcher             | 主题切换器，支持深色/浅色模式 |
| DynamicParticleBackground | 动态粒子背景效果        |
| DecorationCanvas          | 装饰性画布组件         |
| Toast                     | 轻量级消息提示组件       |
| ConfirmDialog             | 确认对话框组件         |
| Weather                   | 天气信息展示组件        |

## 📄 许可证

MIT License
