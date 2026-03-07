import React from 'react';
import MagicBentoCard from '../components/MagicBentoCard';
import { User, Github } from 'lucide-react';

export default function MembersPage() {
    const members = [
        {
            name: "Milon Paul",
            image: "/milon paul.jpeg",
            github: "https://github.com/milonpaul159",

        },
        {
            name: "Anuska Dey",
            image: "/anuska dey.jpeg",
            objectPosition: 'center 20%',
            github: "https://github.com/anuskadey18",

        },
        {
            name: "Swarnabha Bhattacharjee",
            image: "/swarnabha bhattacharjee.jpeg",
            github: "https://github.com/Immortal-27",

        },
        {
            name: "Abhimanyu Sengupta",
            image: "/Abhimanyu Sengupta.jpeg",
            github: "https://github.com/abhii734",

        }
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
                    <MagicBentoCard key={i} className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', transformStyle: 'preserve-3d' }}>
                        <div style={{
                            width: '100%',
                            height: 240,
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--border-active)',
                            overflow: 'hidden',
                            transform: 'translateZ(50px)',
                            transformStyle: 'preserve-3d',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                            transition: 'transform 0.3s ease'
                        }}>
                            {m.image ? (
                                <img
                                    src={m.image}
                                    alt={m.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        objectPosition: m.objectPosition || 'center',
                                        transform: 'translateZ(20px)'
                                    }}
                                />
                            ) : (
                                <User size={48} color="var(--icon-default)" />
                            )}
                        </div>
                        <div style={{ padding: '0 0.5rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', transform: 'translateZ(30px)' }}>
                            <h3 style={{ color: 'var(--text-ice)', fontSize: '1.2rem', fontWeight: 700 }}>{m.name}</h3>
                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <a href={m.github} target="_blank" rel="noopener noreferrer" className="social-link" title="GitHub">
                                    <Github size={18} style={{ color: 'var(--text-gray-blue)', transition: 'color 0.2s' }} />
                                </a>

                            </div>
                        </div>
                    </MagicBentoCard>
                ))}
            </div>
        </>
    );
}
