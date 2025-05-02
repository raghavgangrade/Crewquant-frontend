import axios from 'axios';

// Define types for the work policy data
export interface WorkUrl {
  urlPattern: string;
  workIdExtractor: string;
}

export interface WorkPolicy {
  id?: number;
  workUrls: WorkUrl[];
  monitorIdleTime: boolean;
  monitorNonWorkTime: boolean;
}

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Service for handling all work policy API operations
 */
export const WorkPolicyService = {
  /**
   * Fetches the work policy for the current user
   */
  fetchWorkPolicy: async (token: string): Promise<WorkPolicy | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/work-policy`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Work policy response:', response.data);
      
      // The backend returns an array in workPolicy
      if (response.data.workPolicy && response.data.workPolicy.length > 0) {
        const policyData = response.data.workPolicy[0]; // Get the first policy from the array
        
        // Parse work_urls from JSON string if it's a string
        let workUrls = [];
        if (policyData.work_urls) {
          try {
            workUrls = typeof policyData.work_urls === 'string' 
              ? JSON.parse(policyData.work_urls)
              : policyData.work_urls;
          } catch (e) {
            console.error('Error parsing work_urls:', e);
            workUrls = [];
          }
        }
        
        return {
          id: policyData.id,
          workUrls: Array.isArray(workUrls) ? workUrls : [],
          monitorIdleTime: policyData.monitor_idle_time || false,
          monitorNonWorkTime: policyData.monitor_non_work_time || false
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching work policy:', error);
      throw error;
    }
  },

  /**
   * Creates a new work policy
   */
  createWorkPolicy: async (token: string, workPolicy: WorkPolicy): Promise<any> => {
    try {
      const payload = {
        workUrls: workPolicy.workUrls,
        monitorIdleTime: workPolicy.monitorIdleTime,
        monitorNonWorkTime: workPolicy.monitorNonWorkTime
      };

      const response = await axios.post(`${API_BASE_URL}/work-policy`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating work policy:', error);
      throw error;
    }
  },

  /**
   * Updates an existing work policy
   */
  updateWorkPolicy: async (token: string, workPolicy: WorkPolicy): Promise<any> => {
    try {
      const payload = {
        workUrls: workPolicy.workUrls,
        monitorIdleTime: workPolicy.monitorIdleTime,
        monitorNonWorkTime: workPolicy.monitorNonWorkTime
      };

      const response = await axios.put(`${API_BASE_URL}/work-policy`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error updating work policy:', error);
      throw error;
    }
  },

  /**
   * Saves a work policy (creates new or updates existing)
   */
  saveWorkPolicy: async (token: string, workPolicy: WorkPolicy): Promise<any> => {
    try {
      // If workPolicy has an id, it already exists so use PUT to update
      if (workPolicy.id) {
        return await WorkPolicyService.updateWorkPolicy(token, workPolicy);
      } else {
        // If no id exists, it's a new policy so use POST to create
        return await WorkPolicyService.createWorkPolicy(token, workPolicy);
      }
    } catch (error) {
      console.error('Error saving work policy:', error);
      throw error;
    }
  },

  /**
   * Deletes the entire work policy
   */
  deleteWorkPolicy: async (token: string): Promise<any> => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/work-policy`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error deleting work policy:', error);
      throw error;
    }
  }
};