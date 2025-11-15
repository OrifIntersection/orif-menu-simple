import React, { useState } from "react";
import { useParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import MenuTable from '../components/MenuTable';
import WeekPicker from '../components/WeekPicker';
import Footer from '../components/Footer';
import { LocalMenuService } from '../services/LocalMenuService';
import { getISOWeek } from 'date-fns';

export default function WeekMenuPage2() {
  const { weekNumber } = useParams();
  const currentYear = 2025;
  const currentWeekNum = getISOWeek(new Date());
  const [selectedWeek, setSelectedWeek] = useState(weekNumber ? parseInt(weekNumber, 10) : currentWeekNum);

  // Récupère le menu local pour la semaine sélectionnée
  const menu = LocalMenuService.getMenuByWeek(currentYear, selectedWeek);

  // Debug : affiche le menu récupéré et le numéro de semaine
  const debugInfo = (
    <div style={{ background: '#fff3cd', color: '#856404', padding: '1rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.95rem' }}>
      <strong>DEBUG</strong><br />
      <div>Numéro de semaine affiché : <b>{selectedWeek}</b></div>
      <div>Menu récupéré : <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.9rem', background: '#f8f9fa', padding: '0.5rem', borderRadius: 4 }}>{JSON.stringify(menu, null, 2)}</pre></div>
    </div>
  );

  return (
    <main className="container">
      <PageLayout title={`Menu Semaine ${selectedWeek} (${currentYear})`}>
        {debugInfo}
        <div style={{ maxWidth: '400px', margin: '0 auto 20px' }}>
          <WeekPicker value={selectedWeek} onChange={setSelectedWeek} />
        </div>
        {menu ? (
          menu.days && menu.days.length > 0 ? (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '0.5rem', color: '#007bff' }}>Menu local importé</h3>
              <MenuTable menu={menu} />
            </div>
          ) : (
            <div style={{textAlign: 'center', color: '#d32f2f', fontWeight: 'bold', margin: '2rem 0'}}>
              Aucun menu disponible pour cette semaine.<br />Sélectionnez une autre semaine où le menu existe.
            </div>
          )
        ) : (
          <div style={{textAlign: 'center', color: '#d32f2f', fontWeight: 'bold', margin: '2rem 0'}}>
            Aucun menu local enregistré pour cette semaine.<br />Vérifiez l'importation ou le format du fichier.
          </div>
        )}
        <button onClick={() => {
          const data = localStorage.getItem('menus_local');
          alert('Contenu du localStorage menus_local:\n' + data);
        }} style={{marginBottom: '1rem', background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', cursor: 'pointer'}}>Afficher le contenu localStorage</button>
        <Footer />
      </PageLayout>
    </main>
  );
}
