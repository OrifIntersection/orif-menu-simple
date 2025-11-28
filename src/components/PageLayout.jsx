// Composant Layout simple et indépendant pour la structure de base des pages
import MenuDrawer from './MenuDrawer';

/**
 * PageLayout - Structure de base d'une page (header + contenu)
 * Composant minimaliste qui laisse les pages gérer leur propre logique
 * 
 * @param {String} title - Titre à afficher dans le header
 * @param {JSX.Element} actions - Boutons/actions à afficher dans la toolbar (optionnel)
 * @param {JSX.Element} children - Contenu de la page
 */
export default function PageLayout({ title, actions, children }) {
  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span className="logo" aria-hidden="true"></span>
          <h1>{title}</h1>
          <MenuDrawer />
        </div>
        <div className="toolbar">
          <div className="toolbar-buttons">
            {actions}
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
