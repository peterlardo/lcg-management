'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'

const menuItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['ADMIN', 'DIRECTION', 'RESPONSABLE_STOCK', 'RESPONSABLE_PRODUCTION', 'CAISSIER'] },
  { href: '/ventes', label: 'Ventes', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5.5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5.5a.5.5 0 11-1 0 .5.5 0 011 0z', roles: ['ADMIN', 'DIRECTION', 'CAISSIER'] },
  { href: '/produits', label: 'Produits', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', roles: ['ADMIN', 'DIRECTION', 'RESPONSABLE_STOCK', 'CAISSIER'] },
  { href: '/stocks', label: 'Stocks', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', roles: ['ADMIN', 'DIRECTION', 'RESPONSABLE_STOCK'] },
  { href: '/caisse', label: 'Caisse', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', roles: ['ADMIN', 'DIRECTION', 'CAISSIER'] },
  { href: '/production', label: 'Production', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', roles: ['ADMIN', 'DIRECTION', 'RESPONSABLE_PRODUCTION'] },
  { href: '/distribution', label: 'Distribution', icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-1 2 1 2-1 2 1 2-1 2 1zM6 14h.01M8 10h.01M17 13l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2', roles: ['ADMIN', 'DIRECTION', 'RESPONSABLE_PRODUCTION', 'RESPONSABLE_STOCK'] },
  { href: '/reservations', label: 'Réservations', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', roles: ['ADMIN', 'DIRECTION', 'CAISSIER'] },
  { href: '/commandes', label: 'Commandes', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', roles: ['ADMIN', 'DIRECTION', 'CAISSIER'] },
  { href: '/clients', label: 'Clients', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', roles: ['ADMIN', 'DIRECTION', 'CAISSIER'] },
  { href: '/statistiques', label: 'Statistiques', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', roles: ['ADMIN', 'DIRECTION'] },
  { href: '/rapports', label: 'Rapports', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', roles: ['ADMIN', 'DIRECTION', 'RESPONSABLE_STOCK', 'RESPONSABLE_PRODUCTION'] },
  { href: '/administration', label: 'Administration', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', roles: ['ADMIN'] },
]

const menuGroups = [
  { label: 'Principal', items: ['/dashboard', '/ventes', '/produits', '/stocks', '/caisse'] },
  { label: 'Opérations', items: ['/production', '/distribution', '/reservations', '/commandes'] },
  { label: 'Données', items: ['/clients', '/statistiques', '/rapports'] },
  { label: 'Système', items: ['/administration'] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!user) return null

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role))

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 btn-primary p-2.5 rounded-xl shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
        </svg>
      </button>

      <aside className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out shadow-sidebar h-screen`}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-lcg-500 to-lcg-700 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm tracking-tight">LCG Management</h2>
              <p className="text-xs text-gray-400">La Congolaise des Glaçons</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {menuGroups.map(group => {
            const groupItems = filteredMenu.filter(item => group.items.includes(item.href))
            if (groupItems.length === 0) return null
            return (
              <div key={group.label}>
                <p className="px-3 mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-widest">{group.label}</p>
                <div className="space-y-0.5">
                  {groupItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`sidebar-link group ${isActive(item.href) ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <svg className={`w-5 h-5 shrink-0 ${isActive(item.href) ? 'text-lcg-500' : 'text-gray-400 group-hover:text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                      </svg>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-9 h-9 bg-gradient-to-br from-lcg-400 to-lcg-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">{user.firstName[0]}{user.lastName[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-400 truncate">{user.role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</p>
            </div>
          </div>
          <button onClick={logout} className="sidebar-link sidebar-link-inactive w-full text-red-500 hover:text-red-700 hover:bg-red-50 group">
            <svg className="w-5 h-5 shrink-0 text-red-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden animate-fade-in" onClick={() => setMobileOpen(false)} />
      )}
    </>
  )
}
