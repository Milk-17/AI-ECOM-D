import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ---------------- Main Category ----------------

export const createCategory = async (token , form) => {
    return await api.post('/category',form,{
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}

export const listCategory = async () => {
    return await api.get('/category')
}
    
export const removeCategory = async (token,id) => {
    return await api.delete('/category/'+id,{
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}

//  เพิ่มฟังก์ชัน Update Main Category 
export const updateCategory = async (token, id, form) => {
    return await api.put('/category/'+id, form, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}


// ---------------- Sub Category ----------------

export const createSubCategory = async (token, form) => {
    // 'form' คือ object ที่มี { name, categoryId }
    return await api.post(
      "/subcategory", 
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      }
    );
};
  
// ลบ SubCategory
export const removeSubCategory = async (token, id) => {
    return await api.delete(
        "/subcategory/" + id, 
        {
        headers: {
            Authorization: `Bearer ${token}`, 
        },
        }
    );
};

//  เพิ่มฟังก์ชัน Update Sub Category 
export const updateSubCategory = async (token, id, form) => {
    return await api.put(
        "/subcategory/" + id, 
        form,
        {
        headers: {
            Authorization: `Bearer ${token}`, 
        },
        }
    );
};