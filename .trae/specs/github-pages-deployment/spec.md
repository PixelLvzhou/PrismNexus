# PrismNexus GitHub Pages 部署 - Product Requirement Document

## Overview
- **Summary**: 将 PrismNexus 前端项目部署到 GitHub Pages 上，实现公网可访问
- **Purpose**: 让用户可以通过 https://用户名.github.io/PrismNexus/ 访问项目
- **Target Users**: 项目开发者和使用者

## Goals
- 项目成功部署到 GitHub Pages
- 访问 URL 正确且可正常访问
- 所有前端功能正常工作
- 路由跳转正常，刷新无 404
- 主题切换、登录功能完整可用

## Non-Goals (Out of Scope)
- 后端服务部署（本次只部署前端）
- 自定义域名配置（后续可补充）
- SEO 优化

## Background & Context
- 项目已使用 Vite 构建，配置了 base: "/PrismNexus/"
- 已有 GitHub Actions 工作流配置
- 构建输出目录设置为 docs/
- 支持通过 Git 推送自动触发部署

## Functional Requirements
- **FR-1**: 本地构建成功，生成 docs/ 目录
- **FR-2**: GitHub 仓库正确配置 Pages 源
- **FR-3**: GitHub Actions 自动构建并部署成功
- **FR-4**: 访问线上 URL 正常显示首页
- **FR-5**: 路由功能正常（/ 和 /login）
- **FR-6**: 登录和退出功能完整
- **FR-7**: 主题切换功能正常

## Non-Functional Requirements
- **NFR-1**: 首次部署时间不超过 10 分钟
- **NFR-2**: 页面加载时间不超过 3 秒
- **NFR-3**: GitHub Pages 部署成功后保持稳定
- **NFR-4**: 支持后续代码更新自动部署

## Constraints
- **Technical**: 使用 GitHub Pages + Vite + Vue Router (History 模式)
- **Business**: 使用免费服务，不产生费用
- **Dependencies**: Git, Node.js, GitHub 账号

## Assumptions
- 用户有 GitHub 账号和仓库权限
- 本地已安装 Node.js 和 Git
- 可以访问 GitHub
- 浏览器支持现代 CSS 和 JavaScript

## Acceptance Criteria

### AC-1: 本地构建成功
- **Given**: 项目代码完整，依赖已安装
- **When**: 运行 npm run build
- **Then**: docs/ 目录生成成功，包含所有必要文件
- **Verification**: programmatic

### AC-2: GitHub Pages 配置正确
- **Given**: 代码已推送到 GitHub
- **When**: 在仓库 Settings > Pages 中配置源为 main 分支的 docs/ 目录
- **Then**: 配置保存成功，显示部署 URL
- **Verification**: human-judgment

### AC-3: GitHub Actions 自动部署成功
- **Given**: GitHub Pages 配置已完成
- **When**: 代码推送到 main 分支
- **Then**: Actions 工作流运行成功，状态显示绿色
- **Verification**: human-judgment

### AC-4: 线上访问首页正常
- **Given**: GitHub Pages 部署已完成
- **When**: 访问 https://用户名.github.io/PrismNexus/
- **Then**: 正常显示首页或跳转到登录页
- **Verification**: human-judgment

### AC-5: 路由和功能正常
- **Given**: 访问线上网站
- **When**: 测试登录、退出、主题切换、路由跳转
- **Then**: 所有功能正常，无控制台错误
- **Verification**: human-judgment

## Open Questions
- [ ] 用户的 GitHub 用户名是什么？
- [ ] 仓库是否已经创建并推送到 GitHub？
