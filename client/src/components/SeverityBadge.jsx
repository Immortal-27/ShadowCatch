export default function SeverityBadge({ severity }) {
    if (!severity || severity === 'none') return null;

    return (
        <span className={`severity-badge ${severity}`}>
            {severity}
        </span>
    );
}
