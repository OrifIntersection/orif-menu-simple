export default function ColorLegend() {
  return (
    <div style={{ 
      marginTop: '1rem', 
      padding: '0.75rem', 
      background: '#f8f9fa', 
      borderRadius: '8px',
      fontSize: '0.9rem',
      textAlign: 'center',
      color: '#495057'
    }}>
      <span style={{ marginRight: '1rem' }}>🥗 Entrée</span>
      <span style={{ marginRight: '1rem' }}>🍽️ Plat</span>
      <span style={{ marginRight: '1rem' }}>🥔 Garniture</span>
      <span style={{ marginRight: '1rem' }}>🥬 Légume</span>
      <span style={{ marginRight: '1rem' }}>🍰 Dessert</span>
      <span>✨ Autre</span>
    </div>
  );
}
