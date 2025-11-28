import { useState, useEffect } from 'react';

export default function WeekDeletePicker() {
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' ou 'error'

  // Charger les semaines disponibles depuis localStorage ET Supabase
  useEffect(() => {
    async function loadWeeks() {
      try {
        const allWeeks = new Set();

        // Charger du localStorage
        const localMenus = JSON.parse(localStorage.getItem('menus_local') || '[]');
        localMenus.forEach(m => allWeeks.add(m.week_number));

        // Charger de Supabase
        const { supabase } = await import('../lib/supabase');
        const { data } = await supabase
          .from('meals')
          .select('meal_date')
          .order('meal_date', { ascending: false });

        if (data && data.length > 0) {
          data.forEach(item => {
            const d = new Date(item.meal_date);
            const year = d.getFullYear();
            const jan1 = new Date(year, 0, 1);
            const days = Math.floor((d - jan1) / (24 * 60 * 60 * 1000));
            const weekNum = Math.ceil((days + jan1.getDay() + 1) / 7);
            allWeeks.add(weekNum);
          });
        }

        // Convertir Set en array et trier
        const weeks = Array.from(allWeeks).sort((a, b) => b - a);
        setAvailableWeeks(weeks);
      } catch {
        setMessage('Erreur lors du chargement des semaines');
        setMessageType('error');
      }
    }
    loadWeeks();
  }, []);

  const handleDelete = async () => {
    if (!selectedWeek) {
      setMessage('Veuillez sélectionner une semaine');
      setMessageType('error');
      return;
    }

    const confirmDelete = window.confirm(
      `⚠️ Êtes-vous sûr de vouloir supprimer TOUTES les données de la semaine ${selectedWeek} ?\n\nCette action est IRRÉVERSIBLE !`
    );

    if (!confirmDelete) return;

    setLoading(true);
    setMessage('');

    try {
      // Vérifier si on utilise localStorage ou Supabase
      const localMenus = JSON.parse(localStorage.getItem('menus_local') || '[]');
      const weekData = localMenus.find(m => m.week_number === parseInt(selectedWeek));

      if (weekData) {
        // Supprimer du localStorage
        const updated = localMenus.filter(m => m.week_number !== parseInt(selectedWeek));
        localStorage.setItem('menus_local', JSON.stringify(updated));
        setMessage(`✅ Semaine ${selectedWeek} supprimée du localStorage`);
        setMessageType('success');
        setSelectedWeek('');
        setAvailableWeeks(availableWeeks.filter(w => w !== parseInt(selectedWeek)));
      } else {
        // Supprimer de Supabase
        const { supabase } = await import('../lib/supabase');

        // D'abord, récupérer toutes les dates de la semaine
        const weekDates = getWeekDates(parseInt(selectedWeek));

        // Supprimer les meals (et les meals_dishes en cascade)
        const { error } = await supabase
          .from('meals')
          .delete()
          .in('meal_date', weekDates);

        if (error) {
          setMessage(`❌ Erreur lors de la suppression: ${error.message}`);
          setMessageType('error');
        } else {
          setMessage(`✅ Semaine ${selectedWeek} supprimée de la base de données`);
          setMessageType('success');
          setSelectedWeek('');
          setAvailableWeeks(availableWeeks.filter(w => w !== parseInt(selectedWeek)));
        }
      }
    } catch (err) {
      setMessage(`❌ Erreur: ${err.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getWeekDates = (weekNum) => {
    const year = new Date().getFullYear();
    const d = new Date(year, 0, 1 + (weekNum - 1) * 7);
    const day = d.getDay();
    const mondayOffset = day <= 4 ? day - 1 : day - 8;
    d.setDate(d.getDate() - mondayOffset);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(d);
      date.setDate(d.getDate() + i);
      weekDates.push(date.toISOString().slice(0, 10));
    }
    return weekDates;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <select
        value={selectedWeek}
        onChange={e => setSelectedWeek(e.target.value)}
        disabled={loading || availableWeeks.length === 0}
        style={{
          padding: '0.75rem',
          borderRadius: '6px',
          border: '1px solid #ddd',
          fontSize: '1rem',
          cursor: availableWeeks.length === 0 ? 'not-allowed' : 'pointer',
          opacity: availableWeeks.length === 0 ? 0.5 : 1
        }}
      >
        <option value="">
          {availableWeeks.length === 0 ? 'Aucune semaine disponible' : 'Sélectionnez une semaine...'}
        </option>
        {availableWeeks.map(week => (
          <option key={week} value={week}>{`Semaine ${week}`}</option>
        ))}
      </select>

      <button
        onClick={handleDelete}
        disabled={loading || !selectedWeek || availableWeeks.length === 0}
        style={{
          padding: '0.75rem',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          cursor: !selectedWeek || loading ? 'not-allowed' : 'pointer',
          opacity: !selectedWeek || loading ? 0.5 : 1,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (selectedWeek && !loading) {
            e.target.style.backgroundColor = '#bd2130';
          }
        }}
        onMouseLeave={(e) => {
          if (selectedWeek && !loading) {
            e.target.style.backgroundColor = '#dc3545';
          }
        }}
      >
        {loading ? '⏳ Suppression en cours...' : '🗑️ Supprimer définitivement'}
      </button>

      {message && (
        <div
          style={{
            padding: '1rem',
            borderRadius: '6px',
            backgroundColor: messageType === 'success' ? '#d4edda' : '#f8d7da',
            color: messageType === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${messageType === 'success' ? '#c3e6cb' : '#f5c6cb'}`
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}
