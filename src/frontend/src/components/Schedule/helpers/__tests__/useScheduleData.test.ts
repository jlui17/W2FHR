import { describe, it, expect, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/handlers'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useScheduleData } from '../hooks'
import { TimesheetData } from '@/components/Timesheet/helpers/hooks'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

const BASE = 'http://localhost:8080'

const validTimesheet: TimesheetData = {
  shifts: [
    {
      date: '2024-06-01',
      shiftTitle: 'Morning',
      startTime: '08:00',
      endTime: '16:00',
      breakDuration: '01:00',
      netHours: 7,
      employeeName: 'John Doe',
    },
    {
      date: '2024-06-02',
      shiftTitle: 'Evening',
      startTime: '16:00',
      endTime: '00:00',
      breakDuration: '00:30',
      netHours: 7.5,
      employeeName: 'Jane Smith',
    },
  ],
}

describe('useScheduleData', () => {
  afterEach(() => {
    queryClient.clear()
  })

  it('fetches and converts schedule data', async () => {
    server.use(
      http.get(`${BASE}/timesheet`, () => {
        return HttpResponse.json(validTimesheet, { status: 200 })
      })
    )

    const start = new Date('2024-06-01')
    const end = new Date('2024-06-07')
    const { result } = renderHook(
      () => useScheduleData({ idToken: 'token123', start, end, queryKey: ['test'] }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.shifts).toHaveLength(2)
    expect(result.current.data?.shifts[0].employeeName).toBe('John Doe')
    expect(result.current.data?.shifts[0].date).toBeInstanceOf(Date)
  })

  it('returns error on 404', async () => {
    server.use(
      http.get(`${BASE}/timesheet`, () => {
        return HttpResponse.text('Not found', { status: 404 })
      })
    )

    const { result } = renderHook(
      () =>
        useScheduleData({
          idToken: 'token123',
          start: new Date(),
          end: new Date(),
          queryKey: ['test'],
        }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })

  it('returns error on 500', async () => {
    server.use(
      http.get(`${BASE}/timesheet`, () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    const { result } = renderHook(
      () =>
        useScheduleData({
          idToken: 'token123',
          start: new Date(),
          end: new Date(),
          queryKey: ['test'],
        }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })

  it('returns error on invalid data', async () => {
    server.use(
      http.get(`${BASE}/timesheet`, () => {
        return HttpResponse.json({ invalid: 'data' }, { status: 200 })
      })
    )

    const { result } = renderHook(
      () =>
        useScheduleData({
          idToken: 'token123',
          start: new Date(),
          end: new Date(),
          queryKey: ['test'],
        }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })
})
