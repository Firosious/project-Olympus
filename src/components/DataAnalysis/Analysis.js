import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";
import { useAuth } from "../../context/AuthContext";
import { calculateCarbonSavings } from "../../utils/carbonCalculator";
import Navbar from "../Navbar/Navbar";
import "./Analysis.css";

const getWeekStartDate = (date) => {
  const startDate = new Date(date);
  const dayOfWeek = startDate.getDay();
  const difference = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday
  startDate.setDate(startDate.getDate() + difference);
  startDate.setHours(0, 0, 0, 0);
  return startDate;
};

const getWeekEndDate = (date) => {
  const endDate = new Date(date);
  const dayOfWeek = endDate.getDay();
  const difference = dayOfWeek === 0 ? 0 : 7 - dayOfWeek; // Adjust for Sunday
  endDate.setDate(endDate.getDate() + difference);
  endDate.setHours(23, 59, 59, 999);
  return endDate;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${monthNames[date.getMonth()]}-${String(date.getDate()).padStart(
    2,
    "0"
  )}`;
};

const calculateAverage = (data) => {
  const sum = data.reduce((acc, item) => acc + item.steps, 0);
  return data.length > 0 ? Math.round(sum / data.length) : 0;
};

const Analysis = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [averageSteps, setAverageSteps] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncMessage, setSyncMessage] = useState('');
  const { user } = useAuth();


  // Updated State for Series Visibility
  const [lineVisibility, setLineVisibility] = useState({
    steps: true,
    distance: true,
    carSavings: true,
    busSavings: true
  });

  useEffect(() => {
    const fetchWeeklyData = async () => {
      const startDate = getWeekStartDate(currentDate);
      const endDate = getWeekEndDate(currentDate);
  
      try {
        const response = await fetch(
          `http://localhost:5000/api/fitnessData/weekly/${user.googleId}?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
        );
        let data = await response.json();
  
        if (!Array.isArray(data)) {
          console.error('Received non-array data:', data);
          data = [];
        }
  
        // Calculate carbon savings for each day
        const mappedData = data.map(item => {
          const distanceInKm = item.distance / 1000; // Convert distance to kilometers if needed
          const carbonSaved = calculateCarbonSavings(distanceInKm);
  
          return {
            date: item.date.split('T')[0],
            steps: item.steps || 0,
            distance: item.distance || 0, // Ensure distance data is included
            carbonSaved: carbonSaved.total,  // Use the total carbon saved
            carSavings: carbonSaved.car,
            busSavings: carbonSaved.bus
          };
        });
        setWeeklyData(mappedData);
      } catch (error) {
        console.error('Error fetching weekly data:', error);
        setWeeklyData([]);
      }
    };

    if (user) {
      fetchWeeklyData();
    }
  }, [user, currentDate]);

  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleReset = () => {
    setCurrentDate(new Date());
  };

  const startSync = (start, end, isFullSync) => {
    setIsSyncing(true);
    setSyncProgress(0);
    setSyncMessage('Sync in progress...');

    fetch("http://localhost:5000/api/fitnessData/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.googleId,
        accessToken: localStorage.getItem("googleAccessToken"),
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to start sync');
      }
    })
    .catch(error => {
      console.error('Error during fetch:', error);
      setIsSyncing(false);
      setSyncMessage('Error occurred during sync.');
    });

    const eventSource = new EventSource(`http://localhost:5000/api/fitnessData/syncStatus/${user.googleId}`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setSyncProgress(data.progress);
      if (data.progress < 100) {
        setSyncMessage(`Sync Progress: ${data.progress}%`);
      } else {
        setSyncMessage(`Successfully Synced ${isFullSync ? 'All Data!' : 'The Last 7 Days!'}`);
        setTimeout(() => {
          setIsSyncing(false);
          setSyncMessage('');
        }, 2000);
        eventSource.close();
      }
    };
    eventSource.onerror = () => {
      setSyncMessage('ERROR occurred during sync.');
      eventSource.close();
      setIsSyncing(false);
    };
  };

  const handleSyncData = () => {
    const startDate = new Date(new Date().getFullYear(), 0, 1);
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    startSync(startDate, endDate, true);
  };

  const handleSyncLast7Days = () => {
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    let startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    startSync(startDate, endDate, false);
  };

  // Function to handle legend clicks
  const handleLegendClick = (e) => {
    // Check if this is the last visible line
    const isLastVisible = Object.keys(lineVisibility).filter(key => lineVisibility[key]).length === 1;
    const isCurrentLineVisible = lineVisibility[e.dataKey];

    if (!isLastVisible || !isCurrentLineVisible) {
      setLineVisibility(prevState => ({
        ...prevState,
        [e.dataKey]: !prevState[e.dataKey]
      }));
    }
  };

  return (
    <div>
      <Navbar onDashboard={false} />
      <div className="chart-container">
        <h2>{currentDate.getFullYear()}</h2>
        <div className="average-steps-display">
          7-Day Average Steps: {averageSteps}
        </div>
        {isSyncing && (
          <div className="overlay">
            <div className={`alert-message ${syncProgress < 100 ? 'progress' : 'success'}`}>
              <span>{syncMessage}</span>
            </div>
          </div>
        )}
        <LineChart width={1000} height={400} data={weeklyData} className="line-chart">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatDate} />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" /> {/* Uncomment and configure this */}
          <Tooltip />
          <Legend onClick={handleLegendClick} />
          <Line yAxisId="left" type="monotone" dataKey="steps" stroke="#8884d8" name="Steps" hide={!lineVisibility.steps} />
          <Line yAxisId="left" type="monotone" dataKey="distance" stroke="#82ca9d" name="Distance (m)" hide={!lineVisibility.distance} />
          <Line yAxisId="right" type="monotone" dataKey="carSavings" stroke="#FF5733" name="Car Emissions Saved (g CO2)" hide={!lineVisibility.carSavings} />
          <Line yAxisId="right" type="monotone" dataKey="busSavings" stroke="#33FF57" name="Bus Emissions Saved (g CO2)" hide={!lineVisibility.busSavings} />
        </LineChart>
        <div className="buttons-container">
          <button className={`week-button ${isSyncing ? 'disabled' : ''}`} onClick={handlePreviousWeek} disabled={isSyncing}>Previous Week</button>
          <button className={`week-button ${isSyncing ? 'disabled' : ''}`} onClick={handleReset} disabled={isSyncing}>Current Week</button>
          <button className={`week-button ${isSyncing ? 'disabled' : ''}`} onClick={handleNextWeek} disabled={isSyncing}>Next Week</button>
        </div>
        <div className="sync-buttons-container">
          <button className={`sync-button ${isSyncing ? 'disabled' : ''}`} onClick={handleSyncData} disabled={isSyncing}>Sync All Data</button>
          <button className={`sync-last-7-days-button ${isSyncing ? 'disabled' : ''}`} onClick={handleSyncLast7Days} disabled={isSyncing}>Sync Last 7 Days</button>
        </div>
      </div>
    </div>
  );
};

export default Analysis;