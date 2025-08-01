import axios from 'axios';

const API_URL = 'http://192.168.1.109:8000/api'; 

type LoginResponse = {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    group_code?: string;
    // aur fields agar hain
  };
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(`${API_URL}/login`, {
    email,
    password,
  });
  return response.data;
};
