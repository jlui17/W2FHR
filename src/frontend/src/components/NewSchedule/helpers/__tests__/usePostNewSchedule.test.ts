import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/handlers'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { usePostNewSchedule, NewScheduleSchemaFormData, getBlankTemplate } from '../hooks'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
})

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

const BASE = 'http://localhost:8080'

describe('usePostNewSchedule', () => {
  afterEach(() => {
    queryClient.clear()
  })

  const schedule: NewScheduleSchemaFormData = getBlankTemplate()
  schedule.shifts[0] = {
    employee: 'John Doe',
    shiftTitle: 'Games Supervisor',
    startTime: '10:00 am',
    endTime: '6:00 pm',
    breakDuration: '00:30:00',
    designation: 'Games'
  }

  it('calls onSuccess on 200', async () => {
    server.use(
      http.post(`${BASE}/scheduling`, async ({ request }) => {
        const body = await request.json() as any
        expect(body.shifts).toBeDefined()
        expect(body.shifts.length).toBe(1)
        return new HttpResponse(null, { status: 200 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(
      () => usePostNewSchedule({ onSuccess, onError }),
      { wrapper }
    )

    const date = new Date('2024-11-01')
    result.current.mutate({ idToken: 'token123', newSchedule: schedule, date })

    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(onError).not.toHaveBeenCalled()
  })

  it('calls onError on 403 (updates disabled)', async () => {
    server.use(
      http.post(`${BASE}/scheduling`, () => {
        return HttpResponse.text('Updates disabled', { status: 403 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(
      () => usePostNewSchedule({ onSuccess, onError }),
      { wrapper }
    )

    result.current.mutate({ idToken: 'token123', newSchedule: schedule, date: new Date() })

    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('calls onError on 404', async () => {
    server.use(
      http.post(`${BASE}/scheduling`, () => {
        return HttpResponse.text('Not found', { status: 404 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(
      () => usePostNewSchedule({ onSuccess, onError }),
      { wrapper }
    )

    result.current.mutate({ idToken: 'token123', newSchedule: schedule, date: new Date() })

    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('calls onError on 500', async () => {
    server.use(
      http.post(`${BASE}/scheduling`, () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(
      () => usePostNewSchedule({ onSuccess, onError }),
      { wrapper }
    )

    result.current.mutate({ idToken: 'token123', newSchedule: schedule, date: new Date() })

    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
