import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';

const WorkoutPage = ({ token }) => {
    const [allowedMuscles, setAllowedMuscles] = useState([]);
    const [videos, setVideos] = useState([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [currentMuscle, setCurrentMuscle] = useState('');
    const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
    const [workoutComplete, setWorkoutComplete] = useState(false);
    const videoRef = useRef(null);
    const timerRef = useRef(null);

    const api = axios.create({
        baseURL: 'http://localhost:3000/api',
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        fetchAllowed();
    }, []);

    const fetchAllowed = async () => {
        try {
            const res = await api.get('/workout/allowed');
            setAllowedMuscles(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleStartWorkout = async (muscle) => {
        try {
            const res = await api.post('/workout/start', { muscle });
            console.log('Workout started:', res.data);
            setVideos(res.data.videos);
            setCurrentMuscle(res.data.muscle || muscle);
            setCurrentVideoIndex(0);
            setWorkoutComplete(false);
            setTimeRemaining(600); // Reset timer to 10 minutes
        } catch (err) {
            console.error('Error starting workout:', err);
            alert('Error starting workout');
        }
    };

    const handleVideoEnd = () => {
        clearInterval(timerRef.current);
        if (currentVideoIndex < videos.length - 1) {
            setCurrentVideoIndex(prev => prev + 1);
            setTimeRemaining(600); // Reset timer to 10 minutes for the next video (e.g. abs2)
        } else {
            // Workout complete - trigger confetti!
            triggerConfetti();
            setWorkoutComplete(true);
            setTimeout(() => {
                setVideos([]);
                setWorkoutComplete(false);
                fetchAllowed(); // Refresh allowed muscles
            }, 5000);
        }
    };

    const triggerConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    };

    // Timer countdown effect
    useEffect(() => {
        if (videos.length > 0 && !workoutComplete) {
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleVideoEnd();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timerRef.current);
        }
    }, [currentVideoIndex, videos, workoutComplete]);

    // Auto-play video when index changes
    useEffect(() => {
        if (videoRef.current && videos.length > 0) {
            videoRef.current.load();
            videoRef.current.play().catch(e => console.log("Autoplay prevented", e));
        }
    }, [currentVideoIndex, videos]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress percentage for circular timer
    const timerProgress = ((600 - timeRemaining) / 600) * 100;

    return (
        <div className="workout-page">
            <h2>Workout Session</h2>

            {workoutComplete && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '3rem 4rem',
                    borderRadius: '24px',
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    zIndex: 1000,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    textAlign: 'center'
                }}>
                    🎉 Workout Complete! 💪
                    <div style={{ fontSize: '1.2rem', marginTop: '1rem', fontWeight: 'normal' }}>
                        Great job! Keep it up!
                    </div>
                </div>
            )}

            {videos.length === 0 ? (
                <div>
                    <h3>Select a Muscle Group</h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {allowedMuscles.map(m => (
                            <button
                                key={m}
                                onClick={() => handleStartWorkout(m)}
                                style={{
                                    padding: '1rem 2rem',
                                    fontSize: '1.1rem',
                                    cursor: 'pointer',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    transition: 'transform 0.2s',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                    {allowedMuscles.length < 6 && <p><em>Note: Some muscles are resting from yesterday's workout.</em></p>}
                </div>
            ) : (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{
                        marginBottom: '1.5rem',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0.5rem 0', color: '#667eea' }}>
                            {currentMuscle} Workout
                        </h3>
                        <div style={{
                            fontSize: '1.1rem',
                            color: '#666',
                            marginBottom: '1rem'
                        }}>
                            Exercise {currentVideoIndex + 1} of {videos.length}
                        </div>

                        {/* Progress Bar */}
                        <div style={{
                            width: '100%',
                            height: '8px',
                            background: '#e0e0e0',
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${((currentVideoIndex + 1) / videos.length) * 100}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                    </div>

                    <div>
                        <video
                            ref={videoRef}
                            width="100%"
                            controls
                            loop
                            style={{
                                maxWidth: '100%',
                                borderRadius: '16px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                marginBottom: '2rem'
                            }}
                        >
                            <source src={videos[currentVideoIndex]} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>

                        {/* Circular Timer Below Video */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '2rem',
                            marginTop: '1rem'
                        }}>
                            <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                                {/* Background circle */}
                                <svg width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
                                    <circle
                                        cx="75"
                                        cy="75"
                                        r="65"
                                        fill="none"
                                        stroke="#e0e0e0"
                                        strokeWidth="12"
                                    />
                                    {/* Progress circle */}
                                    <circle
                                        cx="75"
                                        cy="75"
                                        r="65"
                                        fill="none"
                                        stroke="url(#gradient)"
                                        strokeWidth="12"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 65}`}
                                        strokeDashoffset={`${2 * Math.PI * 65 * (1 - timerProgress / 100)}`}
                                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#667eea" />
                                            <stop offset="100%" stopColor="#764ba2" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                {/* Timer text in center */}
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: '2rem',
                                    fontWeight: 'bold',
                                    color: '#333',
                                    fontFamily: 'monospace'
                                }}>
                                    {formatTime(timeRemaining)}
                                </div>
                            </div>
                            <div style={{
                                fontSize: '1.2rem',
                                color: '#666',
                                textAlign: 'left'
                            }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Time Remaining</div>
                                <div style={{ fontSize: '0.9rem', color: '#999' }}>
                                    {timeRemaining > 0 ? 'Keep going! 💪' : 'Moving to next exercise...'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkoutPage;
