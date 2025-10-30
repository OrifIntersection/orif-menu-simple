// Niveau 1 : Ligne de repas simple
import MenuCell from "./MenuCell";

export default function SiderTable({ meal, days, data, items }) {
  return (
    <tr>
      <th className="meal-label">{meal}</th>
      {days.map((day) => {
        const cell = (data[meal] && data[meal][day]) || {};
        const lines = items.map((it) => cell[it] || "");
        return <MenuCell key={day} lines={lines} />;
      })}
      <th className="meal-label">{meal}</th>
    </tr>
  );
}
