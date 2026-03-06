export default function Header({ isConnected }) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <img src="/profile.png" alt="ShadowCatch" style={{ width: 38, height: 38 }} />
        </div>
        <div>
          <h1 className="header-title">ShadowCatch</h1>
          <p className="header-subtitle">Shadow API Hunter</p>
        </div>
      </div>
      <div className="header-right">
        <div
          className={`connection-status ${isConnected ? "connected" : "disconnected"}`}
        >
          <span className={`status-dot ${isConnected ? "pulse" : ""}`} />
          {isConnected ? "Live" : "Disconnected"}
        </div>
      </div>
    </header>
  );
}
