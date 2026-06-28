import router from '@/router';
import { useUserStore } from '@/composables/useUserStore';

const BASE_URL = 'http://localhost:3000';

let isRedirecting = false;

const handleAuthFailure = () => {
  if (isRedirecting) return;
  isRedirecting = true;

  const { resetUserInfo } = useUserStore();
  localStorage.removeItem('token');
  resetUserInfo();

  if (router.currentRoute.value.path !== '/login') {
    router.push('/login');
  }

  setTimeout(() => {
    isRedirecting = false;
  }, 100);
};

const isTokenInvalidError = (status: number, errorMessage: string): boolean => {
  if (status === 401) return true;
  const lowerMsg = errorMessage.toLowerCase();
  return lowerMsg.includes('token无效') ||
    lowerMsg.includes('token 无效') ||
    lowerMsg.includes('token过期') ||
    lowerMsg.includes('token 过期') ||
    lowerMsg.includes('未登录') ||
    lowerMsg.includes('未授权') ||
    lowerMsg.includes('unauthorized');
};

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  auth?: boolean;
}

export const request = async <T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> => {
  const {
    method = 'GET',
    headers = {},
    body,
    auth = true,
  } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (auth) {
    const token = localStorage.getItem('token');
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

  const response = await fetch(fullUrl, {
    method,
    headers: requestHeaders,
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  });

  const contentType = response.headers.get('content-type');
  let data: any;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = typeof data === 'string' ? data : (data?.error || data?.message || `请求失败 (${response.status})`);

    if (auth && isTokenInvalidError(response.status, errorMessage)) {
      handleAuthFailure();
    }

    throw new Error(errorMessage);
  }

  return data as T;
};

export default request;
