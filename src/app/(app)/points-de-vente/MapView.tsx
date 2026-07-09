'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapViewProps {
  points: any[]
  onEdit?: (point: any) => void
}

// Fix default marker icons in Leaflet with webpack/next.js
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png'
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

const posIcon = L.divIcon({
  className: '',
  html: `<div style="background:linear-gradient(135deg,#1e40af,#1a3399);color:#fff;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid #fff"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
})

const activeIcon = L.divIcon({
  className: '',
  html: `<div style="background:linear-gradient(135deg,#059669,#047857);color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,0.25);border:2px solid #fff">✓</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

const defaultCoord: [number, number] = [-4.2694, 15.2712] // Brazzaville center

export default function MapView({ points, onEdit }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: defaultCoord,
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer)
      }
    })

    const markers: L.Marker[] = []
    const bounds: L.LatLngBounds = L.latLngBounds([])

    points.forEach((point) => {
      const lat = point.lat ? parseFloat(point.lat) : null
      const lng = point.lng ? parseFloat(point.lng) : null

      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        const marker = L.marker([lat, lng], { icon: posIcon }).addTo(map)

        const users = point.users || []
        const userList = users.length > 0
          ? `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #e5e7eb;font-size:11px;color:#6b7280">
              <strong>Équipe :</strong><br/>
              ${users.map((u: any) => `${u.firstName} ${u.lastName} (${u.role.replace(/_/g, ' ')})`).join('<br/>')}
            </div>`
          : ''

        marker.bindPopup(`
          <div style="font-family:Inter,system-ui,sans-serif;font-size:13px;min-width:200px">
            <div style="font-weight:700;font-size:15px;color:#1e40af;margin-bottom:4px">${point.name}</div>
            <div style="color:#6b7280;font-size:12px">
              ${point.address ? `<div>📍 ${point.address}, ${point.city}</div>` : `<div>📍 ${point.city}</div>`}
              ${point.phone ? `<div>📞 ${point.phone}</div>` : ''}
            </div>
            ${point.managerName ? `
              <div style="margin-top:6px;padding-top:6px;border-top:1px solid #e5e7eb">
                <div style="font-size:12px"><strong>Gérant :</strong> ${point.managerName}</div>
                ${point.managerPhone ? `<div style="font-size:12px">📞 ${point.managerPhone}</div>` : ''}
              </div>
            ` : ''}
            ${userList}
            ${onEdit ? `<div style="margin-top:8px;text-align:center">
              <button onclick="window.__editPos && window.__editPos(${point.id})" style="background:#1e40af;color:#fff;border:none;padding:4px 12px;border-radius:6px;font-size:12px;cursor:pointer">Modifier</button>
            </div>` : ''}
            <div style="margin-top:6px;text-align:center;font-size:10px;color:#9ca3af">${point.code}</div>
          </div>
        `, { maxWidth: 280, className: 'pos-popup' })

        markers.push(marker)
        bounds.extend([lat, lng])
      }
    })

    if (markers.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    } else {
      map.setView(defaultCoord, 12)
    }

    // Expose edit function for popup buttons
    if (onEdit) {
      ;(window as any).__editPos = (id: number) => {
        const point = points.find(p => p.id === id)
        if (point) onEdit(point)
      }
    }

    return () => {
      delete (window as any).__editPos
    }
  }, [points, onEdit])

  return (
    <div ref={mapRef} style={{ height: '600px', width: '100%' }} className="z-0" />
  )
}
