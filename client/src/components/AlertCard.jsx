import { ShieldAlert, AlertTriangle, KeyRound } from 'lucide-react';
import SeverityBadge from './SeverityBadge';

function formatTime(ts) {
    const d = ts ? new Date(ts) : new Date();
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function getAlertIcon(classification) {
    switch (classification) {
        case 'shadow': return <ShieldAlert size={16} style={{ color: 'var(--accent-red)' }} />;
        case 'method-mismatch': return <AlertTriangle size={16} style={{ color: 'var(--accent-amber)' }} />;
        case 'data-leak': return <KeyRound size={16} style={{ color: 'var(--accent-purple)' }} />;
        default: return null;
    }
}

function getTypeLabel(classification) {
    switch (classification) {
        case 'shadow': return 'Shadow Endpoint';
        case 'method-mismatch': return 'Method Mismatch';
        case 'data-leak': return 'Data Leak';
        default: return 'Unknown';
    }
}

export default function AlertCard({ alert }) {
    const isCritical = alert.severity === 'critical';

    return (
        <div className={`alert-card ${alert.classification} ${isCritical ? 'critical' : ''}`}>
            <div className="alert-header">
                <span className={`alert-type ${alert.classification}`}>
                    {getAlertIcon(alert.classification)}
                    {' '}
                    {getTypeLabel(alert.classification)}
                </span>
                <SeverityBadge severity={alert.severity} />
            </div>

            <div className="alert-endpoint">
                <span className={`method-badge ${alert.method}`}>{alert.method}</span>
                {alert.path}
            </div>

            {alert.details && (
                <p className="alert-details">{alert.details}</p>
            )}

            <div className="alert-time" style={{ marginTop: 8 }}>
                {formatTime(alert.timestamp || alert.alertTime)}
            </div>
        </div>
    );
}
