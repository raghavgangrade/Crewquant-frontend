// src/services/ShiftService.ts

import axios from 'axios';

const API_BASE = "https://crewquant.lirisoft.net";

export interface ShiftPayload {
  user_id: number;
  shift_name: string;
  start_time: string;
  end_time: string;
  days: string[];
  break_duration: number;
}

export interface AssignmentPayload {
  user_id: number;
  shift_id: number;
  start_date: string;
  end_date: string;
}

export const createShift = async (payload: ShiftPayload, token: string) => {
  const response = await axios.post(
    `${API_BASE}/api/shifts`,
    payload,
    {   
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};
    

export const getShifts = async (token: string, userId?: number) => {
  const url = userId 
    ? `${API_BASE}/api/shifts/user/${userId}` 
    : `${API_BASE}/api/shifts`;
  
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// services/shiftService.ts

export const deleteShift = async (id: string, token: string) => {
  const response = await axios.delete(`${API_BASE}/api/shifts/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Update shift by ID
export const updateShift = async (id: number, payload: ShiftPayload, token: string) => {
    const response = await axios.put(
      `${API_BASE}/api/shifts/${id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  };

// Shift Assignment Services
export const createAssignment = async (payload: AssignmentPayload, token: string) => {
  const response = await axios.post(
    `${API_BASE}/api/assign-shift`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

export const getAssignments = async (token: string) => {
  // First get the current user's ID
  const userResponse = await getUsers(token);
  const userId = userResponse.user.id;
  
  // Then fetch assignments for that user
  const response = await axios.get(
    `${API_BASE}/api/assign-shift/user/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const deleteAssignment = async (id: string, token: string) => {
  const response = await axios.delete(`${API_BASE}/api/assign-shift/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateAssignment = async (id: number, payload: AssignmentPayload, token: string) => {
  const response = await axios.put(
    `${API_BASE}/api/assign-shift/${id}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}

export const getUsers = async (token: string) => {
  const response = await axios.get(
    `${API_BASE}/api/auth/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};


