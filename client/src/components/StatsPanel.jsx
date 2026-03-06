import { Activity, ShieldAlert, ShieldOff, Database, AlertTriangle, Gauge } from 'lucide-react';

export default function StatsPanel({ stats }) {
    if (!stats) {
        return (
            <div className="glass-card">
                <div className="card-header">
                    <h2 className="card-title"><Gauge size={18} /> Dashboard</h2>
                </div>
                <div className="empty-state" style={{ padding: '24px' }}>
                    <div className="spinner" />
                    <p className="empty-state-text">Loading statistics...</p>
                </div>
            </div>
        );
    }

    const threatLevel = stats.threatScore >= 80 ? 'critical'
        : stats.threatScore >= 60 ? 'high'
            : stats.threatScore >= 30 ? 'medium'
                : 'low';

    return (
        <div className="glass-card">
            <div className="card-header">
                <h2 className="card-title"><Gauge size={18} /> Dashboard</h2>
                <div className="card-badge" style={{
                    background: 'var(--accent-blue-dim)',
                    color: 'var(--accent-blue)',
                }}>
                    {stats.allowedRouteCount} documented routes
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card blue">
                    <span className="stat-label">Total Requests</span>
                    <span className="stat-value">{stats.totalRequests}</span>
                </div>

                <div className="stat-card green">
                    <span className="stat-label">Valid</span>
                    <span className="stat-value">{stats.validCount}</span>
                </div>

                <div className="stat-card red">
                    <span className="stat-label">Shadow APIs</span>
                    <span className="stat-value">{stats.shadowCount}</span>
                </div>

                <div className="stat-card amber">
                    <span className="stat-label">Method Mismatch</span>
                    <span className="stat-value">{stats.methodMismatchCount}</span>
                </div>

                <div className="stat-card purple">
                    <span className="stat-label">Data Leaks</span>
                    <span className="stat-value">{stats.dataLeakCount}</span>
                </div>

                <div className="stat-card red">
                    <div className="threat-gauge">
                        <span className="stat-label">Threat Level</span>
                        <span className="stat-value" style={{ fontSize: '1.5rem' }}>
                            {stats.threatScore}%
                        </span>
                        <div className="threat-bar-bg">
                            <div
                                className={`threat-bar-fill ${threatLevel}`}
                                style={{ width: `${stats.threatScore}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
