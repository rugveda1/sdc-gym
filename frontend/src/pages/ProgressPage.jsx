import React, { useState, useEffect } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';

const ProgressPage = ({ token }) => {
    const [history, setHistory] = useState({});
    const [stats, setStats] = useState({ currentStreak: 0, maxStreak: 0, totalWorkouts: 0 });
    const [loading, setLoading] = useState(true);
    const [hoveredDay, setHoveredDay] = useState(null);

    const api = axios.create({
        baseURL: 'http://localhost:3000/api',
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [historyRes, statsRes] = await Promise.all([
                api.get('/workout/history'),
                api.get('/workout/stats')
            ]);
            setHistory(historyRes.data);
            setStats(statsRes.data);

            // Trigger confetti if user has a max streak
            if (statsRes.data.maxStreak > 0) {
                setTimeout(() => triggerConfetti(), 500);
            }
        } catch (err) {
            console.error('Error fetching progress:', err);
        } finally {
            setLoading(false);
        }
    };

    const triggerConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.3 },
            colors: ['#87CEEB', '#FF6B6B', '#A78BFA', '#86EFAC']
        });
    };

    // Generate calendar data for current year
    const generateCalendarData = () => {
        const year = new Date().getFullYear();
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);
        const today = new Date();

        const days = [];
        const current = new Date(startDate);

        // Pad to start on Sunday
        while (current.getDay() !== 0) {
            current.setDate(current.getDate() - 1);
        }

        while (current <= endDate || days.length % 7 !== 0) {
            const dateKey = current.toISOString().split('T')[0];
            const isInYear = current.getFullYear() === year;
            const isFuture = current > today;

            days.push({
                date: new Date(current),
                dateKey,
                isInYear,
                isFuture,
                workout: isInYear ? history[dateKey] : null
            });
            current.setDate(current.getDate() + 1);
        }

        return days;
    };

    const getIntensityColor = (workout, isFuture, isInYear) => {
        if (!isInYear) return 'transparent';
        if (isFuture) return '#e0e0e0';
        if (!workout) return '#ebedf0';
        if (workout.count >= 3) return '#216e39';
        if (workout.count >= 2) return '#30a14e';
        if (workout.count >= 1) return '#40c463';
        return '#ebedf0';
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const calendarData = generateCalendarData();
    const weeks = [];
    for (let i = 0; i < calendarData.length; i += 7) {
        weeks.push(calendarData.slice(i, i + 7));
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (loading) {
        return (
            <div className="progress-page">
                <h2>📊 Loading Your Progress...</h2>
                <div className="spinner" style={{ fontSize: '2rem' }}>⏳</div>
            </div>
        );
    }

    return (
        <div className="progress-page">
            <h2 style={{ marginBottom: '2rem', color: '#333' }}>📊 Your Workout Progress</h2>

            {/* Streak Stats */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '3rem',
                marginBottom: '2.5rem',
                flexWrap: 'wrap'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
                    color: 'white',
                    padding: '1.5rem 2.5rem',
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(255, 107, 107, 0.3)',
                    textAlign: 'center',
                    minWidth: '180px'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔥</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.currentStreak}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Current Streak</div>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #A78BFA 0%, #C4B5FD 100%)',
                    color: 'white',
                    padding: '1.5rem 2.5rem',
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(167, 139, 250, 0.3)',
                    textAlign: 'center',
                    minWidth: '180px'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.maxStreak}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Max Streak</div>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #4A90A4 0%, #87CEEB 100%)',
                    color: 'white',
                    padding: '1.5rem 2.5rem',
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(135, 206, 235, 0.3)',
                    textAlign: 'center',
                    minWidth: '180px'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💪</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.totalWorkouts}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Workouts</div>
                </div>
            </div>

            {/* Activity Calendar */}
            <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                overflowX: 'auto'
            }}>
                <h3 style={{ marginBottom: '1rem', color: '#333', textAlign: 'left' }}>
                    {new Date().getFullYear()} Activity
                </h3>

                {/* Month labels */}
                <div style={{
                    display: 'flex',
                    marginBottom: '4px',
                    paddingLeft: '30px',
                    gap: '2px'
                }}>
                    {months.map((month, i) => (
                        <div key={month} style={{
                            width: `${100 / 12}%`,
                            fontSize: '11px',
                            color: '#666',
                            textAlign: 'left'
                        }}>
                            {month}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div style={{ display: 'flex', gap: '2px' }}>
                    {/* Day labels */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        marginRight: '4px',
                        fontSize: '10px',
                        color: '#666'
                    }}>
                        <div style={{ height: '12px' }}></div>
                        <div style={{ height: '12px', lineHeight: '12px' }}>Mon</div>
                        <div style={{ height: '12px' }}></div>
                        <div style={{ height: '12px', lineHeight: '12px' }}>Wed</div>
                        <div style={{ height: '12px' }}></div>
                        <div style={{ height: '12px', lineHeight: '12px' }}>Fri</div>
                        <div style={{ height: '12px' }}></div>
                    </div>

                    {/* Weeks */}
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {week.map((day, dayIndex) => (
                                <div
                                    key={dayIndex}
                                    onMouseEnter={() => setHoveredDay(day)}
                                    onMouseLeave={() => setHoveredDay(null)}
                                    style={{
                                        width: '12px',
                                        height: '12px',
                                        background: getIntensityColor(day.workout, day.isFuture, day.isInYear),
                                        borderRadius: '2px',
                                        cursor: day.isInYear && !day.isFuture ? 'pointer' : 'default',
                                        transition: 'transform 0.1s',
                                        transform: hoveredDay?.dateKey === day.dateKey ? 'scale(1.3)' : 'scale(1)',
                                        position: 'relative'
                                    }}
                                    title={day.isInYear && !day.isFuture ?
                                        `${formatDate(day.date)}: ${day.workout ? `${day.workout.count} workout(s) - ${day.workout.muscles.join(', ')}` : 'No workout'}`
                                        : ''
                                    }
                                />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    marginTop: '1rem',
                    fontSize: '11px',
                    color: '#666'
                }}>
                    <span>Less</span>
                    <div style={{ width: '12px', height: '12px', background: '#ebedf0', borderRadius: '2px' }} />
                    <div style={{ width: '12px', height: '12px', background: '#40c463', borderRadius: '2px' }} />
                    <div style={{ width: '12px', height: '12px', background: '#30a14e', borderRadius: '2px' }} />
                    <div style={{ width: '12px', height: '12px', background: '#216e39', borderRadius: '2px' }} />
                    <span>More</span>
                </div>
            </div>

            {/* Motivational message */}
            <div style={{
                marginTop: '2rem',
                padding: '1rem',
                background: 'rgba(167, 139, 250, 0.1)',
                borderRadius: '12px',
                color: '#666'
            }}>
                {stats.currentStreak > 0 ? (
                    <p>🔥 You're on fire! Keep the streak going!</p>
                ) : (
                    <p>💪 Start a workout today to begin your streak!</p>
                )}
            </div>
        </div>
    );
};

export default ProgressPage;
