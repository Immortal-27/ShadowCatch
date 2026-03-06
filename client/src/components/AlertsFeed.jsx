import { ShieldOff } from 'lucide-react';
import AlertCard from './AlertCard';

export default function AlertsFeed({ alerts }) {
    return (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="card-header">
                <h2 className="card-title" style={{ color: 'var(--accent-red)' }}>
                    <ShieldOff size={18} />
                    Shadow Alerts
                </h2>
                <span className="card-badge" style={{
                    background: 'var(--accent-red-dim)',
                    color: 'var(--accent-red)',
                }}>
                    {alerts.length} threats
                </span>
            </div>

            {alerts.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <ShieldOff size={40} />
                    </div>
                    <p className="empty-state-title">No threats detected</p>
                    <p className="empty-state-text">
                        Shadow endpoints will appear here when undocumented routes are accessed
                    </p>
                </div>
            ) : (
                <div className="alerts-feed">
                    {alerts.map((alert, i) => (
                        <AlertCard key={`${alert.timestamp}-${i}`} alert={alert} />
                    ))}
                </div>
            )}
        </div>
    );
}
