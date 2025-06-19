// API Service for backend communication
class ApiService {
  private baseURL: string;

  constructor() {
    // Use Railway URL by default, fallback to localhost for development
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 
                   'https://personalized-video-learning-path-production.up.railway.app';
    
    console.log('🔗 API Service initialized with URL:', this.baseURL);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log(`📡 Making API request to: ${url}`);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      mode: 'cors', // Enable CORS
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      console.log(`📡 Response status: ${response.status} for ${endpoint}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error: ${response.status} - ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`✅ API Success for ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`❌ API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const result = await this.request('/health');
      console.log('✅ Health check successful:', result);
      return { success: true, data: result };
    } catch (error) {
      console.log('❌ Health check failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get recommendations for a user
  async getRecommendations(userId: string, options: { limit?: number; refresh?: boolean } = {}) {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.refresh) params.append('refresh', 'true');
      
      const query = params.toString() ? `?${params.toString()}` : '';
      const result = await this.request(`/api/recommendations/user/${userId}${query}`);
      return { success: true, data: result };
    } catch (error) {
      console.log('❌ Get recommendations failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Update recommendation status
  async updateRecommendationStatus(recommendationId: string, status: string, metadata?: any) {
    try {
      const result = await this.request(`/api/recommendations/${recommendationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, metadata }),
      });
      return { success: true, data: result };
    } catch (error) {
      console.log('❌ Update recommendation status failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get recommendation analytics
  async getRecommendationAnalytics(userId: string, timeframe: string = '7d') {
    try {
      const result = await this.request(`/api/recommendations/user/${userId}/analytics?timeframe=${timeframe}`);
      return { success: true, data: result };
    } catch (error) {
      console.log('❌ Get analytics failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Test backend connection with timeout and detailed logging
  async testConnection() {
    console.log('🔍 Testing backend connection...');
    console.log('🔗 Backend URL:', this.baseURL);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Connection timeout after 8 seconds');
        controller.abort();
      }, 8000); // 8 second timeout
      
      // Test both root and health endpoints
      console.log('📡 Testing root endpoint...');
      const rootResponse = await this.request('/', {
        signal: controller.signal
      });
      
      console.log('📡 Testing health endpoint...');
      const healthResponse = await this.request('/health', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('✅ Backend connection successful!');
      console.log('📊 Root response:', rootResponse);
      console.log('🏥 Health response:', healthResponse);
      
      return { 
        success: true, 
        data: { 
          root: rootResponse, 
          health: healthResponse,
          url: this.baseURL
        } 
      };
    } catch (error) {
      console.log('❌ Backend connection failed:', error);
      
      // Additional debugging
      if (error.name === 'AbortError') {
        console.log('🔍 Connection timed out - backend might be slow or unreachable');
      } else if (error.message.includes('CORS')) {
        console.log('🔍 CORS error - backend CORS configuration issue');
      } else if (error.message.includes('Failed to fetch')) {
        console.log('🔍 Network error - backend might be down or URL incorrect');
      }
      
      return { 
        success: false, 
        error: error.message,
        url: this.baseURL,
        errorType: error.name
      };
    }
  }

  // Get current backend URL for debugging
  getBackendURL() {
    return this.baseURL;
  }
}

export const apiService = new ApiService();
export default apiService;