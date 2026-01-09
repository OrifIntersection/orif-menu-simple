import { useState, useEffect } from 'react';
import ApiService from '../services/ApiService';

export default function WeekDeletePicker() {
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    async function loadWeeks() {
      try {
        const allMenus = await ApiService.getAllMenus();
        const weeks = allMenus.map(m => m.weekNum).sort((a, b) => b - a);
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
      setMessage('Veuillez selectionner une semaine');
      setMessageType('error');
      return;
    }

    const confirmDelete = window.confirm(
      `Etes-vous sur de vouloir supprimer TOUTES les donnees de la semaine ${selectedWeek} ?\n\nCette action est IRREVERSIBLE !`
    );

    if (!confirmDelete) return;

    setLoading(true);
    setMessage('');

    try {
      const weekDates = getWeekDates(parseInt(selectedWeek));
      
      for (const dateStr of weekDates) {
        try {
          await ApiService.clearMealByType(dateStr, 'MIDI');
          await ApiService.clearMealByType(dateStr, 'SOIR');
        } catch {
        }
      }
      
      setMessage(`Semaine ${selectedWeek} supprimee`);
      setMessageType('success');
      setSelectedWeek('');
      setAvailableWeeks(availableWeeks.filter(w => w !== parseInt(selectedWeek)));
    } catch (err) {
      setMessage(`Erreur: ${err.message}`);
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
          {availableWeeks.length === 0 ? 'Aucune semaine disponible' : 'Selectionnez une semaine...'}
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
      >
        {loading ? 'Suppression en cours...' : 'Supprimer definitivement'}
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
