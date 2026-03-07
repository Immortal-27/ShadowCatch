import React from 'react';
import FileUpload from '../components/FileUpload';
import StatsPanel from '../components/StatsPanel';
import TrafficFeed from '../components/TrafficFeed';
import AlertsFeed from '../components/AlertsFeed';

export default function DashboardPage({ trafficLogs, alerts, stats, clearLogs, refreshStats }) {
    return (
        <>
            <div className="top-section">
                <FileUpload onSpecUploaded={refreshStats} />
                <StatsPanel stats={stats} />
            </div>

            <div className="main-grid">
                <TrafficFeed logs={trafficLogs} onClear={clearLogs} />
                <AlertsFeed alerts={alerts} />
            </div>
        </>
    );
}
