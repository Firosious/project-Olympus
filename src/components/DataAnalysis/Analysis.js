import React, { useState, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";
import { useAuth } from "../../context/AuthContext";
import { calculateCarbonEmissions } from "../../utils/carbonCalculator";
import Navbar from "../Navbar/Navbar";
import "./Analysis.css";

const Analysis = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [averageSteps, setAverageSteps] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncMessage, setSyncMessage] = useState('');
  const { user } = useAuth();
  const [shouldRefetchData, setShouldRefetchData] = useState(false);
  const [lastSyncTimes, setLastSyncTimes] = useState({ lastAllDataSync: null, last7DaySync: null });

  const [lineVisibility, setLineVisibility] = useState({
    steps: true,
    distance: false,
    carEmissionSaved: true,
    carEmissions: false,
    busEmissions: false
  });

  const getWeekStartDate = (date) => {
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - startDate.getDay() + (startDate.getDay() === 0 ? -6 : 1));
    startDate.setHours(0, 0, 0, 0);
    return startDate;
  };
  
  const getWeekEndDate = (date) => {
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() - endDate.getDay() + 7);
    endDate.setHours(23, 59, 59, 999);
    return endDate;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[date.getMonth()]}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const calculateAverage = (data) => {
    const sum = data.reduce((acc, item) => acc + item.steps, 0);
    return data.length > 0 ? Math.round(sum / data.length) : 0;
  };

  const fetchWeeklyData = useCallback(async () => {
    const startDate = getWeekStartDate(currentDate);
    const endDate = getWeekEndDate(currentDate);
    try {
      const response = await fetch(`http://localhost:5000/api/fitnessData/weekly/${user.googleId}?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
      let data = await response.json();

      if (!Array.isArray(data)) {
        console.error('Received non-array data:', data);
        data = [];
      }
      
      const mappedData = data.map(item => {
        const distanceInKm = item.distance / 1000;
        const emissions = calculateCarbonEmissions(distanceInKm);
        return {
          date: item.date.split('T')[0],
          steps: item.steps || 0,
          distance: item.distance || 0,
          carEmissionSaved: Math.max(emissions.car - emissions.walking, 0),
          busEmissionSaved: Math.max(emissions.bus - emissions.walking, 0),
          carEmissions: emissions.car,
          busEmissions: emissions.bus
        };
      });
      setWeeklyData(mappedData);
      setAverageSteps(calculateAverage(data));
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      setWeeklyData([]);
      setAverageSteps(0);
    }
  }, [currentDate, user]);

  useEffect(() => {
    if (user) {
      fetchWeeklyData();
      fetch(`http://localhost:5000/api/users/syncTimes/${user.googleId}`)
        .then(response => response.json())
        .then(data => {
          setLastSyncTimes({
            lastAllDataSync: new Date(data.lastAllDataSync),
            last7DaySync: new Date(data.last7DaySync)
          });
        })
        .catch(error => console.error('Error fetching sync times:', error));
    }
  }, [user, currentDate, fetchWeeklyData]);

  useEffect(() => {
    if (shouldRefetchData) {
      fetchWeeklyData();
      setShouldRefetchData(false);
    }
  }, [shouldRefetchData, fetchWeeklyData]);

  const isButtonDisabled = (syncType) => {
    const now = new Date();
    if (syncType === 'allData' && lastSyncTimes.lastAllDataSync) {
      return (now - new Date(lastSyncTimes.lastAllDataSync)) < 5 * 24 * 60 * 60 * 1000; // 5 days
    } else if (syncType === '7day' && lastSyncTimes.last7DaySync) {
      return (now - new Date(lastSyncTimes.last7DaySync)) < 10 * 60 * 1000; // 10 minutes
    }
    return false;
  };

  const startSync = (start, end, isFullSync) => {
    setIsSyncing(true);
    setSyncProgress(0);
    setSyncMessage('Sync in progress...');
  
    fetch("http://localhost:5000/api/fitnessData/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.googleId, accessToken: localStorage.getItem("googleAccessToken"), startDate: start.toISOString(), endDate: end.toISOString(), syncType: isFullSync ? 'all' : '7day' }),
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to start sync');
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
          setShouldRefetchData(true);
          fetchLatestSyncTimes();
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

  const fetchLatestSyncTimes = () => {
    fetch(`http://localhost:5000/api/users/syncTimes/${user.googleId}`)
      .then(response => response.json())
      .then(data => {
        setLastSyncTimes({
          lastAllDataSync: new Date(data.lastAllDataSync),
          last7DaySync: new Date(data.last7DaySync)
        });
      })
      .catch(error => console.error('Error fetching sync times:', error));
  };

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

  const handleLegendClick = (e) => {
    const isLastVisible = Object.keys(lineVisibility).filter(key => lineVisibility[key]).length === 1;
    const isCurrentLineVisible = lineVisibility[e.dataKey];
    if (!isLastVisible || !isCurrentLineVisible) {
      setLineVisibility(prevState => ({ ...prevState, [e.dataKey]: !prevState[e.dataKey] }));
    }
  };

  return (
    <div className="Analysis">
      <Navbar onDashboard={false} />
      <div className="chart-container">
        <h1>Data Year: {currentDate.getFullYear()}</h1>
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
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
          <Tooltip />
          <Legend onClick={handleLegendClick} />
          <ReferenceLine yAxisId="left" y={averageSteps} label="Avg Steps" stroke="red" strokeDasharray="3 3" />
          <Line yAxisId="left" type="monotone" dataKey="steps" stroke="#8884d8" name="Steps" hide={!lineVisibility.steps} />
          <Line yAxisId="left" type="monotone" dataKey="distance" stroke="#82ca9d" name="Distance (m)" hide={!lineVisibility.distance} />
          <Line yAxisId="left" type="monotone" dataKey="carEmissionSaved" stroke="#FF5733" name="Car Emissions Saved (g CO2)" hide={!lineVisibility.carEmissionSaved} />
          <Line yAxisId="left" type="monotone" dataKey="carEmissions" stroke="#33FF57" name="Car Emissions (g CO2)" hide={!lineVisibility.carEmissions} />
          <Line yAxisId="left" type="monotone" dataKey="busEmissions" stroke="#33FF57" name="Bus Emissions (g CO2)" hide={!lineVisibility.busEmissions} />
        </LineChart>
        <div className="average-steps-display">
          7-Day Average Steps: <i>{averageSteps}</i>
        </div>
        <div className="all-buttons-container">
        <div className="buttons-container">
          <button className={`week-button ${isSyncing ? 'disabled' : ''}`} onClick={handlePreviousWeek} disabled={isSyncing}>← Week</button>
          <button className={`week-button ${isSyncing ? 'disabled' : ''}`} onClick={handleReset} disabled={isSyncing}>Current Week</button>
          <button className={`week-button ${isSyncing ? 'disabled' : ''}`} onClick={handleNextWeek} disabled={isSyncing}>Week →</button>
        </div>
        <div className="sync-buttons-container">
          <button className={`sync-button ${isSyncing || isButtonDisabled('allData') ? 'disabled' : ''}`} onClick={handleSyncData} disabled={isSyncing || isButtonDisabled('allData')}>Sync All Data</button>
          <button className={`sync-last-7-days-button ${isSyncing || isButtonDisabled('7day') ? 'disabled' : ''}`} onClick={handleSyncLast7Days} disabled={isSyncing || isButtonDisabled('7day')}>Sync Last 7 Days</button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
