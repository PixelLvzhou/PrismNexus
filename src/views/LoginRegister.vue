<template>
  <div class="page-container">
    <DynamicParticleBackground></DynamicParticleBackground>
    <div class="page-content">
      <div class="page-logo">
      <div class="logo-triangle">
        <div class="inner-triangle"></div>
      </div>
      <span class="logo-text">Prism Nexus</span>
    </div>
    
    <!-- 主题切换组件 -->
    <ThemeSwitcher class="position-absolute" />
    
    <div class="login-form">
      <!-- Logo -->
      <div class="logo">
        <div class="triangle">
          <div class="inner-triangle"></div>
        </div>
        <h1>
          <span :style="{ color: themeColors.text }">Secure</span>
          <span :style="{ color: themeColors.primary }"> Access</span>
        </h1>
        <p>Identity Verification</p>
      </div>

      <!-- Login Form -->
      <div v-if="isLogin" class="form-section">
        <div class="form-scroll-container">
          <div class="form-group">
            <div class="form-group-row">
              <label>用户名</label>
              <div class="input-wrapper">
                <i class="fas fa-user icon"></i>
                <input 
                    type="text" 
                    v-model="loginForm.username" 
                    placeholder="输入用户名"
                    :class="{ 'input-focus': focusedInputs.username }"
                    @focus="focusedInputs.username = true"
                    @blur="focusedInputs.username = false; validateLoginUsername()"
                  />
              </div>
            </div>
            <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
          </div>
          
          <div class="form-group">
            <div class="form-group-row">
              <label>密码</label>
              <div class="input-wrapper">
                <i class="fas fa-lock icon"></i>
                <input 
                  :type="showLoginPassword ? 'text' : 'password'" 
                  v-model="loginForm.password" 
                  placeholder="********"
                  :class="{ 'input-focus': focusedInputs.password }"
                  @focus="focusedInputs.password = true"
                  @blur="focusedInputs.password = false; validateLoginPassword()"
                />
                <i 
                  :class="['fas', showLoginPassword ? 'fa-eye-slash' : 'fa-eye', 'eye-icon']" 
                  @click="showLoginPassword = !showLoginPassword"
                ></i>
              </div>
            </div>
            <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
          </div>
        </div>
        
        <button 
          class="login-button" 
          @click="handleLogin"
          :disabled="isLoading"
        >
          <span v-if="isLoading">处理中...</span>
          <span v-else>LOGIN SYSTEM <i class="fas fa-arrow-right"></i></span>
        </button>
        
        <div class="form-footer">
          <span class="forgot-password" @click="switchToForgotPassword">忘记密码？</span>
          <span class="switch-mode" @click="switchForm(false)">
            没有账号？注册
          </span>
        </div>
      </div>
      <!-- Forgot Password Form -->
      <div v-else-if="isForgotPassword" class="form-section">
        <!-- Success Message -->
        <div v-if="forgotPasswordSuccess" class="success-message">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3>密码重置成功</h3>
          <p>请使用新密码登录</p>
          <button class="login-button" @click="switchToLogin">
            重新登录 <i class="fas fa-arrow-right"></i>
          </button>
        </div>
        
        <!-- Forgot Password Form -->
        <div v-else>
          <div class="form-scroll-container">
              <div class="form-group-header">
                <p>基础信息</p>
              </div>
            <div class="form-group">
              <div class="form-group-row">
                <label>用户名</label>
                <div class="input-wrapper">
                  <i class="fas fa-user icon"></i>
                  <input 
                    type="text" 
                    v-model="forgotPasswordForm.username" 
                    placeholder="输入用户名"
                    :class="{ 'input-focus': focusedInputs.username }"
                    @focus="focusedInputs.username = true"
                    @blur="focusedInputs.username = false; validateForgotUsername()"
                  />
                </div>
              </div>
              <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
            </div>
            
            <div class="form-group">
              <div class="form-group-row">
                <label>邮箱</label>
                <div class="input-wrapper">
                  <i class="fas fa-envelope icon"></i>
                  <input 
                    type="email" 
                    v-model="forgotPasswordForm.email" 
                    placeholder="输入邮箱"
                    :class="{ 'input-focus': focusedInputs.email }"
                    @focus="focusedInputs.email = true"
                    @blur="focusedInputs.email = false; validateForgotEmail()"
                  />
                </div>
              </div>
              <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
            </div>
            
              <div class="form-group-header">
                <p>验证信息</p>
              </div>
            <div class="form-group verification-code-group">
              <div class="form-group-row">
                <label>验证码</label>
                <div class="input-wrapper with-button">
                  <div class="input-field-container">
                    <i class="fas fa-shield-alt icon"></i>
                    <input 
                      type="text" 
                      v-model="forgotPasswordForm.verificationCode" 
                      placeholder="输入验证码"
                      :class="{ 'input-focus': focusedInputs.verificationCode }"
                      @focus="focusedInputs.verificationCode = true"
                      @blur="focusedInputs.verificationCode = false; validateForgotVerificationCode()"
                    />
                  </div>
                  <button 
                    class="send-code-button" 
                    @click="sendVerificationCode"
                    :disabled="isLoading || !canSendCode"
                  >
                    {{ sendCodeText }} <i class="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
              <div v-if="errors.verificationCode" class="error-message">{{ errors.verificationCode }}</div>
            </div>
            
            <!-- Password Fields (Hidden until verification) -->
            <div v-if="isVerificationPassed">
              <div class="form-group-header">
                <p>安全信息</p>
              </div>
              <div class="form-group">
                <div class="form-group-row">
                  <label>新密码</label>
                  <div class="input-wrapper">
                    <i class="fas fa-lock icon"></i>
                    <input 
                      :type="showForgotNewPassword ? 'text' : 'password'" 
                      v-model="forgotPasswordForm.newPassword" 
                      placeholder="********"
                      :class="{ 'input-focus': focusedInputs.password }"
                      @focus="focusedInputs.password = true"
                      @blur="focusedInputs.password = false; validateForgotNewPassword()"
                    />
                    <i 
                      :class="['fas', showForgotNewPassword ? 'fa-eye-slash' : 'fa-eye', 'eye-icon']" 
                      @click="showForgotNewPassword = !showForgotNewPassword"
                    ></i>
                  </div>
                </div>
                <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
              </div>
              
              <div class="form-group">
                <div class="form-group-row">
                  <label>确认密码</label>
                  <div class="input-wrapper">
                    <i class="fas fa-lock icon"></i>
                    <input 
                      :type="showForgotConfirmNewPassword ? 'text' : 'password'" 
                      v-model="forgotPasswordForm.confirmNewPassword" 
                      placeholder="********"
                      :class="{ 'input-focus': focusedInputs.confirmNewPassword }"
                      @focus="focusedInputs.confirmNewPassword = true"
                      @blur="focusedInputs.confirmNewPassword = false; validateForgotConfirmNewPassword()"
                    />
                    <i 
                      :class="['fas', showForgotConfirmNewPassword ? 'fa-eye-slash' : 'fa-eye', 'eye-icon']" 
                      @click="showForgotConfirmNewPassword = !showForgotConfirmNewPassword"
                    ></i>
                  </div>
                </div>
                <div v-if="errors.confirmNewPassword" class="error-message">{{ errors.confirmNewPassword }}</div>
              </div>
            </div>
          </div>
          
          <button 
            class="login-button" 
            @click="handleForgotPassword"
            :disabled="isLoading"
          >
            <span v-if="isLoading">处理中...</span>
            <span v-else-if="isVerificationPassed">确认修改 <i class="fas fa-arrow-right"></i></span>
            <span v-else>身份验证 <i class="fas fa-arrow-right"></i></span>
          </button>
          
          <div class="form-footer">
            <span class="switch-mode" @click="switchToLogin">
              已有账号？登录
            </span>
          </div>
        </div>
      </div>

      <!-- Register Form -->
      <div v-else class="form-section">
        <!-- Success Message -->
        <div v-if="registerSuccess" class="success-message">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3>注册成功</h3>
          <p>账户已创建，请登录</p>
          <button class="login-button" @click="switchToLogin">
            返回登录 <i class="fas fa-arrow-right"></i>
          </button>
        </div>
        
        <!-- Register Form -->
        <div v-else>
          <div class="form-scroll-container">
              <div class="form-group-header">
                <p>基础信息</p>
              </div>
            <div class="form-group">
              <div class="form-group-row">
                <label>用户名</label>
                <div class="input-wrapper">
                  <i class="fas fa-user icon"></i>
                  <input 
                    type="text" 
                    v-model="registerForm.username" 
                    placeholder="输入用户名"
                    :class="{ 'input-focus': focusedInputs.username }"
                    @focus="focusedInputs.username = true"
                    @blur="focusedInputs.username = false; validateRegisterUsername()"
                  />
                </div>
              </div>
              <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
            </div>
            
            <div class="form-group">
              <div class="form-group-row">
                <label>邮箱</label>
                <div class="input-wrapper">
                  <i class="fas fa-envelope icon"></i>
                  <input 
                    type="email" 
                    v-model="registerForm.email" 
                    placeholder="输入邮箱"
                    :class="{ 'input-focus': focusedInputs.email }"
                    @focus="focusedInputs.email = true"
                    @blur="focusedInputs.email = false; validateRegisterEmail()"
                  />
                </div>
              </div>
              <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
            </div>
            
              <div class="form-group-header">
                <p>安全信息</p>
              </div>
            <div class="form-group">
              <div class="form-group-row">
                <label>密码</label>
                <div class="input-wrapper">
                  <i class="fas fa-lock icon"></i>
                  <input 
                    :type="showRegisterPassword ? 'text' : 'password'" 
                    v-model="registerForm.password" 
                    placeholder="********"
                    :class="{ 'input-focus': focusedInputs.password }"
                    @focus="focusedInputs.password = true"
                    @blur="focusedInputs.password = false; validateRegisterPassword()"
                  />
                  <i 
                    :class="['fas', showRegisterPassword ? 'fa-eye-slash' : 'fa-eye', 'eye-icon']" 
                    @click="showRegisterPassword = !showRegisterPassword"
                  ></i>
                </div>
              </div>
              <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
            </div>
            
            <div class="form-group">
              <div class="form-group-row">
                <label>确认密码</label>
                <div class="input-wrapper">
                  <i class="fas fa-lock icon"></i>
                  <input 
                    :type="showRegisterConfirmPassword ? 'text' : 'password'" 
                    v-model="registerForm.confirmPassword" 
                    placeholder="********"
                    :class="{ 'input-focus': focusedInputs.confirmPassword }"
                    @focus="focusedInputs.confirmPassword = true"
                    @blur="focusedInputs.confirmPassword = false; validateRegisterConfirmPassword()"
                  />
                  <i 
                    :class="['fas', showRegisterConfirmPassword ? 'fa-eye-slash' : 'fa-eye', 'eye-icon']" 
                    @click="showRegisterConfirmPassword = !showRegisterConfirmPassword"
                  ></i>
                </div>
              </div>
              <div v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</div>
            </div>
            
              <div class="form-group-header">
                <p>验证信息</p>
              </div>
            <div class="form-group verification-code-group">
              <div class="form-group-row">
                <label>验证码</label>
                <div class="input-wrapper with-button">
                  <div class="input-field-container">
                    <i class="fas fa-shield-alt icon"></i>
                    <input 
                      type="text" 
                      v-model="registerForm.code" 
                      placeholder="输入验证码"
                      :class="{ 'input-focus': focusedInputs.code }"
                      @focus="focusedInputs.code = true"
                      @blur="focusedInputs.code = false; validateRegisterCode()"
                    />
                  </div>
                  <button 
                    class="send-code-button"
                    @click="sendRegisterVerificationCode"
                    :disabled="!canSendRegisterCode"
                  >
                    {{ registerSendCodeText }} <i class="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
              <div v-if="errors.code" class="error-message">{{ errors.code }}</div>
            </div>
          </div>
          
          <button 
            class="login-button" 
            @click="handleRegister"
            :disabled="isLoading"
          >
            <span v-if="isLoading">处理中...</span>
            <span v-else>REGISTERED ACCOUNT <i class="fas fa-arrow-right"></i></span>
          </button>
          
          <div class="form-footer">
            <span class="switch-mode" @click="switchForm(true)">
              已有账号？登录
            </span>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="apiError" class="api-error">{{ apiError }}</div>
      
      <!-- Success Message -->
      <div v-if="apiSuccess" class="api-success">{{ apiSuccess }}</div>
      
      <!-- System Status -->
      <div class="system-status">
        系统状态: 在线 | v2.0.1
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { login, register, sendVerificationCode as sendCodeApi, resetPassword, verifyCode } from '@/api/auth';
import { useTheme } from '@/composables/useTheme';
import { useUserStore } from '@/composables/useUserStore';
import DynamicParticleBackground from '@/components/DynamicParticleBackground.vue';
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';

