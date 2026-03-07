import axios from 'axios';

const BASE_URL = 'http://api.wafer.local:32088/wafer/records';

export const fetchPagedRecords = async (search, page, size) => {
  const res = await axios.get(`${BASE_URL}/pages`, {
    params: { search, page, size }
  });
  return res.data;
};

export const fetchRecordById = async (id) => {
  const res = await axios.get(`${BASE_URL}/${id}`);
  return res.data;
};

export const uploadAndAnalyze = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await axios.post('http://api.wafer.local:32088/ai/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return res.data; // { prediction: ..., confidence: ... }
};
