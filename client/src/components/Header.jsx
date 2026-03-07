import { Shield } from 'lucide-react';
import TextType from './TextType';
import MagicBentoCard from './MagicBentoCard';

export default function Header({ isConnected }) {
    return (
        <MagicBentoCard as="header" className="header">
            <div className="header-left">
                <div className="header-logo">
                    <img src="/profile.png" alt="Profile" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
                </div>
                <div>
                    <TextType
                        text="ShadowCatch"
                        as="h1"
                        className="header-title"
                        typingSpeed={80}
                        showCursor={true}
                        cursorCharacter="|"
                        loop={true}
                        cursorBlinkDuration={0.5}
                    />
                    <p className="header-subtitle">Shadow API Hunter</p>
                </div>
            </div>
            <div className="header-right">
                <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                    <span className={`status-dot ${isConnected ? 'pulse' : ''}`} />
                    {isConnected ? 'Live' : 'Disconnected'}
                </div>
            </div>
        </MagicBentoCard>
    );
}

