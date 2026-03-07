import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

export function useSocket() {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [trafficLogs, setTrafficLogs] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState(null);
    const [specInfo, setSpecInfo] = useState(null);

    // Fetch initial stats
    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch('/api/stats');
            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    }, []);

    // Fetch initial traffic history
    const fetchTrafficHistory = useCallback(async () => {
        try {
            const res = await fetch('/api/traffic?limit=50');
            const data = await res.json();
            setTrafficLogs(data.logs || []);
            // Separate out alerts
            const alertLogs = (data.logs || []).filter((l) =>
                l.classification !== 'valid' && l.classification !== 'unreachable');
            setAlerts(alertLogs);
        } catch (err) {
            console.error('Failed to fetch traffic:', err);
        }
    }, []);

    useEffect(() => {
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            fetchStats();
            fetchTrafficHistory();
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('traffic-log', (log) => {
            setTrafficLogs((prev) => [log, ...prev].slice(0, 200));
            // Update stats incrementally
            setStats((prev) => {
                if (!prev) return prev;
                const updated = { ...prev, totalRequests: prev.totalRequests + 1 };
                if (log.classification === 'valid') updated.validCount = prev.validCount + 1;
                if (log.classification === 'shadow') updated.shadowCount = prev.shadowCount + 1;
                if (log.classification === 'method-mismatch') updated.methodMismatchCount = prev.methodMismatchCount + 1;
                if (log.classification === 'data-leak') updated.dataLeakCount = prev.dataLeakCount + 1;
                // Recalculate threat score
                const threat = updated.totalRequests > 0
                    ? Math.min(100, Math.round(((updated.shadowCount * 3 + updated.methodMismatchCount * 2 + updated.dataLeakCount * 5) / updated.totalRequests) * 100))
                    : 0;
                updated.threatScore = threat;
                return updated;
            });
        });

        socket.on('shadow-alert', (alert) => {
            setAlerts((prev) => [alert, ...prev].slice(0, 100));
        });

        socket.on('spec-updated', (info) => {
            setSpecInfo(info);
            fetchStats();
        });

        return () => {
            socket.disconnect();
        };
    }, [fetchStats, fetchTrafficHistory]);

    const clearLogs = useCallback(async () => {
        try {
            await fetch('/api/traffic', { method: 'DELETE' });
            setTrafficLogs([]);
            setAlerts([]);
            fetchStats();
        } catch (err) {
            console.error('Failed to clear logs:', err);
        }
    }, [fetchStats]);

    return {
        isConnected,
        trafficLogs,
        alerts,
        stats,
        specInfo,
        clearLogs,
        refreshStats: fetchStats,
    };
}
