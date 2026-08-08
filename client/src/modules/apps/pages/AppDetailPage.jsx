import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appsService } from '../../../services/apps.service';
import { StoreLogo } from '../../../components/StoreIcons';

const TABS = ['Reviews', 'Connection', 'Instruction Prompt', 'Sandbox', 'Settings'];

export default function AppDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [app, setApp] = useState(null);
    const [tab, setTab] = useState('Reviews');
    const [loading, setLoading] = useState(true);

    const loadApp = useCallback(() => {
        // We don't have a GET /apps/:id endpoint, so fetch from list and filter
        appsService.list().then(({ data }) => {
            const found = data.find(a => a.id === Number(id));
            if (!found) navigate('/apps');
            else setApp(found);
        }).finally(() => setLoading(false));
    }, [id, navigate]);

    useEffect(loadApp, [loadApp]);

    if (loading) return <div className="empty-state"><div className="spinner" style={{width:32,height:32,borderWidth:3}}/></div>;
    if (!app) return null;

    return (
        <div>
            {/* App header */}
            <div className="flex items-center gap-12 mb-20">
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/apps')}>← Back</button>
                <div className={`app-platform-icon ${app.platform === 'PLAYSTORE' ? 'app-platform-play' : 'app-platform-apple'}`}>
                    <StoreLogo platform={app.platform} size={24} />
                </div>
                <div>
                    <h2 style={{marginBottom:4}}>{app.name}</h2>
                    <div className="flex gap-8 items-center">
                        <span className="text-sm text-muted">{app.platform === 'PLAYSTORE' ? 'Google Play Store' : 'Apple App Store'}</span>
                        <span className={`badge badge-${app.isActive ? 'green' : 'red'}`}>{app.isActive ? 'Active' : 'Inactive'}</span>
                        <span className={`badge badge-${app.mode === 'AUTO' ? 'purple' : 'blue'}`}>{app.mode} Mode</span>
                    </div>
                </div>
            </div>


            {/* Tabs */}
            <div className="tabs">
                {TABS.map(t => (
                    <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
                ))}
            </div>

            {/* Tab content */}
            {tab === 'Reviews'            && <ReviewsTab appId={app.id} />}
            {tab === 'Connection'          && <ConnectionTab app={app} onUpdated={setApp} />}
            {tab === 'Instruction Prompt'  && <PromptTab app={app} onUpdated={setApp} />}
            {tab === 'Sandbox'             && <SandboxTab appId={app.id} />}
            {tab === 'Settings'            && <SettingsTab app={app} onUpdated={setApp} />}
        </div>
    );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────
