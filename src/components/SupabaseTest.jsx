import React, { useEffect, useState } from 'react'
import { testConnection } from '../lib/supabase.js'
import { useMenus } from '../hooks/useMenus.js'

/**
 * Composant de test pour vérifier la connexion Supabase
 * À utiliser temporairement pour valider l'intégration
 */
const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('⏳ Test en cours...')
  const { 
    menus, 
    mealTypes, 
    categories, 
    loading, 
    error,
    loadAllMenus,
    loadReferenceData 
  } = useMenus()

  const testSupabaseConnection = async () => {
    try {
      setConnectionStatus('⏳ Test de connexion...')
      await testConnection()
      setConnectionStatus('✅ Connexion Supabase réussie !')
    } catch (err) {
      setConnectionStatus(`❌ Erreur : ${err.message}`)
    }
  }

  useEffect(() => {
    testSupabaseConnection()
  }, [])

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #4CAF50', 
      borderRadius: '8px',
      margin: '20px',
      backgroundColor: '#f8f9fa'
    }}>
      <h2>🧪 Test Supabase - ORIF Menu</h2>
      
      {/* Status de connexion */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Connexion</h3>
        <p style={{ 
          padding: '10px', 
          backgroundColor: connectionStatus.includes('✅') ? '#d4edda' : 
                           connectionStatus.includes('❌') ? '#f8d7da' : '#fff3cd',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}>
          {connectionStatus}
        </p>
      </div>

      {/* Status du hook */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Hook useMenus</h3>
        <p>Loading: {loading ? '⏳ Oui' : '✅ Non'}</p>
        {error && <p style={{ color: 'red' }}>❌ Erreur: {error}</p>}
      </div>

      {/* Données de référence */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Données de référence</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h4>Types de repas ({mealTypes.length})</h4>
            <ul>
              {mealTypes.map(type => (
                <li key={type.id}>{type.code} - {type.label}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Catégories ({categories.length})</h4>
            <ul>
              {categories.map(cat => (
                <li key={cat.id}>{cat.code} - {cat.label}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Menus */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Menus ({menus.length})</h3>
        {menus.length === 0 ? (
          <p>🔍 Aucun menu trouvé (normal si base de données vide)</p>
        ) : (
          <ul>
            {menus.slice(0, 5).map(menu => (
              <li key={menu.id}>
                Semaine {menu.week_number}/{menu.year} - {menu.week_label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Boutons de test */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={testSupabaseConnection}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Re-tester connexion
        </button>
        
        <button 
          onClick={loadReferenceData}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📊 Recharger données de référence
        </button>
        
        <button 
          onClick={loadAllMenus}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#17a2b8', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📋 Recharger menus
        </button>
      </div>

      {/* Guide rapide */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#e9ecef',
        borderRadius: '4px'
      }}>
        <h4>🚀 Guide rapide</h4>
        <ol>
          <li>Si connexion ❌ : Vérifiez votre fichier <code>.env.local</code></li>
          <li>Si tables manquantes : Exécutez <code>supabase_setup.sql</code> dans Supabase</li>
          <li>Si données de référence vides : C'est normal, elles seront ajoutées via le script SQL</li>
          <li>Supprimez ce composant une fois les tests validés</li>
        </ol>
      </div>
    </div>
  )
}

export default SupabaseTest