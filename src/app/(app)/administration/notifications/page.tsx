'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

type NotificationType = 'ABONNEMENT_EXPIRATION' | 'RELANCE_PAIEMENT' | 'CONFIRMATION_LIVRAISON' | 'RAPPEL_RESERVATION'

const typeLabels: Record<NotificationType, string> = {
  ABONNEMENT_EXPIRATION: 'Abonnement',
  RELANCE_PAIEMENT: 'Relance Paiement',
  CONFIRMATION_LIVRAISON: 'Livraison',
  RAPPEL_RESERVATION: 'Réservation',
}

const typeIcons: Record<NotificationType, string> = {
  ABONNEMENT_EXPIRATION: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  RELANCE_PAIEMENT: 'M12 1l3.43 6.97L22 9.24l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.11 2 9.24l6.57-.27L12 1z',
  CONFIRMATION_LIVRAISON: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  RAPPEL_RESERVATION: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<any>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '30' })
      if (typeFilter) params.set('type', typeFilter)
      const res = await fetch(`/api/notifications?${params}`)
      const data = await res.json()
      setNotifications(data.notifications || [])
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotifications() }, [page, typeFilter])

  const handleAiNotify = async () => {
    setAiLoading(true)
    setAiResult(null)
    try {
      const res = await fetch('/api/ai/notify', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setAiResult(data)
        toast.success(`${data.total} notification(s) envoyée(s)`)
        fetchNotifications()
      } else {
        toast.error(data.error || 'Erreur')
      }
    } catch {
      toast.error('Erreur serveur')
    } finally {
      setAiLoading(false)
    }
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
        <h1 className="page-title">Notifications IA</h1>
        <div className="flex gap-2">
          <button
            onClick={handleAiNotify}
            disabled={aiLoading}
            className="btn-primary"
          >
            {aiLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Envoi en cours...
              </span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Lancer l'IA
              </>
            )}
          </button>
          <button onClick={fetchNotifications} className="btn-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualiser
          </button>
        </div>
      </div>

      {aiResult && (
        <div className="bg-gradient-to-r from-lcg-50 to-blue-50 border border-lcg-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-lcg-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-lcg-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lcg-800">Notifications envoyées</h3>
              <p className="text-sm text-lcg-600">{aiResult.total} notification(s) générée(s) par l'IA</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{aiResult.details?.abonnements?.length || 0}</p>
              <p className="text-xs text-gray-500">Abonnements</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{aiResult.details?.relances?.length || 0}</p>
              <p className="text-xs text-gray-500">Relances</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{aiResult.details?.reservations?.length || 0}</p>
              <p className="text-xs text-gray-500">Réservations</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{aiResult.details?.livraisons?.length || 0}</p>
              <p className="text-xs text-gray-500">Livraisons</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <select className="input-field pl-10" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}>
            <option value="">Tous les types</option>
            <option value="ABONNEMENT_EXPIRATION">Abonnement</option>
            <option value="RELANCE_PAIEMENT">Relance Paiement</option>
            <option value="CONFIRMATION_LIVRAISON">Confirmation Livraison</option>
            <option value="RAPPEL_RESERVATION">Rappel Réservation</option>
          </select>
        </div>
        <span className="text-xs text-gray-400">
          Page {page} sur {totalPages}
        </span>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loader py-12">
            <div className="loader-spinner" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state py-12">
            <div className="empty-state-icon">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="empty-state-title">Aucune notification</p>
            <p className="empty-state-text">Cliquez sur "Lancer l'IA" pour générer des notifications intelligentes.</p>
          </div>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Destinataire</th>
                  <th>Message</th>
                  <th>Référence</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((n: any) => (
                  <tr key={n.id}>
                    <td className="text-xs whitespace-nowrap">{new Date(n.sentAt).toLocaleDateString('fr-FR')} <span className="text-gray-400">{new Date(n.sentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span></td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-lcg-50 text-lcg-700 whitespace-nowrap">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={(typeIcons as any)[n.type] || typeIcons.CONFIRMATION_LIVRAISON} />
                        </svg>
                        {(typeLabels as any)[n.type] || n.type}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm font-medium">{n.recipientName || '—'}</p>
                        <p className="text-xs text-gray-400">{n.recipient}</p>
                      </div>
                    </td>
                    <td className="text-xs max-w-md">
                      <p className="line-clamp-2">{n.message}</p>
                    </td>
                    <td className="text-xs font-mono">{n.reference || '—'}</td>
                    <td>
                      <span className={n.status === 'ENVOYÉ' ? 'badge-success' : n.status === 'ÉCHOUÉ' ? 'badge-danger' : 'badge-info'}>
                        {n.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="btn-secondary btn-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Précédent
                </button>
                <span className="text-sm text-gray-500">Page {page} / {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="btn-secondary btn-sm"
                >
                  Suivant
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
