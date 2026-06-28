import request from '@/utils/request';

const API_BASE = '/api/permission';

export const applyPermission = async (permissionCode: string) => {
  const data = await request(`${API_BASE}/apply`, {
    method: 'POST',
    body: { permission_code: permissionCode },
  });
  return data;
};

export const queryApplications = async (params: {
  page?: number;
  page_size?: number;
  status?: string;
}) => {
  const data = await request(`${API_BASE}/applications`, {
    method: 'POST',
    body: {
      type: 'query',
      page: params.page || 1,
      page_size: params.page_size || 12,
      status: params.status || 'all',
    },
  });
  return data;
};

export const cancelApplication = async (applicationId: number) => {
  const data = await request(`${API_BASE}/applications`, {
    method: 'POST',
    body: {
      type: 'cancel',
      application_id: applicationId,
    },
  });
  return data;
};

export const approveApplication = async (applicationId: number) => {
  const data = await request(`${API_BASE}/applications`, {
    method: 'POST',
    body: {
      type: 'approve',
      application_id: applicationId,
    },
  });
  return data;
};

export const rejectApplication = async (
  applicationId: number,
  rejectReason: string,
) => {
  const data = await request(`${API_BASE}/applications`, {
    method: 'POST',
    body: {
      type: 'reject',
      application_id: applicationId,
      reject_reason: rejectReason,
    },
  });
  return data;
};

export const getMyPermissions = async () => {
  const data = await request(`${API_BASE}/my-permissions`, {
    method: 'GET',
  });
  return data;
};

export const PERMISSION_CODES = {
  NAV_MANAGE: { code: 'NAV_MANAGE', name: '导航管理权限' },
  ACCOUNT_MANAGE: { code: 'ACCOUNT_MANAGE', name: '账户管理权限' },
};

export const grantPermission = async (
  userId: number,
  permissionCodes: string[],
) => {
  const data = await request(`${API_BASE}/grant`, {
    method: 'POST',
    body: {
      user_id: userId,
      permission_codes: permissionCodes,
    },
  });
  return data;
};
