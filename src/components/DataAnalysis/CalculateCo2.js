import { Vehicles } from "./Vehicles";
import { fetchStepData } from '../../services/GoogleFitService';

    function Co2SavedComponent(props) {
    let stepsInThousands = props.steps;   // takes in the steps from Parent(API)

    let distanceInKilometers = stepsInThousands * 0.762;  //this converts steps into distanceInKilometers

    let walkingCO2InGrammes = distanceInKilometers * 69.8;  //calculates the CO2footprint for walking that distanceInKilometers

    let vehicleCO2InGrammes = walkingCO2InGrammes * props.multiplierFromParent  // takes in the multipler from Parent(JSON array Vehicles)
    
        return (
          /*
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
                {props.Vehicles.map((t, index) => (
                  <tr key={index}>
                    <td>
                      <b>{t.name}</b>
                    </td>
                    <td>
                      <b>{t.vehicleCO2InGrammes}kg</b>
                    </td>
                    <td>
                      <b>{t.vehicleCO2InGrammes - walkingCO2InGrammes}kg</b>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        );
      }