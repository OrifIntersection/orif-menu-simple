// Composant de sélection de date pour accéder aux menus passés
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * DatePicker - Permet de sélectionner une date pour voir le menu de ce jour
 */
export default function DatePicker() {
  const navigate = useNavigate();
  // Récupère la date courante depuis l'URL si présente
  const url = window.location.pathname;
  const match = url.match(/\/date\/(\d{4}-\d{2}-\d{2})/);
  const initialDate = match ? match[1] : "";
  const [selectedDate, setSelectedDate] = useState(initialDate);

  // Met à jour la date si l'URL change
  // (utile si navigation externe ou retour arrière)
  useEffect(() => {
    setSelectedDate(initialDate);
  }, [initialDate]);


  return (
    <div className="date-picker">
      <label htmlFor="date-select" className="picker-label">
        📅 Menu d'une date:
      </label>
      <input
        id="date-select"
        type="date"
        value={selectedDate}
        onChange={e => {
          setSelectedDate(e.target.value);
          if (e.target.value) navigate(`/date/${e.target.value}`);
        }}
        className="date-input"
      />
    </div>
  );
}
