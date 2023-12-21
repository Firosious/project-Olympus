// CarbonCalculator.js

// Constants for carbon emission factors per kilometer (g CO2/km)
const EMISSION_FACTORS = {
  walking: 16, // Based on average diet and energy expenditure
  bicycle: 0, // Assumed negligible due to human-powered transport
  e_scooter: 42.8, // check actual values find paper
  e_car: 40, // Based on average U.S. grid electricity for charging (Tesla Model Y)
  ree_car: 0, // Renewable energy power source
  car: 170, // Average CO2 emissions from petrol combustion
  bus: 89, // Estimated from average bus emissions
  train: 35, // Average emissions from rail transport
  plane: 88 // g CO2e per RPK (Revenue Passenger Kilometer)
};

/**
* Calculates the carbon dioxide emissions for various modes of transportation over a certain distance.
* @param {number} distanceKm - The distance in kilometers.
* @returns {Object} An object containing the CO2 emissions for each mode of transport.
*/
function calculateCarbonEmissions(distanceKm) {
  let emissions = {};

  for (const mode in EMISSION_FACTORS) {
      emissions[mode] = distanceKm * EMISSION_FACTORS[mode];
  }

  return emissions;
}

module.exports = { calculateCarbonEmissions };