// 主题管理（仅保留需要的主题色）
const { themeColors } = useTheme();
const { initUserInfo } = useUserStore();


// 邮箱校验函数
const validateEmail = (email: string) => {
  // 步骤1：空值/空格校验
  if (!email || email.trim() === '') {
    return { valid: false, msg: '请输入邮箱' };
  }

  // 步骤2：严格格式校验
  const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, msg: '请填写正确的邮箱' };
  }

  // 步骤3：域名白名单校验
  const whiteListDomains = ['qq.com', '163.com', '126.com', 'yeah.net', 'vip.163.com', 'vip.126.com', 'foxmail.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain || !whiteListDomains.includes(domain)) {
    return { valid: false, msg: '仅支持QQ邮箱/网易邮箱' };
  }

  return { valid: true, msg: '' };
};

const router = useRouter();

// State
const isLogin = ref(true);
const isForgotPassword = ref(false);
const isLoading = ref(false);
const apiError = ref('');
const apiSuccess = ref('');
const forgotPasswordSuccess = ref(false);
const registerSuccess = ref(false);
const isVerificationPassed = ref(false);
const canSendCode = ref(true);
const sendCodeText = ref('发送验证码');
const countdown = ref(60);
const canSendRegisterCode = ref(true);
const registerSendCodeText = ref('发送验证码');
const registerCountdown = ref(60);

