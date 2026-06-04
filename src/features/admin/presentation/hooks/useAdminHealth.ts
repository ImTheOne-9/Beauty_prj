import { useCallback, useEffect, useState } from 'react'

export function useAdminHealth(pingDatabase: () => Promise<void>) {
  const [pingTime, setPingTime] = useState<number | null>(null)
  const [pingStatus, setPingStatus] = useState<'idle' | 'pinging' | 'success' | 'failed'>('idle')

  const testPing = useCallback(async () => {
    setPingStatus('pinging')
    const start = performance.now()
    try {
      await pingDatabase()
      setPingTime(Math.round(performance.now() - start))
      setPingStatus('success')
    } catch {
      setPingTime(-1)
      setPingStatus('failed')
    }
  }, [pingDatabase])

  useEffect(() => {
    void testPing()
  }, [testPing])

  return { pingTime, pingStatus, testPing }
}
