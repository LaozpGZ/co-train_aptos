import { 
  ApiResponse, 
  PaginatedResponse, 
  TrainingOption, 
  Contributor, 
  NetworkStats, 
  ChartData, 
  TrainingSession,
  TrainingHistory,
  UserProfile
} from '../types/cotrain'
import { handleError } from '../utils/error-handler'
import { globalCache } from '../utils/performance'
import { API_CONFIG, CACHE_CONFIG } from '../config/constants'

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
const API_TIMEOUT = API_CONFIG.TIMEOUT

// HTTP client with error handling
class ApiClient {
  private baseURL: string
  private timeout: number

  constructor(baseURL: string, timeout: number = 10000) {
    this.baseURL = baseURL
    this.timeout = timeout
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        data,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      clearTimeout(timeoutId)
      const handledError = handleError(error)
      return {
        success: false,
        error: handledError.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL, API_TIMEOUT)

// Training API
export const trainingApi = {
  // Get all training options
  getTrainingOptions: async (): Promise<ApiResponse<TrainingOption[]>> => {
    const cacheKey = 'training-options'
    const cached = globalCache.get(cacheKey) as TrainingOption[] | null
    
    if (cached) {
      return {
        success: true,
        data: cached,
        timestamp: new Date().toISOString()
      }
    }

    const response = await apiClient.get<TrainingOption[]>('/training/options')
    
    if (response.success && response.data) {
      globalCache.set(cacheKey, response.data, CACHE_CONFIG.DEFAULT_TTL)
    }
    
    return response
  },

  // Get training option by ID
  getTrainingOption: async (id: string): Promise<ApiResponse<TrainingOption>> => {
    return apiClient.get<TrainingOption>(`/training/options/${id}`)
  },

  // Join training session
  joinTraining: async (optionId: string): Promise<ApiResponse<TrainingSession>> => {
    return apiClient.post<TrainingSession>('/training/join', { optionId })
  },

  // Get training history
  getTrainingHistory: async (userId?: string): Promise<ApiResponse<TrainingHistory[]>> => {
    const endpoint = userId ? `/training/history?userId=${userId}` : '/training/history'
    return apiClient.get<TrainingHistory[]>(endpoint)
  },

  // Get active training sessions
  getActiveSessions: async (): Promise<ApiResponse<TrainingSession[]>> => {
    return apiClient.get<TrainingSession[]>('/training/sessions/active')
  }
}

// Network API
export const networkApi = {
  // Get network statistics
  getNetworkStats: async (): Promise<ApiResponse<NetworkStats>> => {
    const cacheKey = 'network-stats'
    const cached = globalCache.get(cacheKey) as NetworkStats | null
    
    if (cached) {
      return {
        success: true,
        data: cached,
        timestamp: new Date().toISOString()
      }
    }

    const response = await apiClient.get<NetworkStats>('/network/stats')
    
    if (response.success && response.data) {
      globalCache.set(cacheKey, response.data, 30000) // Cache for 30 seconds
    }
    
    return response
  },

  // Get contributors
  getContributors: async (page = 1, limit = 50): Promise<PaginatedResponse<Contributor>> => {
    return apiClient.get<Contributor[]>(`/network/contributors?page=${page}&limit=${limit}`) as Promise<PaginatedResponse<Contributor>>
  },

  // Get chart data
  getChartData: async (timeRange = '7d'): Promise<ApiResponse<ChartData[]>> => {
    const cacheKey = `chart-data-${timeRange}`
    const cached = globalCache.get(cacheKey) as ChartData[] | null
    
    if (cached) {
      return {
        success: true,
        data: cached,
        timestamp: new Date().toISOString()
      }
    }

    const response = await apiClient.get<ChartData[]>(`/network/chart-data?range=${timeRange}`)
    
    if (response.success && response.data) {
      globalCache.set(cacheKey, response.data, 60000) // Cache for 1 minute
    }
    
    return response
  }
}

// User API
export const userApi = {
  // Get user profile
  getProfile: async (userId?: string): Promise<ApiResponse<UserProfile>> => {
    const endpoint = userId ? `/users/${userId}` : '/users/me'
    return apiClient.get<UserProfile>(endpoint)
  },

  // Update user profile
  updateProfile: async (data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> => {
    return apiClient.put<UserProfile>('/users/me', data)
  },

  // Get user statistics
  getUserStats: async (userId?: string): Promise<ApiResponse<any>> => {
    const endpoint = userId ? `/users/${userId}/stats` : '/users/me/stats'
    return apiClient.get<any>(endpoint)
  }
}

// Fallback to mock data when API is not available
export const mockFallback = {
  async getTrainingOptions(): Promise<ApiResponse<TrainingOption[]>> {
    try {
      const { generateTrainingOptions } = await import('../data/mock-data')
      return {
        success: true,
        data: generateTrainingOptions(),
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load mock training options',
        timestamp: new Date().toISOString()
      }
    }
  },

  async getNetworkStats(): Promise<ApiResponse<NetworkStats>> {
    try {
      const { generateNetworkStats } = await import('../data/mock-data')
      return {
        success: true,
        data: generateNetworkStats(),
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load mock network stats',
        timestamp: new Date().toISOString()
      }
    }
  },

  async getContributors(): Promise<ApiResponse<Contributor[]>> {
    try {
      const { generateContributors } = await import('../data/mock-data')
      return {
        success: true,
        data: generateContributors(50),
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load mock contributors',
        timestamp: new Date().toISOString()
      }
    }
  }
}

// Smart API that falls back to mock data
export const smartApi = {
  async getTrainingOptions(): Promise<ApiResponse<TrainingOption[]>> {
    const response = await trainingApi.getTrainingOptions()
    if (!response.success) {
      return mockFallback.getTrainingOptions()
    }
    return response
  },

  async getNetworkStats(): Promise<ApiResponse<NetworkStats>> {
    const response = await networkApi.getNetworkStats()
    if (!response.success) {
      return mockFallback.getNetworkStats()
    }
    return response
  },

  async getContributors(): Promise<ApiResponse<Contributor[]>> {
    const response = await networkApi.getContributors()
    if (!response.success) {
      return mockFallback.getContributors()
    }
    return response.data ? { ...response, data: response.data } : mockFallback.getContributors()
  }
}

export default apiClient