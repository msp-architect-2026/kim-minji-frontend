import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchFailureSummary = async (hours) => {
  const res = await axios.get(`${API_URL}/failures/summary`, { params: { hours } });
  return res.data;
};

export const fetchFailures = async ({ hours, errorCode, page, size }) => {
  const params = { hours, page, size };
  if (errorCode) params.errorCode = errorCode;
  const res = await axios.get(`${API_URL}/failures`, { params });
  return res.data;
};
