# 后端项目 - 产品需求文档

## Overview
- **Summary**: 基于 Node.js + Express.js 框架开发一个前后端分离的后端项目，包含用户注册、登录功能，支持 JWT 认证，使用 MySQL 存储用户数据。
- **Purpose**: 为前端系统提供用户认证和管理接口，支持用户注册、登录等核心功能。
- **Target Users**: 前端开发人员，需要调用后端接口实现用户认证功能。

## Goals
- 开发一个独立的后端项目，包含完整的用户认证功能
- 实现注册接口，支持用户注册并加密存储密码
- 实现登录接口，支持用户登录并生成 JWT 令牌
- 解决跨域问题，支持前端系统调用
- 提供清晰的错误处理和返回信息

## Non-Goals (Out of Scope)
- 不开发前端页面，只提供后端接口
- 不实现除注册、登录外的其他业务逻辑
- 不涉及复杂的权限管理

## Background & Context
- 前端系统需要用户认证功能
- 需要一个独立的后端服务来处理用户数据和认证逻辑
- 采用前后端分离架构，通过 API 进行通信

## Functional Requirements
- **FR-1**: 注册接口（POST /api/register）
  - 接收用户名、密码、邮箱参数
  - 校验用户名和邮箱的唯一性
  - 使用 bcryptjs 加密存储密码
  - 返回注册成功/失败信息

- **FR-2**: 登录接口（POST /api/login）
  - 接收用户名和密码参数
  - 验证用户凭证
  - 生成 JWT 令牌（有效期 2 小时）
  - 返回 Token 和用户基本信息（不含密码）

- **FR-3**: 跨域支持
  - 使用 cors 中间件解决跨域问题
  - 允许前端系统调用后端接口

## Non-Functional Requirements
- **NFR-1**: 安全性
  - 密码使用 bcryptjs 加密存储
  - JWT 令牌用于身份验证
  - 环境变量管理敏感信息

- **NFR-2**: 可靠性
  - 完善的异常处理
  - 清晰的错误返回信息

- **NFR-3**: 可维护性
  - 代码结构清晰
  - 详细的代码注释
  - 完整的项目文档

## Constraints
- **Technical**: Node.js + Express.js 框架，MySQL 数据库
- **Dependencies**: express, cors, bcryptjs, jsonwebtoken, mysql2, dotenv

## Assumptions
- 前端系统使用 Trae.js 或其他 HTTP 客户端调用后端接口
- MySQL 数据库已安装并可访问
- 开发环境已配置 Node.js

## Acceptance Criteria

### AC-1: 注册功能
- **Given**: 前端发送注册请求，包含用户名、密码、邮箱
- **When**: 后端接收请求并处理
- **Then**: 
  - 如果用户名或邮箱已存在，返回错误信息
  - 如果注册成功，返回成功信息
  - 密码在数据库中加密存储
- **Verification**: `programmatic`

### AC-2: 登录功能
- **Given**: 前端发送登录请求，包含用户名和密码
- **When**: 后端接收请求并验证
- **Then**: 
  - 如果用户名或密码错误，返回错误信息
  - 如果验证通过，返回 JWT 令牌和用户信息
  - JWT 令牌有效期为 2 小时
- **Verification**: `programmatic`

### AC-3: 跨域支持
- **Given**: 前端系统从不同域名发送请求
- **When**: 后端接收跨域请求
- **Then**: 后端正确处理跨域请求，返回相应数据
- **Verification**: `programmatic`

### AC-4: 异常处理
- **Given**: 系统遇到错误（如数据库连接失败、参数错误等）
- **When**: 后端处理异常
- **Then**: 后端返回清晰的错误信息，包含错误码和错误描述
- **Verification**: `human-judgment`

## Open Questions
- [ ] 数据库连接信息的具体配置
- [ ] JWT 密钥的具体设置
- [ ] 前端调用的具体实现细节