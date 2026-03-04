// rafce
import { useState } from 'react'
import { toast } from 'react-toastify'
import Resize from 'react-image-file-resizer'
import { removeFiles, uploadFiles } from '../../api/product'
import useEcomStore from '../../store/ecom-store'
import { Loader } from 'lucide-react';

const Uploadfile = ({ form, setForm }) => {
    // Javascript
    const token = useEcomStore((state) => state.token)
    const [isLoading, setIsLoading] = useState(false)

    const handleOnChange = (e) => {
        // code
        setIsLoading(true)
        const files = e.target.files
        if (files) {
            setIsLoading(true)
            let allFiles = form.images || []  // ใช้ค่า default เป็น []
            for (let i = 0; i < files.length; i++) {
                // console.log(files[i])

                // Validate
                const file = files[i]
                if (!file.type.startsWith('image/')) {
                    toast.error(`ไฟล์ ${file.name} ไม่ใช่ไฟล์รูปภาพ`)
                    continue
                }
                // Image Resize 
                Resize.imageFileResizer(
                    files[i],
                    720,
                    720,
                    "JPEG",
                    100,
                    0,
                    (data) => {
                        // endpoint Backend
                        uploadFiles(token, data)
                            .then((res) => {
                                console.log(res)
                                allFiles.push(res.data)
                                setForm({
                                    ...form,
                                    images: allFiles
                                })
                                setIsLoading(false)
                                toast.success('อัปโหลดรูปสำเร็จ!')
                            })
                            .catch((err) => {
                                console.log(err)
                                setIsLoading(false)
                            })
                    },
                    "base64"
                )


            }
        }
    }
    console.log(form)

    const handleDelete = (public_id) => {
        const images = form.images
        removeFiles(token, public_id)
            .then((res) => {
                const filterImages = images.filter((item) => {
                    console.log(item)
                    return item.public_id !== public_id
                })

                console.log('filterImages', filterImages)
                setForm({
                    ...form,
                    images: filterImages
                })
                toast.error(res.data)
            })
            .catch((err) => {
                console.log(err)
            })
    }
    return (
        <div className='my-4'>
            <div className='flex mx-4 gap-4 my-4 flex-wrap'>
                {
                    isLoading && <Loader className='w-16 h-16 animate-spin'/>
                }
                
                {/* Image */}
                {
                    form.images && form.images.map((item, index) =>
                        <div className='relative' key={index}>
                            <img
                                className='w-24 h-24 hover:scale-105'
                                src={item.url} 
                            />
                            <span
                                onClick={() => handleDelete(item.public_id)}
                                className='absolute top-0 right-0 bg-red-500 p-1 rounded-md cursor-pointer hover:bg-red-600'>
                                X
                            </span>
                        </div>
                    )
                }
            </div>

            <div>
                <input
                    onChange={handleOnChange}
                    type='file'
                    name='images'
                    multiple
                />
            </div>

        </div>
    )
}

export default Uploadfile