import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, Switch, message, Card, Space, Tag, Popconfirm } from 'antd'
import { UserAddOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import AdminLayout from '../components/AdminLayout'
import ApiService from '../services/ApiService'

const { Option } = Select

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form] = Form.useForm()

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await ApiService.getUsers()
      setUsers(data)
    } catch (error) {
      message.error('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleCreate = () => {
    setEditingUser(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    form.setFieldsValue({
      role: user.role,
      is_active: user.is_active
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await ApiService.deleteUser(id)
      message.success('Utilisateur supprimé')
      loadUsers()
    } catch (error) {
      message.error(error.message || 'Erreur lors de la suppression')
    }
  }

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        await ApiService.updateUser(editingUser.id, {
          role: values.role,
          is_active: values.is_active
        })
        message.success('Utilisateur modifié')
      } else {
        await ApiService.createUser(
          values.username,
          values.email,
          values.password,
          values.full_name,
          values.role
        )
        message.success('Utilisateur créé')
      }
      setModalVisible(false)
      loadUsers()
    } catch (error) {
      message.error(error.message || 'Erreur lors de la sauvegarde')
    }
  }

  const columns = [
    {
      title: 'Utilisateur',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <div>
          <strong>{text}</strong>
          {record.full_name && <div style={{ fontSize: '12px', color: '#666' }}>{record.full_name}</div>}
        </div>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? 'Administrateur' : 'Lecteur'}
        </Tag>
      )
    },
    {
      title: 'Statut',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <Tag color={active ? 'green' : 'default'}>
          {active ? 'Actif' : 'Désactivé'}
        </Tag>
      )
    },
    {
      title: 'Créé le',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString('fr-FR')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Supprimer cet utilisateur ?"
            onConfirm={() => handleDelete(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
            />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <AdminLayout title="Gestion des utilisateurs">
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={handleCreate}
          >
            Nouvel utilisateur
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadUsers}
            loading={loading}
          >
            Actualiser
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingUser ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ role: 'viewer', is_active: true }}
        >
          {!editingUser && (
            <>
              <Form.Item
                name="username"
                label="Nom d'utilisateur"
                rules={[
                  { required: true, message: 'Requis' },
                  { min: 3, message: 'Minimum 3 caractères' }
                ]}
              >
                <Input placeholder="Identifiant unique" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Requis' },
                  { type: 'email', message: 'Email invalide' }
                ]}
              >
                <Input placeholder="email@exemple.com" />
              </Form.Item>

              <Form.Item
                name="full_name"
                label="Nom complet"
              >
                <Input placeholder="Jean Dupont" />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mot de passe"
                rules={[
                  { required: true, message: 'Requis' },
                  { min: 6, message: 'Minimum 6 caractères' }
                ]}
              >
                <Input.Password placeholder="Mot de passe" />
              </Form.Item>
            </>
          )}

          <Form.Item
            name="role"
            label="Rôle"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="viewer">Lecteur (consultation seule)</Option>
              <Option value="admin">Administrateur (accès complet)</Option>
            </Select>
          </Form.Item>

          {editingUser && (
            <Form.Item
              name="is_active"
              label="Compte actif"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Annuler</Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Modifier' : 'Créer'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  )
}
