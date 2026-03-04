import { useState, useEffect} from 'react'
import useEcomStore from '../store/ecom-store'
import { currentUser } from '../api/auth'
import LodingToRedirect from '../routes/LoadingToRedirect'

const ProtectRouteUser = ( {element} ) => {

    const [ok, setOk] = useState(false)
    const [loading, setLoading] = useState(true)
    const user = useEcomStore ((state) => state.user)
    const token = useEcomStore ((state) => state.token)
    

    useEffect(() => {
      if (user && token) {
        currentUser(token)
        .then((res) => setOk(true))
        .catch((err) => setOk(false))
        .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    },[user, token])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return ok ? element : <LodingToRedirect />
  
}

export default ProtectRouteUser 