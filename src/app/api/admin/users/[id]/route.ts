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
    const data: any = {}

    if (body.username !== undefined) data.username = body.username.trim().toLowerCase()
    if (body.firstName !== undefined) data.firstName = body.firstName
    if (body.lastName !== undefined) data.lastName = body.lastName
    if (body.email !== undefined) data.email = body.email
    if (body.role !== undefined) data.role = body.role
    if (body.phone !== undefined) data.phone = body.phone || null
    if (body.pointOfSaleId !== undefined) data.pointOfSaleId = body.pointOfSaleId ? parseInt(body.pointOfSaleId) : null
    if (body.isActive !== undefined) data.isActive = body.isActive === 'true' || body.isActive === true

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
