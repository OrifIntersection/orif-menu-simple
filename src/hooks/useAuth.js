import { useAuth as useJwtAuth } from '../contexts/JwtAuthContext'

export const useAuth = () => {
  return useJwtAuth()
}
