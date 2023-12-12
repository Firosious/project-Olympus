// CarbonCalculator.js

// Constants for carbon emission factors per kilometer (kg CO2/km)
const EMISSION_FACTORS = {
    car: 108.2, // Avg emission factor for cars
    bus: 105, // Avg emission factor for buses
    train: 41, // Avg emission factor for trains
    // Add more if needed
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
  