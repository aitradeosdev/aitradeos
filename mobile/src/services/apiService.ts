import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getApiBaseUrl = () => {
  // Always use production Render backend
  return 'https://aitradeos.onrender.com/api';
};

const API_BASE_URL = 'https://aitradeos.onrender.com/api';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          await this.handleTokenExpiration();
        }
        return Promise.reject(error);
      }
    );
  }

  private async handleTokenExpiration() {
    this.token = null;
    await AsyncStorage.removeItem('huntr_ai_token');
    await AsyncStorage.removeItem('huntr_ai_user');
  }

  setAuthToken(token: string | null) {
    this.token = token;
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete(url, config);
  }

  async uploadImage(imageUri: string, fileName: string): Promise<AxiosResponse<any>> {
    try {
      const formData = new FormData();
      
      // For web, we need to fetch the image as a blob first
      if (typeof window !== 'undefined') {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('chart', blob, fileName);
      } else {
        // For native platforms
        (formData as any).append('chart', {
          uri: imageUri,
          type: 'image/jpeg',
          name: fileName,
        });
      }

      return this.api.post('/analysis/chart', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000,
      });
    } catch (error) {
      throw error;
    }
  }

  async uploadMultipleImages(imageUris: string[]): Promise<AxiosResponse<any>> {
    try {
      const formData = new FormData();
      
      for (let i = 0; i < imageUris.length; i++) {
        const imageUri = imageUris[i];
        const fileName = `chart_${Date.now()}_${i + 1}.jpg`;
        
        // For web, we need to fetch the image as a blob first
        if (typeof window !== 'undefined') {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          formData.append('charts', blob, fileName);
        } else {
          // For native platforms
          (formData as any).append('charts', {
            uri: imageUri,
            type: 'image/jpeg',
            name: fileName,
          });
        }
      }

      return this.api.post('/analysis/charts/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 180000, // Longer timeout for multiple images
      });
    } catch (error) {
      throw error;
    }
  }

  async getAnalysisHistory(params?: {
    page?: number;
    limit?: number;
    signal?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<AxiosResponse<any>> {
    return this.api.get('/analysis/history', { params });
  }

  async getAnalysisStatistics(): Promise<AxiosResponse<any>> {
    return this.api.get('/analysis/statistics');
  }

  async submitFeedback(analysisId: string, feedback: {
    rating?: number;
    comments?: string;
    actualOutcome?: string;
    priceChange?: number;
  }): Promise<AxiosResponse<any>> {
    return this.api.post(`/analysis/feedback/${analysisId}`, feedback);
  }

  async deleteAnalysis(analysisId: string): Promise<AxiosResponse<any>> {
    return this.api.delete(`/user/analysis/${analysisId}`);
  }

  async getUserProfile(): Promise<AxiosResponse<any>> {
    return this.api.get('/auth/profile');
  }

  async updateUserProfile(updates: {
    firstName?: string;
    lastName?: string;
    username?: string;
  }): Promise<AxiosResponse<any>> {
    return this.api.put('/auth/profile', updates);
  }

  async updateUserSettings(settings: {
    allowDataTraining?: boolean;
    notifications?: boolean;
    theme?: 'light' | 'dark';
  }): Promise<AxiosResponse<any>> {
    return this.api.put('/auth/settings', settings);
  }

  async getUserUsageStats(): Promise<AxiosResponse<any>> {
    return this.api.get('/auth/usage-stats');
  }

  async getUserAnalysisHistory(): Promise<AxiosResponse<any>> {
    return this.api.get('/user/analysis-history');
  }

  async getUserStatistics(): Promise<AxiosResponse<any>> {
    return this.api.get('/user/statistics');
  }

  async clearUserHistory(password: string): Promise<AxiosResponse<any>> {
    return this.api.delete('/user/clear-history', { data: { password } });
  }

  async deleteAccount(password: string): Promise<AxiosResponse<any>> {
    return this.api.delete('/auth/account', { data: { password } });
  }

  async chatWithAnalysis(analysisId: string, message: string): Promise<AxiosResponse<any>> {
    return this.api.post(`/analysis/chat/${analysisId}`, { message });
  }

  async checkHealth(): Promise<AxiosResponse<any>> {
    return this.api.get('/health');
  }

  async getDevices(): Promise<AxiosResponse<any>> {
    return this.api.get('/devices');
  }

  async registerDevice(deviceInfo: {
    deviceId: string;
    name: string;
    type?: string;
    platform?: string;
    browser?: string;
    ipAddress?: string;
    location?: string;
  }): Promise<AxiosResponse<any>> {
    return this.api.post('/devices/register', deviceInfo);
  }

  async removeDevice(deviceId: string): Promise<AxiosResponse<any>> {
    return this.api.delete(`/devices/${deviceId}`);
  }

  // Admin endpoints
  async getAdminStats(): Promise<AxiosResponse<any>> {
    return this.api.get('/admin/stats');
  }

  async getAdminUsers(params?: { page?: number; search?: string }): Promise<AxiosResponse<any>> {
    return this.api.get('/admin/users', { params });
  }

  async updateUserRole(userId: string, role: string): Promise<AxiosResponse<any>> {
    return this.api.put(`/admin/users/${userId}/role`, { role });
  }

  async deactivateUser(userId: string): Promise<AxiosResponse<any>> {
    return this.api.put(`/admin/users/${userId}/deactivate`);
  }

  async reactivateUser(userId: string): Promise<AxiosResponse<any>> {
    return this.api.put(`/admin/users/${userId}/reactivate`);
  }

  async toggleUserStatus(userId: string): Promise<AxiosResponse<any>> {
    return this.api.put(`/admin/users/${userId}/toggle-status`);
  }

  async initializeDatabase(): Promise<AxiosResponse<any>> {
    return this.api.post('/admin/init-database');
  }

  async deleteUser(userId: string): Promise<AxiosResponse<any>> {
    return this.api.delete(`/admin/users/${userId}`);
  }

  async getEnvVars(): Promise<AxiosResponse<any>> {
    return this.api.get('/admin/env');
  }

  async updateEnvVar(key: string, value: string): Promise<AxiosResponse<any>> {
    return this.api.put('/admin/env', { key, value });
  }

  // Payment endpoints
  async initiatePayment(data: { plan: string }): Promise<AxiosResponse<any>> {
    return this.api.post('/payment/initiate', data);
  }

  async confirmPayment(paymentId: string): Promise<AxiosResponse<any>> {
    return this.api.post(`/payment/confirm/${paymentId}`);
  }

  async getPaymentStatus(paymentId: string): Promise<AxiosResponse<any>> {
    return this.api.get(`/payment/status/${paymentId}`);
  }

  async cancelPayment(paymentId: string): Promise<AxiosResponse<any>> {
    return this.api.delete(`/payment/cancel/${paymentId}`);
  }

  async getPendingPayment(): Promise<AxiosResponse<any>> {
    return this.api.get('/payment/pending');
  }

  // Admin payment management endpoints
  async getAdminPayments(params?: { 
    status?: string; 
    page?: number; 
    limit?: number;
  }): Promise<AxiosResponse<any>> {
    return this.api.get('/admin/payments', { params });
  }

  async approvePayment(paymentId: string): Promise<AxiosResponse<any>> {
    return this.api.put(`/admin/payments/${paymentId}/approve`);
  }

  async rejectPayment(paymentId: string, reason?: string): Promise<AxiosResponse<any>> {
    return this.api.put(`/admin/payments/${paymentId}/reject`, { reason });
  }

  async getPaymentDetails(paymentId: string): Promise<AxiosResponse<any>> {
    return this.api.get(`/admin/payments/${paymentId}`);
  }

  async getPaymentConfig(): Promise<AxiosResponse<any>> {
    return this.api.get('/admin/payment-config');
  }

  async updatePaymentConfig(config: any): Promise<AxiosResponse<any>> {
    return this.api.put('/admin/payment-config', config);
  }

  async getPaymentStats(): Promise<AxiosResponse<any>> {
    return this.api.get('/admin/payments/stats');
  }

  // Contact configuration endpoints
  async getContactConfig(): Promise<AxiosResponse<any>> {
    return this.api.get('/admin/contact-config');
  }

  async updateContactConfig(config: any): Promise<AxiosResponse<any>> {
    return this.api.put('/admin/contact-config', config);
  }

  async getUserContactConfig(): Promise<AxiosResponse<any>> {
    return this.api.get('/user/contact-config');
  }

  getApiUrl(): string {
    return API_BASE_URL;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiService = new ApiService();
export default apiService;