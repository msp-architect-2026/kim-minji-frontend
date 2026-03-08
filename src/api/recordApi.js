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
  return res.data; // { id, prediction, confidence }
};