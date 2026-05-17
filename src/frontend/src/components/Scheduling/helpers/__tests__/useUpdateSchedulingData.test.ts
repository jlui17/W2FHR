import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/handlers'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useUpdateSchedulingData } from '../hooks'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
})

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

const BASE = 'https://q4q2yztd56.execute-api.us-west-2.amazonaws.com/v1'

const validResponse = {
  availability: {
    '2024-11-01': [{ name: 'John Doe', position: 'Attendant' }]
  },
  scheduledEmployees: {},
  metadata: {
    shiftTitles: ['Games Supervisor'],
    shiftTimes: ['08:00 am', '12:00 pm'],
    breakDurations: ['00:30:00']
  },
  showMonday: true,
  disableUpdates: false,
  startOfWeek: '2024-11-01'
}

describe('useUpdateSchedulingData', () => {
  afterEach(() => {
    queryClient.clear()
  })

  it('calls onSuccess on 200', async () => {
    server.use(
      http.put(`${BASE}/scheduling`, async ({ request }) => {
        const body = await request.json() as any
        expect(body.showMonday).toBe(true)
        return HttpResponse.json(validResponse, { status: 200 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(
      () => useUpdateSchedulingData({ onSuccess, onError }),
      { wrapper }
    )

    result.current.mutate({ idToken: 'token123', updates: { showMonday: true } })

    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(onError).not.toHaveBeenCalled()
    // onSuccess is called as (data, variables, context) by useMutation
    expect(onSuccess.mock.calls[0][0]).toEqual(expect.objectContaining({
      showMonday: true,
      disableUpdates: false
    }))
  })

  it('calls onError on 403 (updates disabled)', async () => {
    server.use(
      http.put(`${BASE}/scheduling`, () => {
        return HttpResponse.text('Updates disabled', { status: 403 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(
      () => useUpdateSchedulingData({ onSuccess, onError }),
      { wrapper }
    )

    result.current.mutate({ idToken: 'token123', updates: { disableUpdates: true } })

    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('calls onError on 404', async () => {
    server.use(
      http.put(`${BASE}/scheduling`, () => {
        return HttpResponse.text('Not found', { status: 404 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(
      () => useUpdateSchedulingData({ onSuccess, onError }),
      { wrapper }
    )

    result.current.mutate({ idToken: 'token123', updates: {} })

    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('calls onError on 500', async () => {
    server.use(
      http.put(`${BASE}/scheduling`, () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(
      () => useUpdateSchedulingData({ onSuccess, onError }),
      { wrapper }
    )

    result.current.mutate({ idToken: 'token123', updates: { startOfWeek: '2024-11-15' } })

    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('calls onError when response is invalid', async () => {
    server.use(
      http.put(`${BASE}/scheduling`, () => {
        return HttpResponse.json({ invalid: 'data' }, { status: 200 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(
      () => useUpdateSchedulingData({ onSuccess, onError }),
      { wrapper }
    )

    result.current.mutate({ idToken: 'token123', updates: {} })

    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
