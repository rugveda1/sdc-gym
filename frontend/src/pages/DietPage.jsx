import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DietPage = ({ token }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dietPlan, setDietPlan] = useState(null);
    const [jobId, setJobId] = useState(null);

    // Profile Form State
    const [formData, setFormData] = useState({
        weightKg: '', heightCm: '', region: '', eatingHabits: '', goal: ''
    });

    const api = axios.create({
        baseURL: 'http://localhost:3000/api',
        headers: { Authorization: `Bearer ${token}` }
    });
    useEffect(() => {
        fetchProfile();
    }, []);
    // Poll for results if we have a job ID
    useEffect(() => {
        let interval;
        if (jobId) {
            interval = setInterval(async () => {
                try {
                    const res = await api.get(`/diet/result?jobId=${jobId}`);
                    if (res.data.status === 'completed') {
                        setDietPlan(res.data.result);
                        setJobId(null); // Stop polling
                    } else if (res.data.status === 'failed') {
                        alert('Diet generation failed');
                        setJobId(null);
                    }
                }
                catch (err) {
                    console.error(err);
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [jobId]);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/profile');
            setProfile(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/profile', {
                ...formData,
                weightKg: parseFloat(formData.weightKg),
                heightCm: parseFloat(formData.heightCm)
            });
            setProfile(res.data);
        } catch (err) {
            alert('Error saving profile');
        }
    };

    const handleGenerate = async () => {
        try {
            const res = await api.post('/diet/generate');
            setJobId(res.data.jobId);
        } catch (err) {
            alert('Error starting generation');
        }
    };

    if (loading) return <div>Loading...</div>;

    if (!profile) {
        return (
            <div className="diet-page">
                <h2>Complete Your Profile</h2>
                <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '0 auto' }}>
                    <input placeholder="Weight (kg)" type="number" value={formData.weightKg} onChange={e => setFormData({ ...formData, weightKg: e.target.value })} required />
                    <input placeholder="Height (cm)" type="number" value={formData.heightCm} onChange={e => setFormData({ ...formData, heightCm: e.target.value })} required />
                    <input placeholder="Region (e.g., South India)" value={formData.region} onChange={e => setFormData({ ...formData, region: e.target.value })} required />
                    <input placeholder="Eating Habits (e.g., Vegetarian)" value={formData.eatingHabits} onChange={e => setFormData({ ...formData, eatingHabits: e.target.value })} required />
                    <input placeholder="Goal (e.g., Muscle Gain)" value={formData.goal} onChange={e => setFormData({ ...formData, goal: e.target.value })} required />
                    <button type="submit">Save Profile</button>
                </form>
            </div>
        );
    }

    return (
        <div className="diet-page">
            <h2>Your Diet Plan</h2>
            <div style={{ marginBottom: '1rem' }}>
                <strong>Profile:</strong> {profile.weightKg}kg, {profile.goal}
            </div>

            {!dietPlan && !jobId && (
                <button onClick={handleGenerate} style={{ padding: '10px 20px', fontSize: '1.2rem' }}>
                    Generate Diet Plan
                </button>
            )}

            {jobId && (
                <div style={{ marginTop: '1rem' }}>
                    Generating your personalized plan... <span className="spinner">⏳</span>
                </div>
            )}

            {dietPlan && (
                <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.7)', borderRadius: '16px', border: '1px solid var(--sky-blue-light)', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <h3>{dietPlan.summary}</h3>
                    <p><em>{dietPlan.notes}</em></p>
                    <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
                        {dietPlan.days.map((day, idx) => (
                            <div key={idx} style={{ background: 'rgba(180, 228, 255, 0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--sky-blue-light)' }}>
                                <h4 style={{ color: 'var(--sky-blue-dark)', marginBottom: '1rem' }}>{day.day}</h4>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {day.meals.map((m, i) => (
                                        <li key={i} style={{ marginBottom: '0.75rem', padding: '0.5rem', background: 'rgba(255,255,255,0.5)', borderRadius: '8px' }}>
                                            <strong style={{ color: 'var(--coral)' }}>{m.time}:</strong> {m.meal} <span style={{ color: 'var(--purple)' }}>({m.calories} cal)</span> - {m.notes}
                                        </li>
                                    ))}
                                </ul>
                                <small style={{ color: 'var(--text-light)', marginTop: '0.5rem', display: 'block' }}>
                                    <strong>Macros:</strong> P: {day.macros.protein}, C: {day.macros.carbs}, F: {day.macros.fat}
                                </small>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DietPage;
