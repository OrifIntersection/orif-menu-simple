import { useState } from 'react'
import { Card, Form, Input, Button, Alert, Typography, Space } from 'antd'
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/JwtAuthContext'
import PageLayout from '../components/PageLayout'

const { Title, Text, Link } = Typography

const LoginPage = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState('info')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = async (values) => {
    setLoading(true)
    setMessage(null)
    
    try {
      const result = await login(values.username, values.password)
      
      if (result.success) {
        setMessageType('success')
        setMessage('Connexion réussie !')
        setTimeout(() => navigate('/'), 1000)
      } else {
        setMessageType('error')
        setMessage(result.message)
      }
    } catch {
      setMessageType('error')
      setMessage('Erreur lors de la connexion')
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
            maxWidth: 420, 
            width: '100%',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Title level={3} style={{ color: '#1890ff', marginBottom: '8px' }}>
              Menu Cafét - ORIF
            </Title>
            <Text type="secondary">
              Accès administration du menu
            </Text>
          </div>

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
              name="username"
              label="Nom d'utilisateur ou email"
              rules={[
                { required: true, message: 'Veuillez saisir votre identifiant' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Identifiant"
                size="large"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mot de passe"
              rules={[
                { required: true, message: 'Veuillez saisir votre mot de passe' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mot de passe"
                size="large"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Space direction="vertical" size="small">
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Contactez l'administrateur pour obtenir un compte
              </Text>
              <Link onClick={handleBackToHome} style={{ fontSize: '14px' }}>
                <ArrowLeftOutlined /> Retour à l'accueil
              </Link>
            </Space>
          </div>
        </Card>
      </div>
    </PageLayout>
  )
}

export default LoginPage
