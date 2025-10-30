// Niveau 1 : Ligne des jours simple
export default function HeaderTable({ days }) {
  return (
    <tr>
      <th className="corner-cell"></th>
      {days.map((d) => (
        <th key={d}>{d}</th>
      ))}
      <th className="corner-cell"></th>
    </tr>
  );
}
