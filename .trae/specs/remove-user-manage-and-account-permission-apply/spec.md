# 移除用户管理权限 + 账户管理权限申请改造 Spec

## Why
目前系统有三个权限编码（NAV_MANAGE、ACCOUNT_MANAGE、USER_MANAGE），其中 USER_MANAGE 从未被使用，属于冗余权限。同时账户管理页目前对管理员默认开放所有操作权限，这与"权限可分配"的设计理念不符。需要将账户管理也纳入权限申请体系，让管理员默认只能浏览账户列表，必须通过申请获得 ACCOUNT_MANAGE 权限后才能进行操作。

## What Changes
- **删除 USER_MANAGE 权限编码**（前后端同步移除）
- **后端账户管理接口改造**：在 `status/role/delete` 操作中增加 ACCOUNT_MANAGE 权限检查，管理员无此权限时返回 403
- **后端保持 `query` 查询不受权限影响**：管理员始终可以查看账户列表
- **前端 AccountManage.vue 改造**：
  - 操作按钮显示逻辑从 `currentRole === 'admin'` 改为基于 `hasAccountManagePermission`
  - 新增权限申请按钮和申请提示（与 NavigationManage.vue 模式一致）
  - 替换所有 `alert` 为 Toast 组件
- **前端权限管理页同步**：PermissionManage.vue 的权限标签网格只显示两个权限
- **角色分配规则保持不变**：开发者可随意分配角色；管理员只能对普通用户操作，管理员之间不可互相操作

## Impact
- Affected specs: 权限申请体系、账户管理体系、权限编码定义
- Affected code:
  - `backend/controllers/permissionController.js` — 移除 USER_MANAGE
  - `backend/controllers/authController.js` — manageAccounts 增加权限校验
  - `PrismNexus/src/api/permission.ts` — 移除 USER_MANAGE
  - `PrismNexus/src/views/AccountManage.vue` — 新增权限申请 UI + 操作权限控制
  - `PrismNexus/src/views/PermissionManage.vue` — 同步权限列表
  - `PrismNexus/src/views/NavigationManage.vue` — 无直接修改，作为参考模式

## ADDED Requirements

### Requirement: 账户管理权限申请
管理员进入账户管理页后，默认只能查看账户列表，所有操作按钮（设为管理员、设为普通用户、封禁/启用、删除）均不显示。页面提供"申请账户管理权限"按钮，点击后弹出确认框，确认后提交 ACCOUNT_MANAGE 权限申请。

#### Scenario: 管理员无权限时
- **WHEN** 管理员进入账户管理页
- **THEN** 能看到账户列表，但操作列无按钮
- **THEN** 搜索框下方显示"申请账户管理权限"按钮
- **THEN** 点击按钮弹出确认框，确认后 Toast 提示"申请已提交"
- **THEN** 申请记录可在权限管理页查看

#### Scenario: 管理员有待审批申请时
- **WHEN** 管理员已提交 ACCOUNT_MANAGE 申请且待审批
- **THEN** 搜索框下方显示"已提交权限申请待审批，可随时取消申请"
- **THEN** 点击"取消申请"可取消当前申请
- **THEN** 申请按钮置灰不可点击

#### Scenario: 管理员已获得权限后
- **WHEN** 开发者在权限管理页通过该管理员的 ACCOUNT_MANAGE 申请
- **THEN** 该管理员刷新账户管理页后，操作按钮恢复正常显示
- **THEN** 角色分配规则保持现有逻辑（只能操作普通用户）

### Requirement: 后端权限校验
账户管理接口 `/api/auth/accounts` 的 `query` 操作保持现有 `requireAdmin` 校验不变，`status/role/delete` 操作在现有校验基础上额外检查当前用户是否拥有 ACCOUNT_MANAGE 权限（通过查询 `user_permissions` 表）。

#### Scenario: 管理员无 ACCOUNT_MANAGE 权限调用操作接口
- **WHEN** 管理员调用 status/role/delete 操作
- **THEN** 后端返回 403，错误信息为"您没有账户管理权限，请先申请"

## MODIFIED Requirements

### Requirement: 权限编码定义
权限编码从三个缩减为两个：
- `NAV_MANAGE` — 导航管理权限
- `ACCOUNT_MANAGE` — 账户管理权限
- ~~`USER_MANAGE` — 用户管理权限（已移除）~~

所有涉及 `PERMISSION_CODES` 定义的地方同步更新。

### Requirement: 账户管理页操作按钮显示逻辑
原逻辑：`currentRole === 'admin'` 时显示操作按钮  
新逻辑：基于 `hasAccountManagePermission`（调用 `getMyPermissions` 接口检查 ACCOUNT_MANAGE 是否 granted）控制按钮显示。

开发者始终拥有所有权限，不受此限制。

## REMOVED Requirements

### Requirement: USER_MANAGE 权限
**Reason**: 该权限从未在系统任何功能中使用，属于冗余设计。  
**Migration**: 从 `PERMISSION_CODES` 中移除，数据库中已有的 USER_MANAGE 权限记录保留不影响系统运行（查询时会被过滤掉），前端不再展示此权限。
