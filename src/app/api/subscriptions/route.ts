import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const subscriptions = await prisma.clientSubscription.findMany({
      include: {
        client: true,
        product: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ subscriptions })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !['ADMIN', 'DIRECTION'].includes(user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const subscription = await prisma.clientSubscription.create({
      data: {
        clientId: parseInt(body.clientId),
        productId: parseInt(body.productId),
        quantity: parseInt(body.quantity) || 1,
        frequency: body.frequency || 'HEBDOMADAIRE',
        pricePerUnit: parseFloat(body.pricePerUnit) || 0,
        totalPrice: (parseFloat(body.pricePerUnit) || 0) * (parseInt(body.quantity) || 1),
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
        nextDeliveryDate: body.nextDeliveryDate ? new Date(body.nextDeliveryDate) : null,
        status: body.status || 'ACTIF',
        notes: body.notes || null,
      },
      include: { client: true, product: true },
    })

    return NextResponse.json({ subscription }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
