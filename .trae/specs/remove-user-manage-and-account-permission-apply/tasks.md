# Tasks

## 阶段一：后端改造

- [x] **Task 1: 后端移除 USER_MANAGE 权限编码**
  - [x] SubTask 1.1: 修改 `backend/controllers/permissionController.js`，从 `PERMISSION_CODES` 中删除 `USER_MANAGE`
  - [x] SubTask 1.2: 验证其他后端文件无引用 USER_MANAGE

- [x] **Task 2: 后端账户管理接口增加 ACCOUNT_MANAGE 权限校验**
  - [x] SubTask 2.1: 在 `backend/controllers/authController.js` 的 `manageAccounts` 函数中，导入 `checkUserHasPermission`
  - [x] SubTask 2.2: 在 `status`、`role`、`delete` case 中增加权限检查：如果当前用户 role 为 admin 但没有 ACCOUNT_MANAGE 权限，返回 403
  - [x] SubTask 2.3: `query` case 保持现有逻辑不变（管理员始终可查列表）

## 阶段二：前端改造

- [x] **Task 3: 前端 API 层移除 USER_MANAGE**
  - [x] SubTask 3.1: 修改 `PrismNexus/src/api/permission.ts`，从 `PERMISSION_CODES` 中删除 `USER_MANAGE`

- [x] **Task 4: AccountManage.vue 新增权限申请功能**
  - [x] SubTask 4.1: 引入 `getMyPermissions`、`applyPermission`、`queryApplications`、`cancelApplication`、`PERMISSION_CODES` API
  - [x] SubTask 4.2: 引入 `Toast` 组件
  - [x] SubTask 4.3: 新增 `myPermissions`、`applications` 响应式数据
  - [x] SubTask 4.4: 新增 `hasAccountManagePermission` computed（检查 myPermissions 中 ACCOUNT_MANAGE 是否 granted）
  - [x] SubTask 4.5: 新增 `currentApplication` computed（过滤当前用户的 ACCOUNT_MANAGE 申请记录）
  - [x] SubTask 4.6: 新增 `showApplyButton`、`applyButtonDisabled`、`applyButtonText` computed
  - [x] SubTask 4.7: 在搜索框下方新增申请按钮/申请提示 DOM
  - [x] SubTask 4.8: 新增 `handleApplyPermission`、`handleCancelApplication` 方法（参考 NavigationManage.vue）
  - [x] SubTask 4.9: 新增 `fetchMyPermissions`、`fetchMyApplications` 方法
  - [x] SubTask 4.10: 修改 `canShowStatusBtn`、`canShowDeleteBtn` 和角色分配按钮的 `v-if` 条件，从 `currentRole === 'admin'` 改为基于 `hasAccountManagePermission`
  - [x] SubTask 4.11: 替换所有 `alert` 为 `toast.value` 调用
  - [x] SubTask 4.12: 在 `onMounted` 中调用 `fetchMyPermissions` 和 `fetchMyApplications`
  - [x] SubTask 4.13: 添加申请按钮和提示的 CSS 样式（参考 NavigationManage.vue）

- [x] **Task 5: PermissionManage.vue 同步更新**
  - [x] SubTask 5.1: 验证 `allPermissions` computed 只显示两个权限（因从 PERMISSION_CODES 计算，Task 3 完成后自动生效）
  - [x] SubTask 5.2: 无需额外修改

## 阶段三：验证

- [x] **Task 6: 验证后端接口权限校验**
  - [x] SubTask 6.1: 以管理员身份登录，未申请 ACCOUNT_MANAGE 时调用 status/role/delete 接口，验证返回 403
  - [x] SubTask 6.2: 以管理员身份登录，已拥有 ACCOUNT_MANAGE 时调用操作接口，验证正常执行
  - [x] SubTask 6.3: query 接口始终可访问

- [x] **Task 7: 验证前端功能**
  - [x] SubTask 7.1: 管理员无权限时进入账户管理页，验证操作按钮不显示，申请按钮可见
  - [x] SubTask 7.2: 点击申请按钮，验证 Toast 提示"申请已提交"
  - [x] SubTask 7.3: 开发者审批通过后，管理员刷新页面，验证操作按钮恢复显示
  - [x] SubTask 7.4: 验证角色分配规则保持不变（管理员只能操作普通用户）
  - [x] SubTask 7.5: 验证权限管理页只显示两个权限标签

# Task Dependencies
- Task 2 depends on Task 1（后端基础变更）
- Task 4 depends on Task 3（前端 API 层变更）
- Task 6 depends on Task 2（后端验证）
- Task 7 depends on Task 4（前端验证）
- Task 4 SubTask 4.1~4.3 是前提，其余 SubTask 可并行
