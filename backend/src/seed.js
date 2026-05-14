import 'dotenv/config'
import prisma from './lib/prisma.js'
import bcrypt from 'bcrypt'

const seed = async () => {
  console.log('🌱 Seeding demo data...')

  const hash = await bcrypt.hash('password123', 12)

  const dpo = await prisma.user.upsert({
    where:  { email: 'admin@audix.com' },
    update: {},
    create: { email: 'admin@audix.com', passwordHash: hash, role: 'DPO_ADMIN' }
  })

  const u1 = await prisma.user.upsert({
    where:  { email: 'anjali@example.com' },
    update: {},
    create: { email: 'anjali@example.com', passwordHash: hash, role: 'USER' }
  })
  const u2 = await prisma.user.upsert({
    where:  { email: 'arjun@example.com' },
    update: {},
    create: { email: 'arjun@example.com', passwordHash: hash, role: 'USER' }
  })
  const u3 = await prisma.user.upsert({
    where:  { email: 'deepika@example.com' },
    update: {},
    create: { email: 'deepika@example.com', passwordHash: hash, role: 'USER' }
  })
  const u4 = await prisma.user.upsert({
    where:  { email: 'rahul@example.com' },
    update: {},
    create: { email: 'rahul@example.com', passwordHash: hash, role: 'USER' }
  })
  const u5 = await prisma.user.upsert({
    where:  { email: 'priya@example.com' },
    update: {},
    create: { email: 'priya@example.com', passwordHash: hash, role: 'USER' }
  })

  console.log('✅ Users created')

  await prisma.purposeCatalog.upsert({
    where: { id: 'purpose-marketing' }, update: {},
    create: { id: 'purpose-marketing', name: 'Marketing Communications',
              description: 'Sending promotional emails', category: 'marketing', isActive: true }
  })
  await prisma.purposeCatalog.upsert({
    where: { id: 'purpose-analytics' }, update: {},
    create: { id: 'purpose-analytics', name: 'Analytics & Improvement',
              description: 'Using data to improve services', category: 'analytics', isActive: true }
  })
  await prisma.purposeCatalog.upsert({
    where: { id: 'purpose-kyc' }, update: {},
    create: { id: 'purpose-kyc', name: 'KYC Verification',
              description: 'Know Your Customer verification', category: 'compliance', isActive: true }
  })
  await prisma.purposeCatalog.upsert({
    where: { id: 'purpose-thirdparty' }, update: {},
    create: { id: 'purpose-thirdparty', name: 'Third Party Sharing',
              description: 'Sharing with trusted partners', category: 'sharing', isActive: true }
  })

  console.log('✅ Purposes created')

  const notice = await prisma.noticeVersion.upsert({
    where: { id: 'notice-v1-en' }, update: {},
    create: {
      id: 'notice-v1-en', version: '1.0', language: 'en',
      content: 'We collect and process your personal data under DPDPA 2023.',
      purposes: ['purpose-marketing', 'purpose-analytics', 'purpose-kyc'],
      effectiveFrom: new Date(),
    }
  })

  console.log('✅ Notice version created')

  const consentData = [
    { user: u1, status: 'ACTIVE',    purposes: ['purpose-marketing', 'purpose-analytics'] },
    { user: u2, status: 'ACTIVE',    purposes: ['purpose-kyc'] },
    { user: u3, status: 'ACTIVE',    purposes: ['purpose-marketing'] },
    { user: u4, status: 'WITHDRAWN', purposes: ['purpose-thirdparty'] },
    { user: u5, status: 'ACTIVE',    purposes: ['purpose-analytics', 'purpose-kyc'] },
  ]

  for (const cd of consentData) {
    const consent = await prisma.consentMaster.create({
      data: {
        dataPrincipalId: cd.user.id,
        purposes:        cd.purposes.map(p => ({ purposeId: p, granted: true })),
        status:          cd.status,
        language:        'en',
        noticeVersionId: notice.id,
        source:          { channel: 'web' },
      }
    })
    await prisma.consentEvent.create({
      data: {
        consentId:       consent.id,
        dataPrincipalId: cd.user.id,
        eventType:       cd.status === 'WITHDRAWN' ? 'WITHDRAWN' : 'GRANTED',
        purposes:        cd.purposes.map(p => ({ purposeId: p, granted: true })),
        noticeVersionId: notice.id,
        actorType:       'USER',
        actorId:         cd.user.id,
        hash:            Buffer.from(consent.id + Date.now()).toString('hex').slice(0, 64),
        timestamp:       new Date(),
      }
    })
  }

  console.log('✅ Consents created:', consentData.length)

  const complaintData = [
    { user: u1, category: 'data misuse',      status: 'RECEIVED' },
    { user: u2, category: 'unauthorized use', status: 'UNDER_REVIEW' },
    { user: u3, category: 'data breach',      status: 'ESCALATED' },
  ]

  for (const cd of complaintData) {
    const consent = await prisma.consentMaster.findFirst({
      where: { dataPrincipalId: cd.user.id }
    })
    await prisma.complaint.create({
      data: {
        dataPrincipalId: cd.user.id,
        consentId:       consent?.id || cd.user.id,
        category:        cd.category,
        subject:         cd.category,
        description:     'Demo complaint for ' + cd.category,
        status:          cd.status,
      }
    })
  }

  console.log('✅ Complaints created:', complaintData.length)
  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Demo login: admin@audix.com / password123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  await prisma.$disconnect()
}

seed().catch(e => {
  console.error('❌ Seed failed:', e.message)
  process.exit(1)
})