import prisma from '../../lib/prisma.js'

const sendConsentGranted = async (userId) => {
  console.log(`NOTIFICATION: Consent granted for user ${userId}`)

  const notification = await prisma.notification.create({
    data: {
      userId,
      type:    'CONSENT_GRANTED',
      message: 'Your consent has been recorded successfully.',
      status:  'SENT'
    }
  })

  return notification
}

const sendConsentWithdrawn = async (userId) => {
  console.log(`NOTIFICATION: Consent withdrawn for user ${userId}`)

  const notification = await prisma.notification.create({
    data: {
      userId,
      type:    'CONSENT_WITHDRAWN',
      message: 'Your consent has been withdrawn successfully.',
      status:  'SENT'
    }
  })

  return notification
}

export default { sendConsentGranted, sendConsentWithdrawn }