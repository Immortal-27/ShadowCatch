import React from 'react';
import MagicBentoCard from '../components/MagicBentoCard';
import { Shield, Zap, Search, Activity } from 'lucide-react';

export default function FeaturesPage() {
    const features = [
        {
            title: "Shadow & Zombie Endpoint Detection",
            desc: "Uses a detection engine to compare real-time traffic against uploaded OpenAPI/Swagger specs, identifying undocumented endpoints or forgotten \"zombie\" APIs that pose a security risk.",
            icon: <Search className="text-accent-red" />
        },
        {
            title: "Real-Time Traffic Proxying",
            desc: "Implements an Express-based proxy (http-proxy-middleware) that sits between clients and the target API, allowing for passive monitoring and analysis without modifying the original service's code.",
            icon: <Activity className="text-accent-red" />
        },
        {
            title: "Sensitive Data Leak Inspection",
            desc: "Automatically scans request query parameters for sensitive keywords (like password, secret, or token) to catch accidental data exposure even on legitimate, documented routes.",
            icon: <Shield className="text-accent-red" />
        },
        {
            title: "Dynamic Severity Scoring",
            desc: "Features a custom scoring engine that calculates risk levels by analyzing endpoint classifications and path patterns, flagging suspicious keywords like admin, backdoor, or nuke as high-priority alerts.",
            icon: <Zap className="text-accent-red" />
        }
    ];

    return (
        <>
            <header className="page-header" style={{ marginBottom: '2rem' }}>
                <h1 className="header-title" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-ice)' }}>
                    System Features
                </h1>
                <p style={{ color: 'var(--text-gray-blue)', marginTop: '0.5rem' }}>
                    Next-generation security for your undocumented perimeter.
                </p>
            </header>

            <div className="main-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                {features.map((f, i) => (
                    <MagicBentoCard key={i} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '1rem', opacity: 0.8 }}>{f.icon}</div>
                        <h3 style={{ color: 'var(--text-ice)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>{f.title}</h3>
                        <p style={{ color: 'var(--text-gray-blue)', fontSize: '0.9rem', lineHeight: 1.6, flexGrow: 1 }}>{f.desc}</p>
                    </MagicBentoCard>
                ))}
            </div>
        </>
    );
}
