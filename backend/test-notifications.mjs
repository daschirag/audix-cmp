import './src/lib/prisma.js'
import service from './src/modules/notifications/notification.service.js'

async function test() {
  console.log('Testing sendConsentGranted...')
  const r1 = await service.sendConsentGranted('6a0424134298fa61f499ee2e')
  console.log('Result:', JSON.stringify(r1, null, 2))

  console.log('\nTesting sendConsentWithdrawn...')
  const r2 = await service.sendConsentWithdrawn('6a0424134298fa61f499ee2e')
  console.log('Result:', JSON.stringify(r2, null, 2))

  console.log('\nBoth notifications working!')
  process.exit(0)
}

test().catch(e => {
  console.error('Error:', e.message)
  process.exit(1)
})