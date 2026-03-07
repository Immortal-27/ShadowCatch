import { useState, useEffect, useRef } from 'react';

export default function CmdModal({ isOpen, onClose, method, path }) {
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const outputRef = useRef(null);

    useEffect(() => {
        if (!isOpen || !path) return;

        setOutput('');
        setLoading(true);

        const proxyUrl = `/api/proxy-fetch?method=${encodeURIComponent(method)}&path=${encodeURIComponent(path)}`;

        fetch(proxyUrl)
            .then(async (res) => {
                const text = await res.text();
                try {
                    const json = JSON.parse(text);
                    return JSON.stringify(json, null, 2);
                } catch {
                    return text;
                }
            })
            .then((data) => {
                // Simulate typing effect
                let i = 0;
                const interval = setInterval(() => {
                    if (i < data.length) {
                        const chunk = data.slice(i, i + 5);
                        setOutput((prev) => prev + chunk);
                        i += 5;
                    } else {
                        clearInterval(interval);
                    }
                }, 10);
                setLoading(false);
                return () => clearInterval(interval);
            })
            .catch((err) => {
                setOutput(`Error: ${err.message}\n\nMake sure the server is running at localhost:3001`);
                setLoading(false);
            });
    }, [isOpen, path, method]);

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="cmd-overlay" onClick={onClose}>
            <div className="cmd-window" onClick={(e) => e.stopPropagation()}>
                {/* Title bar */}
                <div className="cmd-titlebar">
                    <div className="cmd-titlebar-left">
                        <span className="cmd-icon">■</span>
                        <span className="cmd-title">Byte Crafter Fetched — {method} {path}</span>
                    </div>
                    <div className="cmd-titlebar-buttons">
                        <button className="cmd-btn cmd-btn-close" onClick={onClose}>✕</button>
                    </div>
                </div>

                {/* Terminal body */}
                <div className="cmd-body" ref={outputRef}>
                    <div className="cmd-line">
                        <span className="cmd-text">ShadowCatch</span>
                    </div>
                    <div className="cmd-line">
                        <span className="cmd-text">(c) Byte Crafter. All rights reserved.</span>
                    </div>
                    <div className="cmd-line" style={{ marginTop: '1em' }}>
                        <span className="cmd-text">C:\ShadowCatch&gt; curl -X {method} http://localhost:3001/proxy{path}</span>
                    </div>
                    <div className="cmd-line" style={{ marginTop: '0.5em' }}>
                        <span className="cmd-text">Connecting to localhost:3001...</span>
                    </div>
                    {loading && (
                        <div className="cmd-line">
                            <span className="cmd-text cmd-blink">█</span>
                        </div>
                    )}
                    {output && (
                        <pre className="cmd-output">{output}</pre>
                    )}
                    <div className="cmd-line" style={{ marginTop: '0.5em' }}>
                        <span className="cmd-text">C:\ShadowCatch&gt; <span className="cmd-blink">█</span></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
