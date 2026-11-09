import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const clean = (params) => Object.fromEntries(Object.entries(params).filter(([, value]) => value));

export const fetchPChart = async ({ days, defect, equipment }) => {
  const res = await axios.get(`${API_URL}/spc/p-chart`, { params: clean({ days, defect, equipment }) });
  return res.data;
};

export const fetchCommonality = async ({ days, defect }) => {
  const res = await axios.get(`${API_URL}/spc/commonality`, { params: clean({ days, defect }) });
  return res.data;
};
