import React, { useState } from "react";
import { useParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import DatePicker from '../components/DatePicker';
import MenuTable from '../components/MenuTable';
import WeekPicker from '../components/WeekPicker';
import Footer from '../components/Footer';
import { LocalMenuService } from '../services/LocalMenuService';
import { getISOWeek } from 'date-fns';

export default function WeekMenuPage() {
  const { date } = useParams();
  let menuDuJour = null;
  if (date) {
    const jsDate = new Date(date);
    const currentYear = jsDate.getFullYear();
    const weekNum = getISOWeek(jsDate);
    const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
    const jsDay = jsDate.getDay();
    const jourIndex = jsDay === 0 ? 6 : jsDay - 1;
    const jourActuel = jours[jourIndex];
    const menuSemaine = LocalMenuService.getMenuByWeek(currentYear, weekNum);
    if (menuSemaine && menuSemaine.days && menuSemaine.days.includes(jourActuel)) {
      menuDuJour = {
        ...menuSemaine,
        days: [jourActuel],
        data: Object.fromEntries(Object.entries(menuSemaine.data).filter(([day]) => day === jourActuel)),
      };
    }
  }

  return (
    <main className="container">
      <PageLayout title={`Menu du jour (${date || 'aucune date'})`}>
        {/* Section explicative sur la gestion du menu */}
        <section style={{ background: '#f5f5f5', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem', border: '1px solid #e0e0e0' }}>
          <h4 style={{ color: '#007bff', marginBottom: '0.5rem' }}>Gestion du menu du jour et de la semaine</h4>
          <ul style={{ marginLeft: '1.2rem', marginBottom: 0 }}>
            <li>Le <b>menu du jour</b> affiche uniquement le jour sélectionné dans l'agenda.</li>
            <li>Le <b>menu de la semaine</b> affiche tous les jours de la semaine sélectionnée.</li>
            <li>Pour changer de jour, utilisez le sélecteur de date ci-dessous.</li>
            <li>Pour voir le menu de la semaine, rendez-vous sur la page <b>Menu Semaine</b>.</li>
          </ul>
        </section>
        <div style={{ maxWidth: '400px', margin: '0 auto 20px' }}>
          <DatePicker />
        </div>
        {menuDuJour ? (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#007bff' }}>Menu du jour importé</h3>
            <MenuTable menu={menuDuJour} />
          </div>
        ) : (
          <div style={{textAlign: 'center', color: '#d32f2f', fontWeight: 'bold', margin: '2rem 0'}}>
            Aucun menu disponible pour ce jour.<br />Sélectionnez une autre date ou semaine.
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