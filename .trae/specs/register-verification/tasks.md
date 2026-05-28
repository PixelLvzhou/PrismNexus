# 注册模块新增验证码 - 实现计划

## [x] 任务1: 修改后端发送验证码接口添加类型参数
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 修改 `sendVerificationCode` 函数，添加 `type` 参数
  - 当 type=reg 时，只需要邮箱参数，直接发送验证码
  - 当 type=mod 时，保持现有逻辑，验证用户和邮箱绑定关系
  - 确保参数验证和错误处理
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 发送验证码接口接收 type=reg 和 email 参数，返回成功
  - `programmatic` TR-1.2: 发送验证码接口接收 type=mod，验证用户和邮箱绑定关系
- **Notes**: 复用现有的验证码生成和存储机制

## [x] 任务2: 修改后端注册接口添加验证码验证
- **Priority**: P0
- **Depends On**: 任务1
- **Description**:
  - 修改 `register` 函数，添加 `code` 参数
  - 验证验证码的有效性
  - 只有验证码验证通过后才能完成注册
  - 确保参数验证和错误处理
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-2.1: 注册接口接收有效的验证码，注册成功
  - `programmatic` TR-2.2: 注册接口接收无效或过期的验证码，返回错误
- **Notes**: 验证码验证失败时返回明确的错误信息

## [x] 任务3: 修改前端注册表单添加验证码输入框
- **Priority**: P0
- **Depends On**: 任务1
- **Description**:
  - 在注册表单的确认密码字段下方添加验证码输入框
  - 添加发送验证码按钮
  - 实现验证码输入的前端验证
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-3.1: 注册表单显示验证码输入框和发送按钮
  - `programmatic` TR-3.2: 验证码输入框有基本的前端验证
- **Notes**: 参考忘记密码表单的验证码输入框样式

## [x] 任务4: 实现前端发送验证码逻辑
- **Priority**: P0
- **Depends On**: 任务3
- **Description**:
  - 实现发送验证码的API调用，传递 type=reg 参数
  - 实现发送验证码的倒计时功能
  - 处理发送成功和失败的状态
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-4.1: 点击发送验证码按钮后，调用API并显示倒计时
  - `human-judgment` TR-4.2: 倒计时结束后，按钮可重新点击
- **Notes**: 复用忘记密码表单的发送验证码逻辑

## [x] 任务5: 修改前端注册提交逻辑
- **Priority**: P0
- **Depends On**: 任务2, 任务3
- **Description**:
  - 修改注册表单的提交逻辑，包含验证码参数
  - 验证所有字段的有效性
  - 处理注册成功和失败的状态
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-5.1: 提交注册表单时包含验证码参数
  - `programmatic` TR-5.2: 验证码无效时显示错误信息
- **Notes**: 确保表单验证逻辑的完整性

## [x] 任务6: 实现前端邮箱验证逻辑
- **Priority**: P0
- **Depends On**: 任务3
- **Description**:
  - 实现邮箱格式的严格正则验证
  - 实现域名白名单验证（仅支持QQ邮箱和网易邮箱）
  - 与后端验证规则保持一致
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-6.1: 输入无效邮箱格式时显示错误提示
  - `programmatic` TR-6.2: 输入非支持域名邮箱时显示错误提示
- **Notes**: 参考后端的邮箱验证规则

## [x] 任务7: 确保前端样式一致性
- **Priority**: P1
- **Depends On**: 任务3
- **Description**:
  - 确保验证码输入框和发送按钮的样式与现有表单元素一致
  - 保持整体风格统一
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `human-judgment` TR-7.1: 验证码输入框和发送按钮样式与现有元素一致
- **Notes**: 参考忘记密码表单的样式