import axios from 'axios';

import { ElMessage } from 'element-plus';
import router from '@/router';

const request = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        ElMessage.error('登录状态已过期，请重新登录');
        router.push('/login');
      } else if (status === 401) {
        ElMessage.error('没有权限访问该资源');
      } else {
        ElMessage.error(
          `请求失败: ${error.response.data.message || '未知错误'}`
        );
      }
    } else {
      ElMessage.error('网络错误，请检查您的连接');
    }
    return Promise.reject(error);
  }
);

request.interceptors.request.use(
  (config) => {
    const loginUser = JSON.parse(localStorage.getItem('loginUser'));
    if (loginUser && loginUser.token) {
      config.headers.token = loginUser.token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export default request;
