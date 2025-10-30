// Niveau 1 : Header simple sans interactions
export default function HeaderPage({ weekLabel }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="logo" aria-hidden="true"></span>
        <div>
          <h1>Cafétéria ORIF — Menu de la semaine</h1>
          <p className="muted">Semaine : <strong>{weekLabel}</strong></p>
        </div>
      </div>
    </header>
  );
}
