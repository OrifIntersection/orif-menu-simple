// Page d'identification des erreurs pour l'application Orif Menu
import React from "react";

const errorList = [
  {
    code: "PROFILE_NOT_FOUND",
    message: "Profil utilisateur non trouvé. Un nouveau profil va être créé automatiquement.",
    solution: "Vérifiez que la table 'profiles' existe et que la logique d'authentification utilise le bon identifiant."
  },
  {
    code: "CANNOT_COERCE_JSON",
    message: "Impossible de convertir le résultat en objet JSON unique.",
    solution: "Vérifiez la requête Supabase et le format des données retournées. Utilisez .single() si vous attendez un seul résultat."
  },
  {
    code: "AUTH_STATE_CHANGED",
    message: "Changement d'état d'authentification détecté.",
    solution: "Ceci est un message d'information, aucune action requise."
  },
  {
    code: "RLS_BLOCKED",
    message: "La politique Row Level Security bloque l'accès ou l'insertion.",
    solution: "Vérifiez les politiques RLS dans Supabase et assurez-vous que l'utilisateur a les droits nécessaires."
  },
  {
    code: "FOUC",
    message: "Flash Of Unstyled Content (FOUC) détecté.",
    solution: "Vérifiez l'ordre d'import des fichiers CSS et le chargement des polices."
  },
  {
    code: "IMPORT_ERROR",
    message: "Erreur lors de l'import du fichier Excel.",
    solution: "Vérifiez le format du fichier et la présence des colonnes attendues : Semaine, Jour, Moment, Plat."
  },
  {
    code: "DATA_PERSISTENCE",
    message: "Les anciennes données du menu ne sont pas supprimées avant import.",
    solution: "Assurez-vous que la fonction clearMenuForDate est appelée avant chaque import."
  },
  {
    code: "SQL_SYNTAX",
    message: "Erreur de syntaxe SQL détectée.",
    solution: "Vérifiez la requête SQL et la structure de la base de données."
  }
];

export default function ErrorReferencePage() {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
      <h2 style={{ color: "#d32f2f" }}>🛠️ Guide des erreurs et solutions</h2>
      <p>Voici la liste des erreurs courantes dans l'application et comment les résoudre :</p>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "2rem" }}>
        <thead>
          <tr style={{ background: "#f8d7da" }}>
            <th style={{ padding: "0.75rem", border: "1px solid #d0d5dd" }}>Code</th>
            <th style={{ padding: "0.75rem", border: "1px solid #d0d5dd" }}>Message</th>
            <th style={{ padding: "0.75rem", border: "1px solid #d0d5dd" }}>Solution</th>
          </tr>
        </thead>
        <tbody>
          {errorList.map((err) => (
            <tr key={err.code}>
              <td style={{ padding: "0.75rem", border: "1px solid #d0d5dd", fontWeight: "bold", color: "#d32f2f" }}>{err.code}</td>
              <td style={{ padding: "0.75rem", border: "1px solid #d0d5dd" }}>{err.message}</td>
              <td style={{ padding: "0.75rem", border: "1px solid #d0d5dd", color: "#388e3c" }}>{err.solution}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
