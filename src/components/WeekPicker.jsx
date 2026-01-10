import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/ApiService";
import { getCurrentWeekNumber, getISOWeekYear } from "../utils/dateUtils";

export default function WeekPicker({ defaultYear, defaultWeek }) {
  const navigate = useNavigate();
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [selectedValue, setSelectedValue] = useState("");
  const [loading, setLoading] = useState(true);

  const currentYear = getISOWeekYear(new Date());
  const currentWeek = getCurrentWeekNumber();

  useEffect(() => {
    async function loadAvailableWeeks() {
      try {
        const weeks = await ApiService.getAvailableWeeks();
        setAvailableWeeks(weeks);
      } catch (error) {
        console.error("Erreur chargement semaines disponibles:", error);
        setAvailableWeeks([]);
      }
      setLoading(false);
    }
    loadAvailableWeeks();
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setSelectedValue(value);
    
    if (value) {
      const [year, week] = value.split("-");
      navigate(`/week/${year}/${week}`);
    }
  };

  const groupedByYear = {};
  availableWeeks.forEach(({ year, week }) => {
    if (!groupedByYear[year]) groupedByYear[year] = [];
    groupedByYear[year].push(week);
  });

  const years = Object.keys(groupedByYear).sort((a, b) => b - a);

  return (
    <div className="week-picker">
      <label htmlFor="week-select" className="picker-label">
        Menu d'autre semaine disponible
      </label>
      <select
        id="week-select"
        value={selectedValue}
        onChange={handleChange}
        className="week-input"
        disabled={loading}
      >
        <option value="">
          {loading ? "Chargement..." : "Sélectionner une semaine"}
        </option>
        {years.map(year => (
          <optgroup key={year} label={`Année ${year}`}>
            {groupedByYear[year].sort((a, b) => b - a).map(week => (
              <option key={`${year}-${week}`} value={`${year}-${week}`}>
                Semaine {week}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
