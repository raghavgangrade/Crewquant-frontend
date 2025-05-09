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
    

export const getShifts = async (token: string) => {
    const response = await axios.get(
      `${API_BASE}/api/shifts`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
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