// Password visibility
const showLoginPassword = ref(false);
const showRegisterPassword = ref(false);
const showRegisterConfirmPassword = ref(false);
const showForgotNewPassword = ref(false);
const showForgotConfirmNewPassword = ref(false);

// Forms
const loginForm = reactive({
  username: '',
  password: ''
});

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  code: ''
});

const forgotPasswordForm = reactive({
  username: '',
  email: '',
  verificationCode: '',
  newPassword: '',
  confirmNewPassword: ''
});

// Focus states
const focusedInputs = reactive({
  username: false,
  password: false,
  confirmPassword: false,
  email: false,
  verificationCode: false,
  confirmNewPassword: false,
  code: false
});

// Errors
const errors = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  verificationCode: '',
  confirmNewPassword: '',
  code: ''
});

// Validation
const validateLoginUsername = () => {
  if (!loginForm.username) {
    errors.username = '请输入用户名';
  } else {
    errors.username = '';
  }
};

const validateLoginPassword = () => {
  if (!loginForm.password) {
    errors.password = '请输入密码';
  } else if (loginForm.password.length < 6) {
    errors.password = '密码长度至少为6位';
  } else {
    errors.password = '';
  }
};

const validateLoginForm = (): boolean => {
  validateLoginUsername();
  validateLoginPassword();
  return !errors.username && !errors.password;
};

