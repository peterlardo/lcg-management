import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { generateReference } from '@/lib/utils'

const DAYS_BEFORE_EXPIRY = 3
const DAYS_BEFORE_PAYMENT_REMINDER = 2
const NOTIFICATION_METHOD = 'EMAIL'

async function checkSubscriptions() {
  const results: any[] = []
  const now = new Date()
  const expiryThreshold = new Date(now.getTime() + DAYS_BEFORE_EXPIRY * 24 * 60 * 60 * 1000)

  const subscriptions = await prisma.clientSubscription.findMany({
    where: {
      status: 'ACTIF',
      endDate: { not: null, lte: expiryThreshold, gte: now },
    },
    include: { client: true, product: true },
  })

  for (const sub of subscriptions) {
    const daysLeft = Math.ceil((sub.endDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const message = `Bonjour ${sub.client.name}, votre abonnement ${sub.product.name} (${sub.quantity} ${sub.product.unit}) expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}. Merci de renouveler votre abonnement.`

    await prisma.notificationLog.create({
      data: {
        type: 'ABONNEMENT_EXPIRATION',
        recipient: sub.client.email || sub.client.phone || '',
        recipientName: sub.client.name,
        message,
        status: 'ENVOYÉ',
        reference: `SUB-${sub.id}`,
        entityType: 'SUBSCRIPTION',
        entityId: sub.id,
      },
    })

    results.push({ type: 'ABONNEMENT_EXPIRATION', client: sub.client.name, daysLeft })
  }

  return results
}

async function checkPaymentReminders() {
  const results: any[] = []
  const now = new Date()
  const threshold = new Date(now.getTime() - DAYS_BEFORE_PAYMENT_REMINDER * 24 * 60 * 60 * 1000)

  const orders = await prisma.order.findMany({
    where: {
      status: { in: ['EN_ATTENTE', 'CONFIRMÉE'] },
      createdAt: { lte: threshold },
    },
    include: { client: true, items: { include: { product: true } } },
  })

  for (const order of orders) {
    const message = `Bonjour ${order.client.name}, votre commande ${order.reference} d'un montant de ${order.total.toLocaleString('fr-FR')} FCFA est toujours en attente. Merci de procéder au paiement pour confirmation.`

    await prisma.notificationLog.create({
      data: {
        type: 'RELANCE_PAIEMENT',
        recipient: order.client.email || order.client.phone || '',
        recipientName: order.client.name,
        message,
        status: 'ENVOYÉ',
        reference: order.reference,
        entityType: 'ORDER',
        entityId: order.id,
      },
    })

    results.push({ type: 'RELANCE_PAIEMENT', client: order.client.name, reference: order.reference })
  }

  return results
}

async function checkReservationConfirmations() {
  const results: any[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const reservations = await prisma.reservation.findMany({
    where: {
      status: 'CONFIRMÉE',
      scheduledDate: { gte: today, lt: tomorrow },
    },
    include: { client: true, items: { include: { product: true } }, pointOfSale: true },
  })

  for (const res of reservations) {
    const items = res.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')
    const message = `Bonjour ${res.client.name}, votre réservation ${res.reference} (${items}) est confirmée pour aujourd'hui ${res.scheduledTime ? 'à ' + res.scheduledTime : ''} au ${res.pointOfSale.name}. Merci de passer retirer votre commande.`

    await prisma.notificationLog.create({
      data: {
        type: 'CONFIRMATION_LIVRAISON',
        recipient: res.client.email || res.client.phone || '',
        recipientName: res.client.name,
        message,
        status: 'ENVOYÉ',
        reference: res.reference,
        entityType: 'RESERVATION',
        entityId: res.id,
      },
    })

    results.push({ type: 'CONFIRMATION_LIVRAISON', client: res.client.name, reference: res.reference })
  }

  return results
}

async function checkOrderDeliveryConfirmations() {
  const results: any[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const orders = await prisma.order.findMany({
    where: {
      status: 'LIVRÉE',
      deliveryDate: { gte: today, lt: tomorrow },
    },
    include: { client: true },
  })

  for (const order of orders) {
    const message = `Bonjour ${order.client.name}, votre commande ${order.reference} a été livrée avec succès. Merci de votre confiance !`

    await prisma.notificationLog.create({
      data: {
        type: 'CONFIRMATION_LIVRAISON',
        recipient: order.client.email || order.client.phone || '',
        recipientName: order.client.name,
        message,
        status: 'ENVOYÉ',
        reference: order.reference,
        entityType: 'ORDER',
        entityId: order.id,
      },
    })

    results.push({ type: 'CONFIRMATION_LIVRAISON', client: order.client.name, reference: order.reference })
  }

  return results
}

export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user || !['ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const [subscriptions, payments, reservations, deliveries] = await Promise.all([
      checkSubscriptions(),
      checkPaymentReminders(),
      checkReservationConfirmations(),
      checkOrderDeliveryConfirmations(),
    ])

    const total = subscriptions.length + payments.length + reservations.length + deliveries.length

    return NextResponse.json({
      success: true,
      total,
      details: {
        abonnements: subscriptions,
        relances: payments,
        reservations,
        livraisons: deliveries,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
