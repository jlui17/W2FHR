import { describe, it, expect, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/handlers'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useSchedulingData } from '../hooks'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
})

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

const BASE = 'http://localhost:8080'

const validSchedulingData = {
  availability: {
    '2024-11-01': [{ name: 'John Doe', position: 'Attendant' }],
    '2024-11-02': [{ name: 'Jane Smith', position: 'Supervisor' }]
  },
  scheduledEmployees: {
    '2024-11-01': [{ name: 'John Doe' }]
  },
  metadata: {
    shiftTitles: ['Games Supervisor', 'Water Walkers Attendant'],
    shiftTimes: ['08:00 am', '12:00 pm'],
    breakDurations: ['00:30:00', '01:00:00']
  },
  showMonday: false,
  disableUpdates: false,
  startOfWeek: '2024-11-01'
}

describe('useSchedulingData', () => {
  afterEach(() => {
    queryClient.clear()
  })

  it('has initial data before fetch completes', () => {
    server.use(
      http.get(`${BASE}/scheduling`, () => {
        return HttpResponse.json(validSchedulingData, { status: 200 })
      })
    )

    const { result } = renderHook(
      () => useSchedulingData({ idToken: 'token123' }),
      { wrapper }
    )

    // initialData should be available immediately
    expect(result.current.data).toBeDefined()
    expect(result.current.data?.metadata.shiftTitles).toBeInstanceOf(Set)
    expect(result.current.data?.days).toEqual([])
  })

  it('fetches and converts scheduling data', async () => {
    server.use(
      http.get(`${BASE}/scheduling`, () => {
        return HttpResponse.json(validSchedulingData, { status: 200 })
      })
    )

    const { result } = renderHook(
      () => useSchedulingData({ idToken: 'token123' }),
      { wrapper }
    )

    // Wait for actual fetched data (initialData has empty shiftTitles)
    await waitFor(() => expect(result.current.data?.metadata.shiftTitles.has('Games Supervisor')).toBe(true))
    expect(result.current.isSuccess).toBe(true)
    expect(result.current.data?.disableUpdates).toBe(false)
  })

  it('returns error on 404', async () => {
    server.use(
      http.get(`${BASE}/scheduling`, () => {
        return HttpResponse.text('Not found', { status: 404 })
      })
    )

    const { result } = renderHook(
      () => useSchedulingData({ idToken: 'token123' }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('returns error on 500', async () => {
    server.use(
      http.get(`${BASE}/scheduling`, () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    const { result } = renderHook(
      () => useSchedulingData({ idToken: 'token123' }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('returns error on invalid data', async () => {
    server.use(
      http.get(`${BASE}/scheduling`, () => {
        return HttpResponse.json({ invalid: 'data' }, { status: 200 })
      })
    )

    const { result } = renderHook(
      () => useSchedulingData({ idToken: 'token123' }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
