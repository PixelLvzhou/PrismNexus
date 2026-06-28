import request from '@/utils/request';

const API_BASE = '/api/navigation';

export const getNavigations = async () => {
  const data = await request(`${API_BASE}`, {
    method: 'GET',
  });
  return data;
};

export const getAllNavigations = async () => {
  const data = await request(`${API_BASE}/all`, {
    method: 'GET',
  });
  return data;
};

export const createNavigation = async (navData: any) => {
  const data = await request(`${API_BASE}`, {
    method: 'POST',
    body: navData,
  });
  return data;
};

export const updateNavigation = async (id: number, navData: any) => {
  const data = await request(`${API_BASE}/${id}`, {
    method: 'PUT',
    body: navData,
  });
  return data;
};

export const deleteNavigation = async (id: number) => {
  const data = await request(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  return data;
};

export default {
  getNavigations,
  getAllNavigations,
  createNavigation,
  updateNavigation,
  deleteNavigation,
};