const validateRegisterUsername = () => {
  if (!registerForm.username) {
    errors.username = '请输入用户名';
  } else {
    errors.username = '';
  }
};

const validateRegisterEmail = () => {
  if (!registerForm.email) {
    errors.email = '请输入邮箱';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
    errors.email = '邮箱格式不正确';
  } else {
    errors.email = '';
  }
};

const validateRegisterPassword = () => {
  if (!registerForm.password) {
    errors.password = '请输入密码';
  } else if (registerForm.password.length < 6) {
    errors.password = '密码长度至少为6位';
  } else {
    errors.password = '';
  }
  // 同时验证确认密码
  validateRegisterConfirmPassword();
};

const validateRegisterConfirmPassword = () => {
  if (!registerForm.confirmPassword) {
    errors.confirmPassword = '请输入确认密码';
  } else if (registerForm.password !== registerForm.confirmPassword) {
    errors.confirmPassword = '两次密码输入不一致';
  } else {
    errors.confirmPassword = '';
  }
};

const validateRegisterCode = () => {
  if (!registerForm.code) {
    errors.code = '请输入验证码';
  } else {
    errors.code = '';
  }
};

const validateRegisterForm = (): boolean => {
  validateRegisterUsername();
  validateRegisterEmail();
  validateRegisterPassword();
  validateRegisterConfirmPassword();
  validateRegisterCode();
  return !errors.username && !errors.email && !errors.password && !errors.confirmPassword && !errors.code;
};

// Forgot password validation
const validateForgotUsername = () => {
  if (!forgotPasswordForm.username) {
    errors.username = '请输入用户名';
  } else {
    errors.username = '';
  }
};

const validateForgotEmail = () => {
  if (!forgotPasswordForm.email) {
    errors.email = '请输入邮箱';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordForm.email)) {
    errors.email = '邮箱格式不正确';
  } else {
    errors.email = '';
  }
};

const validateForgotVerificationCode = () => {
  if (!forgotPasswordForm.verificationCode) {
    errors.verificationCode = '请输入验证码';
  } else {
    errors.verificationCode = '';
  }
};

const validateForgotNewPassword = () => {
  if (!forgotPasswordForm.newPassword) {
    errors.password = '请输入新密码';
  } else if (forgotPasswordForm.newPassword.length < 6) {
    errors.password = '密码长度至少为6位';
  } else {
    errors.password = '';
  }
  // 同时验证确认密码
  validateForgotConfirmNewPassword();
};

const validateForgotConfirmNewPassword = () => {
  if (!forgotPasswordForm.confirmNewPassword) {
    errors.confirmNewPassword = '请输入确认密码';
  } else if (forgotPasswordForm.newPassword !== forgotPasswordForm.confirmNewPassword) {
    errors.confirmNewPassword = '两次密码输入不一致';
  } else {
    errors.confirmNewPassword = '';
  }
};

const validateForgotForm = (): boolean => {
  validateForgotUsername();
  validateForgotEmail();
  validateForgotVerificationCode();
  
  if (isVerificationPassed.value) {
    validateForgotNewPassword();
    validateForgotConfirmNewPassword();
  }
  
  return !errors.username && !errors.email && !errors.verificationCode && 
         (!isVerificationPassed.value || (!errors.password && !errors.confirmNewPassword));
};

// Handlers
const handleLogin = async () => {
  if (!validateLoginForm()) return;
  
  isLoading.value = true;
  apiError.value = '';
  
  try {
    await login(loginForm);
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('登录成功但未获取到 token');
    }
    
    // 初始化用户信息
    await initUserInfo();
    
    await router.replace('/loading');
  } catch (error: any) {
    apiError.value = error.message || '登录失败';
    setTimeout(() => {
      apiError.value = '';
    }, 4500);
  } finally {
    isLoading.value = false;
  }
};

