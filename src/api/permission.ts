const API_BASE_URL = "http://localhost:3000/api/permission";

// 获取token
const getToken = () => localStorage.getItem("token");

const getAuthHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

// 权限申请
export const applyPermission = async (permissionCode: string) => {
  const token = getToken();
  if (!token) {
    throw new Error("请先登录");
  }

  const response = await fetch(`${API_BASE_URL}/apply`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ permission_code: permissionCode }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "申请失败");
  }
  return data;
};

// 权限申请列表查询
export const queryApplications = async (params: {
  page?: number;
  page_size?: number;
  status?: string;
}) => {
  const token = getToken();
  if (!token) {
    throw new Error("请先登录");
  }

  const response = await fetch(`${API_BASE_URL}/applications`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      type: "query",
      page: params.page || 1,
      page_size: params.page_size || 10,
      status: params.status || "all",
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "查询失败");
  }
  return data;
};

// 取消申请
export const cancelApplication = async (applicationId: number) => {
  const token = getToken();
  if (!token) {
    throw new Error("请先登录");
  }

  const response = await fetch(`${API_BASE_URL}/applications`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      type: "cancel",
      application_id: applicationId,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "取消失败");
  }
  return data;
};

// 审批通过
export const approveApplication = async (applicationId: number) => {
  const token = getToken();
  if (!token) {
    throw new Error("请先登录");
  }

  const response = await fetch(`${API_BASE_URL}/applications`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      type: "approve",
      application_id: applicationId,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "审批失败");
  }
  return data;
};

// 审批驳回
export const rejectApplication = async (
  applicationId: number,
  rejectReason: string,
) => {
  const token = getToken();
  if (!token) {
    throw new Error("请先登录");
  }

  const response = await fetch(`${API_BASE_URL}/applications`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      type: "reject",
      application_id: applicationId,
      reject_reason: rejectReason,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "驳回失败");
  }
  return data;
};

// 获取当前用户权限
export const getMyPermissions = async () => {
  const token = getToken();
  if (!token) {
    throw new Error("请先登录");
  }

  const response = await fetch(`${API_BASE_URL}/my-permissions`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "获取权限失败");
  }
  return data;
};

// 权限编码定义
export const PERMISSION_CODES = {
  NAV_MANAGE: { code: "NAV_MANAGE", name: "导航管理权限" },
  ACCOUNT_MANAGE: { code: "ACCOUNT_MANAGE", name: "账户管理权限" },
};

// 直接授予权限（开发者操作）
export const grantPermission = async (
  userId: number,
  permissionCodes: string[],
) => {
  const token = getToken();
  if (!token) {
    throw new Error("请先登录");
  }

  const response = await fetch(`${API_BASE_URL}/grant`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      user_id: userId,
      permission_codes: permissionCodes,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "授权失败");
  }
  return data;
};
