import { useEffect, useState } from 'react';
import { appsService } from '../../../services/apps.service';

export default function AiConfigPage() {
    const [config, setConfig] = useState({ provider: 'GEMINI', apiKey: '' });
    const [hasKey, setHasKey] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        appsService.getAiConfig().then(({ data }) => {
            setConfig(c => ({...c, provider: data.provider || 'GEMINI'}));
            setHasKey(data.hasKey);
        }).catch(() => {});
    }, []);

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true); setError(''); setSaved(false);
        try {
            await appsService.saveAiConfig({ provider: config.provider, apiKey: config.apiKey || undefined });
            setSaved(true); setTimeout(() => setSaved(false), 2000);
            if (config.apiKey) setHasKey(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save');
        } finally { setSaving(false); }
    }

    return (
        <div>
            <h2 className="mb-8">AI Configuration</h2>
            <p className="text-muted text-sm mb-20">Choose your AI provider and optionally supply your own API key. Leave the key empty to use the server's default key.</p>

            <div className="card" style={{maxWidth:500}}>
                <form onSubmit={handleSave} style={{display:'flex',flexDirection:'column',gap:20}}>
                    <div className="form-group">
                        <label className="form-label">AI Provider</label>
                        <select className="form-select" value={config.provider}
                            onChange={e => setConfig(c => ({...c, provider: e.target.value}))}>
                            <option value="GEMINI">🧠 Google Gemini (Recommended)</option>
                            <option value="OPENAI">⚡ OpenAI GPT</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            API Key {hasKey && <span className="badge badge-green" style={{marginLeft:6}}>Key saved</span>}
                        </label>
                        <input type="password" className="form-input"
                            placeholder={hasKey ? '••••••••••••••• (leave blank to keep existing)' : `Enter your ${config.provider === 'GEMINI' ? 'Gemini' : 'OpenAI'} API key`}
                            value={config.apiKey} onChange={e => setConfig(c => ({...c, apiKey: e.target.value}))} />
                        <span className="text-sm text-muted mt-8" style={{display:'block'}}>
                            {config.provider === 'GEMINI'
                                ? <>Get your free key at <a href="https://aistudio.google.com" target="_blank" rel="noreferrer">Google AI Studio</a></>
                                : <>Get your key at <a href="https://platform.openai.com" target="_blank" rel="noreferrer">OpenAI Platform</a></>}
                        </span>
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <div className="card" style={{background:'var(--accent-dim)',border:'1px solid var(--accent-border)'}}>
                        <p style={{fontSize:13,color:'var(--accent-light)'}}>
                            🔒 Your API key is encrypted with AES-256-GCM before being stored in the database. It is never sent back to the client.
                        </p>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{alignSelf:'flex-start'}} disabled={saving}>
                        {saving ? <><span className="spinner"/> Saving…</> : saved ? '✓ Saved' : '💾 Save Config'}
                    </button>
                </form>
            </div>
        </div>
    );
}
