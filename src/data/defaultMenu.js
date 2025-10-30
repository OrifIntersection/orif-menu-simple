const defaultMenu = {
  weekLabel: "4 au 10 septembre 2025",
  days: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
  meals: ["Midi", "Soir"],
  items: ["Salade", "Viande", "Féculent", "Légumes", "Dessert"],
  data: { Midi: {}, Soir: {} }
};

for (const meal of defaultMenu.meals) {
  for (const day of defaultMenu.days) {
    defaultMenu.data[meal][day] = {
      Salade: "Salade",
      Viande: "Viande",
      Féculent: "Féculent",
      Légumes: "Légumes",
      Dessert: "Dessert"
    };
  }
}

export default defaultMenu;
