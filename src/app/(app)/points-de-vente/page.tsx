'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('./MapView'), { ssr: false })

export default function PointsDeVentePage() {
  const { user } = useAuth()
  const [points, setPoints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [view, setView] = useState<'list' | 'map'>('map')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pointofsale')
      const data = await res.json()
      setPoints(data.pointsOfSale || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const filteredPoints = points.filter((p: any) =>
    !searchTerm || `${p.name} ${p.code} ${p.city} ${p.managerName || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const data = Object.fromEntries(form)

    const url = editing ? '/api/pointofsale' : '/api/pointofsale'
    const method = editing ? 'PUT' : 'POST'
    if (editing) (data as any).id = editing.id

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      toast.success(editing ? 'Point de vente modifié' : 'Point de vente créé')
      setShowModal(false)
      setEditing(null)
      fetchData()
    } else {
      const err = await res.json()
      toast.error(err.error || 'Erreur')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Désactiver ce point de vente ?')) return
    const res = await fetch(`/api/pointofsale?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Point de vente désactivé')
      fetchData()
    } else {
      toast.error('Erreur')
    }
  }

  const getCoord = (p: any) => {
    if (p.lat && p.lng) return { lat: p.lat, lng: p.lng }
    return null
  }

  const canEdit = user?.role === 'ADMIN'

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Points de vente</h1>
          <p className="text-sm text-gray-400 mt-1">{points.length} point(s) de vente enregistré(s)</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setView('map')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'map' ? 'bg-white shadow-sm text-lcg-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Carte
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'list' ? 'bg-white shadow-sm text-lcg-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Liste
            </button>
          </div>
          {canEdit && (
            <button onClick={() => { setEditing(null); setShowModal(true) }} className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouveau
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="card">
          <div className="loader"><div className="loader-spinner" /></div>
        </div>
      ) : view === 'map' ? (
        <div className="card p-0 overflow-hidden rounded-xl">
          <MapView
            points={filteredPoints}
            onEdit={canEdit ? (p: any) => { setEditing(p); setShowModal(true) } : undefined}
          />
        </div>
      ) : (
        <>
          <div className="relative max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Rechercher un point de vente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Code</th>
                  <th>Adresse</th>
                  <th>Gérant</th>
                  <th className="text-center">Caisses</th>
                  <th className="text-center">Ventes</th>
                  <th>Statut</th>
                  {canEdit && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredPoints.map((p: any) => (
                  <tr key={p.id}>
                    <td className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-lcg-100 rounded-lg flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-lcg-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-xs">{p.code}</td>
                    <td className="text-sm text-gray-500 max-w-[200px] truncate">{p.address || '—'}</td>
                    <td>
                      {p.managerName ? (
                        <div>
                          <p className="text-sm font-medium">{p.managerName}</p>
                          {p.managerPhone && <p className="text-xs text-gray-400">{p.managerPhone}</p>}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                      {p.users?.length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">{p.users.length} employé(s)</p>
                      )}
                    </td>
                    <td className="text-center">{p._count?.caisses || 0}</td>
                    <td className="text-center">{p._count?.sales || 0}</td>
                    <td>
                      <span className={p.isActive ? 'badge-success' : 'badge-danger'}>
                        {p.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="text-right">
                        <button
                          onClick={() => { setEditing(p); setShowModal(true) }}
                          className="btn-ghost btn-sm p-1.5 text-gray-400 hover:text-lcg-600"
                          title="Modifier"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal max-w-lg">
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-lcg-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-lcg-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold">{editing ? 'Modifier le point de vente' : 'Nouveau point de vente'}</h2>
                  <p className="text-xs text-gray-400">{editing ? 'Modifiez les informations ci-dessous' : 'Ajoutez un nouveau point de vente'}</p>
                </div>
              </div>
              <button type="button" onClick={() => { setShowModal(false); setEditing(null) }} className="btn-ghost btn-sm p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-field">Nom</label>
                    <input name="name" className="input-field" required defaultValue={editing?.name || ''} />
                  </div>
                  <div>
                    <label className="label-field">Code</label>
                    <input name="code" className="input-field" required defaultValue={editing?.code || ''} />
                  </div>
                </div>
                <div>
                  <label className="label-field">Adresse</label>
                  <input name="address" className="input-field" defaultValue={editing?.address || ''} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-field">Ville</label>
                    <input name="city" className="input-field" defaultValue={editing?.city || 'Brazzaville'} />
                  </div>
                  <div>
                    <label className="label-field">Téléphone</label>
                    <input name="phone" className="input-field" defaultValue={editing?.phone || ''} />
                  </div>
                </div>
                <hr className="border-gray-200" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gérant / Responsable</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-field">Nom du gérant</label>
                    <input name="managerName" className="input-field" defaultValue={editing?.managerName || ''} placeholder="Ex: Jean Dupont" />
                  </div>
                  <div>
                    <label className="label-field">Téléphone du gérant</label>
                    <input name="managerPhone" className="input-field" defaultValue={editing?.managerPhone || ''} placeholder="+242 XX XXX XXX" />
                  </div>
                </div>
                <hr className="border-gray-200" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Coordonnées géographiques</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-field">Latitude</label>
                    <input name="lat" type="number" step="any" className="input-field" defaultValue={editing?.lat || ''} placeholder="-4.2694" />
                  </div>
                  <div>
                    <label className="label-field">Longitude</label>
                    <input name="lng" type="number" step="any" className="input-field" defaultValue={editing?.lng || ''} placeholder="15.2712" />
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  Coordonnées de Brazzaville : -4.2694, 15.2712. Utilisez Google Maps pour trouver les coordonnées exactes.
                </p>
                {editing && (
                  <div className="flex items-center gap-3">
                    <label className="label-field mb-0">Actif</label>
                    <select name="isActive" className="input-field w-auto" defaultValue={editing?.isActive ? 'true' : 'false'}>
                      <option value="true">Oui</option>
                      <option value="false">Non</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => { setShowModal(false); setEditing(null) }} className="btn-secondary">Annuler</button>
                <button type="submit" className="btn-primary">
                  {editing ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
