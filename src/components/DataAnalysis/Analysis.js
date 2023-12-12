import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../Navbar/Navbar.js";
import "./Analysis.css";

const getWeekStartDate = (date) => {
  const startDate = new Date(date);
  startDate.setDate(
    startDate.getDate() -
      (startDate.getDay() === 0 ? 6 : startDate.getDay() - 1)
  );
  startDate.setHours(0, 0, 0, 0);
  return startDate;
};

const getWeekEndDate = (date) => {
  const endDate = new Date(date);
  endDate.setDate(
    endDate.getDate() - (endDate.getDay() === 0 ? 0 : endDate.getDay()) + 6
  );
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

  useEffect(() => {
    const fetchWeeklyData = async () => {
      const startDate = getWeekStartDate(currentDate);
      const endDate = getWeekEndDate(currentDate);

      try {
        const response = await fetch(
          `http://localhost:5000/api/fitnessData/weekly/${user._id}?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
        );
        let data = await response.json();

        if (!Array.isArray(data)) {
          console.error('Received non-array data:', data);
          data = [];
          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            data.push({ date: d.toISOString().split('T')[0], steps: 0 });
          }
        }

        const mappedData = data.map(item => ({
          date: item.date.split('T')[0],
          steps: item.steps || 0
        }));
        setWeeklyData(mappedData);
        setAverageSteps(calculateAverage(mappedData));
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
        userId: user._id,
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

    const eventSource = new EventSource(`http://localhost:5000/api/fitnessData/syncStatus/${user._id}`);
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
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="steps" stroke="#8884d8" />
          <ReferenceLine y={averageSteps} label={{
            value: 'Week Steps Average',
            position: 'top',  // You can choose: 'top', 'bottom', 'insideTop', 'insideBottom', 'insideLeft', 'insideRight', 'insideTopLeft', etc.
            fill: 'red',               // Text color
            fontSize: 15,               // Font size
            fontWeight: 'bold'          // Font weight
          }} stroke="red" strokeDasharray="3 3" />
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