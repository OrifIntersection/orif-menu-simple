// Composant de sélection de date pour accéder aux menus passés
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DatePicker as AntDatePicker } from "antd";
import fr_FR from "antd/locale/fr_FR";
import dayjs from "dayjs";
import "dayjs/locale/fr";

dayjs.locale("fr");

/**
 * DatePicker - Permet de sélectionner une date pour voir le menu de ce jour
 */
export default function DatePicker() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);

  // Gérer le changement de date
  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.format('YYYY-MM-DD');
      // Naviguer vers la page de consultation du menu de cette date
      navigate(`/date/${formattedDate}`);
    }
  };

  return (
    <div className="date-picker">
      <AntDatePicker
        value={selectedDate}
        onChange={handleDateChange}
        placeholder="Cherche un jour"
        format="DD/MM/YYYY"
        style={{ width: '100%' }}
        locale={fr_FR}
      />
    </div>
  );
}
