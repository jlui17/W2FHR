import { describe, it, expect, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/handlers'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useUserAvailability, UserAvailability } from '../hooks'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
})

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

const BASE = 'https://q4q2yztd56.execute-api.us-west-2.amazonaws.com/v1'

const validAvailability: UserAvailability = {
  day1: { date: '2024-06-01', isAvailable: true },
  day2: { date: '2024-06-02', isAvailable: false },
  day3: { date: '2024-06-03', isAvailable: true },
  day4: { date: '2024-06-04', isAvailable: false },
  canUpdate: true,
  showMonday: false
}

describe('useUserAvailability', () => {
  afterEach(() => {
    queryClient.clear()
  })

  it('fetches availability data with valid response', async () => {
    server.use(
      http.get(`${BASE}/availability`, ({ request }) => {
        return HttpResponse.json(validAvailability, { status: 200 })
      })
    )

    const { result } = renderHook(
      () => useUserAvailability({ idToken: 'token123' }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.canUpdate).toBe(true)
    expect(result.current.data?.day1.isAvailable).toBe(true)
  })

  it('returns error on 404', async () => {
    server.use(
      http.get(`${BASE}/availability`, () => {
        return HttpResponse.text('Not found', { status: 404 })
      })
    )

    const { result } = renderHook(
      () => useUserAvailability({ idToken: 'token123' }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('returns error on 500', async () => {
    server.use(
      http.get(`${BASE}/availability`, () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    const { result } = renderHook(
      () => useUserAvailability({ idToken: 'token123' }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('returns error on invalid data', async () => {
    server.use(
      http.get(`${BASE}/availability`, () => {
        return HttpResponse.json({ invalid: true }, { status: 200 })
      })
    )

    const { result } = renderHook(
      () => useUserAvailability({ idToken: 'token123' }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
