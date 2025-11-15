// Composant de sélection de semaine pour accéder aux menus passés
// ...existing code...
import { getCurrentYear } from "../utils/dateUtils";

/**
 * WeekPicker - Permet de sélectionner une semaine pour voir le menu de cette semaine
 */
export default function WeekPicker({ value, onChange }) {
  const currentYear = getCurrentYear();
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
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
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
