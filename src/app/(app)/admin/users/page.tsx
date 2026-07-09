'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export default function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({ username: '', email: '', firstName: '', lastName: '', password: '', role: 'CAISSIER', phone: '', pointOfSaleId: '' })
  const [posList, setPosList] = useState<any[]>([])

  const fetchUsers = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    if (res.ok) setUsers((await res.json()).users || [])
    setLoading(false)
  }

  const fetchPos = async () => {
    const res = await fetch('/api/pointofsale')
    if (res.ok) setPosList((await res.json()).pointOfSales || [])
  }

  useEffect(() => { fetchUsers(); fetchPos() }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.firstName || !form.lastName || !form.password) {
      toast.error('Champs obligatoires'); return
    }
    setSaving(true)
    const res = await fetch('/api/admin/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, pointOfSaleId: form.pointOfSaleId ? parseInt(form.pointOfSaleId) : null }),
    })
    if (res.ok) {
      toast.success('Utilisateur créé'); setShowModal(false); setForm({ username: '', email: '', firstName: '', lastName: '', password: '', role: 'CAISSIER', phone: '', pointOfSaleId: '' })
      fetchUsers()
    } else { const d = await res.json(); toast.error(d.error || 'Erreur') }
    setSaving(false)
  }

  const handleToggle = async (id: number, isActive: boolean) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    if (res.ok) { toast.success('Statut modifié'); fetchUsers() }
    else toast.error('Erreur')
  }

  if (user?.role !== 'ADMIN') {
    return <div className="text-center py-12"><p className="text-gray-500 font-medium">Accès réservé à l'administrateur</p></div>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Utilisateurs</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nouvel utilisateur
        </button>
      </div>

      <div className="table-container">
        {loading ? <div className="loader py-12"><div className="loader-spinner" /></div>
        : users.length === 0 ? <div className="empty-state py-12"><p className="empty-state-title">Aucun utilisateur</p></div>
        : (
          <table className="table">
            <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Point de vente</th><th>Statut</th><th>Dernière connexion</th><th></th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="font-medium">{u.firstName} {u.lastName}</td>
                  <td className="text-xs">{u.email}</td>
                  <td><span className="badge-info">{u.role.replace(/_/g, ' ')}</span></td>
                  <td className="text-xs text-gray-500">{u.pointOfSale?.name || '—'}</td>
                  <td>{u.isActive ? <span className="badge-success">Actif</span> : <span className="badge-danger">Inactif</span>}</td>
                  <td className="text-xs text-gray-400">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('fr-FR') : 'Jamais'}</td>
                  <td>
                    <button onClick={() => handleToggle(u.id, u.isActive)} className={`btn-sm ${u.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}>
                      {u.isActive ? 'Désactiver' : 'Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">Nouvel utilisateur</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label><input type="text" className="input-field" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom</label><input type="text" className="input-field" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label><input type="text" className="input-field" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label><input type="password" className="input-field" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                  <select className="input-field" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                    <option value="ADMIN">Admin</option>
                    <option value="DIRECTION">Direction</option>
                    <option value="RESPONSABLE_STOCK">Resp. Stock</option>
                    <option value="RESPONSABLE_PRODUCTION">Resp. Production</option>
                    <option value="CAISSIER">Caissier</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label><input type="text" className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Point de vente</label>
                <select className="input-field" value={form.pointOfSaleId} onChange={e => setForm({...form, pointOfSaleId: e.target.value})}>
                  <option value="">—</option>
                  {posList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Annuler</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Création...' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
