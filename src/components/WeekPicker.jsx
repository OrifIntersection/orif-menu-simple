// Composant de sélection de semaine pour accéder aux menus passés
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentYear } from "../utils/dateUtils";

/**
 * WeekPicker - Permet de sélectionner une semaine pour voir le menu de cette semaine
 */
export default function WeekPicker() {
  const navigate = useNavigate();
  const [selectedWeek, setSelectedWeek] = useState("");
  const currentYear = getCurrentYear();

  // Gérer le changement de semaine
  const handleWeekChange = (e) => {
    const weekNumber = parseInt(e.target.value);
    setSelectedWeek(weekNumber);
    
    if (weekNumber >= 1 && weekNumber <= 53) {
      // Naviguer vers la page du menu de cette semaine
      navigate(`/week/${weekNumber}`);
    }
  };

  // Générer les options de 1 à 53
  const weekOptions = [];
  for (let i = 1; i <= 53; i++) {
    weekOptions.push(
      <option key={i} value={i}>
        Semaine {i} - {currentYear}
      </option>
    );
  }

  return (
    <div className="week-picker">
      <label htmlFor="week-select" className="picker-label">
        📆 Menu d'une semaine:
      </label>
      <select
        id="week-select"
        value={selectedWeek}
        onChange={handleWeekChange}
        className="week-input"
      >
        <option value="" disabled>
          Le numéro de semaine doit être entre 1 et 53
        </option>
        {weekOptions}
      </select>
    </div>
  );
}