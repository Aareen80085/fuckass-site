'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Skill, PortfolioItem, SocialLink } from '@/lib/store';
import toast from 'react-hot-toast';
import { saveUserToFirestore } from '@/lib/authService';

const SKILL_OPTIONS = ['Video Editing', 'Thumbnail Design', 'YouTube SEO', 'TikTok Reels', 'Instagram Reels', 'Scripting', 'Voiceover', 'Motion Graphics', 'Color Grading', 'Podcast Editing', 'Content Calendar', 'Analytics', 'Brand Strategy', 'Copywriting'];
type SocialPlatform = SocialLink['platform'];
const SOCIAL_PLATFORMS: SocialPlatform[] = ['youtube', 'instagram', 'tiktok', 'twitter', 'website'];

export default function ProfilePage() {
  const { currentUser, updateProfile } = useStore();
  const [activeSection, setActiveSection] = useState<'basic' | 'skills' | 'portfolio' | 'social'>('basic');
  const [saving, setSaving] = useState(false);

  // Basic
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [niche, setNiche] = useState(currentUser?.niche || '');

  // Skills
  const [skills, setSkills] = useState<Skill[]>(currentUser?.skills || []);
  const [customSkill, setCustomSkill] = useState('');

  // Portfolio
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(currentUser?.portfolio || []);
  const [newPortfolio, setNewPortfolio] = useState({ title: '', description: '', url: '', type: 'link' as PortfolioItem['type'] });
  const [addingPortfolio, setAddingPortfolio] = useState(false);

  // Social
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(currentUser?.socialLinks || []);
  const [newSocial, setNewSocial] = useState<SocialLink>({ platform: 'youtube', url: '', followers: undefined, engagementRate: undefined });

  function calcScore() {
    let score = 20;
    if (bio.length > 50) score += 15;
    if (niche) score += 10;
    score += Math.min(20, skills.length * 4);
    score += Math.min(15, portfolio.length * 5);
    score += Math.min(15, socialLinks.length * 5);
    return Math.min(100, score);
  }

  async function save() {
    setSaving(true);
    const score = calcScore();
    const data = { displayName, bio, niche, skills, portfolio, socialLinks, profileScore: score };
    
    // Update local store
    updateProfile(data);
    
    // Persist to database if user is logged in natively
    if (currentUser?.id) {
      try {
        await saveUserToFirestore(currentUser.id, data);
        toast.success('Profile updated & saved to Database! ✨');
      } catch (err) {
        toast.error('Local update success, but failed to save to Database.');
      }
    } else {
      toast.success('Profile updated! ✨');
    }
    
    setSaving(false);
  }

  function addSkill(name: string) {
    if (!name.trim() || skills.find(s => s.name.toLowerCase() === name.toLowerCase())) return;
    setSkills(prev => [...prev, { name, level: 'intermediate' }]);
  }

  function updateSkillLevel(idx: number, level: Skill['level']) {
    setSkills(prev => prev.map((s, i) => i === idx ? { ...s, level } : s));
  }

  function removeSkill(idx: number) {
    setSkills(prev => prev.filter((_, i) => i !== idx));
  }

  function addPortfolio() {
    if (!newPortfolio.title || !newPortfolio.url) return;
    setPortfolio(prev => [...prev, { ...newPortfolio, id: `p-${Date.now()}` }]);
    setNewPortfolio({ title: '', description: '', url: '', type: 'link' });
    setAddingPortfolio(false);
  }

  function addSocialLink() {
    if (!newSocial.url) return;
    const exists = socialLinks.findIndex(s => s.platform === newSocial.platform);
    if (exists >= 0) {
      setSocialLinks(prev => prev.map((s, i) => i === exists ? { ...newSocial } : s));
    } else {
      setSocialLinks(prev => [...prev, { ...newSocial }]);
    }
    setNewSocial({ platform: 'youtube', url: '', followers: undefined, engagementRate: undefined });
    toast.success('Social link added!');
  }

  const levelColors = { beginner: 'badge-cyan', intermediate: 'badge-amber', expert: 'badge-emerald' };
  const socialIcons: Record<string, string> = { youtube: '📺', instagram: '📸', tiktok: '🎵', twitter: '🐦', website: '🌐' };

  const score = calcScore();

  return (
    <div className="dashboard-content" style={{ animation: 'fadeIn 0.4s ease' }}>
      
      {/* Premium Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
        <div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, background: 'linear-gradient(135deg, #fff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em', marginBottom: 4 }}>
            Profile Arsenal
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500 }}>
            Optimize your digital presence and attract high-ticket clients.
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={save} 
          disabled={saving} 
          style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: 999, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', transform: saving ? 'scale(0.98)' : 'scale(1)', boxShadow: '0 0 30px rgba(124, 58, 237, 0.4), inset 0 1px 1px rgba(255,255,255,0.2)' }}
        >
          {saving ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Syncing Core...</> : '💾 Save Profile'}
        </button>
      </div>

      {/* Hero Score Banner */}
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: 40, marginBottom: 40, display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)' }}>
        {/* Dynamic Glow Orbs */}
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '50%', height: '150%', background: score >= 80 ? 'var(--emerald)' : score >= 60 ? 'var(--amber)' : 'var(--purple)', opacity: 0.15, filter: 'blur(100px)', zIndex: 0, borderRadius: '50%', pointerEvents: 'none', transition: 'background 1s ease' }} />
        
        <div className="score-circle" style={{ zIndex: 1, filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))', transform: 'scale(1.1)' }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            <circle cx="50" cy="50" r="42" fill="none" stroke={score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#a855f7'} strokeWidth="6" strokeLinecap="round" strokeDasharray="263.9" strokeDashoffset={263.9 - 263.9 * score / 100} style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1), stroke 1s ease' }}/>
          </svg>
          <div className="score-text">
            <span className="score-value" style={{ fontSize: '1.6rem', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{score}</span>
            <span className="score-label" style={{ opacity: 0.8 }}>Score</span>
          </div>
        </div>

        <div style={{ flex: 1, zIndex: 1 }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 12, color: '#fff' }}>Profile Architecture</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 20, maxWidth: 500 }}>
            {score >= 80 ? "Your profile is elite. You're fully optimized to attract top-tier clients on Facet." : "Complete the missing modules below to boost your ranking in search results and client recommendations."}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[
              { label: 'Bio', done: bio.length > 50 },
              { label: 'Niche', done: !!niche },
              { label: 'Skills', done: skills.length > 0 },
              { label: 'Portfolio', done: portfolio.length > 0 },
              { label: 'Social Graph', done: socialLinks.length > 0 },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, background: item.done ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${item.done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)'}`, transition: 'all 0.3s ease' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.done ? 'var(--emerald)' : 'var(--text-muted)', boxShadow: item.done ? '0 0 10px var(--emerald)' : 'none' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: item.done ? 'var(--emerald)' : 'var(--text-muted)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Segmented Control Navigation */}
      <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: 6, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 32, gap: 4, overflowX: 'auto' }}>
        {([['basic','👤 Identity'],['skills','⚡ Capabilities'],['portfolio','🖼️ Showroom'],['social','🌐 Social Graph']] as const).map(([s, label]) => (
          <button 
            key={s} 
            onClick={() => setActiveSection(s)} 
            style={{ 
              flex: 1, minWidth: 120, padding: '12px 20px', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 600, 
              background: activeSection === s ? 'rgba(255,255,255,0.1)' : 'transparent', 
              color: activeSection === s ? '#fff' : 'var(--text-muted)',
              boxShadow: activeSection === s ? '0 4px 12px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.1)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' 
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative' }}>
        
        {/* Basic Info */}
        {activeSection === 'basic' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="glass-card" style={{ padding: 40, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              
              <div style={{ display: 'flex', gap: 40, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
                <label className="group" style={{ position: 'relative', cursor: 'pointer', display: 'flex', width: 'max-content' }}>
                  <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #ec4899, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', fontWeight: 800, color: '#fff', boxShadow: '0 10px 30px rgba(124, 58, 237, 0.4)', transition: 'all 0.3s ease', overflow: 'hidden' }}>
                    {currentUser?.photoURL ? (
                      <img src={currentUser.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      displayName?.[0]?.toUpperCase() || '?'
                    )}
                  </div>
                  <div style={{ position: 'absolute', bottom: -5, right: -5, background: 'var(--bg-secondary)', borderRadius: '50%', padding: 4 }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', transition: 'all 0.2s', fontSize: '1.1rem' }}>
                      📷
                    </div>
                  </div>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) return toast.error('Image must be less than 2MB');
                    
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const dataUrl = event.target?.result as string;
                      updateProfile({ photoURL: dataUrl } as any);
                      toast.success('Profile picture updated locally! Click save to keep it.');
                    };
                    reader.readAsDataURL(file);
                  }} />
                </label>
                
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
                  <div className="input-group">
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 4 }}>Display Name</label>
                    <input type="text" className="input-field" style={{ padding: '14px 20px', fontSize: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)' }} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name or brand name" />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 4 }}>Specialty Niche</label>
                    <input type="text" className="input-field" style={{ padding: '14px 20px', fontSize: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)' }} value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g. YouTube Growth & Video Editing" />
                  </div>
                </div>
              </div>

              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Professional Bio</label>
                  <span style={{ fontSize: '0.75rem', color: bio.length > 500 ? 'var(--red)' : 'var(--text-muted)' }}>{bio.length} / 500</span>
                </div>
                <textarea className="input-field" style={{ minHeight: 160, padding: '16px 20px', fontSize: '0.95rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', lineHeight: 1.6 }} value={bio} onChange={e => setBio(e.target.value)} placeholder="Write a compelling bio that explains who you are and what value you bring to clients. The AI Agent will read this directly." maxLength={500} />
              </div>
            </div>
          </div>
        )}

        {/* Skills */}
        {activeSection === 'skills' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="glass-card" style={{ padding: 40, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              
              <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 300 }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: 6 }}>Active Capabilities</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>Set up your technical stack so clients can instantly filter for your services.</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {skills.length === 0 && (
                      <div style={{ padding: 30, textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '2rem', display: 'block', marginBottom: 10, opacity: 0.5 }}>⚡</span>
                        <p style={{ color: 'var(--text-muted)' }}>No capabilities registered yet.</p>
                      </div>
                    )}
                    {skills.map((skill, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, transition: 'all 0.2s', ':hover': { background: 'rgba(255,255,255,0.04)' } } as React.CSSProperties}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: skill.level === 'expert' ? 'var(--emerald)' : skill.level === 'intermediate' ? 'var(--amber)' : 'var(--cyan)', boxShadow: `0 0 10px ${skill.level === 'expert' ? 'var(--emerald)' : skill.level === 'intermediate' ? 'var(--amber)' : 'var(--cyan)'}` }} />
                          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{skill.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ background: 'rgba(0,0,0,0.4)', padding: 4, borderRadius: 10, display: 'flex', gap: 4 }}>
                            {(['beginner','intermediate','expert'] as Skill['level'][]).map(lvl => (
                              <button key={lvl} onClick={() => updateSkillLevel(i, lvl)} style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: skill.level === lvl ? 'rgba(255,255,255,0.1)' : 'transparent', color: skill.level === lvl ? '#fff' : 'var(--text-muted)' }}>
                                {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                              </button>
                            ))}
                          </div>
                          <button onClick={() => removeSkill(i)} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(239,68,68,0.1)', color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ width: 320, background: 'rgba(0,0,0,0.2)', padding: 30, borderRadius: 24, border: '1px solid rgba(255,255,255,0.03)' }}>
                  <h4 style={{ marginBottom: 16, color: '#fff', fontSize: '1rem' }}>Add New Capability</h4>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                    <input type="text" style={{ flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', outline: 'none' }} placeholder="e.g. 3D Animation" value={customSkill} onChange={e => setCustomSkill(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { addSkill(customSkill); setCustomSkill(''); } }} />
                    <button className="btn btn-primary" style={{ padding: '0 16px', borderRadius: 12 }} onClick={() => { addSkill(customSkill); setCustomSkill(''); }}>Add</button>
                  </div>

                  <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Suggested</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {SKILL_OPTIONS.filter(s => !skills.find(sk => sk.name === s)).slice(0, 10).map(s => (
                      <button key={s} onClick={() => addSkill(s)} style={{ padding: '8px 14px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: 'var(--purple-light)', borderRadius: 999, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Showroom */}
        {activeSection === 'portfolio' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 4 }}>Visual Showroom</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Upload your highest converting work.</p>
              </div>
              <button className="btn" style={{ background: '#fff', color: '#000', borderRadius: 12, fontWeight: 700, padding: '12px 24px' }} onClick={() => setAddingPortfolio(!addingPortfolio)}>
                {addingPortfolio ? 'Cancel' : '+ New Artifact'}
              </button>
            </div>

            {addingPortfolio && (
              <div className="glass-card" style={{ padding: 32, marginBottom: 32, borderTop: '1px solid var(--purple)', background: 'linear-gradient(to bottom, rgba(124,58,237,0.05), rgba(0,0,0,0.2))' }}>
                <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
                  <div className="input-group">
                    <label style={{ color: '#fff' }}>Artifact Title</label>
                    <input type="text" className="input-field" placeholder="e.g. MrBeast Edit - 15M Views" value={newPortfolio.title} onChange={e => setNewPortfolio(p => ({ ...p, title: e.target.value }))} style={{ background: 'rgba(0,0,0,0.3)' }} />
                  </div>
                  <div className="input-group">
                    <label style={{ color: '#fff' }}>Format Category</label>
                    <select className="input-field" value={newPortfolio.type} onChange={e => setNewPortfolio(p => ({ ...p, type: e.target.value as PortfolioItem['type'] }))} style={{ background: 'rgba(0,0,0,0.3)' }}>
                      <option value="video">Short-form Video / Reel</option>
                      <option value="image">Thumbnail / Graphic</option>
                      <option value="design">UI/UX Design</option>
                      <option value="link">External Link / Website</option>
                    </select>
                  </div>
                </div>
                <div className="input-group" style={{ marginBottom: 24 }}>
                  <label style={{ color: '#fff' }}>Asset URL</label>
                  <input type="url" className="input-field" placeholder="https://..." value={newPortfolio.url} onChange={e => setNewPortfolio(p => ({ ...p, url: e.target.value }))} style={{ background: 'rgba(0,0,0,0.3)' }} />
                </div>
                <div className="input-group" style={{ marginBottom: 32 }}>
                  <label style={{ color: '#fff' }}>Impact Description</label>
                  <textarea className="input-field" placeholder="Describe the ROI this brought the client (e.g. boosted retention by 25%)..." value={newPortfolio.description} onChange={e => setNewPortfolio(p => ({ ...p, description: e.target.value }))} style={{ background: 'rgba(0,0,0,0.3)', minHeight: 80 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-primary" onClick={addPortfolio} style={{ padding: '12px 32px' }}>Mint Artifact to Showroom</button>
                </div>
              </div>
            )}

            {portfolio.length === 0 && !addingPortfolio ? (
              <div style={{ padding: '100px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '4rem', marginBottom: 16, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}>🔮</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 8, color: '#fff' }}>Your showroom is empty</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 24, maxWidth: 400, margin: '0 auto' }}>Top-earning creators on Facet have at least 3 artifacts in their visual showroom.</p>
                <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }} onClick={() => setAddingPortfolio(true)}>Upload First Artifact</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                {portfolio.map(item => {
                  const typeStyles: Record<string, { icon: string, bg: string, color: string }> = { 
                    video: { icon: '🎥', bg: 'rgba(236,72,153,0.1)', color: 'var(--pink)' }, 
                    image: { icon: '🖼️', bg: 'rgba(16,185,129,0.1)', color: 'var(--emerald)' }, 
                    design: { icon: '✨', bg: 'rgba(124,58,237,0.1)', color: 'var(--purple-light)' }, 
                    link: { icon: '🔗', bg: 'rgba(6,182,212,0.1)', color: 'var(--cyan)' } 
                  };
                  const style = typeStyles[item.type] || typeStyles.link;
                  
                  return (
                    <div key={item.id} className="glass-card" style={{ position: 'relative', overflow: 'hidden', padding: 24, transition: 'all 0.3s ease', cursor: 'grab' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: style.color }} />
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                            {style.icon}
                          </div>
                          <div>
                            <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.2 }}>{item.title}</h4>
                            <span style={{ fontSize: '0.75rem', color: style.color, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{item.type}</span>
                          </div>
                        </div>
                        <button onClick={() => setPortfolio(prev => prev.filter(p => p.id !== item.id))} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', transition: 'color 0.2s', padding: 4 }}>✕</button>
                      </div>
                      
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20, maxHeight: 60, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                        {item.description}
                      </p>
                      
                      <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: 8, color: '#fff', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, transition: 'background 0.2s' }}>
                        Open Link ↗
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Social Graph */}
        {activeSection === 'social' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="glass-card" style={{ padding: 40, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              
              <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 300 }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: 6 }}>Social Graph Integrations</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 32 }}>Linking your platforms drastically improves AI audit accuracy and gig placement.</p>
                  
                  <div style={{ display: 'grid', gap: 16 }}>
                    {socialLinks.length === 0 && (
                      <div style={{ padding: 40, textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 20, border: '1px dashed rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 12, opacity: 0.5 }}>🌐</span>
                        <p style={{ color: 'var(--text-muted)' }}>No accounts linked. You are virtually a ghost.</p>
                      </div>
                    )}
                    {socialLinks.map((link, i) => {
                      const platformColors: Record<string, string> = { youtube: '#ef4444', instagram: '#ec4899', tiktok: '#06b6d4', twitter: '#3b82f6', website: '#a855f7' };
                      const color = platformColors[link.platform] || '#a855f7';
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 24, background: 'linear-gradient(90deg, rgba(255,255,255,0.02), rgba(0,0,0,0.2))', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: color }} />
                          
                          <div style={{ width: 50, height: 50, borderRadius: 16, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', border: `1px solid ${color}44` }}>
                            {socialIcons[link.platform] || '🔗'}
                          </div>
                          
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                              <h4 style={{ color: '#fff', textTransform: 'capitalize', fontSize: '1.1rem' }}>{link.platform}</h4>
                              <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: color, fontSize: '0.8rem', textDecoration: 'none' }}>Verify ↗</a>
                            </div>
                            <div style={{ display: 'flex', gap: 16, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                              <span><strong style={{ color: '#fff' }}>{link.followers ? link.followers.toLocaleString() : '---'}</strong> followers</span>
                              {link.engagementRate && <span><strong style={{ color: '#fff' }}>{link.engagementRate}%</strong> engagement</span>}
                            </div>
                          </div>

                          <button onClick={() => setSocialLinks(prev => prev.filter((_, j) => j !== i))} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-muted)', width: 40, height: 40, borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div style={{ width: 340, background: 'rgba(0,0,0,0.2)', padding: 32, borderRadius: 24, border: '1px solid var(--border)' }}>
                  <h4 style={{ marginBottom: 20, color: '#fff', fontSize: '1.05rem' }}>Link New Account</h4>
                  
                  <div className="input-group" style={{ marginBottom: 16 }}>
                    <label>Platform Identity</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 4 }}>
                      {SOCIAL_PLATFORMS.map(p => (
                        <button key={p} onClick={() => setNewSocial(prev => ({ ...prev, platform: p }))} style={{ padding: '10px 0', background: newSocial.platform === p ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.3)', border: `1px solid ${newSocial.platform === p ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.05)'}`, borderRadius: 12, color: newSocial.platform === p ? '#fff' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: '1.2rem', filter: newSocial.platform === p ? 'none' : 'grayscale(100%)' }}>{socialIcons[p]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="input-group" style={{ marginBottom: 16 }}>
                    <label>Profile URL</label>
                    <input type="url" className="input-field" placeholder="https://..." value={newSocial.url} onChange={e => setNewSocial(p => ({ ...p, url: e.target.value }))} style={{ background: 'rgba(0,0,0,0.3)' }} />
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                    <div className="input-group" style={{ flex: 1 }}>
                      <label>Followers</label>
                      <input type="number" className="input-field" placeholder="e.g. 50k" value={newSocial.followers || ''} onChange={e => setNewSocial(p => ({ ...p, followers: Number(e.target.value) }))} style={{ background: 'rgba(0,0,0,0.3)' }} />
                    </div>
                    <div className="input-group" style={{ flex: 1 }}>
                      <label>ER %</label>
                      <input type="number" className="input-field" placeholder="e.g. 4.5" step="0.1" value={newSocial.engagementRate || ''} onChange={e => setNewSocial(p => ({ ...p, engagementRate: Number(e.target.value) }))} style={{ background: 'rgba(0,0,0,0.3)' }} />
                    </div>
                  </div>

                  <button className="btn btn-primary" onClick={addSocialLink} disabled={!newSocial.url} style={{ width: '100%', padding: '14px 0' }}>Connect Identity</button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
