import "./styles.css";
import { Vehicles } from "./Vehicles";

export default function App() {
  return (
    <>
      <div className="App">
        <h1>Sample text 1</h1>
      </div>
      <Co2SavedComponent APIData={Vehicles} distance={10} />
    </>
  );
  function Co2SavedComponent(props) {
    return (
      <>
        <h1>Co2 Saved:</h1>
        <table border="1">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Co2 Produced</th>
              <th>Co2 Saved</th>
            </tr>
          </thead>
          <tbody>
            {props.APIData.map((t, index) => (
              <tr key={index}>
                <td>
                  <b>{t.name}</b>
                </td>
                <td>
                  <b>{t.multiplier * props.distance}kg</b>
                </td>
                <td>
                  <b>{t.multiplier * props.distance - 1 * props.distance}kg</b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }
}
