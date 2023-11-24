function Analysis(props){

    let stepsInThousands = props.stepsFromParent;   // takes in the steps from Parent(API)

    let distanceInKilometers = stepsInThousands * 0.762;  //this converts steps into distanceInKilometers

    let walkingCO2InGrammes = distanceInKilometers * 69.8;  //calculates the CO2footprint for walking that distanceInKilometers

    let vehicleCO2InGrammes = walkingCO2InGrammes * props.multpierFromParent  // takes in the multipler from Parent(JSON array Vehicles)


}