const sendRegisterVerificationCode = async () => {
  if (!registerForm.email) {
    errors.email = '请输入邮箱';
    return;
  }
  
  const emailValidation = validateEmail(registerForm.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.msg;
    return;
  }
  
  canSendRegisterCode.value = false;
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/send-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'reg',
        email: registerForm.email
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || '发送验证码失败');
    }
    
    const data = await response.json();
    apiSuccess.value = data.message || '验证码已发送到您的邮箱';
    
    // 开始倒计时
    registerCountdown.value = 60;
    registerSendCodeText.value = `${registerCountdown.value}秒后重发`;
    
    const timer = setInterval(() => {
      registerCountdown.value--;
      registerSendCodeText.value = `${registerCountdown.value}秒后重发`;
      
      if (registerCountdown.value <= 0) {
        clearInterval(timer);
        canSendRegisterCode.value = true;
        registerSendCodeText.value = '发送验证码';
      }
    }, 1000);
    
    // 3秒后清除成功消息
    setTimeout(() => {
      apiSuccess.value = '';
    }, 3000);
  } catch (error: any) {
    apiError.value = error.message || '发送验证码失败';
    // 重置发送状态
    canSendRegisterCode.value = true;
    registerSendCodeText.value = '发送验证码';
    
    // Reset error after 4.5 seconds
    setTimeout(() => {
      apiError.value = '';
    }, 4500);
  }
};

const handleRegister = async () => {
  if (!validateRegisterForm()) return;
  
  isLoading.value = true;
  apiError.value = '';
  
  try {
    await register(registerForm);
    registerSuccess.value = true;
  } catch (error: any) {
    apiError.value = error.message || '注册失败';
    // Reset error after 4.5 seconds
    setTimeout(() => {
      apiError.value = '';
    }, 4500);
  } finally {
    isLoading.value = false;
  }
};

const handleForgotPassword = async () => {
  if (!validateForgotForm()) return;
  
  isLoading.value = true;
  apiError.value = '';
  
  try {
    if (!isVerificationPassed.value) {
      // 验证验证码
      await verifyCode({
        type: 'mod',
        username: forgotPasswordForm.username,
        email: forgotPasswordForm.email,
        code: forgotPasswordForm.verificationCode
      });
      isVerificationPassed.value = true;
    } else {
      // 调用密码重置API
      await resetPassword({
        type: 'mod',
        username: forgotPasswordForm.username,
        email: forgotPasswordForm.email,
        code: forgotPasswordForm.verificationCode,
        newPassword: forgotPasswordForm.newPassword
      });
      forgotPasswordSuccess.value = true;
    }
  } catch (error: any) {
    apiError.value = error.message || '操作失败';
    // Reset error after 4.5 seconds
    setTimeout(() => {
      apiError.value = '';
    }, 4500);
  } finally {
    isLoading.value = false;
  }
};

const sendVerificationCode = async () => {
  // 前端校验用户名和邮箱
  if (!forgotPasswordForm.username) {
    errors.username = '请输入用户名';
    return;
  }
  if (!forgotPasswordForm.email) {
    errors.email = '请输入邮箱';
    return;
  }
  
  // 验证邮箱格式
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordForm.email)) {
    errors.email = '邮箱格式不正确';
    return;
  }
  
  // 清除错误信息
  errors.username = '';
  errors.email = '';
  apiError.value = '';
  
  try {
    // 禁用发送按钮
    canSendCode.value = false;
    
    // 调用发送验证码API
    const response = await fetch('http://localhost:3000/api/auth/send-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'mod',
        username: forgotPasswordForm.username,
        email: forgotPasswordForm.email
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || '发送验证码失败');
    }
    
    const data = await response.json();
    // 显示接口返回的文案
    apiSuccess.value = data.message || '验证码已发送到您的邮箱';
    
    // 开始倒计时
    countdown.value = 60;
    sendCodeText.value = `${countdown.value}秒后重发`;
    
    const timer = setInterval(() => {
      countdown.value--;
      sendCodeText.value = `${countdown.value}秒后重发`;
      
      if (countdown.value <= 0) {
        clearInterval(timer);
        canSendCode.value = true;
        sendCodeText.value = '发送验证码';
      }
    }, 1000);
    
    // 3秒后清除成功消息
    setTimeout(() => {
      apiSuccess.value = '';
    }, 3000);
  } catch (error: any) {
    apiError.value = error.message || '发送验证码失败';
    // 重置发送状态
    canSendCode.value = true;
    sendCodeText.value = '发送验证码';
    
    // Reset error after 4.5 seconds
    setTimeout(() => {
      apiError.value = '';
    }, 4500);
  }
};

// Switch form handler
const switchForm = (toLogin: boolean) => {
  isLogin.value = toLogin;
  isForgotPassword.value = false;
  registerSuccess.value = false;
  apiError.value = '';
  
  // Reset focus states
  Object.keys(focusedInputs).forEach(key => {
    focusedInputs[key as keyof typeof focusedInputs] = false;
  });
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = '';
  });
  
  // Clear form data
  if (toLogin) {
    // Switching to login form, clear register form
    registerForm.username = '';
    registerForm.password = '';
    registerForm.confirmPassword = '';
    registerForm.email = '';
    registerForm.code = '';
  } else {
    // Switching to register form, clear login form
    loginForm.username = '';
    loginForm.password = '';
  }
};

