import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, hashPassword } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const data: any = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      role: body.role,
      phone: body.phone || null,
      pointOfSaleId: body.pointOfSaleId ? parseInt(body.pointOfSaleId) : null,
      isActive: body.isActive === 'true' || body.isActive === true,
    }

    if (body.password) {
      data.password = await hashPassword(body.password)
    }

    const updated = await prisma.user.update({
      where: { id: parseInt(params.id) },
      data,
      select: {
        id: true, username: true, email: true, firstName: true, lastName: true,
        role: true, isActive: true, phone: true, pointOfSale: true,
        createdAt: true, lastLoginAt: true,
      },
    })

    return NextResponse.json({ user: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
