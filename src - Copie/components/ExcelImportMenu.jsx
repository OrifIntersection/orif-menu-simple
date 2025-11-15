// Composant pour importer des menus depuis un fichier Excel
import React, { useState } from "react";
import * as XLSX from "xlsx";

function ExcelImportMenu({ onImport }) {
  // Supprime la gestion du champ semaine
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array", codepage: 65001 });

        // On prend la première feuille (onglet)
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];

        // On convertit en tableau de lignes [[col1, col2, ...], ...]
        const rows = XLSX.utils.sheet_to_json(sheet, {
          header: 1,  // on veut un tableau brut, pas des objets
          defval: ""  // valeurs vides => ""
        });

        if (!rows || rows.length < 2) {
          alert("Le fichier ne contient pas de données.");
          setLoading(false);
          return;
        }

        const header = rows[0];       // ["Semaine", "Jour", "Moment", "Plat"]
        const dataRows = rows.slice(1);

        // Vérifier que l'en-tête est correct (souple sur la casse)
        const headerStr = header.map(h => String(h).toLowerCase());
        const hasValidHeader = 
          headerStr.includes("semaine") &&
          headerStr.includes("jour") &&
          headerStr.includes("moment") &&
          headerStr.includes("plat");

        if (!hasValidHeader) {
          alert("L'en-tête du fichier n'est pas correct. Il doit contenir : Semaine, Jour, Moment, Plat.");
          setLoading(false);
          return;
        }

        const jourIdx = headerStr.indexOf("jour");
        const momentIdx = headerStr.indexOf("moment");
        const platIdx = headerStr.indexOf("plat");
        const semaineIdx = headerStr.indexOf("semaine");

        // On transforme chaque ligne en objet propre
        const menus = dataRows
          .filter((row) => (semaineIdx === -1 || row[semaineIdx]) && row[jourIdx] && row[momentIdx] && row[platIdx])
          .map((row) => ({
            semaine: semaineIdx !== -1 ? String(row[semaineIdx]).trim() : "",
            jour: String(row[jourIdx]).trim(),
            moment: String(row[momentIdx]).trim(),
            plat: String(row[platIdx]).trim(),
          }));

        if (menus.length === 0) {
          alert("Aucune ligne valide trouvée dans le fichier.");
          setLoading(false);
          return;
        }

        // Détecte la semaine unique dans le fichier
        let semaine = "";
        const semaines = Array.from(new Set(menus.map(m => m.semaine))).filter(Boolean);
        if (semaines.length === 1) {
          semaine = semaines[0];
        } else {
          // Si aucune semaine trouvée dans la colonne, extraire depuis le nom du fichier
          const match = file.name.match(/semaine_(\d{4}-\d{1,2})/i);
          if (match) {
            semaine = match[1];
            // Met à jour tous les menus avec cette semaine
            menus.forEach(m => m.semaine = semaine);
          } else {
            alert("Impossible de détecter la semaine. Vérifiez la colonne Semaine ou le nom du fichier.");
            setLoading(false);
            return;
          }
        }

        console.log(`✅ ${menus.length} plats importés pour la semaine ${semaine}`);

        // On remonte les données au parent
        onImport(semaine, menus);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la lecture du fichier:", error);
        alert("Erreur lors de la lecture du fichier Excel. Vérifiez le format.");
        setLoading(false);
      }
    };

    reader.onerror = () => {
      alert("Erreur lors de la lecture du fichier.");
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  }

  return (
    <div style={{ 
      border: "2px solid #007bff", 
      padding: "1.5rem", 
      borderRadius: "12px",
      backgroundColor: "white",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    }}>
      <h3 style={{ marginTop: 0, color: "#007bff" }}>📥 Importer un fichier Excel de menus</h3>

      {/* Champ Numéro de semaine supprimé */}

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
          Fichier Excel (.xlsx ou .xls) :
        </label>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          disabled={loading}
          style={{
            padding: "0.5rem",
            fontSize: "1rem"
          }}
        />
      </div>

      {fileName && (
        <p style={{ color: "#28a745", fontWeight: "bold" }}>
          📄 Fichier sélectionné : {fileName}
        </p>
      )}

      {loading && (
        <p style={{ color: "#007bff", fontWeight: "bold" }}>
          ⏳ Chargement en cours...
        </p>
      )}

      <div style={{ 
        fontSize: "0.9rem", 
        color: "#555", 
        backgroundColor: "#f8f9fa",
        padding: "1rem",
        borderRadius: "4px",
        marginTop: "1rem"
      }}>
        <p style={{ margin: "0 0 0.5rem 0", fontWeight: "bold" }}>ℹ️ Format attendu :</p>
        <p style={{ margin: "0 0 0.5rem 0" }}>
          Le fichier Excel doit contenir les colonnes : <code>Semaine</code>, <code>Jour</code>, <code>Moment</code>, <code>Plat</code>
        </p>
        <p style={{ margin: 0 }}>
          Exemple : <code>2025-49 | Lundi | Midi | Émincé de poulet</code>
        </p>
      </div>
    </div>
  );
}

export default ExcelImportMenu;
