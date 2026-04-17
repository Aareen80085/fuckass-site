'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Order } from '@/lib/store';
import toast from 'react-hot-toast';

type StatusFilter = 'all' | Order['status'];

export default function OrdersPage() {
  const { orders, currentUser, updateOrderStatus } = useStore();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  const isCreator = currentUser?.role === 'creator';
  const myOrders = orders.filter(o => isCreator ? o.creatorId === currentUser?.id : o.clientId === currentUser?.id);
  const filtered = myOrders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch = o.gigTitle.toLowerCase().includes(search.toLowerCase()) || o.clientName.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const statusColors: Record<string, string> = {
    pending: 'badge-amber',
    in_progress: 'badge-cyan',
    delivered: 'badge-purple',
    completed: 'badge-emerald',
    cancelled: 'badge-red',
  };

  function markDelivered(id: string) {
    updateOrderStatus(id, 'delivered');
    toast.success('Order marked as delivered!');
  }

  function markComplete(id: string) {
    updateOrderStatus(id, 'completed');
    toast.success('Order completed! 🎉');
  }

  const counts = {
    all: myOrders.length,
    pending: myOrders.filter(o => o.status === 'pending').length,
    in_progress: myOrders.filter(o => o.status === 'in_progress').length,
    delivered: myOrders.filter(o => o.status === 'delivered').length,
    completed: myOrders.filter(o => o.status === 'completed').length,
    cancelled: myOrders.filter(o => o.status === 'cancelled').length,
  };

  const totalRevenue = myOrders.filter(o => o.status === 'completed').reduce((s, o) => s + (Number(o.amount) || 0), 0);

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2>{isCreator ? 'Orders' : 'My Orders'}</h2>
            <p>{isCreator ? `${myOrders.length} total orders · $${totalRevenue} earned` : `${myOrders.length} services ordered`}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: isCreator ? 'Total Revenue' : 'Total Spent', value: `$${myOrders.reduce((s,o) => o.status !== 'cancelled' ? s + (Number(o.amount) || 0) : s, 0)}`, color: 'emerald' },
          { label: 'Active', value: counts.in_progress + counts.pending, color: 'cyan' },
          { label: 'Completed', value: counts.completed, color: 'purple' },
          { label: 'Total Orders', value: counts.all, color: 'amber' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          className="input-field"
          placeholder="Search orders..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['all','pending','in_progress','delivered','completed','cancelled'] as StatusFilter[]).map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`} style={{ textTransform: 'capitalize' }}>
              {s.replace('_',' ')} {counts[s as keyof typeof counts] > 0 && `(${counts[s as keyof typeof counts]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
          <h3>No orders found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
            {myOrders.length === 0 ? 'No orders yet. They\'ll appear here once placed.' : 'No orders match your filters.'}
          </p>
        </div>
      ) : (
        <div className="glass-card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>{isCreator ? 'Client' : 'Creator'}</th>
                  <th>Package</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  {isCreator && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.gigTitle}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>#{order.id}</div>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{isCreator ? order.clientName : 'Alex Rivera'}</td>
                    <td><span className="badge badge-gray" style={{ textTransform: 'capitalize' }}>{order.packageType}</span></td>
                    <td style={{ fontWeight: 700, color: 'var(--emerald)' }}>${order.amount}</td>
                    <td style={{ fontSize: '0.8rem', color: order.status === 'in_progress' ? 'var(--amber)' : 'var(--text-secondary)' }}>{order.dueDate}</td>
                    <td><span className={`badge ${statusColors[order.status] || 'badge-gray'}`}>{order.status.replace('_', ' ')}</span></td>
                    {isCreator && (
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {order.status === 'in_progress' && (
                            <button className="btn btn-primary btn-sm" onClick={() => markDelivered(order.id)}>Deliver</button>
                          )}
                          {order.status === 'delivered' && (
                            <button className="btn btn-success btn-sm" onClick={() => markComplete(order.id)}>Complete</button>
                          )}
                          {(order.status === 'completed' || order.status === 'cancelled') && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.status}</span>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
