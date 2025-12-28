# 基于three.js的3D建模效果实现

## 实现目标
在首页新增一个按钮，点击按钮跳转到新页面，在新页面中创建一个可旋转的3D球体场景。

## 技术栈
- Vue 3 + TypeScript
- three.js
- vue-router

## 实现步骤

### 1. 安装three.js依赖
- 安装three.js核心库
- 安装three.js的TypeScript类型定义

### 2. 创建3D场景页面
- 创建`src/views/ThreeDScene.vue`组件
- 实现基本的three.js场景初始化
- 创建可旋转的3D球体
- 添加相机控制和灯光效果
- 实现动画循环

### 3. 添加路由配置
- 在`src/router/index.ts`中导入新组件
- 添加新路由配置

### 4. 更新首页
- 在`src/views/Home.vue`中添加跳转按钮
- 实现按钮点击事件，跳转到3D场景页面

### 5. 测试和优化
- 确保3D场景正常渲染
- 优化性能，添加加载状态
- 确保页面跳转流畅

## 预期效果
- 首页新增一个"3D场景"按钮
- 点击按钮跳转到新页面
- 新页面中显示一个可旋转的3D球体
- 球体具有材质和纹理效果
- 支持鼠标拖拽旋转和滚轮缩放

## 文件修改
- `package.json`：添加three.js依赖
- `src/views/ThreeDScene.vue`：创建3D场景组件
- `src/router/index.ts`：添加新路由
- `src/views/Home.vue`：添加跳转按钮

## 实现细节
- 使用OrbitControls实现相机控制
- 添加环境光和方向光增强视觉效果
- 使用MeshStandardMaterial实现真实感材质
- 添加简单的加载动画
- 响应式设计，适应不同屏幕尺寸