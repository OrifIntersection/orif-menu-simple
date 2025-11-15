import React, { useState } from "react";
import { useParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import MenuTable from '../components/MenuTable';
import WeekPicker from '../components/WeekPicker';
import Footer from '../components/Footer';
import { LocalMenuService } from '../services/LocalMenuService';
import { getISOWeek } from 'date-fns';

export default function WeekMenuPage() {
  const { weekNumber } = useParams();
  const currentYear = 2025;
  const currentWeekNum = getISOWeek(new Date());
  const [selectedWeek, setSelectedWeek] = useState(weekNumber ? parseInt(weekNumber, 10) : currentWeekNum);

  // Récupère le menu local pour la semaine sélectionnée
  const menu = LocalMenuService.getMenuByWeek(currentYear, selectedWeek);

  return (
    <main className="container">
      <PageLayout title={`Menu Semaine ${selectedWeek} (${currentYear})`}>
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