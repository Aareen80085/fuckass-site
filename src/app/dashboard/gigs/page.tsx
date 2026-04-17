'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Gig } from '@/lib/store';
import toast from 'react-hot-toast';

const CATEGORIES = ['Video Editing', 'Thumbnail Design', 'Scripting', 'TikTok Reels', 'Instagram Content', 'YouTube Strategy', 'Social Media Management', 'Podcast Editing'];

const emptyPackage = { name: '', description: '', price: 0, deliveryDays: 3, revisions: 2, features: [] as string[] };

export default function GigsPage() {
  const { gigs, currentUser, addGig, updateGig, deleteGig, addOrder } = useStore();
  const isCreator = currentUser?.role === 'creator';
  
  const displayGigs = isCreator ? gigs.filter(g => g.status === 'active') : gigs.filter(g => g.creatorId === currentUser?.id);

  const [showModal, setShowModal] = useState(false);
  const [editingGig, setEditingGig] = useState<Gig | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [featureInputs, setFeatureInputs] = useState({ basic: '', standard: '', premium: '' });

  const [form, setForm] = useState({
    title: '', description: '', category: '', tags: [] as string[], status: 'active' as Gig['status'],
    packages: {
      basic: { ...emptyPackage, name: 'Basic' },
      standard: { ...emptyPackage, name: 'Standard' },
      premium: { ...emptyPackage, name: 'Premium' },
    },
  });

  function openCreate() {
    setEditingGig(null);
    setForm({ title: '', description: '', category: '', tags: [], status: 'active', packages: { basic: { ...emptyPackage, name: 'Basic' }, standard: { ...emptyPackage, name: 'Standard' }, premium: { ...emptyPackage, name: 'Premium' } } });
    setShowModal(true);
  }

  function openEdit(gig: Gig) {
    setEditingGig(gig);
    setForm({ title: gig.title, description: gig.description, category: gig.category, tags: gig.tags, status: gig.status, packages: { ...gig.packages } });
    setShowModal(true);
  }

  function addTag(e: React.KeyboardEvent) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      if (!form.tags.includes(tagInput.trim())) setForm(p => ({ ...p, tags: [...p.tags, tagInput.trim()] }));
      setTagInput('');
    }
  }

  function removeTag(tag: string) { setForm(p => ({ ...p, tags: p.tags.filter(t => t !== tag) })); }

  function addFeature(pkg: 'basic' | 'standard' | 'premium') {
    const val = featureInputs[pkg].trim();
    if (!val) return;
    setForm(p => ({ ...p, packages: { ...p.packages, [pkg]: { ...p.packages[pkg], features: [...p.packages[pkg].features, val] } } }));
    setFeatureInputs(p => ({ ...p, [pkg]: '' }));
  }

  function updatePackage(pkg: 'basic' | 'standard' | 'premium', field: string, value: any) {
    setForm(p => ({ ...p, packages: { ...p.packages, [pkg]: { ...p.packages[pkg], [field]: value } } }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.description || !form.category) return toast.error('Please fill in all required fields');
    if (editingGig) {
      updateGig(editingGig.id, { ...form });
      toast.success('Gig updated!');
    } else {
      addGig({ ...form, creatorId: currentUser!.id });
      toast.success('Gig created! 🎉');
    }
    setShowModal(false);
  }

  function handleOrder(gig: Gig) {
    if (!currentUser) return;
    addOrder({
      id: Math.random().toString(36).substring(7),
      gigId: gig.id,
      gigTitle: gig.title,
      creatorId: currentUser.id,
      clientId: gig.creatorId,
      clientName: 'Client',
      packageType: 'basic',
      amount: gig.packages.basic.price,
      status: 'pending',
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + gig.packages.basic.deliveryDays * 86400000).toISOString().split('T')[0]
    });
    toast.success('Job claimed successfully!');
  }

  function handleDelete(id: string) {
    if (window.confirm('Delete this gig? This cannot be undone.')) {
      deleteGig(id);
      toast.success('Gig deleted');
    }
  }

  function toggleStatus(gig: Gig) {
    const next = gig.status === 'active' ? 'paused' : 'active';
    updateGig(gig.id, { status: next });
    toast.success(`Gig ${next === 'active' ? 'activated' : 'paused'}`);
  }

  const statusColors: Record<string, string> = { active: 'badge-emerald', paused: 'badge-amber', draft: 'badge-gray' };

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2>{isCreator ? 'Explore Opportunities' : 'My Job Postings'}</h2>
            <p>{isCreator ? 'Find clients needing content creation services' : 'Post your content needs'}</p>
          </div>
          {!isCreator && <button className="btn btn-primary" onClick={openCreate} id="create-gig-btn">+ Post Job</button>}
        </div>
      </div>

      {displayGigs.length === 0 ? (
        <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>{isCreator ? '🔍' : '📋'}</div>
          <h3>No jobs available</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8, marginBottom: 24 }}>{isCreator ? 'No clients have posted active jobs right now.' : 'Create your first job posting to hire creators'}</p>
          {!isCreator && <button className="btn btn-primary" onClick={openCreate}>Create Your First Job →</button>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {displayGigs.map(gig => (
            <div key={gig.id} className="glass-card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                    <span className={`badge ${statusColors[gig.status]}`}>{gig.status}</span>
                    <span className="badge badge-purple">{gig.category}</span>
                    {gig.rating > 0 && <span style={{ fontSize: '0.8rem', color: 'var(--amber)' }}>★ {gig.rating.toFixed(1)}</span>}
                  </div>
                  <h3 style={{ fontSize: '1rem', marginBottom: 6, lineHeight: 1.4 }}>{gig.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>{gig.description.slice(0, 120)}...</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {gig.tags.slice(0, 5).map(t => <span key={t} className="tag" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{t}</span>)}
                  </div>
                </div>
                {/* Packages Summary */}
                <div style={{ display: 'flex', gap: 10 }}>
                  {(['basic','standard','premium'] as const).map(pkg => (
                    <div key={pkg} style={{ textAlign: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border)', minWidth: 70 }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>{pkg}</div>
                      <div style={{ fontWeight: 800, color: 'var(--emerald)', fontSize: '1.1rem' }}>${gig.packages[pkg].price}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)'}}>{gig.packages[pkg].deliveryDays}d</div>
                    </div>
                  ))}
                </div>
                {/* Stats */}
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{gig.views}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Views</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{gig.orders}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Orders</div>
                  </div>
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  {isCreator ? (
                    <button className="btn btn-primary" onClick={() => handleOrder(gig)} style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>Claim Job</button>
                  ) : (
                    <>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(gig)}>Edit</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleStatus(gig)}>{gig.status === 'active' ? 'Pause' : 'Activate'}</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(gig.id)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>{editingGig ? 'Edit Job' : 'Create New Job'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="input-group">
                  <label>Job Title *</label>
                  <input type="text" className="input-field" placeholder="I need someone to..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                </div>
                <div className="grid-2">
                  <div className="input-group">
                    <label>Category *</label>
                    <select className="input-field" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} required>
                      <option value="">Select category...</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Status</label>
                    <select className="input-field" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Gig['status'] }))}>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
                <div className="input-group">
                  <label>Description *</label>
                  <textarea className="input-field" placeholder="Describe your service in detail..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required style={{ minHeight: 100 }} />
                </div>
                <div className="input-group">
                  <label>Tags (press Enter to add)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, minHeight: 48 }}>
                    {form.tags.map(t => <span key={t} className="tag">{t}<button type="button" onClick={() => removeTag(t)}>✕</button></span>)}
                    <input style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.875rem', minWidth: 120, fontFamily: 'inherit' }} placeholder="Add tag..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} />
                  </div>
                </div>

                {/* Packages */}
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 12 }}>Packages</label>
                  <div className="grid-3">
                    {(['basic','standard','premium'] as const).map(pkg => (
                      <div key={pkg} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10 }}>
                        <div style={{ fontWeight: 700, textTransform: 'capitalize', marginBottom: 12, color: pkg === 'premium' ? 'var(--amber)' : pkg === 'standard' ? 'var(--purple-light)' : 'var(--text-secondary)' }}>{pkg}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <input className="input-field" style={{ padding: '7px 10px' }} placeholder="Description" value={form.packages[pkg].description} onChange={e => updatePackage(pkg, 'description', e.target.value)} />
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                            <input type="number" className="input-field" style={{ padding: '7px 10px' }} placeholder="Price $" value={form.packages[pkg].price || ''} onChange={e => updatePackage(pkg, 'price', Number(e.target.value))} />
                            <input type="number" className="input-field" style={{ padding: '7px 10px' }} placeholder="Days" value={form.packages[pkg].deliveryDays || ''} onChange={e => updatePackage(pkg, 'deliveryDays', Number(e.target.value))} />
                          </div>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <input className="input-field" style={{ padding: '7px 8px', flex: 1 }} placeholder="Add feature..." value={featureInputs[pkg]} onChange={e => setFeatureInputs(p => ({ ...p, [pkg]: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature(pkg); } }} />
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => addFeature(pkg)}>+</button>
                          </div>
                          {form.packages[pkg].features.map((f, i) => <div key={i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>✓ {f}</div>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingGig ? 'Update Job' : 'Post Job'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
