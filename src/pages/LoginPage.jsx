import { useState } from 'react'
import { Card, Form, Input, Button, Alert, Typography, Space, Tabs } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/JwtAuthContext'
import PageLayout from '../components/PageLayout'

const { Title, Text, Link } = Typography

const LoginPage = () => {
  const [form] = Form.useForm()
  const [registerForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState('info')
  const [activeTab, setActiveTab] = useState('login')
  const navigate = useNavigate()
  const { login, register } = useAuth()

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

  const handleRegister = async (values) => {
    setLoading(true)
    setMessage(null)
    
    try {
      const result = await register(
        values.username,
        values.email,
        values.password,
        values.full_name
      )
      
      if (result.success) {
        setMessageType('success')
        setMessage('Compte créé avec succès !')
        setTimeout(() => navigate('/'), 1000)
      } else {
        setMessageType('error')
        setMessage(result.message)
      }
    } catch {
      setMessageType('error')
      setMessage('Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  const items = [
    {
      key: 'login',
      label: 'Connexion',
      children: (
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
              placeholder="admin"
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
      )
    },
    {
      key: 'register',
      label: 'Inscription',
      children: (
        <Form
          form={registerForm}
          layout="vertical"
          onFinish={handleRegister}
          disabled={loading}
        >
          <Form.Item
            name="username"
            label="Nom d'utilisateur"
            rules={[
              { required: true, message: 'Choisissez un nom d\'utilisateur' },
              { min: 3, message: 'Minimum 3 caractères' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="monpseudo"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Veuillez saisir votre email' },
              { type: 'email', message: 'Format d\'email invalide' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="email@exemple.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="full_name"
            label="Nom complet"
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Jean Dupont (optionnel)"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mot de passe"
            rules={[
              { required: true, message: 'Choisissez un mot de passe' },
              { min: 6, message: 'Minimum 6 caractères' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mot de passe"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Confirmer le mot de passe"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Confirmez le mot de passe' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Les mots de passe ne correspondent pas'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirmer"
              size="large"
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
              {loading ? 'Création...' : 'Créer un compte'}
            </Button>
          </Form.Item>
        </Form>
      )
    }
  ]

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

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={items}
            centered
          />

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Space direction="vertical" size="small">
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