// Switch to forgot password form
const switchToForgotPassword = () => {
  isForgotPassword.value = true;
  isLogin.value = false;
  forgotPasswordSuccess.value = false;
  isVerificationPassed.value = false;
  apiError.value = '';
  
  // Reset focus states
  Object.keys(focusedInputs).forEach(key => {
    focusedInputs[key as keyof typeof focusedInputs] = false;
  });
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = '';
  });
  
  // Clear form data
  forgotPasswordForm.username = '';
  forgotPasswordForm.email = '';
  forgotPasswordForm.verificationCode = '';
  forgotPasswordForm.newPassword = '';
  forgotPasswordForm.confirmNewPassword = '';
};

// Switch to login form
const switchToLogin = () => {
  isForgotPassword.value = false;
  isLogin.value = true;
  forgotPasswordSuccess.value = false;
  registerSuccess.value = false;
  isVerificationPassed.value = false;
  apiError.value = '';
  
  // Reset focus states
  Object.keys(focusedInputs).forEach(key => {
    focusedInputs[key as keyof typeof focusedInputs] = false;
  });
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = '';
  });
  
  // Clear form data
  forgotPasswordForm.username = '';
  forgotPasswordForm.email = '';
  forgotPasswordForm.verificationCode = '';
  forgotPasswordForm.newPassword = '';
  forgotPasswordForm.confirmNewPassword = '';
  registerForm.username = '';
  registerForm.password = '';
  registerForm.confirmPassword = '';
  registerForm.email = '';
  registerForm.code = '';
};
</script>

<style scoped>
.page-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.page-content {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.grid-background {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background-size: 40px 40px;
  z-index: 0;
}



.page-logo {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 10px;
}

.logo-triangle {
  width: 35px;
  height: 35px;
  position: relative;
  background-color: transparent;
  filter: v-bind('`drop-shadow(0 0 5px ${themeColors.primary}A0)`');
  transition: filter 0.3s ease;
}

.logo-text {
  font-family: 'Black Ops One', 'Orbitron', 'Rajdhani', '宋体', 'SimSun', serif;
  font-size: 26px;
  font-weight: 900;
  color: v-bind('themeColors.primary');
  transition: color 0.3s ease;
  line-height: 1;
  transform: translateY(2px) translateX(-6px);
}

.logo-triangle::before {
  content: '';
  position: absolute;
  top: 5px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 18px solid transparent;
  border-right: 18px solid transparent;
  border-bottom: 31px solid v-bind('themeColors.primary');
  transition: border-bottom-color 0.3s ease;
}

.logo-triangle .inner-triangle {
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  width: 0;
  height: 0;
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-bottom: 15px solid v-bind('themeColors.background');
  transition: border-bottom-color 0.3s ease;
}

.logo-text {
  font-family: 'Orbitron', 'Rajdhani', '宋体', 'SimSun', serif;
  font-size: 26px;
  font-weight: 900;
  color: v-bind('themeColors.primary');
  transition: color 0.3s ease;
}

.login-form {
  padding: 40px;
  background-color: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  z-index: 1;
  text-align: center;
  min-width: 420px;
  max-width: 100%;
}

.logo {
  margin-bottom: 40px;
}

.triangle {
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
  position: relative;
  background-color: transparent;
  filter: v-bind('`drop-shadow(0 0 10px ${themeColors.primary}A0)`');
  animation: triangle-edge-glow 2s infinite;
  transition: filter 0.3s ease;
}

@keyframes triangle-edge-glow {
  0% {
    filter: v-bind('`drop-shadow(0 0 10px ${themeColors.primary}A0)`');
  }
  50% {
    filter: v-bind('`drop-shadow(0 0 20px ${themeColors.primary}FF) drop-shadow(0 0 30px ${themeColors.primary}80)`');
  }
  100% {
    filter: v-bind('`drop-shadow(0 0 10px ${themeColors.primary}A0)`');
  }
}

.triangle::before {
  content: '';
  position: absolute;
  top: 13px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 50px solid transparent;
  border-right: 50px solid transparent;
  border-bottom: 87px solid v-bind('themeColors.primary');
  transition: border-bottom-color 0.3s ease;
}

.inner-triangle {
  position: absolute;
  top: 43px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  width: 0;
  height: 0;
  border-left: 25px solid transparent;
  border-right: 25px solid transparent;
  border-bottom: 43px solid v-bind('themeColors.background');
  transition: border-bottom-color 0.3s ease;
}

.logo h1 {
  font-family: 'Orbitron', 'Rajdhani', '宋体', 'SimSun', serif;
  font-size: 29px;
  font-weight: bold;
  color: v-bind('themeColors.text');
  margin: 0 0 5px;
  text-transform: uppercase;
  transition: all 0.3s ease;
  cursor: pointer;
}

.logo h1:hover {
  text-shadow: 0 0 15px v-bind('themeColors.primary');
}

.logo p {
  font-family: 'Rajdhani', '宋体', 'SimSun', serif;
  font-size: 12px;
  color: v-bind('themeColors.secondary');
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  transition: color 0.3s ease;
}

.form-group-header {
  margin: 20px 0 10px;
  text-align: left;
}

.form-group-header p {
  font-family: 'Rajdhani', '宋体', 'SimSun', serif;
  font-size: 12px;
  color: v-bind('themeColors.secondary');
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  transition: color 0.3s ease;
  font-weight: bold;
}

.form-scroll-container {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
}

.form-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.form-scroll-container::-webkit-scrollbar-track {
  background: rgba(128, 128, 128, 0.1);
}

.form-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(15, 247, 150, 0.5);
  border-radius: 3px;
}

