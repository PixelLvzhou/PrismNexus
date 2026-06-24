# Checklist

## 后端

- [x] `backend/controllers/permissionController.js` 中 `PERMISSION_CODES` 只包含 NAV_MANAGE 和 ACCOUNT_MANAGE
- [x] `backend/controllers/authController.js` 的 `manageAccounts` 函数中，`status/role/delete` 操作增加了 ACCOUNT_MANAGE 权限检查
- [x] 管理员无 ACCOUNT_MANAGE 权限时调用操作接口返回 403
- [x] 管理员始终可以调用 `query` 操作获取账户列表
- [x] 开发者操作不受权限检查影响

## 前端 API

- [x] `PrismNexus/src/api/permission.ts` 中 `PERMISSION_CODES` 只包含 NAV_MANAGE 和 ACCOUNT_MANAGE

## 前端 AccountManage.vue

- [x] 引入 Toast 组件并挂载到 DOM
- [x] 引入 `getMyPermissions`、`applyPermission`、`queryApplications`、`cancelApplication` API
- [x] `hasAccountManagePermission` computed 正确判断当前用户是否有 ACCOUNT_MANAGE 权限
- [x] `currentApplication` computed 正确过滤当前用户的 ACCOUNT_MANAGE 申请记录
- [x] 搜索框下方显示申请按钮/申请提示（与 NavigationManage.vue 模式一致）
- [x] `showApplyButton` 逻辑正确：管理员角色显示，已有权限不显示，已有待审批申请不显示
- [x] 申请按钮点击后弹出 ConfirmDialog 确认
- [x] 申请提交后 Toast 提示"申请已提交"
- [x] 待审批状态下显示取消申请提示，点击可取消
- [x] 操作按钮（设为管理员、设为普通用户、封禁/启用、删除）的显示逻辑基于 `hasAccountManagePermission`
- [x] 管理员无权限时操作列无任何按钮
- [x] 所有 `alert` 已替换为 Toast 调用
- [x] `onMounted` 中调用 `fetchMyPermissions` 和 `fetchMyApplications`
- [x] 角色分配规则保持不变（管理员只能操作普通用户，不能操作其他管理员）

## 前端 PermissionManage.vue

- [x] 权限配置弹框中只显示"导航管理权限"和"账户管理权限"两个标签
- [x] 无"用户管理权限"标签

## 集成验证

- [x] 管理员申请 ACCOUNT_MANAGE 权限后，申请记录出现在权限管理页
- [x] 开发者审批通过后，管理员刷新账户管理页，操作按钮正常显示
- [x] 管理员获得 ACCOUNT_MANAGE 后，操作普通用户的角色/状态/删除功能正常
- [x] 管理员获得 ACCOUNT_MANAGE 后，仍然不能操作其他管理员账户
