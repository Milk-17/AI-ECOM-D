import axios from 'axios';

// ---------------- Main Category ----------------

export const createCategory = async (token , form) => {
    return await axios.post('http://localhost:5001/api/category',form,{
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}

export const listCategory = async () => {
    return await axios.get('http://localhost:5001/api/category')
}
    
export const removeCategory = async (token,id) => {
    return await axios.delete('http://localhost:5001/api/category/'+id,{
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}

//  เพิ่มฟังก์ชัน Update Main Category 
export const updateCategory = async (token, id, form) => {
    return await axios.put('http://localhost:5001/api/category/'+id, form, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}


// ---------------- Sub Category ----------------

export const createSubCategory = async (token, form) => {
    // 'form' คือ object ที่มี { name, categoryId }
    return await axios.post(
      "http://localhost:5001/api/subcategory", 
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
    return await axios.delete(
        "http://localhost:5001/api/subcategory/" + id, 
        {
        headers: {
            Authorization: `Bearer ${token}`, 
        },
        }
    );
};

//  เพิ่มฟังก์ชัน Update Sub Category 
export const updateSubCategory = async (token, id, form) => {
    return await axios.put(
        "http://localhost:5001/api/subcategory/" + id, 
        form,
        {
        headers: {
            Authorization: `Bearer ${token}`, 
        },
        }
    );
};