import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchLots = async (page = 0, size = 20) => {
  const res = await axios.get(`${API_URL}/lots`, { params: { page, size } });
  return res.data;
};

export const fetchLot = async (id) => {
  const res = await axios.get(`${API_URL}/lots/${id}`);
  return res.data;
};

export const createLot = async (lot) => {
  const res = await axios.post(`${API_URL}/lots`, lot);
  return res.data;
};

export const inspectWafer = async (lotId, slotNo, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${API_URL}/lots/${lotId}/wafers/${slotNo}/inspections`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const retryInspection = async (id) => {
  const res = await axios.post(`${API_URL}/inspections/${id}/retry`);
  return res.data;
};

export const fetchInspectionEvents = async (id) => {
  const res = await axios.get(`${API_URL}/inspections/${id}/events`);
  return res.data;
};

export const fetchProcessHistory = async (waferId) => {
  const res = await axios.get(`${API_URL}/wafers/${waferId}/process-history`);
  return res.data;
};

export const holdLot = async (id, body) => {
  const res = await axios.post(`${API_URL}/lots/${id}/hold`, body);
  return res.data;
};

export const releaseLot = async (id, body) => {
  const res = await axios.post(`${API_URL}/lots/${id}/release`, body);
  return res.data;
};

export const fetchPendingReviews = async (page = 0, size = 20) => {
  const res = await axios.get(`${API_URL}/inspections/pending-reviews`, { params: { page, size } });
  return res.data;
};

export const reviewInspection = async (id, body) => {
  const res = await axios.post(`${API_URL}/inspections/${id}/review`, body);
  return res.data;
};

// local 프로파일 backend에서만 동작한다
export const simulate = async () => {
  const res = await axios.post(`${API_URL}/dev/simulate`);
  return res.data;
};

export const apiErrorMessage = (error) => {
  const body = error.response?.data;
  if (!body?.code) return error.message;
  return `${body.detail} (${body.code}, trace ${body.traceId})`;
};
