import { describe, it, expect, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/handlers'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useTimesheetData, TimesheetData } from '../hooks'

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
      breakDuration: '1:00',
      netHours: 7,
      employeeName: 'John Doe',
    },
  ],
}

describe('useTimesheetData', () => {
  afterEach(() => {
    queryClient.clear()
  })

  it('fetches timesheet data with valid response', async () => {
    server.use(
      http.get(`${BASE}/timesheet`, ({ request }) => {
        const url = new URL(request.url)
        if (url.searchParams.get('upcoming') === 'true') {
          return HttpResponse.json(validTimesheet, { status: 200 })
        }
        return HttpResponse.text('Not found', { status: 404 })
      })
    )

    const { result } = renderHook(
      () => useTimesheetData({ idToken: 'token123', getUpcoming: true }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(validTimesheet)
  })

  it('returns error on 404', async () => {
    server.use(
      http.get(`${BASE}/timesheet`, () => {
        return HttpResponse.text('Not found', { status: 404 })
      })
    )

    const { result } = renderHook(
      () => useTimesheetData({ idToken: 'token123', getUpcoming: true }),
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
      () => useTimesheetData({ idToken: 'token123', getUpcoming: true }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })

  it('returns error on malformed data (200 but invalid)', async () => {
    server.use(
      http.get(`${BASE}/timesheet`, () => {
        return HttpResponse.json({ notShifts: true }, { status: 200 })
      })
    )

    const { result } = renderHook(
      () => useTimesheetData({ idToken: 'token123', getUpcoming: true }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('does not fetch when getUpcoming is false', async () => {
    server.use(
      http.get(`${BASE}/timesheet`, () => {
        return HttpResponse.json(validTimesheet, { status: 200 })
      })
    )

    const { result } = renderHook(
      () => useTimesheetData({ idToken: 'token123', getUpcoming: false }),
      { wrapper }
    )

    // Should stay idle — query is disabled when getUpcoming is false
    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('idle')
    })
  })
})
