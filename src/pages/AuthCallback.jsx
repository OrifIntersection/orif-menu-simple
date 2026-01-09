import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spin, Card } from 'antd'

const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/login')
  }, [navigate])

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <Card 
        style={{ 
          maxWidth: 500, 
          width: '90%',
          textAlign: 'center',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{ marginBottom: '20px' }}>
            <Spin size="large" />
          </div>
          <h2 style={{ marginBottom: '12px', color: '#1890ff' }}>
            Redirection...
          </h2>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Redirection vers la page de connexion
          </p>
        </div>
      </Card>
    </div>
  )
}

export default AuthCallback
