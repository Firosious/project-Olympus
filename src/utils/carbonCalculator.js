// CarbonCalculator.js

// Constants for carbon emission factors per kilometer (kg CO2/km)
const EMISSION_FACTORS = {
    walking: 69.8,                //Wells to wheels number of marginal Co2e in grammes per kilometre for various forms of trasnport
    car: 122, 
    bus: 90, 
    train: 41, 
    electric_scooter: 3.87,
    bicycle: 35,
    hellicopter: 10000,
    electric_car: 58,
    electric_unicycle: 2.7,
  };
  
  /**
   * Calculates the amount of carbon dioxide emissions saved by walking a certain distance,
   * compared to using various modes of transportation.
   * @param {number} distanceKm - The distance in kilometers.
   * @returns {Object} An object containing the amount of CO2e saved for each mode of transport.
   */
  export function calculateCarbonSavings(distanceKm) {
    let savings = {};
  
    for (const mode in EMISSION_FACTORS) {
      savings[mode] = distanceKm * EMISSION_FACTORS[mode];
    }
  
    return savings;
  }
  
