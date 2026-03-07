import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle, XCircle, FileJson } from 'lucide-react';
import MagicBentoCard from './MagicBentoCard';

export default function FileUpload({ onSpecUploaded }) {
    const [status, setStatus] = useState('idle'); // idle | uploading | success | error
    const [message, setMessage] = useState('');

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        const formData = new FormData();
        formData.append('spec', file);
        formData.append('specName', file.name);

        setStatus('uploading');
        setMessage('');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(`${data.title} v${data.version} — ${data.routeCount} routes loaded`);
                if (onSpecUploaded) onSpecUploaded(data);
            } else {
                setStatus('error');
                setMessage(data.message || 'Upload failed');
            }
        } catch (err) {
            setStatus('error');
            setMessage(err.message);
        }
    }, [onSpecUploaded]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/json': ['.json'],
            'text/yaml': ['.yaml', '.yml'],
        },
        maxFiles: 1,
    });

    return (
        <MagicBentoCard className="glass-card">
            <div className="card-header">
                <h2 className="card-title">
                    <FileJson size={18} style={{ color: 'var(--icon-default)' }} />
                    API Spec
                </h2>
            </div>

            <div
                {...getRootProps()}
                className={`upload-zone ${isDragActive ? 'active' : ''}`}
            >
                <input {...getInputProps()} />
                <div className="upload-icon">
                    {status === 'uploading' ? (
                        <div className="spinner" />
                    ) : (
                        <Upload size={28} style={{ color: 'var(--icon-default)' }} />
                    )}
                </div>
                <p className="upload-text">
                    {isDragActive
                        ? 'Drop your spec file here...'
                        : <>Drag & drop a <strong>Swagger/OpenAPI</strong> spec</>
                    }
                </p>
                <p className="upload-hint">.json, .yaml, or .yml</p>
            </div>

            {status === 'success' && (
                <div className="upload-success" style={{ marginTop: 12 }}>
                    <CheckCircle size={16} style={{ color: 'var(--icon-success)' }} />
                    {message}
                </div>
            )}

            {status === 'error' && (
                <div className="upload-error" style={{ marginTop: 12 }}>
                    <XCircle size={16} style={{ color: 'var(--icon-active)' }} />
                    {message}
                </div>
            )}
        </MagicBentoCard>
    );
}

