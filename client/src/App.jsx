import { useSocket } from './hooks/useSocket';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import StatsPanel from './components/StatsPanel';
import TrafficFeed from './components/TrafficFeed';
import AlertsFeed from './components/AlertsFeed';

export default function App() {
    const {
        isConnected,
        trafficLogs,
        alerts,
        stats,
        clearLogs,
        refreshStats,
    } = useSocket();

    return (
        <div className="app-container">
            <Header isConnected={isConnected} />

            <div className="top-section">
                <FileUpload onSpecUploaded={refreshStats} />
                <StatsPanel stats={stats} />
            </div>

            <div className="main-grid">
                <TrafficFeed logs={trafficLogs} onClear={clearLogs} />
                <AlertsFeed alerts={alerts} />
            </div>
        </div>
    );
}
