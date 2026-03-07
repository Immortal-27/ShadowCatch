import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSocket } from './hooks/useSocket';
import Header from './components/Header';
import FaultyTerminal from './components/FaultyTerminal';
import { NavigationDock } from './components/NavigationDock';
import DashboardPage from './pages/DashboardPage';
import FeaturesPage from './pages/FeaturesPage';
import MembersPage from './pages/MembersPage';

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
        <Router>
            <div className="faulty-terminal-bg">
                <FaultyTerminal
                    waveColor={[1.0, 0.2, 0.4]}
                    waveSpeed={0.03}
                    waveFrequency={2}
                    waveAmplitude={0.3}
                    colorNum={4}
                    pixelSize={2}
                    enableMouseInteraction={false}
                />
            </div>

            <div className="app-container">
                <Header isConnected={isConnected} />

                <Routes>
                    <Route path="/" element={
                        <DashboardPage
                            trafficLogs={trafficLogs}
                            alerts={alerts}
                            stats={stats}
                            clearLogs={clearLogs}
                            refreshStats={refreshStats}
                        />
                    } />
                    <Route path="/features" element={<FeaturesPage />} />
                    <Route path="/members" element={<MembersPage />} />
                </Routes>
            </div>

            <NavigationDock />
        </Router>
    );
}
