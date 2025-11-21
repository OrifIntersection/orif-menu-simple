// Composant d'en-tête simple pour les pages de l'application

/**
 * HeaderPage - En-tête de page avec logo et titre
 */
export default function HeaderPage() {
  return (
    // En-tête HTML avec barre de navigation supérieure
    <header className="topbar">
      {/* Conteneur de la marque/identité */}
      <div className="brand">
        {/* Logo de l'ORIF (carré avec dégradé bleu/cyan) */}
        {/* aria-hidden="true" indique que c'est purement décoratif pour les lecteurs d'écran */}
        <span className="logo" aria-hidden="true"></span>
        
        {/* Conteneur du titre */}
        <div>
          {/* Titre principal de l'application */}
          <h1>Cafétéria ORIF</h1>
        </div>
      </div>
    </header>
  );
}
