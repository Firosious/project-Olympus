import React, { useState, useEffect, useCallback } from 'react';
import './Leaderboard.css';
import { useAuth } from '../../context/AuthContext';
import Navbar from "../Navbar/Navbar";

function Leaderboard() {
    const { user } = useAuth();
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [userEntry, setUserEntry] = useState(null);
    const [timeframe, setTimeframe] = useState('daily');
    const [leaderboardType, setLeaderboardType] = useState('steps');

    const updateAndFetchLeaderboard = useCallback(async () => {
        try {
            if (!user) {
                throw new Error('User not authenticated');
            }

            await fetch('http://localhost:5000/api/leaderboard/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ googleId: user.googleId })
            });

            const response = await fetch(`http://localhost:5000/api/leaderboard?timeframe=${timeframe}&type=${leaderboardType}`);
            if (response.ok) {
                const data = await response.json();
                while (data.length < 10) {
                    data.push({ user: null, daily: {}, weekly: {}, monthly: {} });
                }
                setLeaderboardData(data.slice(0, 10));

                const userInTop = data.some(entry => entry.user && entry.user.googleId === user.googleId);
                if (!userInTop) {
                    const userResponse = await fetch(`http://localhost:5000/api/leaderboard/user/${user.googleId}?timeframe=${timeframe}&type=${leaderboardType}`);
                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        setUserEntry(userData);
                    }
                } else {
                    setUserEntry(null);
                }
            } else {
                throw new Error('Failed to fetch leaderboard data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }, [user, timeframe, leaderboardType]); // useCallback with dependencies

    useEffect(() => {
        updateAndFetchLeaderboard();
    }, [updateAndFetchLeaderboard]); // updateAndFetchLeaderboard included in dependency array

    if (!user) {
        return <div className="leaderboard-container">Please log in to view the leaderboard.</div>;
    }

    let leaderboardTitle;
    if (leaderboardType === 'steps') {
        leaderboardTitle = `Leaderboard - ${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} - Steps`;
    } else if (leaderboardType === 'carbonSaved') {
        leaderboardTitle = `Leaderboard - ${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} - CO2 Saved`;
    }

    return (
        <div className='Leaderboard'>
            <Navbar onDashboard={false} />
        <div className="leaderboard-container">
            <h1 className="leaderboard-title">{leaderboardTitle}</h1>
            
            <div className="leaderboard-date-controls">
                <button onClick={() => setTimeframe('daily')}>Daily</button>
                <button onClick={() => setTimeframe('weekly')}>Weekly</button>
                <button onClick={() => setTimeframe('monthly')}>Monthly</button>
            </div>
            <div className="leaderboard-type-controls">
                <button onClick={() => setLeaderboardType('steps')}>Steps</button>
                <button onClick={() => setLeaderboardType('carbonSaved')}>CO2 Saved</button>
            </div>

            

            <table className="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>User</th>
                        <th>{leaderboardType === 'steps' ? 'Steps' : 'CO2 Saved (g)'}</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboardData.map((entry, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{entry.user ? `${entry.user.firstName} ${entry.user.lastName}` : '---'}</td>
                            <td>
                                {entry.user
                                    ? (leaderboardType === 'steps' 
                                        ? `${entry[timeframe].steps}` 
                                        : `${entry[timeframe].carbonSaved.toFixed(2)}`)
                                    : '---'
                                }
                            </td>
                        </tr>
                    ))}
                    {userEntry && (
                        <tr className="user-entry">
                            <td>{userEntry.rank}</td>
                            <td>{`${userEntry.user.firstName} ${userEntry.user.lastName}`}</td>
                            <td>
                                {leaderboardType === 'steps' 
                                    ? `${userEntry[timeframe].steps}` 
                                    : `${userEntry[timeframe].carbonSaved.toFixed(2)}`}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <button className="refresh-button" onClick={updateAndFetchLeaderboard}>Refresh Leaderboard</button>
        </div>
        </div>
    );
}

export default Leaderboard;
