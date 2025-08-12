import axios from 'axios';

const axiosInstance = axios.create({
  // Vì đã dùng proxy trong Vite, chúng ta không cần baseURL ở đây
  baseURL: '/api' // URL sẽ được proxy tới http://localhost:5000/api
});

export default axiosInstance;