import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const currentUser = async (token) => await api.post('/current-user' , {} , { 
    headers:{
        Authorization : `Bearer ${token}`   
    } 
});

export const currentAdmin = async (token) => {
    return await api.post('/current-admin',{},{
        headers:{
            Authorization: `Bearer ${token}`
        }
    })
}