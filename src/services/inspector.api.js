import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from '../config/api.config';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Helper function to get stored token
const getToken = async () => {
  try {
    return await AsyncStorage.getItem('accessToken');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Helper function for authenticated API calls
const authenticatedFetch = async (url, options = {}) => {
  const token = await getToken();
  
  if (!token) {
    throw new Error('No authentication token found. Please login again.');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

/**
 * Inspector API Service
 * All endpoints for Inspector role operations
 */
export const InspectorAPI = {
  
  /**
   * Get inspector profile
   * GET /api/v1/auth/profile
   */
  getProfile: async () => {
    try {
      console.log('📤 Fetching inspector profile...');
      const data = await authenticatedFetch(`${API_BASE_URL}/auth/profile`);
      console.log('✅ Profile fetched:', data);
      return data;
    } catch (error) {
      console.error('❌ Get profile error:', error);
      throw error;
    }
  },

  /**
   * Get pending inspections (inspections waiting to be completed)
   * GET /api/v1/inspections/pending
   */
  getPendingInspections: async () => {
    try {
      console.log('📤 Fetching pending inspections...');
      const data = await authenticatedFetch(`${API_BASE_URL}/inspections/pending`);
      console.log('✅ Pending inspections fetched:', data);
      return data;
    } catch (error) {
      console.error('❌ Get pending inspections error:', error);
      throw error;
    }
  },

  /**
   * Get inspector's inspection history
   * GET /api/v1/inspections/my-inspections
   * @param {string} status - Optional filter by status (pending, approved, rejected)
   */
  getMyInspections: async (status = null) => {
    try {
      const queryParam = status ? `?status=${status}` : '';
      console.log(`📤 Fetching my inspections${status ? ` with status=${status}` : ''}...`);
      const data = await authenticatedFetch(`${API_BASE_URL}/inspections/my-inspections${queryParam}`);
      console.log('✅ My inspections fetched:', data);
      return data;
    } catch (error) {
      console.error('❌ Get my inspections error:', error);
      throw error;
    }
  },

  /**
   * Get inspection detail by ID
   * GET /api/v1/inspections/:id
   * @param {string} inspectionId - The inspection ID
   */
  getInspectionDetail: async (inspectionId) => {
    try {
      console.log(`📤 Fetching inspection detail for ID: ${inspectionId}`);
      const data = await authenticatedFetch(`${API_BASE_URL}/inspections/${inspectionId}`);
      console.log('✅ Inspection detail fetched:', data);
      return data;
    } catch (error) {
      console.error('❌ Get inspection detail error:', error);
      throw error;
    }
  },

  /**
   * Complete an inspection with technical checks and verdict
   * PATCH /api/v1/inspections/:id/complete
   * @param {string} inspectionId - The inspection ID
   * @param {object} inspectionData - The inspection report data
   */
  completeInspection: async (inspectionId, inspectionData) => {
    try {
      console.log(`📤 Completing inspection ${inspectionId}...`);
      console.log('📋 Inspection data:', inspectionData);
      
      const data = await authenticatedFetch(
        `${API_BASE_URL}/inspections/${inspectionId}/complete`,
        {
          method: 'PATCH',
          body: JSON.stringify(inspectionData),
        }
      );
      
      console.log('✅ Inspection completed:', data);
      return data;
    } catch (error) {
      console.error('❌ Complete inspection error:', error);
      throw error;
    }
  },

  /**
   * Get disputes list (for inspector to view)
   * Note: This endpoint might not exist on backend yet
   * Returns empty array if endpoint not available
   */
  getDisputes: async (status = 'under_review') => {
    try {
      console.log(`📤 Fetching disputes with status: ${status}`);
      // This endpoint might need to be created on backend
      // For now using a generic disputes endpoint
      const data = await authenticatedFetch(`${API_BASE_URL}/disputes?status=${status}`);
      console.log('✅ Disputes fetched:', data);
      return data;
    } catch (error) {
      console.warn('⚠️ Get disputes error (endpoint not available):', error.message);
      // Return empty array instead of throwing for graceful handling
      return { data: [], message: 'Disputes endpoint not available' };
    }
  },

  /**
   * Add inspector evidence to a dispute
   * PATCH /api/v1/disputes/:id/inspector-evidence
   * @param {string} disputeId - The dispute ID
   * @param {string} comparisonNotes - Inspector's comparison notes
   */
  addDisputeEvidence: async (disputeId, comparisonNotes) => {
    try {
      console.log(`📤 Adding evidence to dispute ${disputeId}...`);
      
      const data = await authenticatedFetch(
        `${API_BASE_URL}/disputes/${disputeId}/inspector-evidence`,
        {
          method: 'PATCH',
          body: JSON.stringify({ comparisonNotes }),
        }
      );
      
      console.log('✅ Evidence added:', data);
      return data;
    } catch (error) {
      console.error('❌ Add dispute evidence error:', error);
      throw error;
    }
  },

  /**
   * Get dispute detail by ID
   * GET /api/v1/disputes/:id
   * @param {string} disputeId - The dispute ID
   */
  getDisputeDetail: async (disputeId) => {
    try {
      console.log(`📤 Fetching dispute detail for ID: ${disputeId}`);
      const data = await authenticatedFetch(`${API_BASE_URL}/disputes/${disputeId}`);
      console.log('✅ Dispute detail fetched:', data);
      return data;
    } catch (error) {
      console.error('❌ Get dispute detail error:', error);
      throw error;
    }
  },

  /**
   * Upload inspection media (photos/videos)
   * This is a helper function for uploading images
   * You'll need to implement the actual upload endpoint
   * @param {string} uri - Local file URI
   * @param {string} type - File type (image/video)
   */
  uploadMedia: async (uri, type = 'image') => {
    try {
      console.log(`📤 Uploading ${type}...`);
      const token = await getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const fileType = match ? `${type}/${match[1]}` : `${type}`;

      formData.append('file', {
        uri: uri,
        name: filename,
        type: fileType,
      });

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      console.log('✅ Media uploaded:', data);
      return data.url || data.data?.url; // Return the uploaded file URL
    } catch (error) {
      console.error('❌ Upload media error:', error);
      throw error;
    }
  },

  /**
   * Upload multiple media files
   * @param {Array} uris - Array of local file URIs
   * @param {string} type - File type (image/video)
   */
  uploadMultipleMedia: async (uris, type = 'image') => {
    try {
      console.log(`📤 Uploading ${uris.length} ${type}s...`);
      const uploadPromises = uris.map(uri => InspectorAPI.uploadMedia(uri, type));
      const urls = await Promise.all(uploadPromises);
      console.log('✅ All media uploaded:', urls);
      return urls;
    } catch (error) {
      console.error('❌ Upload multiple media error:', error);
      throw error;
    }
  },

  /**
   * Get earnings/statistics
   * This might need a custom endpoint
   * Placeholder for now
   */
  getEarnings: async (period = 'all') => {
    try {
      console.log(`📤 Fetching earnings for period: ${period}`);
      // This endpoint needs to be implemented on backend
      const data = await authenticatedFetch(`${API_BASE_URL}/inspections/earnings?period=${period}`);
      console.log('✅ Earnings fetched:', data);
      return data;
    } catch (error) {
      console.error('❌ Get earnings error:', error);
      // Return mock data for now if endpoint doesn't exist
      console.warn('⚠️ Earnings endpoint not available, using profile data');
      return null;
    }
  },

  /**
   * Get all bicycles to match with inspection bicycleId
   * POST /api/v1/bicycles/get-all-bicycles
   */
  getAllBicycles: async () => {
    try {
      console.log('📤 Fetching all bicycles...');
      const data = await authenticatedFetch(
        `${API_BASE_URL}/bicycles/get-all-bicycles`,
        {
          method: 'POST',
        }
      );
      console.log('✅ Bicycles fetched:', data);
      return data;
    } catch (error) {
      console.error('❌ Get all bicycles error:', error);
      throw error;
    }
  },

  /**
   * Get user details by ID (to fetch seller information)
   * GET /api/v1/users/:id
   * @param {string} userId - The user ID
   */
  getUserById: async (userId) => {
    try {
      console.log(`📤 Fetching user details for ID: ${userId}`);
      const data = await authenticatedFetch(`${API_BASE_URL}/users/${userId}`);
      console.log('✅ User details fetched:', data);
      return data;
    } catch (error) {
      console.error('❌ Get user by ID error:', error);
      return null; // Return null instead of throwing to handle gracefully
    }
  },
};

export default InspectorAPI;
