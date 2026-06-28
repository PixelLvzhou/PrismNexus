import request from '@/utils/request';

export const login = async (credentials: {
  username: string;
  password: string;
}): Promise<void> => {
  try {
    const data = await request<any>('/api/auth/login', {
      method: 'POST',
      body: credentials,
      auth: false,
    });

    if (data.token) {
      localStorage.setItem('token', data.token);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Login failed');
  }
};

export const register = async (userData: {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  code: string;
}): Promise<void> => {
  try {
    const data = await request<any>('/api/auth/register', {
      method: 'POST',
      body: userData,
      auth: false,
    });

    if (data.token) {
      localStorage.setItem('token', data.token);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Registration failed');
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

export const sendVerificationCode = async (data: {
  type: string;
  username: string;
  email: string;
}): Promise<void> => {
  try {
    await request('/api/auth/send-code', {
      method: 'POST',
      body: data,
      auth: false,
    });
  } catch (error: any) {
    throw new Error(error.message || '发送验证码失败');
  }
};

export const resetPassword = async (data: {
  type: string;
  username: string;
  email: string;
  code: string;
  newPassword: string;
}): Promise<void> => {
  try {
    await request('/api/auth/reset-password', {
      method: 'POST',
      body: data,
      auth: false,
    });
  } catch (error: any) {
    throw new Error(error.message || '重置密码失败');
  }
};

export const verifyCode = async (data: {
  type: string;
  username: string;
  email: string;
  code: string;
}): Promise<void> => {
  try {
    await request('/api/auth/reset-password', {
      method: 'POST',
      body: data,
      auth: false,
    });
  } catch (error: any) {
    throw new Error(error.message || '验证码验证失败');
  }
};
