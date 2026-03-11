import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchPagedRecords = async (search, page, size) => {
  const res = await axios.get(`${API_URL}/wafer/records/pages`, {
    params: { search, page, size }
  });
  return res.data;
};

export const fetchRecordById = async (id) => {
  const res = await axios.get(`${API_URL}/wafer/records/${id}`);
  return res.data;
};

export const uploadAndAnalyze = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${API_URL}/ai/predict`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const fetchStats = async () => {
  const res = await axios.get(`${API_URL}/wafer/stats`);
  return res.data;
};

export const fetchDailyStats = async (days = 7) => {
  const res = await axios.get(`${API_URL}/wafer/stats/daily`, { params: { days } });
  return res.data;
};

export const fetchDefectDistribution = async () => {
  const res = await axios.get(`${API_URL}/wafer/stats/defect-distribution`);
  return res.data;
};

export const fetchAllRecords = async () => {
  const res = await axios.get(`${API_URL}/wafer/records`);
  return res.data;
};

export const exportRecords = async (prediction, startDate, endDate) => {
  const params = {};
  if (prediction) params.prediction = prediction;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const res = await axios.get(`${API_URL}/wafer/records/export`, { params });
  return res.data;
};