.form-scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(15, 247, 150, 0.8);
}

.form-section {
  margin-bottom: 20px;
  width: 100%;
  max-width: 350px;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
  display: flex;
  flex-direction: column;
}

.form-group-row {
  display: flex;
  align-items: stretch;
  width: 100%;
  position: relative;
}

.form-group-row::after {
  content: '';
  position: absolute;
  bottom: 0;
  /* top: -5; */
  left: 0;
  right: 0;
  height: 2px;
  background-color: v-bind('themeColors.primary');
  z-index: -1;
  transition: background-color 0.3s ease;
}

.form-group label {
  display: inline-block;
  font-family: 'Rajdhani', '宋体', 'SimSun', serif;
  font-size: 13px;
  font-weight: bold;
  color: v-bind('themeColors.buttonText');
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  background-color: v-bind('themeColors.primary');
  padding: 3px 15px;
  border-radius: 0;
  margin-right: 0;
  min-width: 90px;
  text-align: center;
  box-sizing: border-box;
  border-bottom: none;
  height: 26.8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-group .input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
}

.form-group:focus-within .icon {
  color: v-bind('themeColors.primary');
}

.input-wrapper {
  position: relative;
  width: 100%;
  flex: 1;
}

.input-wrapper .eye-icon {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  color: v-bind('themeColors.text');
  font-size: 14px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.input-wrapper .eye-icon:hover {
  opacity: 1;
}

.input-wrapper.with-button {
  display: flex;
  align-items: stretch;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
}

.input-wrapper.with-button input {
  flex: 1;
  border-bottom: none;
  padding: 3px 10px 3px 30px;
  outline: none;
  transition: all 0.3s ease;
  height: 26.8px;
  box-sizing: border-box;
  transform: translateY(-1px);
}

.input-wrapper.with-button input:focus {
  border-bottom: none;
  box-shadow: none;
}

.send-code-button {
  padding: 3px 15px;
  background-color: v-bind('themeColors.primary');
  border: none;
  border-radius: 0;
  color: v-bind('themeColors.buttonText');
  font-family: 'Rajdhani', '宋体', 'SimSun', serif;
  font-size: 13px;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  height: 26.8px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-code-button:hover {
  background-color: v-bind('themeColors.primary');
  box-shadow: v-bind('`0 0 10px ${themeColors.primary}FF, 0 0 15px ${themeColors.primary}80`');
  transition: box-shadow 0.3s ease;
}

.send-code-button i {
  margin-left: 5px;
  transition: transform 0.3s ease;
}

.send-code-button:hover i {
  transform: translateX(4px);
}

.send-code-button:disabled {
  background-color: v-bind('themeColors.primary');
  cursor: not-allowed;
  opacity: 0.8;
}

.icon {
  position: absolute;
  left: 5px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(128, 128, 128, 0.8);
  transition: color 0.3s ease;
}

.form-group input {
  flex: 1;
  padding: 3px 30px 3px 30px;
  background-color: transparent;
  border: none;
  border-bottom: none;
  border-radius: 0;
  color: #fff;
  font-family: 'Rajdhani', '宋体', 'SimSun', serif;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
  outline: none;
  width: 100%;
  position: relative;
  height: 100%;
  box-sizing: border-box;
}



.form-group input::placeholder {
  color: rgba(128, 128, 128, 0.5);
  font-family: 'Rajdhani', '宋体', 'SimSun', serif;
  font-size: 13px;
  transition: color 0.3s ease;
}

.form-group input:focus,
.input-focus {
  border-bottom-color: v-bind('themeColors.primary');
  box-shadow: none;
}

.error-message {
  font-family: 'Rajdhani', '宋体', 'SimSun', serif;
  font-size: 13px;
  font-weight: 500;
  color: #ff0000;
  margin-top: 5px;
  margin-left: 90px;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: v-bind('themeColors.primary');
  border: none;
  border-radius: 2px;
  color: v-bind('themeColors.buttonText');
  font-family: 'Rajdhani', '宋体', 'SimSun', serif;
  font-size: 15px;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 20px 0;
  box-sizing: border-box;
}

.login-button:hover {
  background-color: v-bind('themeColors.primary');
  box-shadow: v-bind('`0 0 10px ${themeColors.primary}FF, 0 0 15px ${themeColors.primary}80`');
  transition: box-shadow 0.3s ease;
}

.login-button i {
  margin-left: 5px;
  transition: transform 0.3s ease;
}

.login-button:hover i {
  transform: translateX(4px);
}

.login-button:active {
  transform: translateY(2px);
  box-shadow: 0 0 5px v-bind('`rgba(${themeColors.primary.replace("#", "").match(/.{2}/g)?.join(", ")}, 0.5)`');
}

.login-button:disabled {
  background-color: v-bind('themeColors.primary');
  cursor: not-allowed;
  opacity: 0.8;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Rajdhani', '宋体', 'SimSun', serif;
  font-size: 13px;
  font-weight: 500;
}

.forgot-password {
  color: v-bind('themeColors.secondary');
  cursor: pointer;
  transition: color 0.3s ease;
}

.switch-mode {
  color: v-bind('themeColors.secondary');
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.api-error {
  font-family: 'Rajdhani', '宋体', 'SimSun', serif;
  font-size: 13px;
  font-weight: 500;
  color: #ff0000;
  margin: 10px 0;
  animation: blink 1s infinite;
}

.api-success {
  font-family: 'Rajdhani', '宋体', 'SimSun', serif;
  font-size: 13px;
  font-weight: 500;
  color: v-bind('themeColors.primary');
  margin: 10px 0;
  animation: blink 1s infinite;
  transition: color 0.3s ease;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.system-status {
  font-family: 'Rajdhani', '宋体', 'SimSun', serif;
  font-size: 11px;
  font-weight: 500;
  color: v-bind('themeColors.primary');
  margin-top: 20px;
  letter-spacing: 1px;
  transition: color 0.3s ease;
}

.success-message {
  text-align: center;
  padding: 30px 0;
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background-color: v-bind('`rgba(${themeColors.primary.replace("#", "").match(/.{2}/g)?.join(", ")}, 0.2)`');
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon i {
  font-size: 40px;
  color: v-bind('themeColors.primary');
}

.success-message h3 {
  font-family: 'Rajdhani', '宋体', 'SimSun', serif;
  font-size: 20px;
  font-weight: bold;
  color: v-bind('themeColors.primary');
  margin: 0 0 10px;
  transition: color 0.3s ease;
}

.success-message p {
  font-family: 'Rajdhani', '宋体', 'SimSun', serif;
  font-size: 12px;
  color: v-bind('themeColors.primary');
  margin: 0 0 20px;
  transition: color 0.3s ease;
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background-color: v-bind('`rgba(${themeColors.primary.replace("#", "").match(/.{2}/g)?.join(", ")}, 0.2)`');
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 0 10px v-bind('`rgba(${themeColors.primary.replace("#", "").match(/.{2}/g)?.join(", ")}, 0.5)`');
  transition: box-shadow 0.3s ease, background-color 0.3s ease;
}

.success-icon:hover {
  box-shadow: 0 0 20px v-bind('`rgba(${themeColors.primary.replace("#", "").match(/.{2}/g)?.join(", ")}, 0.8)`'), 0 0 30px v-bind('`rgba(${themeColors.primary.replace("#", "").match(/.{2}/g)?.join(", ")}, 0.4)`');
}

@media (max-width: 480px) {
  .login-form {
    width: 90%;
    padding: 20px;
    min-width: unset;
  }
  
  .login-button {
    width: 100%;
  }
  
  .form-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .form-group-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .form-group label {
    margin-bottom: 10px;
    margin-right: 0;
    width: 100%;
    text-align: left;
  }
  
  .input-wrapper {
    width: 100%;
  }
  
  .input-wrapper {
    position: relative;
  }
  
  .input-wrapper .icon {
    position: absolute;
    left: 5px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
  }
  
  .input-wrapper.with-button {
    width: 100%;
    flex-direction: column;
  }
  
  .input-wrapper.with-button .input-field-container {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
  }
  
  .input-wrapper.with-button input {
    margin-right: 0;
    margin-bottom: 10px;
    width: 100%;
  }
  
  .input-wrapper.with-button .icon {
    position: absolute;
    left: 5px;
    top: 50%;
    transform: translateY(-50%) translateY(-5px);
    z-index: 2;
  }
  
  .send-code-button {
    width: 100%;
    padding: 3px 15px;
    height: auto;
  }
  
  .form-footer {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .logo h1 {
    font-size: 24px;
  }
  
  .triangle {
    width: 80px;
    height: 80px;
  }
  
  .triangle::before {
    top: 10px;
    border-left: 40px solid transparent;
    border-right: 40px solid transparent;
    border-bottom: 69px solid v-bind('themeColors.primary');
  }
  
  .inner-triangle {
    top: 34px;
    border-left: 20px solid transparent;
    border-right: 20px solid transparent;
    border-bottom: 34px solid #000;
  }
}
</style>