import React from 'react';
import MagicBentoCard from '../components/MagicBentoCard';
import { User, Cpu, ShieldCheck } from 'lucide-react';

export default function MembersPage() {
    const members = [
        { name: "Milon Paul", role: "Security Architect", status: "Active" },
        { name: "Anuska Dey", role: "Threat Researcher", status: "Monitoring" },
        { name: "Swarnabha Bhattacharjee", role: "SOC Lead", status: "Active" },
        { name: "Abhimanyu Sengupta", role: "AI Guardian", status: "Synchronized" }
    ];

    return (
        <>
            <header className="page-header" style={{ marginBottom: '2rem' }}>
                <h1 className="header-title" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-ice)' }}>
                    SecOps Team
                </h1>
                <p style={{ color: 'var(--text-gray-blue)', marginTop: '0.5rem' }}>
                    The guardians behind the shadow.
                </p>
            </header>

            <div className="main-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                {members.map((m, i) => (
                    <MagicBentoCard key={i} className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: 'var(--bg-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--border-active)'
                        }}>
                            {m.name.includes('Protocol') ? <Cpu size={24} color="var(--accent-red)" /> : <User size={24} color="var(--icon-default)" />}
                        </div>
                        <div>
                            <h3 style={{ color: 'var(--text-ice)', fontSize: '1.1rem', marginBottom: '0.2rem' }}>{m.name}</h3>
                        </div>
                    </MagicBentoCard>
                ))}
            </div>
        </>
    );
}