function ReviewsTab({ appId }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetching, setFetching] = useState(false);
    const [popup, setPopup] = useState(null); // { type: 'success'|'error', message }

    useEffect(() => {
        appsService.listReviews(appId).then(r => setReviews(r.data)).finally(() => setLoading(false));
    }, [appId]);

    async function handleFetch() {
        setFetching(true);
        try {
            const { data } = await appsService.fetchReviews(appId);
            setPopup({ type: 'success', message: data.message });
            const refreshed = await appsService.listReviews(appId);
            setReviews(refreshed.data);
        } catch (err) {
            setPopup({ type: 'error', message: err.response?.data?.error || 'Failed to fetch reviews' });
        } finally { setFetching(false); }
    }

    async function handleGenerate(reviewId) {
        setReviews(r => r.map(x => x.id === reviewId ? {...x, _generating: true} : x));
        try {
            const { data } = await appsService.generateReply(appId, reviewId);
            setReviews(r => r.map(x => x.id === reviewId ? {...data, _generating: false} : x));
        } catch { setReviews(r => r.map(x => x.id === reviewId ? {...x, _generating: false} : x)); }
    }

    async function handlePublish(reviewId) {
        setReviews(r => r.map(x => x.id === reviewId ? {...x, _publishing: true} : x));
        try {
            const { data } = await appsService.publishReply(appId, reviewId);
            setReviews(r => r.map(x => x.id === reviewId ? {...data, _publishing: false} : x));
            setPopup({ type: 'success', message: 'Reply published successfully!' });
        } catch (err) {
            setReviews(r => r.map(x => x.id === reviewId ? {...x, _publishing: false} : x));
            setPopup({ type: 'error', message: err.response?.data?.error || 'Publish failed' });
        }
    }

    return (
        <div>
            <div className="section-header">
                <h3>Reviews</h3>
                <button className="btn btn-secondary" onClick={handleFetch} disabled={fetching}>
                    {fetching ? <><span className="spinner"/> Fetching…</> : '🔄 Fetch Reviews'}
                </button>
            </div>

            {loading ? (
                <div className="empty-state"><div className="spinner" style={{width:24,height:24,borderWidth:2}}/></div>
            ) : reviews.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">💬</div>
                    <p className="empty-text">No reviews yet. Click "Fetch Reviews" to pull from the store.</p>
                </div>
            ) : (
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    {reviews.map(review => (
                        <div key={review.id} className="card">
                            <div className="flex items-center gap-12 mb-8" style={{flexWrap:'wrap'}}>
                                <div style={{fontWeight:600,color:'var(--text-heading)',fontSize:13}}>{review.reviewerName || 'Anonymous'}</div>
                                {review.rating && <span className="stars">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</span>}
                                <span className={`badge badge-${review.isPublished ? 'green' : 'yellow'}`}>
                                    {review.isPublished ? '✓ Published' : '● Pending'}
                                </span>
                                <span className="text-sm text-muted" style={{marginLeft:'auto'}}>
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="review-content">{review.content}</p>
                            {review.aiReply && (
                                <div className="review-reply">
                                    <span style={{fontSize:11,color:'var(--accent-light)',fontWeight:600,display:'block',marginBottom:4}}>AI Reply</span>
                                    {review.aiReply}
                                </div>
                            )}
                            <div className="review-actions">
                                <button className="btn btn-secondary btn-sm" onClick={() => handleGenerate(review.id)} disabled={review._generating}>
                                    {review._generating ? <><span className="spinner"/> Generating…</> : '✨ Regenerate'}
                                </button>
                                {!review.isPublished && review.aiReply && (
                                    <button className="btn btn-primary btn-sm" onClick={() => handlePublish(review.id)} disabled={review._publishing}>
                                        {review._publishing ? <><span className="spinner"/> Publishing…</> : '🚀 Publish'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {popup && <Popup type={popup.type} message={popup.message} onClose={() => setPopup(null)} />}
        </div>
    );
}

// ─── Connection Tab ───────────────────────────────────────────────────────────
function ConnectionTab({ app, onUpdated }) {
    const [form, setForm] = useState({ platform: app.platform, credentials: '' });
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [popup, setPopup] = useState(null);
    const [saved, setSaved] = useState(false);

    const set = k => e => setForm(p => ({...p, [k]: e.target.value}));

    async function handleSave(e) {
        e.preventDefault();
        if (!form.credentials) return;
        try { JSON.parse(form.credentials); } catch { setPopup({ type: 'error', message: 'Credentials must be valid JSON' }); return; }
        setSaving(true);
        try {
            const { data } = await appsService.update(app.id, { platform: form.platform, credentials: form.credentials });
            onUpdated(d => ({...d, ...data}));
            setSaved(true); setTimeout(() => setSaved(false), 2000);
        } catch (err) { setPopup({ type: 'error', message: err.response?.data?.error || 'Save failed' }); }
        finally { setSaving(false); }
    }

    async function handleTest() {
        setTesting(true);
        try {
            const { data } = await appsService.testConnection(app.id);
            setPopup({ type: 'success', message: `✅ ${data.message}. Found ${data.reviewCount} reviews.` });
        } catch (err) {
            setPopup({ type: 'error', message: err.response?.data?.error || 'Connection failed' });
        } finally { setTesting(false); }
    }

    const credPlaceholder = form.platform === 'PLAYSTORE'
        ? '{\n  "packageName": "com.example.app",\n  "type": "service_account",\n  "project_id": "...",\n  ...\n}'
        : '{\n  "appId": "123456789",\n  "issuerId": "...",\n  "keyId": "...",\n  "privateKey": "-----BEGIN PRIVATE KEY-----\\n..."\n}';

    return (
        <div>
            <h3 className="mb-16">Store Connection</h3>
            <div className="card" style={{maxWidth:600}}>
                <form onSubmit={handleSave} style={{display:'flex',flexDirection:'column',gap:16}}>
                    <div className="form-group">
                        <label className="form-label">Platform</label>
                        <select className="form-select" value={form.platform} onChange={set('platform')}>
                            <option value="PLAYSTORE">▶ Google Play Store</option>
                            <option value="APPSTORE">🍎 Apple App Store</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Credentials (JSON)</label>
                        <div className="text-sm text-muted mb-8">Stored encrypted on server. Paste your full service account / API key JSON.</div>
                        <textarea className="form-textarea" style={{minHeight:160,fontFamily:'monospace',fontSize:12}}
                            placeholder={credPlaceholder} value={form.credentials} onChange={set('credentials')} />
                    </div>
                    <div className="flex gap-8">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? <><span className="spinner"/> Saving…</> : saved ? '✓ Saved' : '💾 Save Credentials'}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={handleTest} disabled={testing}>
                            {testing ? <><span className="spinner"/> Testing…</> : '🔌 Test Connection'}
                        </button>
                    </div>
                </form>
            </div>
            {popup && <Popup type={popup.type} message={popup.message} onClose={() => setPopup(null)} />}
        </div>
    );
}

// ─── Instruction Prompt Tab ───────────────────────────────────────────────────
function PromptTab({ app, onUpdated }) {
    const [prompt, setPrompt] = useState(app.instructionPrompt || '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await appsService.update(app.id, { instructionPrompt: prompt });
            onUpdated(d => ({...d, instructionPrompt: data.instructionPrompt}));
            setSaved(true); setTimeout(() => setSaved(false), 2000);
        } finally { setSaving(false); }
    }

    return (
        <div>
            <h3 className="mb-8">Instruction Prompt</h3>
            <p className="text-muted text-sm mb-16">Define the tone, style, and rules for AI-generated replies. This prompt is prepended to every review reply request.</p>
            <div className="card" style={{maxWidth:700}}>
                <form onSubmit={handleSave} style={{display:'flex',flexDirection:'column',gap:16}}>
                    <div className="form-group">
                        <label className="form-label">Prompt</label>
                        <textarea className="form-textarea" style={{minHeight:200}}
                            placeholder={"Example:\nYou are a friendly and professional customer support agent for [App Name].\nAlways:\n- Thank the user for their feedback\n- Be empathetic and concise\n- Offer help if there's an issue\n- Keep replies under 100 words\n- Use a warm, professional tone"}
                            value={prompt} onChange={e => setPrompt(e.target.value)} />
                    </div>
                    <div>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? <><span className="spinner"/> Saving…</> : saved ? '✓ Saved' : '💾 Save Prompt'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Sandbox Tab ──────────────────────────────────────────────────────────────
function SandboxTab({ appId }) {
    const [reviewText, setReviewText] = useState('');
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleTest(e) {
        e.preventDefault();
        if (!reviewText.trim()) return;
        setLoading(true); setError(''); setReply('');
        try {
            const { data } = await appsService.sandbox(appId, reviewText);
            setReply(data.aiReply);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate reply');
        } finally { setLoading(false); }
    }

    return (
        <div>
            <h3 className="mb-8">Sandbox</h3>
            <p className="text-muted text-sm mb-16">Test your instruction prompt by pasting a sample review. Nothing is saved or published.</p>
            <div className="card" style={{maxWidth:700}}>
                <form onSubmit={handleTest} style={{display:'flex',flexDirection:'column',gap:16}}>
                    <div className="form-group">
                        <label className="form-label">Sample Review</label>
                        <textarea className="form-textarea" style={{minHeight:100}}
                            placeholder="Paste a customer review here to test your prompt…"
                            value={reviewText} onChange={e => setReviewText(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{alignSelf:'flex-start'}} disabled={loading || !reviewText.trim()}>
                        {loading ? <><span className="spinner"/> Generating…</> : '✨ Generate Reply'}
                    </button>
                </form>
                {error && <p className="form-error mt-12">{error}</p>}
                {reply && (
                    <div style={{marginTop:20}}>
                        <div className="form-label mb-8">AI Reply</div>
                        <div className="sandbox-output">{reply}</div>
                    </div>
                )}
                {!reply && !loading && (
                    <div style={{marginTop:20}}>
                        <div className="form-label mb-8">AI Reply</div>
                        <div className="sandbox-output sandbox-placeholder">Your generated reply will appear here…</div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab({ app, onUpdated }) {
    const [mode, setMode] = useState(app.mode);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    async function handleModeChange(newMode) {
        setMode(newMode);
        setSaving(true);
        try {
            const { data } = await appsService.update(app.id, { mode: newMode });
            onUpdated(d => ({...d, mode: data.mode}));
            setSaved(true); setTimeout(() => setSaved(false), 2000);
        } finally { setSaving(false); }
    }

    return (
        <div>
            <h3 className="mb-16">Settings</h3>
            <div className="card" style={{maxWidth:500}}>
                <h4 className="mb-8">Reply Mode</h4>
                <p className="text-muted text-sm mb-16">
                    <strong style={{color:'var(--green)'}}>Auto Mode:</strong> Fetches new reviews, generates AI replies, and publishes automatically.<br/>
                    <strong style={{color:'var(--blue)'}}>Manual Mode:</strong> Fetches and generates replies, but you approve each before publishing.
                </p>
                <div className="mode-selector mb-16">
                    <button className={`mode-btn${mode === 'MANUAL' ? ' active-manual' : ''}`} onClick={() => handleModeChange('MANUAL')} disabled={saving}>
                        🖐 Manual Mode
                    </button>
                    <button className={`mode-btn${mode === 'AUTO' ? ' active-auto' : ''}`} onClick={() => handleModeChange('AUTO')} disabled={saving}>
                        🤖 Auto Mode
                    </button>
                </div>
                {saved && <p style={{color:'var(--green)',fontSize:13}}>✓ Mode updated</p>}
                {saving && <div className="flex items-center gap-8"><span className="spinner" style={{borderTopColor:'var(--accent)'}}/> <span className="text-sm text-muted">Saving…</span></div>}
            </div>
        </div>
    );
}

// ─── Popup helper ─────────────────────────────────────────────────────────────
function Popup({ type, message, onClose }) {
    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup" onClick={e => e.stopPropagation()} style={{textAlign:'center'}}>
                <div className="popup-icon">{type === 'success' ? '✅' : '❌'}</div>
                <div className="popup-title">{type === 'success' ? 'Success' : 'Error'}</div>
                <div className="popup-body">{message}</div>
                <div className="popup-actions" style={{justifyContent:'center'}}>
                    <button className="btn btn-primary" onClick={onClose}>OK</button>
                </div>
            </div>
        </div>
    );
}
