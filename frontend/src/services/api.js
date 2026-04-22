import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 传感器相关API
export const sensorAPI = {
  // 获取所有传感器列表
  getSensors: () => api.get('/sensors'),
  
  // 获取指定传感器数据
  getSensorData: (sensorId) => api.get(`/sensors/${sensorId}`),
  
  // 获取所有传感器实时数据
  getAllSensorsData: () => api.get('/sensors/all'),
  
  // 获取传感器历史数据
  getSensorHistory: (sensorId, limit = 100) => 
    api.get(`/history/${sensorId}?limit=${limit}`),
};

// 分析相关API
export const analysisAPI = {
  // 获取传感器性能分析
  getSensorAnalysis: (sensorId) => api.get(`/analysis/${sensorId}`),
  
  // 获取所有传感器分析
  getAllAnalysis: () => api.get('/analysis/all'),
  
  // 获取传感器统计数据
  getSensorStatistics: (sensorId) => api.get(`/statistics/${sensorId}`),
};

// 系统相关API
export const systemAPI = {
  // 获取系统状态
  getSystemStatus: () => api.get('/system/status'),
  
  // 启动数据采集
  startDataCollection: () => api.post('/system/start'),
  
  // 停止数据采集
  stopDataCollection: () => api.post('/system/stop'),
  
  // 获取仪表板数据
  getDashboardData: () => api.get('/dashboard'),
};

// 导出相关API
export const exportAPI = {
  // 导出传感器数据
  exportSensorData: (sensorId) => api.get(`/export/${sensorId}`),
};

export default api;
