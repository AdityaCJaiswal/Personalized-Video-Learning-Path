// API Service for backend communication
class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Get recommendations for a user
  async getRecommendations(userId: string, options: { limit?: number; refresh?: boolean } = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.refresh) params.append('refresh', 'true');
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/recommendations/user/${userId}${query}`);
  }

  // Update recommendation status
  async updateRecommendationStatus(recommendationId: string, status: string, metadata?: any) {
    return this.request(`/api/recommendations/${recommendationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, metadata }),
    });
  }

  // Get recommendation analytics
  async getRecommendationAnalytics(userId: string, timeframe: string = '7d') {
    return this.request(`/api/recommendations/user/${userId}/analytics?timeframe=${timeframe}`);
  }

  // Test backend connection
  async testConnection() {
    try {
      const response = await this.request('/');
      console.log('Backend connection successful:', response);
      return { success: true, data: response };
    } catch (error) {
      console.error('Backend connection failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export const apiService = new ApiService();
export default apiService;