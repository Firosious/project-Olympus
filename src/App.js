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
      /*
      - in the below code '1' is being used as a placeholder for the amount of Co2 produced by a person walking
      - creates a table that displays:
      - 1. Name of Vehicle: taken directly from the json array
      - 2. The Co2 it produces: Multiplies distance (taken from props) by the vehicle's multiplier (taken from json array)
      - 3. The Co2 saved/lost by walking: Multiplies disctance by walking multiplier (which is constant) and then subtracts that result from Co2Produced by Vehicle
      */
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
