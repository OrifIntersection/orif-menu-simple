// Composant de sélection de date pour accéder aux menus passés
import { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * DatePicker - Permet de sélectionner une date pour voir le menu de ce jour
 */
export default function DatePicker() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("");

  // Gérer le changement de date
  const handleDateChange = (e) => {
    const date = e.target.value; // Format: YYYY-MM-DD
    setSelectedDate(date);
    
    if (date) {
      // Naviguer vers la page de consultation du menu de cette date
      navigate(`/date/${date}`);
    }
  };

  return (
    <div className="date-picker">
      <label htmlFor="date-select" className="picker-label">
        📅 Menu d'une date:
      </label>
      <input
        id="date-select"
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        className="date-input"
      />
    </div>
  );
} 
