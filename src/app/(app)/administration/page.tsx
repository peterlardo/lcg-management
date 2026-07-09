'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export default function AdministrationPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState<any[]>([])
  const [pointsOfSale, setPointsOfSale] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchUsers()
      fetch('/api/pointofsale').then(r => r.json()).then(d => setPointsOfSale(d.pointsOfSale || []))
    }
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data.users || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((u: any) => {
    const matchSearch = !searchTerm || `${u.firstName} ${u.lastName} ${u.username} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase())
    const matchRole = !roleFilter || u.role === roleFilter
    return matchSearch && matchRole
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const data = Object.fromEntries(form)

    if (editingUser) {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('Utilisateur modifié')
        setShowUserModal(false)
        setEditingUser(null)
        fetchUsers()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Erreur')
      }
    } else {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('Utilisateur créé')
        setShowUserModal(false)
        fetchUsers()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Erreur')
      }
    }
  }

  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrateur',
    DIRECTION: 'Direction',
    RESPONSABLE_STOCK: 'Resp. Stock',
    RESPONSABLE_PRODUCTION: 'Resp. Production',
    CAISSIER: 'Caissier',
  }

  const roleColors: Record<string, string> = {
    ADMIN: 'badge-danger',
    DIRECTION: 'badge-info',
    RESPONSABLE_STOCK: 'badge-warning',
    RESPONSABLE_PRODUCTION: 'badge-warning',
    CAISSIER: 'badge-success',
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">Accès réservé à l'administrateur</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Administration</h1>
        <button onClick={() => { setEditingUser(null); setShowUserModal(true) }} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter
        </button>
      </div>

      <div className="tabs">
        <button onClick={() => setTab('users')} className={tab === 'users' ? 'tab-active' : 'tab'}>
          <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          Utilisateurs
        </button>
        <button onClick={() => setTab('settings')} className={tab === 'settings' ? 'tab-active' : 'tab'}>
          <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Paramètres
        </button>
      </div>

      {tab === 'users' && (
        <>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="input-field w-auto" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">Tous les rôles</option>
              <option value="ADMIN">Administrateur</option>
              <option value="DIRECTION">Direction</option>
              <option value="RESPONSABLE_STOCK">Responsable Stock</option>
              <option value="RESPONSABLE_PRODUCTION">Responsable Production</option>
              <option value="CAISSIER">Caissier</option>
            </select>
          </div>

          <div className="table-container">
            {loading ? (
              <div className="loader py-12">
                <div className="loader-spinner" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="empty-state py-12">
                <div className="empty-state-icon">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <p className="empty-state-title">Aucun utilisateur trouvé</p>
                <p className="empty-state-text">Modifiez vos critères de recherche ou créez un nouvel utilisateur.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Identifiant</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Point de vente</th>
                    <th>Statut</th>
                    <th className="text-right w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u: any) => (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                            u.role === 'ADMIN' ? 'bg-red-500' :
                            u.role === 'DIRECTION' ? 'bg-blue-500' :
                            u.role === 'RESPONSABLE_STOCK' ? 'bg-amber-500' :
                            u.role === 'RESPONSABLE_PRODUCTION' ? 'bg-purple-500' :
                            'bg-emerald-500'
                          }`}>
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{u.firstName} {u.lastName}</p>
                            <p className="text-xs text-gray-400">{u.phone || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-xs">{u.username}</td>
                      <td className="text-sm">{u.email}</td>
                      <td>
                        <span className={roleColors[u.role] || 'badge'}>{roleLabels[u.role] || u.role}</span>
                      </td>
                      <td className="text-sm text-gray-500">{u.pointOfSale?.name || '—'}</td>
                      <td>
                        <span className={u.isActive ? 'badge-success' : 'badge-danger'}>
                          {u.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => { setEditingUser(u); setShowUserModal(true) }}
                          className="btn-ghost btn-sm p-1.5 text-gray-400 hover:text-lcg-600"
                          title="Modifier"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === 'settings' && (
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Paramètres généraux</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Version du logiciel</p>
                  <p className="text-xs text-gray-500">LCG Management v1.1.0</p>
                </div>
              </div>
              <span className="text-sm font-mono bg-white px-3 py-1 rounded-lg border">v1.1.0</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Base de données</p>
                  <p className="text-xs text-gray-500">PostgreSQL (Neon)</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-emerald-700">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                Connectée
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Notifications IA</p>
                  <p className="text-xs text-gray-500">Abonnements, relances, livraisons</p>
                </div>
              </div>
              <span className="badge-success">Active</span>
            </div>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal max-w-lg">
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                  editingUser?.role === 'ADMIN' ? 'bg-red-500' :
                  editingUser?.role === 'DIRECTION' ? 'bg-blue-500' :
                  editingUser?.role === 'RESPONSABLE_STOCK' ? 'bg-amber-500' :
                  editingUser?.role === 'RESPONSABLE_PRODUCTION' ? 'bg-purple-500' :
                  'bg-emerald-500'
                }`}>
                  {editingUser ? editingUser.firstName[0] + editingUser.lastName[0] : '+'}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</h2>
                  <p className="text-xs text-gray-400">{editingUser ? editingUser.username : 'Créez un compte pour un membre de l\'équipe'}</p>
                </div>
              </div>
              <button type="button" onClick={() => { setShowUserModal(false); setEditingUser(null) }} className="btn-ghost btn-sm p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-field">Prénom</label>
                    <input name="firstName" className="input-field" required defaultValue={editingUser?.firstName || ''} />
                  </div>
                  <div>
                    <label className="label-field">Nom</label>
                    <input name="lastName" className="input-field" required defaultValue={editingUser?.lastName || ''} />
                  </div>
                </div>
                <div>
                  <label className="label-field">Email</label>
                  <input name="email" type="email" className="input-field" required defaultValue={editingUser?.email || ''} />
                </div>
                {!editingUser && (
                  <>
                    <div>
                      <label className="label-field">Nom d'utilisateur</label>
                      <input name="username" className="input-field" required />
                    </div>
                    <div>
                      <label className="label-field">Mot de passe</label>
                      <input name="password" type="password" className="input-field" required />
                    </div>
                  </>
                )}
                {editingUser && (
                  <div>
                    <label className="label-field">Nouveau mot de passe (laisser vide pour ne pas changer)</label>
                    <input name="password" type="password" className="input-field" placeholder="••••••••" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-field">Rôle</label>
                    <select name="role" className="input-field" defaultValue={editingUser?.role || 'CAISSIER'}>
                      <option value="CAISSIER">Caissier / Vendeur</option>
                      <option value="RESPONSABLE_STOCK">Responsable de stock</option>
                      <option value="RESPONSABLE_PRODUCTION">Responsable de production</option>
                      <option value="DIRECTION">Direction</option>
                      <option value="ADMIN">Administrateur</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-field">Statut</label>
                    <select name="isActive" className="input-field" defaultValue={editingUser ? (editingUser.isActive ? 'true' : 'false') : 'true'}>
                      <option value="true">Actif</option>
                      <option value="false">Inactif</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label-field">Point de vente</label>
                  <select name="pointOfSaleId" className="input-field" defaultValue={editingUser?.pointOfSale?.id || ''}>
                    <option value="">Aucun</option>
                    {pointsOfSale.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-field">Téléphone</label>
                  <input name="phone" className="input-field" defaultValue={editingUser?.phone || ''} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => { setShowUserModal(false); setEditingUser(null) }} className="btn-secondary">Annuler</button>
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Enregistrer les modifications' : 'Créer l\'utilisateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
