// Niveau 1 : Tableau simple avec HeaderTable et SiderTable
import HeaderTable from "./HeaderTable";
import SiderTable from "./SiderTable";

export default function MenuTable({ menu }) {
  const { weekLabel, days, meals, items, data } = menu;

  return (
    <>
      <h3 className="table-caption">Menu du {weekLabel}</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <HeaderTable days={days} />
          </thead>
          <tbody>
            {meals.map((meal) => (
              <SiderTable
                key={meal}
                meal={meal}
                days={days}
                items={items}
                data={data}
              />
            ))}
          </tbody>
          <tfoot>
            <HeaderTable days={days} />
          </tfoot>
        </table>
      </div>
    </>
  );
}