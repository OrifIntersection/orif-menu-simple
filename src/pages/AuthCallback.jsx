// Page de callback pour l'authentification Magic Link
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Spin, Alert, Card } from 'antd'
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

/**
 * Page Historique de Connexion
 * Affiche l'état de la session et le traitement du Magic Link
 */
const AuthCallback = () => {
  const [status, setStatus] = useState('loading') // 'loading', 'success', 'error'
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Vérifier si Supabase est configuré
        if (!isSupabaseConfigured()) {
          console.log('🔧 Supabase non configuré - mode simulation')
          setStatus('error')
          setMessage('Mode simulation actif - Supabase non configuré. Redirection vers l\'accueil...')
          setTimeout(() => navigate('/'), 3000)
          return
        }

        console.log('📧 Traitement du Magic Link...')
        
        // Vérifier si on a un hash dans l'URL (token du magic link)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        console.log('🔍 Token détecté:', accessToken ? 'Oui' : 'Non')

        if (accessToken && refreshToken) {
          // Cas 1 : Token présent dans l'URL - Supabase va le traiter automatiquement
          console.log('✅ Token trouvé, attente de la session...')
          
          // Attendre un court instant pour que Supabase traite le token
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Récupérer la session après traitement
          const { data, error } = await supabase.auth.getSession()
          
          if (error) throw error
          
          if (data.session) {
            setStatus('success')
            setMessage(`Connexion réussie ! Bienvenue ${data.session.user.email}`)
            setTimeout(() => navigate('/admin'), 2000)
          } else {
            throw new Error('Session non créée après traitement du token')
          }
        } else {
          // Cas 2 : Pas de token dans l'URL - vérifier s'il y a une session existante
          console.log('ℹ️ Pas de token, vérification de la session existante...')
          
          const { data, error } = await supabase.auth.getSession()
          
          if (error) throw error
          
          if (data.session) {
            setStatus('success')
            setMessage(`Déjà connecté ! Bienvenue ${data.session.user.email}`)
            setTimeout(() => navigate('/admin'), 2000)
          } else {
            setStatus('error')
            setMessage('Lien invalide ou expiré. Veuillez redemander un nouveau lien.')
            setTimeout(() => navigate('/'), 3000)
          }
        }

      } catch (error) {
        console.error('❌ Erreur lors du callback auth:', error)
        setStatus('error')
        setMessage(`Erreur d'authentification: ${error.message}`)
        setTimeout(() => navigate('/'), 3000)
      }
    }

    handleAuthCallback()
  }, [navigate])

  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <Spin size="large" />,
          title: 'Connexion en cours...',
          description: 'Vérification de votre authentification',
          type: 'info'
        }
      case 'success':
        return {
          icon: <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '48px' }} />,
          title: 'Connexion réussie !',
          description: message,
          type: 'success'
        }
      case 'error':
        return {
          icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '48px' }} />,
          title: 'Erreur de connexion',
          description: message,
          type: 'error'
        }
      default:
        return {
          icon: <Spin size="large" />,
          title: 'Traitement...',
          description: '',
          type: 'info'
        }
    }
  }

  const config = getStatusConfig()

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
            {config.icon}
          </div>
          
          <h2 style={{ 
            marginBottom: '12px',
            color: status === 'error' ? '#ff4d4f' : status === 'success' ? '#52c41a' : '#1890ff'
          }}>
            {config.title}
          </h2>
          
          {config.description && (
            <p style={{ 
              color: '#666',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              {config.description}
            </p>
          )}

          {status === 'success' && (
            <Alert
              message="Redirection automatique vers l'administration"
              type="success"
              showIcon
              style={{ marginTop: '16px' }}
            />
          )}

          {status === 'error' && (
            <Alert
              message="Redirection vers l'accueil dans quelques secondes"
              type="info"
              showIcon
              style={{ marginTop: '16px' }}
            />
          )}
        </div>
      </Card>
    </div>
  )
}

export default AuthCallback