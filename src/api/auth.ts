// 登录请求
export const login = async (credentials: {
  username: string;
  password: string;
}): Promise<void> => {
  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || "Login failed");
    }

    const data = await response.json();
    // 存储 Token 到 localStorage
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
  } catch (error: any) {
    throw new Error(error.message || "Login failed");
  }
};

// 注册请求
export const register = async (userData: {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  code: string;
}): Promise<void> => {
  try {
    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || errorData.message || "Registration failed"
      );
    }

    const data = await response.json();
    // 存储 Token 到 localStorage
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
  } catch (error: any) {
    throw new Error(error.message || "Registration failed");
  }
};

// 登出功能
export const logout = (): void => {
  localStorage.removeItem("token");
};

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("token");
};

// 发送验证码
export const sendVerificationCode = async (data: {
  type: string;
  username: string;
  email: string;
}): Promise<void> => {
  try {
    const response = await fetch("http://localhost:3000/api/auth/send-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || "发送验证码失败");
    }
  } catch (error: any) {
    throw new Error(error.message || "发送验证码失败");
  }
};

// 重置密码
export const resetPassword = async (data: {
  type: string;
  username: string;
  email: string;
  code: string;
  newPassword: string;
}): Promise<void> => {
  try {
    const response = await fetch(
      "http://localhost:3000/api/auth/reset-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || "重置密码失败");
    }
  } catch (error: any) {
    throw new Error(error.message || "重置密码失败");
  }
};

// 验证验证码
export const verifyCode = async (data: {
  type: string;
  username: string;
  email: string;
  code: string;
}): Promise<void> => {
  try {
    // 我们可以使用重置密码接口来验证验证码
    // 只传递用户名、邮箱和验证码，不传递新密码
    // 这样后端会验证验证码的有效性
    const response = await fetch(
      "http://localhost:3000/api/auth/reset-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || "验证码验证失败");
    }
  } catch (error: any) {
    throw new Error(error.message || "验证码验证失败");
  }
};
