// Page d'administration autonome
import { useNavigate } from 'react-router-dom';
import { getCurrentWeekNumber, formatDate } from '../utils/dateUtils';
import AdminLayout from '../components/AdminLayout';
import WeekDeletePicker from '../components/WeekDeletePicker';

export default function AdminPage() {
  const navigate = useNavigate();
  const currentWeekNumber = getCurrentWeekNumber();
  const today = formatDate(new Date());

  return (
    <AdminLayout title="Tableau de bord">
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Gérez les menus de la cafétéria ORIF depuis cette interface centralisée
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem', 
          marginTop: '2rem' 
        }}>
          
          {/* Section import Excel - NOUVEAU */}
          <div style={{ 
            border: '2px solid #dc3545', 
            borderRadius: '12px', 
            padding: '2rem',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginTop: 0, color: '#dc3545' }}>📥 Import Excel</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Importez une semaine complète depuis un fichier Excel
            </p>
            <button 
              onClick={() => navigate('/admin/import')}
              style={{ 
                padding: '1rem',
                fontSize: '1rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
            >
              📥 Importer un fichier Excel
            </button>
            <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '1rem', marginBottom: 0 }}>
              Format : Semaine, Jour, Moment, Plat
            </p>
          </div>
          
          {/* Section modification rapide */}
          <div style={{ 
            border: '2px solid #007bff', 
            borderRadius: '12px', 
            padding: '2rem',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginTop: 0, color: '#007bff' }}>🚀 Modification rapide</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Accès direct aux menus les plus utilisés
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                onClick={() => navigate(`/admin/week/${currentWeekNumber}`)}
                style={{ 
                  padding: '1rem',
                  fontSize: '1rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
              >
                📅 Semaine courante (S{currentWeekNumber})
              </button>
              <button 
                onClick={() => navigate(`/admin/date/${today}`)}
                style={{ 
                  padding: '1rem',
                  fontSize: '1rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1e7e34'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
              >
                📆 Menu d'aujourd'hui
              </button>
            </div>
          </div>

          {/* Section suppression de semaine */}
          <div style={{ 
            border: '2px solid #dc3545', 
            borderRadius: '12px', 
            padding: '2rem',
            backgroundColor: '#fff5f5',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginTop: 0, color: '#dc3545' }}>🗑️ Suppression de semaine</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Sélectionnez une semaine à supprimer définitivement
            </p>
            <WeekDeletePicker />
          </div>

          {/* Section statistiques */}
          <div style={{ 
            border: '2px solid #6f42c1', 
            borderRadius: '12px', 
            padding: '2rem',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginTop: 0, color: '#6f42c1' }}>📊 Aperçu rapide</h3>
            <div style={{ textAlign: 'left' }}>
              <div style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                <span style={{ color: '#666' }}>Semaine actuelle :</span>
                <strong style={{ marginLeft: '0.5rem' }}>S{currentWeekNumber}</strong>
              </div>
              <div style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                <span style={{ color: '#666' }}>Date du jour :</span>
                <strong style={{ marginLeft: '0.5rem' }}>{new Date().toLocaleDateString('fr-FR')}</strong>
              </div>
              <div style={{ padding: '0.5rem 0' }}>
                <span style={{ color: '#666' }}>Statut :</span>
                <span style={{ 
                  marginLeft: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}>
                  🟢 Système opérationnel
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section actions rapides */}
        <div style={{ 
          marginTop: '3rem',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h3>⚡ Actions rapides</h3>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '1rem', 
            flexWrap: 'wrap',
            marginTop: '1rem'
          }}>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '1rem 2rem',
                fontSize: '1rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#545b62'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
            >
              🏠 Retour à l'accueil
            </button>
            {/* Bouton Aperçu public supprimé */}
          </div>
        </div>

        {/* Section outils d'administration */}
        <div style={{ 
          marginTop: '3rem',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          borderTop: '3px solid #dc3545'
        }}>
          <h3 style={{ color: '#dc3545', marginTop: 0 }}>🔧 Outils d'administration</h3>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Outils avancés pour la gestion des menus et des données
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1rem'
          }}>
            <button 
              onClick={() => navigate('/debug')}
              style={{ 
                padding: '1.5rem',
                fontSize: '1rem',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#0e5a70'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#17a2b8'}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔍</div>
              <strong>Diagnostic Système</strong>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
                Vérifier l'état du système et du localStorage
              </p>
            </button>
            
            <button 
              onClick={() => navigate('/auth/callback')}
              style={{ 
                padding: '1.5rem',
                fontSize: '1rem',
                backgroundColor: '#6c63ff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#504ee2'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#6c63ff'}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📋</div>
              <strong>Historique de Connexion</strong>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
                Afficher l'état de la session actuelle
              </p>
            </button>
          </div>
          
        </div>
      </div>
    </AdminLayout>
  );
}