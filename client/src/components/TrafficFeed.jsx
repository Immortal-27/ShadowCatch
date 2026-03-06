import { Radio, Trash2 } from 'lucide-react';

function formatTime(ts) {
    const d = ts ? new Date(ts) : new Date();
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function TrafficFeed({ logs, onClear }) {
    return (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="card-header">
                <h2 className="card-title">
                    <Radio size={18} style={{ color: 'var(--accent-green)' }} />
                    Live Traffic
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="card-badge" style={{
                        background: 'var(--accent-green-dim)',
                        color: 'var(--accent-green)',
                    }}>
                        {logs.length} entries
                    </span>
                    {logs.length > 0 && (
                        <button className="btn btn-danger" onClick={onClear} title="Clear logs">
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            {logs.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <Radio size={40} />
                    </div>
                    <p className="empty-state-title">No traffic yet</p>
                    <p className="empty-state-text">
                        Send requests through the proxy at <code style={{ color: 'var(--accent-green)' }}>https://shadowcatch.webbytecrafter.xyz:3001/proxy/*</code> to see live traffic
                    </p>
                </div>
            ) : (
                <div className="traffic-feed">
                    {logs.map((log, i) => (
                        <div key={`${log.timestamp}-${i}`} className={`traffic-entry ${log.classification}`}>
                            <span className={`method-badge ${log.method}`}>{log.method}</span>
                            <span className="traffic-path" title={log.path}>{log.path}</span>
                            <span className="traffic-time">{formatTime(log.timestamp)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
