// distanceCalculator.js

/**
 * Calculates the stride length based on height and sex.
 * @param {number} heightInCm - Height of the user in centimeters.
 * @param {string} sex - Sex of the user ('male' or 'female').
 * @returns {number} The calculated stride length in centimeters.
 */
function calculateStrideLength(heightInCm, sex) {
    return sex === 'male' ? heightInCm * 0.415 : heightInCm * 0.413;
}

/**
 * Calculates the distance traveled based on steps, height, and sex.
 * @param {number} steps - Number of steps taken.
 * @param {number} heightInCm - Height of the user in centimeters.
 * @param {string} sex - Sex of the user ('male' or 'female').
 * @returns {number} The calculated distance in meters, rounded to 2 decimal places.
 */
function calculateDistance(steps, heightInCm, sex) {
    const strideLengthInCm = calculateStrideLength(heightInCm, sex);
    return steps > 0 && strideLengthInCm > 0
        ? parseFloat(((steps * strideLengthInCm) / 100).toFixed(2)) // Convert to meters and round to 2 decimal places
        : 0;
}

module.exports = { calculateDistance, calculateStrideLength };