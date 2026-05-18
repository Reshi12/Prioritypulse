import { useState, useEffect, useCallback, useRef } from 'react'
import { getSimState, startSim, pauseSim, stepSim, resetSim } from '../api/endpoints'
import { MOCK, WS_URL } from '../api/client'

export function useSimulation() {
  const [simState, setSimState] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)

  // Fetch initial simulation state
  const fetchState = useCallback(async () => {
    try {
      const data = await getSimState()
      setSimState(data)
    } catch (err) {
      console.error('Failed to fetch simulation state:', err)
    }
  }, [])

  // WebSocket connection (only when not in mock mode)
  useEffect(() => {
    if (MOCK) {
      fetchState()
      return
    }

    const connect = () => {
      try {
        const ws = new WebSocket(WS_URL)
        wsRef.current = ws

        ws.onopen = () => {
          setIsConnected(true)
          console.log('WebSocket connected')
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            setSimState(data)
          } catch (e) {
            console.error('Failed to parse WS message:', e)
          }
        }

        ws.onclose = () => {
          setIsConnected(false)
          // Reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(connect, 3000)
        }

        ws.onerror = (err) => {
          console.error('WebSocket error:', err)
          ws.close()
        }
      } catch (err) {
        console.error('WebSocket connection failed:', err)
        reconnectTimeoutRef.current = setTimeout(connect, 3000)
      }
    }

    connect()
    fetchState()

    return () => {
      if (wsRef.current) wsRef.current.close()
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
    }
  }, [fetchState])

  // Simulation control actions
  const handleStart = useCallback(async (params = {}) => {
    setIsLoading(true)
    try {
      await startSim(params)
      if (MOCK) {
        setSimState((prev) => prev ? { ...prev, status: 'running' } : prev)
      }
      await fetchState()
    } catch (err) {
      console.error('Start simulation failed:', err)
    } finally {
      setIsLoading(false)
    }
  }, [fetchState])

  const handlePause = useCallback(async () => {
    setIsLoading(true)
    try {
      await pauseSim()
      if (MOCK) {
        setSimState((prev) => prev ? { ...prev, status: 'paused' } : prev)
      }
      await fetchState()
    } catch (err) {
      console.error('Pause simulation failed:', err)
    } finally {
      setIsLoading(false)
    }
  }, [fetchState])

  const handleStep = useCallback(async () => {
    setIsLoading(true)
    try {
      await stepSim()
      if (MOCK) {
        setSimState((prev) => prev ? { ...prev, clock: prev.clock + 1 } : prev)
      }
      await fetchState()
    } catch (err) {
      console.error('Step simulation failed:', err)
    } finally {
      setIsLoading(false)
    }
  }, [fetchState])

  const handleReset = useCallback(async () => {
    setIsLoading(true)
    try {
      await resetSim()
      if (MOCK) {
        setSimState((prev) => prev ? { ...prev, clock: 0, status: 'idle' } : prev)
      }
      await fetchState()
    } catch (err) {
      console.error('Reset simulation failed:', err)
    } finally {
      setIsLoading(false)
    }
  }, [fetchState])

  return {
    simState,
    isConnected: MOCK ? true : isConnected,
    isLoading,
    onStart: handleStart,
    onPause: handlePause,
    onStep: handleStep,
    onReset: handleReset,
    refresh: fetchState,
  }
}
