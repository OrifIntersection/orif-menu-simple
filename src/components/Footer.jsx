/**
 * Footer - Pied de page de l'application avec le copyright
 * Affiche les informations légales et de copyright
 */
export default function Footer() {
  return (
    // Élément footer HTML avec classe CSS pour le styling
    <footer className="footer">
      {/* Conteneur du texte de copyright */}
      <div className="copyright">
        {/* Texte en petit caractères avec l'année et le nom de l'organisation */}
        <small>© 2025 ORIF - Tous droits réservés</small>
      </div>
    </footer>
  );
}
