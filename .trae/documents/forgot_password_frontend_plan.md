# 忘记密码功能前端实现计划

## [x] Task 1: 在 auth.ts 中添加发送验证码和重置密码 API 函数
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 在 auth.ts 文件中添加 sendVerificationCode 函数，调用后端 /api/auth/send-code 接口
  - 在 auth.ts 文件中添加 resetPassword 函数，调用后端 /api/auth/reset-password 接口
- **Success Criteria**:
  - 成功添加两个 API 函数，能够正确调用后端接口
- **Test Requirements**:
  - `programmatic` TR-1.1: 确认函数语法正确
  - `programmatic` TR-1.2: 确认接口 URL 正确
- **Notes**: 确保错误处理逻辑完整

## [x] Task 2: 修改 sendVerificationCode 方法调用真实 API
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 修改 LoginRegister.vue 中的 sendVerificationCode 方法
  - 调用真实的 sendVerificationCode API 函数
  - 添加错误处理和 UI 反馈
  - 实现按钮倒计时功能
- **Success Criteria**:
  - 点击发送验证码按钮时调用真实 API
  - 成功时开始倒计时
  - 失败时显示错误信息
- **Test Requirements**:
  - `programmatic` TR-2.1: 确认 API 调用正确
  - `human-judgment` TR-2.2: 确认 UI 反馈正常
- **Notes**: 确保在 API 调用期间禁用发送按钮

## [x] Task 3: 修改 handleForgotPassword 方法调用真实 API
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 修改 LoginRegister.vue 中的 handleForgotPassword 方法
  - 在验证通过后调用真实的 resetPassword API 函数
  - 添加错误处理和 UI 反馈
  - 实现修改成功后的成功模块展示
- **Success Criteria**:
  - 点击确认修改按钮时调用真实 API
  - 成功时显示成功模块
  - 失败时显示错误信息
- **Test Requirements**:
  - `programmatic` TR-3.1: 确认 API 调用正确
  - `human-judgment` TR-3.2: 确认 UI 反馈正常
- **Notes**: 确保在 API 调用期间显示加载状态

## [/] Task 4: 测试完整的忘记密码流程
- **Priority**: P1
- **Depends On**: Task 2, Task 3
- **Description**:
  - 测试发送验证码功能
  - 测试密码修改功能
  - 测试各种错误场景
  - 验证 UI 反馈和用户体验
- **Success Criteria**:
  - 完整的忘记密码流程能够正常工作
  - 各种错误场景能够正确处理
  - UI 反馈及时且清晰
- **Test Requirements**:
  - `programmatic` TR-4.1: 测试 API 调用成功场景
  - `programmatic` TR-4.2: 测试 API 调用失败场景
  - `human-judgment` TR-4.3: 验证用户体验
- **Notes**: 测试时需要使用真实的用户名和邮箱