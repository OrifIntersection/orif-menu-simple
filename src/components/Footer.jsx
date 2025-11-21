/**
 * Footer - Pied de page de l'application avec le copyright
 * Affiche les informations légales et de copyright
 */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="copyright">
        <div className="menu-info" style={{marginBottom: '1rem', fontSize: '1rem', color: '#444'}}>
          <strong>Régimes acceptés avec certificat médical :</strong> sans lactose, et sans gluten.<br />
          Si vous avez des doutes concernant les ingrédients qui peuvent provoquer des allergies ou d’autres réactions indésirables, veuillez vous adresser au Chef de cuisine.
        </div>
        <small>© 2025 ORIF - Tous droits réservés</small>
      </div>
    </footer>
  );
}
