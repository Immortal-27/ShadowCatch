import { useState } from 'react';
import { Radio, Trash2 } from 'lucide-react';
import MagicBentoCard from './MagicBentoCard';
import CmdModal from './CmdModal';

function formatTime(ts) {
    const d = ts ? new Date(ts) : new Date();
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function TrafficFeed({ logs, onClear }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);

    const handleEntryClick = (log) => {
        setSelectedLog(log);
        setModalOpen(true);
    };

    return (
        <>
            <MagicBentoCard className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="card-header">
                    <h2 className="card-title">
                        <Radio size={18} style={{ color: 'var(--accent-mint)' }} />
                        Live Traffic
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="card-badge" style={{
                            background: 'var(--accent-mint-dim)',
                            color: 'var(--accent-mint)',
                        }}>
                            {logs.length} entries
                        </span>
                        {logs.length > 0 && (
                            <button className="btn btn-danger" onClick={onClear} title="Clear logs">
                                <Trash2 size={14} style={{ color: 'var(--icon-default)' }} />
                            </button>
                        )}
                    </div>
                </div>

                {
                    logs.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">
                                <Radio size={40} style={{ color: 'var(--icon-disabled)' }} />
                            </div>
                            <p className="empty-state-title">No traffic yet</p>
                            <p className="empty-state-text">
                                Send requests through the proxy at <code style={{ color: 'var(--accent-red)' }}>localhost:3001/proxy/*</code> to see live traffic
                            </p>
                        </div>
                    ) : (
                        <div className="traffic-feed">
                            {logs.map((log, i) => (
                                <div
                                    key={`${log.timestamp}-${i}`}
                                    className={`traffic-entry ${log.classification}`}
                                    onClick={() => handleEntryClick(log)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <span className={`method-badge ${log.method}`}>{log.method}</span>
                                    <span className="traffic-path" title={log.path}>{log.path}</span>
                                    <span className="traffic-time">{formatTime(log.timestamp)}</span>
                                </div>
                            ))}
                        </div>
                    )
                }
            </MagicBentoCard>

            <CmdModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                method={selectedLog?.method || 'GET'}
                path={selectedLog?.path || ''}
            />
        </>
    );
}
