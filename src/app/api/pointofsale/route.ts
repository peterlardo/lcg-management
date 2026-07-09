import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const pointsOfSale = await prisma.pointOfSale.findMany({
      include: {
        _count: { select: { sales: true, users: true, caisses: true } },
        users: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ pointsOfSale })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !['ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()

    const pos = await prisma.pointOfSale.create({
      data: {
        name: body.name,
        code: body.code,
        address: body.address || null,
        city: body.city || 'Brazzaville',
        phone: body.phone || null,
        lat: body.lat ? parseFloat(body.lat) : null,
        lng: body.lng ? parseFloat(body.lng) : null,
        managerName: body.managerName || null,
        managerPhone: body.managerPhone || null,
        isActive: body.isActive !== 'false',
      },
      include: {
        _count: { select: { sales: true, users: true, caisses: true } },
        users: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    })

    return NextResponse.json({ pointOfSale: pos }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ce code ou nom existe déjà' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !['ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()

    const pos = await prisma.pointOfSale.update({
      where: { id: parseInt(body.id) },
      data: {
        name: body.name,
        code: body.code,
        address: body.address || null,
        city: body.city || 'Brazzaville',
        phone: body.phone || null,
        lat: body.lat ? parseFloat(body.lat) : null,
        lng: body.lng ? parseFloat(body.lng) : null,
        managerName: body.managerName || null,
        managerPhone: body.managerPhone || null,
        isActive: body.isActive === 'true' || body.isActive === true,
      },
      include: {
        _count: { select: { sales: true, users: true, caisses: true } },
        users: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    })

    return NextResponse.json({ pointOfSale: pos })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ce code ou nom existe déjà' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !['ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

    await prisma.pointOfSale.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
