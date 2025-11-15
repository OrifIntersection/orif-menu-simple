// Version de debug simple pour AuthCallback
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthCallbackDebug = () => {
  const [debug, setDebug] = useState('Initialisation...')
  const navigate = useNavigate()

  useEffect(() => {
    console.log('🔧 AuthCallback Debug - Démarrage')
    setDebug('Effect déclenché')
    
    const timer = setTimeout(() => {
      console.log('🔧 Redirection vers accueil')
      setDebug('Redirection...')
      navigate('/')
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      fontSize: '20px'
    }}>
      <div style={{
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h1>Debug AuthCallback</h1>
        <p>Status: {debug}</p>
        <p>URL: {window.location.href}</p>
        <button onClick={() => navigate('/')}>
          Retour manuel à l'accueil
        </button>
      </div>
    </div>
  )
}

export default AuthCallbackDebug