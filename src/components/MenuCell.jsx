export default function MenuCell({ lines = [] }) {
  return (
    <td>
      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </td>
  );
}