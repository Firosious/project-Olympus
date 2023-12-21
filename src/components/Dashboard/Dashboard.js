import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../Navbar/Navbar.js";
import { fetchStepData } from "../../services/GoogleFitService.js";
import { calculateCarbonEmissions } from "../../utils/carbonCalculator";
import { calculateDistance } from "../../utils/distanceCalculator.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Label } from "recharts";
import "./Dashboard.css";
import walkingIcon from "../../img/transport/walking.png";
import eScooterIcon from "../../img/transport/escooter.png";
import trainIcon from "../../img/transport/train.png";
import busIcon from "../../img/transport/bus.png";
import planeIcon from "../../img/transport/plane.png";
import eCarIcon from "../../img/transport/ecar.png";
import carIcon from "../../img/transport/car.png";

function Dashboard() {
  const { user } = useAuth();
  const [totalSteps, setTotalSteps] = useState(0);
  const [weeklyTotalSteps, setWeeklyTotalSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [carEmissionSaved, setCarEmissionSaved] = useState(0);
  const [weeklyTotalSavings, setWeeklyTotalSavings] = useState(0);
  const [walkingEmissions, setWalkingEmissions] = useState(0);
  const [eScooterEmissions, setEScooterEmissions] = useState(0);
  const [ecarEmissions, setEcarEmissions] = useState(0);
  const [carEmissions, setCarEmissions] = useState(0);
  const [busEmissions, setBusEmissions] = useState(0);
  const [trainEmissions, setTrainEmissions] = useState(0);
  const [planeEmissions, setPlaneEmissions] = useState(0);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("googleAccessToken");
    if (accessToken && user) {
      fetchStepData(accessToken).then((fetchedSteps) => {
        setTotalSteps(fetchedSteps);
        const distanceInMeters = calculateDistance(
          fetchedSteps,
          user.heightInCm,
          user.sex
        );
        setDistance(distanceInMeters);
        setIsDataFetched(true);
      });
    }
  }, [user]);

  useEffect(() => {
    const distanceInKm = distance / 1000;
    const emissions = calculateCarbonEmissions(distanceInKm);
    const savedEmission = emissions.car - emissions.walking;
    setCarEmissionSaved(Math.max(savedEmission, 0));


    // Set the emissions for each mode of transport
    setWalkingEmissions(emissions.walking);
    setEScooterEmissions(emissions.e_scooter);
    setEcarEmissions(emissions.e_car);
    setCarEmissions(emissions.car);
    setBusEmissions(emissions.bus);
    setTrainEmissions(emissions.train);
    setPlaneEmissions(emissions.plane);
  }, [distance]);

  useEffect(() => {
    const fetchWeeklyDataAndCalculateSavings = async () => {
      const startDate = getWeekStartDate(new Date());
      const endDate = getWeekEndDate(new Date());
      const response = await fetch(
        `http://localhost:5000/api/fitnessData/weekly/${user.googleId}?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
        );
      if (response.ok) {
        const weeklyData = await response.json();
        const totalSavings = weeklyData.reduce((total, day) => {
          const dayDistanceInKm = day.distance / 1000;
          const dayEmissions = calculateCarbonEmissions(dayDistanceInKm);
          return total + Math.max(dayEmissions.car - dayEmissions.walking, 0);
        }, 0);
        const totalSteps = weeklyData.reduce((total, day) => total + day.steps, 0);
        setWeeklyTotalSavings(totalSavings);
        setWeeklyTotalSteps(totalSteps);
      }
    };

    if (user) {
      fetchWeeklyDataAndCalculateSavings();
    }
  }, [user]);

  useEffect(() => {
    if (isDataFetched) {
      setShowAlert(totalSteps === 0);
    }
  }, [totalSteps, isDataFetched]);

  function getWeekStartDate(date) {
    const startDate = new Date(date);
    startDate.setDate(
      startDate.getDate() -
        startDate.getDay() +
        (startDate.getDay() === 0 ? -6 : 1)
    );
    startDate.setHours(0, 0, 0, 0);
    return startDate;
  }

  function getWeekEndDate(date) {
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() - endDate.getDay() + 7);
    endDate.setHours(23, 59, 59, 999);
    return endDate;
  }

  // Function to handle closing of the alert
  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  // Prepare the data for the bar chart
  const barChartData = [
    {
      name: "Walking",
      value: walkingEmissions,
      unit: "g CO₂",
      icon: walkingIcon,
    },
    {
      name: "Electric Scooter",
      value: eScooterEmissions,
      unit: "g CO₂",
      icon: eScooterIcon,
    },
    {
      name: "Electric Car",
      value: ecarEmissions,
      unit: "g CO₂",
      icon: eCarIcon,
    },
    {
      name: "Car",
      value: carEmissions,
      unit: "g CO₂",
      icon: carIcon,
    },
    {
      name: "Bus",
      value: busEmissions,
      unit: "g CO₂",
      icon: busIcon,
    },
    {
      name: "Train",
      value: trainEmissions,
      unit: "g CO₂",
      icon: trainIcon,
    },
    {
      name: "Plane",
      value: planeEmissions,
      unit: "g CO₂e per RPK (Revenue Passenger Kilometer)",
      icon: planeIcon,
    },
  ];

  // Custom tick function
  const renderCustomAxisTick = ({ x, y, payload }) => {
    const iconSrc = barChartData.find(
      (item) => item.name === payload.value
    )?.icon;
    return (
      <g transform={`translate(${x - 50},${y - 15})`}>
        <image x={-25} y={-15} xlinkHref={iconSrc} width="60" height="50" />
      </g>
    );
  };

  // Custom tooltip formatter
const renderTooltip = ({ payload, label }) => {
  if (payload && payload.length) {
    // Display a specific message for the plane data point
    let tooltipValue = `${payload[0].value.toFixed(2)} g CO₂e`;
    if (label === "Plane" || label === "Train" || label === "Bus") {
      tooltipValue += " per RPK (Revenue Passenger Kilometer)";
    }

    return (
      <div className="custom-tooltip">
        <p>{label}</p>
        <p>{tooltipValue}</p>
      </div>
    );
  }
  return null;
};


  return (
    <div className="Dashboard">
      <Navbar onDashboard={true} />
      <div className="Dashboard-content">
        <h1>Welcome {user?.firstName || "User"}, heres your stats!</h1>
        
        {showAlert && (
          <div className="overlay-alert">
            <div className="dashboard-alert-message">
              <p>Your step count appears to be zero, which may indicate it hasn't updated correctly. To fix this, open your Google FIT app, refresh it, and then go to the Data Report page to sync the data across our database.</p>
              <button onClick={handleCloseAlert} className="dashboard-close-alert-button">x</button>
            </div>
          </div>
        )}
        
        <h3>
          Daily Steps: <i>{totalSteps}</i> | Weekly Total Steps: <i>{weeklyTotalSteps}</i>
        </h3>
        <h3>Distance Walked: <i>{distance.toFixed(2)}</i> meters</h3>
        <h3>
          CO₂ Emissions Saved by Walking: <i>{carEmissionSaved.toFixed(2)}</i> g
          (compared to car)
        </h3>
        <h3>
          This Week's Total CO₂ Emissions Saved: <i>{weeklyTotalSavings.toFixed(2)}</i>{" "}g (compared to car)</h3>
        <h3 className="chart-title">Emissions Comparison: If Walking Distance Was Covered by Transport</h3>
        <div className="bar-chart">
          <BarChart
            width={1200}
            height={500}
            data={barChartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number">
              <Label value="CO₂ Emissions (g CO₂e)" offset={-10} position="insideBottom" />
            </XAxis>
            <YAxis type="category" dataKey="name" tick={renderCustomAxisTick} />
            <Tooltip content={renderTooltip} />
            <Bar dataKey="value" fill="#82ca9d" barSize={20} />
          </BarChart>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;