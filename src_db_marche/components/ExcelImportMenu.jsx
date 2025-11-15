// Composant pour importer des menus depuis un fichier Excel
import React, { useState } from "react";
import * as XLSX from "xlsx";

function ExcelImportMenu({ onImport }) {
    const [inputKey, setInputKey] = useState(Date.now());
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewMenus, setPreviewMenus] = useState([]);
  const [importClicked, setImportClicked] = useState(false);

  function handleFileChange(event) {
      setImportClicked(false);
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array", codepage: 65001 });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: ""
        });
        if (!rows || rows.length < 2) {
          setPreviewMenus([]);
          setLoading(false);
          return;
        }
        const header = rows[0];
        const dataRows = rows.slice(1);
        // Validation stricte des colonnes
        const headerStr = header.map(h => String(h).toLowerCase().trim());
        const semaineIdx = headerStr.indexOf("semaine");
        const jourIdx = headerStr.indexOf("jour");
        const momentIdx = headerStr.indexOf("moment");
        const platIdx = headerStr.indexOf("plat");
        if (semaineIdx === -1 || jourIdx === -1 || momentIdx === -1 || platIdx === -1) {
          setPreviewMenus([]);
          setLoading(false);
          return;
        }
        // On transforme chaque ligne en objet propre
        const menus = dataRows
          .map((row, idx) => {
            const semaine = String(row[semaineIdx]).trim();
            const jour = String(row[jourIdx]).trim();
            const moment = String(row[momentIdx]).trim();
            const plat = String(row[platIdx]).trim();
            return { semaine, jour, moment, plat, _row: idx + 2 };
          })
          .filter((menu) => {
            const isHeaderRow = menu.semaine === header[semaineIdx] && menu.jour === header[jourIdx] && menu.moment === header[momentIdx] && menu.plat === header[platIdx];
            const isValid = menu.semaine && menu.jour && menu.moment && menu.plat;
            return isValid && !isHeaderRow;
          });

        // ...existing code...

        const importedMenus = menus.map(({semaine, jour, moment, plat}) => ({Semaine: semaine, Jour: jour, Moment: moment, Plat: plat}));
        onImport(importedMenus);
        setPreviewMenus(importedMenus);
        setLoading(false);
      } catch {
        setPreviewMenus([]);
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setPreviewMenus([]);
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
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
          Fichier Excel (.xlsx ou .xls) :
        </label>
        <input
          key={inputKey}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          disabled={loading}
          style={{
            padding: "0.5rem",
            fontSize: "1rem"
          }}
        />
        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
          <button
            type="button"
            style={{
              padding: "0.5rem 1.2rem",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer"
            }}
            disabled={loading}
            onClick={() => setImportClicked(true)}
          >
            Importer
          </button>
          <button
            type="button"
            style={{
              padding: "0.5rem 1.2rem",
              background: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer"
            }}
            disabled={loading}
            onClick={() => {
              setFileName("");
              setPreviewMenus([]);
              setInputKey(Date.now());
            }}
          >
            Annuler
          </button>
        </div>
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
      {importClicked && previewMenus.length > 0 && (
        <div style={{ marginTop: "2rem", background: "#f0f4ff", padding: "1rem", borderRadius: "8px" }}>
          <h4 style={{ color: "#007bff" }}>Contenu du fichier importé :</h4>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {previewMenus.map((menu, idx) => (
              <li key={idx} style={{ marginBottom: "0.5rem", fontSize: "1rem" }}>
                <span style={{ color: "#333" }}>
                  {menu.Semaine} | {menu.Jour} | {menu.Moment} | {menu.Plat}
                </span>
              </li>
            ))}
          </ul>
        </div>
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
