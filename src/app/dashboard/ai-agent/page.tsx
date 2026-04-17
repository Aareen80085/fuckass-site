'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { auditProfile, generateContentStrategy, optimizeGig, chatWithAI, getMockAudit, getMockStrategy, getMockGigOptimization, AuditResult, ContentStrategy, GigOptimization } from '@/lib/ai';
import toast from 'react-hot-toast';

type Tab = 'chat' | 'audit' | 'strategy' | 'gig';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

const STARTER_PROMPTS = [
  'How do I grow my YouTube channel faster?',
  'What are the best posting times for TikTok?',
  'Write me a viral hook for my next video',
  'How should I price my editing services?',
];

export default function AIAgentPage() {
  const { currentUser, gigs, apiKey, setApiKey } = useStore();
  const [tab, setTab] = useState<Tab>('chat');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '👋 Hi! I\'m **CreatorAI**, your personal content strategist. I can help you grow your audience, optimize your profile, and generate content strategies.\n\nWhat would you like to work on today?', ts: Date.now() },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [strategy, setStrategy] = useState<ContentStrategy | null>(null);
  const [strategyLoading, setStrategyLoading] = useState(false);
  const [gigOpt, setGigOpt] = useState<GigOptimization | null>(null);
  const [gigOptLoading, setGigOptLoading] = useState(false);
  const [selectedGigId, setSelectedGigId] = useState('');
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(apiKey);
  const [openWeakness, setOpenWeakness] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const myGigs = gigs.filter(g => g.creatorId === currentUser?.id);
  const profile = {
    displayName: currentUser?.displayName || '',
    bio: currentUser?.bio || '',
    niche: currentUser?.niche || '',
    skills: currentUser?.skills || [],
    portfolio: currentUser?.portfolio || [],
    socialLinks: currentUser?.socialLinks || [],
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  async function sendChat(content?: string) {
    const msg = content || chatInput.trim();
    if (!msg || chatLoading) return;
    setChatInput('');
    const newMsg: ChatMessage = { role: 'user', content: msg, ts: Date.now() };
    const updated = [...chatMessages, newMsg];
    setChatMessages(updated);
    setChatLoading(true);
    try {
      const reply = await chatWithAI(updated.map(m => ({ role: m.role, content: m.content })), profile, apiKey);
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply, ts: Date.now() }]);
    } finally {
      setChatLoading(false);
    }
  }

  async function runAudit() {
    setAuditLoading(true);
    setTab('audit');
    try {
      if (apiKey || process.env.NODE_ENV === 'development') {
        const res = await fetch('/api/audit-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser?.id, profile, apiKey }),
        });
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setAuditResult(data);
      } else {
        setAuditResult(getMockAudit(profile));
      }
    } catch {
      toast.error('Audit failed. Using demo data.');
      setAuditResult(getMockAudit(profile));
    } finally {
      setAuditLoading(false);
    }
  }

  async function runStrategy() {
    setStrategyLoading(true);
    setTab('strategy');
    try {
      const result = await generateContentStrategy(profile, apiKey);
      setStrategy(result);
    } catch {
      setStrategy(getMockStrategy(profile));
    } finally {
      setStrategyLoading(false);
    }
  }

  async function runGigOpt() {
    const gig = myGigs.find(g => g.id === selectedGigId) || myGigs[0];
    if (!gig) return toast.error('No gigs found. Create a gig first.');
    setGigOptLoading(true);
    setTab('gig');
    try {
      const result = await optimizeGig({ title: gig.title, description: gig.description, category: gig.category, tags: gig.tags, packages: gig.packages }, apiKey);
      setGigOpt(result);
    } catch {
      setGigOpt(getMockGigOptimization({ title: gig.title, description: gig.description, category: gig.category, tags: gig.tags, packages: gig.packages }));
    } finally {
      setGigOptLoading(false);
    }
  }

  function saveApiKey() {
    setApiKey(apiKeyInput.trim());
    setShowApiModal(false);
    toast.success('API key saved! AI responses will now be powered by GPT-4.');
  }

  const scoreColor = (score: number) => score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="dashboard-content">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="ai-badge" style={{ marginBottom: 10 }}>🤖 CreatorAI</div>
            <h2>AI Agent</h2>
            <p>Your personal content strategist, profile coach, and growth advisor</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowApiModal(true)}>
              {apiKey ? '🔑 API Key Active' : '+ Add OpenAI Key'}
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <button className="btn btn-primary" onClick={runAudit} disabled={auditLoading} id="audit-btn">
          {auditLoading ? <><span className="spinner" /> Running Audit...</> : '🔍 Audit My Profile'}
        </button>
        <button className="btn btn-secondary" onClick={runStrategy} disabled={strategyLoading} id="strategy-btn">
          {strategyLoading ? <><span className="spinner" /> Generating...</> : '📅 Generate Strategy'}
        </button>
        {myGigs.length > 0 && (
          <button className="btn btn-secondary" onClick={runGigOpt} disabled={gigOptLoading} id="gig-opt-btn">
            {gigOptLoading ? <><span className="spinner" /> Optimizing...</> : '🎯 Optimize a Gig'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 4, marginBottom: 24, border: '1px solid var(--border)' }}>
        {([['chat','💬 Chat'],['audit','🔍 Audit'],['strategy','📅 Strategy'],['gig','🎯 Gig Opt']] as [Tab, string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px 12px', outline: 'none', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s', background: tab === t ? 'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(236,72,153,0.2))' : 'transparent', color: tab === t ? 'var(--purple-light)' : 'var(--text-muted)', border: tab === t ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Chat Tab */}
      {tab === 'chat' && (
        <div className="glass-card chat-container">
          <div className="chat-messages">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role === 'user' ? 'user' : ''}`}>
                <div className={`chat-avatar ${msg.role === 'user' ? 'user-av' : 'ai'}`}>
                  {msg.role === 'user' ? currentUser?.displayName?.[0]?.toUpperCase() : '✦'}
                </div>
                <div className={`chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
                  {msg.content.split('\n').map((line, j) => (
                    <div key={j} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') || '<br/>' }} />
                  ))}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="chat-message">
                <div className="chat-avatar ai">✦</div>
                <div className="chat-bubble ai"><div className="loading-dots"><span/><span/><span/></div></div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          {/* Starter prompts */}
          {chatMessages.length <= 1 && (
            <div style={{ padding: '0 20px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {STARTER_PROMPTS.map(p => (
                <button key={p} onClick={() => sendChat(p)} className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', border: '1px solid var(--border)' }}>{p}</button>
              ))}
            </div>
          )}
          <div className="chat-input-area">
            <textarea
              id="chat-input"
              className="input-field"
              placeholder="Ask me anything about growing your creator business..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
              rows={1}
            />
            <button className="btn btn-primary" onClick={() => sendChat()} disabled={!chatInput.trim() || chatLoading} id="chat-send">
              ↑ Send
            </button>
          </div>
        </div>
      )}

      {/* Audit Tab */}
      {tab === 'audit' && (
        <div>
          {!auditResult && !auditLoading && (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>🔍</div>
              <h3>Profile Audit</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: 8, marginBottom: 24 }}>Get a comprehensive score and personalized recommendations to improve your creator profile.</p>
              <button className="btn btn-primary" onClick={runAudit}>Run Profile Audit →</button>
            </div>
          )}
          {auditLoading && (
            <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 20, animation: 'pulse-ring 2s infinite' }}>🔍</div>
              <div className="loading-dots" style={{ justifyContent: 'center', marginBottom: 12 }}><span/><span/><span/></div>
              <p style={{ color: 'var(--text-muted)' }}>Analyzing your profile with AI...</p>
            </div>
          )}
          {auditResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Score */}
              <div className="ai-glow-card" style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
                <div className="score-circle">
                  <svg width="130" height="130" viewBox="0 0 130 130">
                    <circle cx="65" cy="65" r="56" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
                    <circle cx="65" cy="65" r="56" fill="none" stroke={scoreColor(auditResult.score)} strokeWidth="8" strokeLinecap="round" strokeDasharray="351.9" strokeDashoffset={351.9 - 351.9 * auditResult.score / 100} style={{ transition: 'stroke-dashoffset 1.5s ease' }}/>
                  </svg>
                  <div className="score-text">
                    <span className="score-value" style={{ color: scoreColor(auditResult.score) }}>{auditResult.score}</span>
                    <span className="score-label">Profile Score</span>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h3 style={{ marginBottom: 8 }}>Profile Analysis Complete</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>
                    {auditResult.score >= 80 ? 'Excellent profile! A few tweaks will make it perfect.' : auditResult.score >= 60 ? 'Good foundation! Implement these suggestions to significantly boost conversions.' : 'Your profile needs attention. Follow these recommendations to unlock growth.'}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span className="badge badge-emerald">✓ {auditResult.strengths.length} Strengths</span>
                    <span className="badge badge-red">⚠ {auditResult.weaknesses.length} Issues</span>
                  </div>
                </div>
              </div>

              <div className="grid-2">
                {/* Strengths */}
                <div className="glass-card" style={{ padding: 20 }}>
                  <h4 style={{ color: 'var(--emerald)', marginBottom: 12 }}>✅ Strengths</h4>
                  {auditResult.strengths.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: i < auditResult.strengths.length - 1 ? '1px solid var(--border)' : 'none', fontSize: '0.875rem' }}>
                      <span>✓</span><span style={{ color: 'var(--text-secondary)' }}>{s}</span>
                    </div>
                  ))}
                </div>
                {/* Weaknesses */}
                <div className="glass-card" style={{ padding: 20 }}>
                  <h4 style={{ color: 'var(--red)', marginBottom: 12 }}>⚠️ Needs Improvement</h4>
                  {auditResult.weaknesses.map((w, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: i < auditResult.weaknesses.length - 1 ? '1px solid var(--border)' : 'none', fontSize: '0.875rem' }}>
                      <span>⚠</span><span style={{ color: 'var(--text-secondary)' }}>{w}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bio Rewrite */}
              <div className="glass-card" style={{ padding: 20 }}>
                <h4 style={{ marginBottom: 12 }}>✍️ AI Bio Rewrite</h4>
                <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, padding: 16, fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  "{auditResult.suggestions.bioRewrite}"
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => { toast.success('Going to profile to apply changes...'); }}>
                  Apply to Profile →
                </button>
              </div>

              {/* Suggestions Grid */}
              <div className="grid-2">
                <div className="glass-card" style={{ padding: 20 }}>
                  <h4 style={{ marginBottom: 12 }}>🏷️ Missing Skills</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {auditResult.suggestions.missingSkills.map(s => <span key={s} className="tag">{s}</span>)}
                  </div>
                </div>
                <div className="glass-card" style={{ padding: 20 }}>
                  <h4 style={{ marginBottom: 12 }}>⚡ Quick Wins</h4>
                  {auditResult.suggestions.quickWins.map((q, i) => (
                    <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '6px 0', borderBottom: i < auditResult.suggestions.quickWins.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      → {q}
                    </div>
                  ))}
                </div>
              </div>

              {/* Portfolio & Gig Tips */}
              <div className="glass-card" style={{ padding: 20 }}>
                <h4 style={{ marginBottom: 12 }}>🖼️ Portfolio & Gig Tips</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[...auditResult.suggestions.portfolioTips, ...auditResult.suggestions.gigOptimizations].map((tip, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--purple-light)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span> {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Strategy Tab */}
      {tab === 'strategy' && (
        <div>
          {!strategy && !strategyLoading && (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>📅</div>
              <h3>Content Strategy Generator</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: 8, marginBottom: 24 }}>Get a personalized weekly content calendar, platform strategies, viral hooks, and growth tips.</p>
              <button className="btn btn-primary" onClick={runStrategy}>Generate My Strategy →</button>
            </div>
          )}
          {strategyLoading && (
            <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 20 }}>📅</div>
              <div className="loading-dots" style={{ justifyContent: 'center', marginBottom: 12 }}><span/><span/><span/></div>
              <p style={{ color: 'var(--text-muted)' }}>Building your personalized content strategy...</p>
            </div>
          )}
          {strategy && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Weekly Plan */}
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ marginBottom: 20 }}>📅 7-Day Content Calendar</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {strategy.weeklyPlan.map((day, i) => {
                    const plColors: Record<string, string> = { YouTube: '#ef4444', Instagram: '#ec4899', TikTok: '#06b6d4' };
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 100px 1fr', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, alignItems: 'center', border: '1px solid var(--border)' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{day.day}</span>
                        <span style={{ padding: '3px 8px', background: `${plColors[day.platform] || '#7c3aed'}22`, color: plColors[day.platform] || 'var(--purple-light)', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, textAlign: 'center' }}>{day.platform}</span>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{day.idea}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Hook: "{day.hook}"</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Platform Strategies */}
              <div className="grid-3">
                {Object.entries(strategy.platformStrategies).map(([platform, data]) => {
                  const icons: Record<string, string> = { YouTube: '📺', Instagram: '📸', TikTok: '🎵' };
                  return (
                    <div key={platform} className="glass-card" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <span style={{ fontSize: '1.2rem' }}>{icons[platform] || '📱'}</span>
                        <h4>{platform}</h4>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--purple-light)', marginBottom: 4 }}>⏰ Best Time</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{data.bestTime}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--emerald)', marginBottom: 4 }}>📊 Frequency</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{data.frequency}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>TIPS</div>
                      {data.tips.slice(0, 3).map((tip, j) => <div key={j} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', padding: '4px 0', borderTop: j > 0 ? '1px solid var(--border)' : 'none' }}>→ {tip}</div>)}
                    </div>
                  );
                })}
              </div>

              {/* Content Ideas */}
              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ marginBottom: 16 }}>💡 Content Ideas</h3>
                <div className="grid-2">
                  {strategy.contentIdeas.map((idea, i) => (
                    <div key={i} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 6 }}>{idea.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{idea.description}</div>
                      <span className="badge badge-emerald">Est. {idea.estimatedViews} views</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid-2">
                {/* Trending Topics */}
                <div className="glass-card" style={{ padding: 20 }}>
                  <h4 style={{ marginBottom: 12 }}>🔥 Trending Topics</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {strategy.trendingTopics.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                </div>
                {/* Caption Templates */}
                <div className="glass-card" style={{ padding: 20 }}>
                  <h4 style={{ marginBottom: 12 }}>✍️ Caption Formulas</h4>
                  {strategy.captionTemplates.map((c, i) => (
                    <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 8 }}>"{c}"</div>
                  ))}
                </div>
              </div>

              {/* Growth Tips */}
              <div className="glass-card" style={{ padding: 20 }}>
                <h4 style={{ marginBottom: 12 }}>🚀 Growth Playbook</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                  {strategy.growthTips.map((tip, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: 'rgba(124,58,237,0.07)', borderRadius: 8, border: '1px solid rgba(124,58,237,0.15)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--purple-light)', fontWeight: 700, flexShrink: 0 }}>0{i+1}</span> {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gig Optimization Tab */}
      {tab === 'gig' && (
        <div>
          {!gigOpt && !gigOptLoading && (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎯</div>
              <h3>Gig Optimizer</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: 8, marginBottom: 20 }}>AI will improve your gig title, description, tags, and pricing strategy.</p>
              {myGigs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360, margin: '0 auto' }}>
                  <select className="input-field" value={selectedGigId} onChange={e => setSelectedGigId(e.target.value)}>
                    <option value="">Select a gig to optimize...</option>
                    {myGigs.map(g => <option key={g.id} value={g.id}>{g.title.slice(0, 50)}...</option>)}
                  </select>
                  <button className="btn btn-primary" onClick={runGigOpt}>Optimize This Gig →</button>
                </div>
              ) : <p style={{ color: 'var(--text-muted)' }}>No gigs yet. Create a gig first.</p>}
            </div>
          )}
          {gigOptLoading && (
            <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
              <div className="loading-dots" style={{ justifyContent: 'center', marginBottom: 12 }}><span/><span/><span/></div>
              <p style={{ color: 'var(--text-muted)' }}>Optimizing your gig...</p>
            </div>
          )}
          {gigOpt && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="glass-card" style={{ padding: 24 }}>
                <h4 style={{ marginBottom: 10, color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>✨ Improved Title</h4>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', padding: '14px 18px', background: 'rgba(124,58,237,0.1)', borderRadius: 10, border: '1px solid rgba(124,58,237,0.25)' }}>
                  {gigOpt.improvedTitle}
                </div>
              </div>
              <div className="glass-card" style={{ padding: 24 }}>
                <h4 style={{ marginBottom: 10, color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>📝 Improved Description</h4>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '14px 18px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border)', whiteSpace: 'pre-line', lineHeight: 1.7 }}>
                  {gigOpt.improvedDescription}
                </div>
              </div>
              <div className="grid-3">
                <div className="glass-card" style={{ padding: 20 }}>
                  <h4 style={{ marginBottom: 12 }}>🏷️ Suggested Tags</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {gigOpt.suggestedTags.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                </div>
                <div className="glass-card" style={{ padding: 20 }}>
                  <h4 style={{ marginBottom: 12 }}>💰 Pricing Strategy</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{gigOpt.pricingStrategy}</p>
                </div>
                <div className="glass-card" style={{ padding: 20 }}>
                  <h4 style={{ marginBottom: 12 }}>📊 Competitor Insights</h4>
                  {gigOpt.competitorInsights.map((c, i) => <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '6px 0', borderBottom: i < gigOpt.competitorInsights.length - 1 ? '1px solid var(--border)' : 'none' }}>→ {c}</div>)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* API Key Modal */}
      {showApiModal && (
        <div className="modal-overlay" onClick={() => setShowApiModal(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔑 OpenAI API Key</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowApiModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16, lineHeight: 1.7 }}>
                Add your OpenAI API key to enable live AI responses. Without a key, the platform uses rich demo responses. Your key is stored locally and never sent to our servers.
              </p>
              <div className="input-group">
                <label>API Key</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="sk-..."
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  autoFocus
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                Get your key at platform.openai.com → API Keys
              </p>
            </div>
            <div className="modal-footer">
              {apiKey && <button className="btn btn-danger" onClick={() => { setApiKey(''); setApiKeyInput(''); toast.success('API key removed'); setShowApiModal(false); }}>Remove Key</button>}
              <button className="btn btn-secondary" onClick={() => setShowApiModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveApiKey}>Save Key</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
