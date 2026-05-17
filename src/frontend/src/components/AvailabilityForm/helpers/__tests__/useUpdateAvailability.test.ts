import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/handlers'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useUpdateAvailability, UserAvailability } from '../hooks'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
})

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

const BASE = 'https://q4q2yztd56.execute-api.us-west-2.amazonaws.com/v1'

const availData: UserAvailability = {
  day1: { date: '2024-06-01', isAvailable: true },
  day2: { date: '2024-06-02', isAvailable: false },
  day3: { date: '2024-06-03', isAvailable: true },
  day4: { date: '2024-06-04', isAvailable: false },
  canUpdate: true,
  showMonday: false
}

describe('useUpdateAvailability', () => {
  afterEach(() => {
    queryClient.clear()
  })

  it('calls onSuccess on 200', async () => {
    server.use(
      http.post(`${BASE}/availability`, async ({ request }) => {
        const body = await request.json() as any
        return HttpResponse.json({ ...body, canUpdate: true }, { status: 200 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(
      () => useUpdateAvailability({ onSuccess, onError }),
      { wrapper }
    )

    result.current.mutate({ availabilityData: availData, idToken: 'token123' })

    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(onError).not.toHaveBeenCalled()
  })

  it('calls onError on 403 (updates disabled)', async () => {
    server.use(
      http.post(`${BASE}/availability`, () => {
        return HttpResponse.text('Updates disabled', { status: 403 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(
      () => useUpdateAvailability({ onSuccess, onError }),
      { wrapper }
    )

    result.current.mutate({ availabilityData: availData, idToken: 'token123' })

    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('calls onError on 404', async () => {
    server.use(
      http.post(`${BASE}/availability`, () => {
        return HttpResponse.text('Not found', { status: 404 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(
      () => useUpdateAvailability({ onSuccess, onError }),
      { wrapper }
    )

    result.current.mutate({ availabilityData: availData, idToken: 'token123' })

    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('calls onError on 500', async () => {
    server.use(
      http.post(`${BASE}/availability`, () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(
      () => useUpdateAvailability({ onSuccess, onError }),
      { wrapper }
    )

    result.current.mutate({ availabilityData: availData, idToken: 'token123' })

    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
