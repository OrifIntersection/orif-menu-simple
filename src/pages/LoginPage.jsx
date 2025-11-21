// Page de connexion avec Magic Link et validation d'emails
import { useState } from 'react'
import { Card, Form, Input, Button, Alert, Typography, Space } from 'antd'
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isEmailAllowed, getEmailErrorMessage } from '../utils/emailValidation'
import PageLayout from '../components/PageLayout'

const { Title, Text, Link } = Typography

const LoginPage = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState('info')
  const navigate = useNavigate()
  const { signInWithMagicLink, isSupabaseConfigured } = useAuth()

  const handleLogin = async (values) => {
    setLoading(true)
    setMessage(null)
    
    try {
      // Vérification de la liste blanche d'emails
      if (!isEmailAllowed(values.email)) {
        setMessageType('error')
        setMessage(getEmailErrorMessage())
        setLoading(false)
        return
      }

      const result = await signInWithMagicLink(values.email)
      
      if (result.success) {
        setMessageType('success')
        setMessage(result.message)
        form.resetFields()
      } else {
        setMessageType('error')
        setMessage(result.message)
      }
    } catch {
      setMessageType('error')
      setMessage('Erreur lors de l\'envoi de l\'email de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  return (
    <PageLayout>
      <div style={{ 
        minHeight: '80vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '20px'
      }}>
        <Card 
          style={{ 
            maxWidth: 400, 
            width: '100%',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Title level={3} style={{ color: '#1890ff', marginBottom: '8px' }}>
              Connexion Administration
            </Title>
            <Text type="secondary">
              Accès réservé aux administrateurs du menu
            </Text>
          </div>

          {!isSupabaseConfigured && (
            <Alert
              message="Mode Simulation"
              description="Supabase non configuré - authentification simulée disponible"
              type="warning"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          {message && (
            <Alert
              message={message}
              type={messageType}
              showIcon
              closable
              style={{ marginBottom: '16px' }}
              onClose={() => setMessage(null)}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleLogin}
            disabled={loading}
          >
            <Form.Item
              name="email"
              label="Adresse email"
              rules={[
                { required: true, message: 'Veuillez saisir votre email' },
                { type: 'email', message: 'Format d\'email invalide' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="admin@exemple.com"
                size="large"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
                style={{ marginBottom: '12px' }}
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le lien de connexion'}
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Space direction="vertical" size="small">
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Un email avec un lien de connexion vous sera envoyé
              </Text>
              
              <Link onClick={handleBackToHome} style={{ fontSize: '14px' }}>
                <ArrowLeftOutlined /> Retour à l'accueil
              </Link>
            </Space>
          </div>

          {!isSupabaseConfigured && (
            <div style={{ 
              marginTop: '20px', 
              padding: '12px', 
              backgroundColor: '#f9f9f9', 
              borderRadius: '4px',
              border: '1px dashed #d9d9d9'
            }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <strong>Mode développement :</strong> L'authentification Magic Link sera disponible 
                une fois Supabase configuré. En attendant, utilisez le bouton de simulation.
              </Text>
            </div>
          )}
        </Card>
      </div>
    </PageLayout>
  )
}

export default LoginPage