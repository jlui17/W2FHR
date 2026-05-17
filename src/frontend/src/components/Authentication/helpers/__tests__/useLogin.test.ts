import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/handlers'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useLogin, NotConfirmedException, AuthSession } from '../authentication'

// always retry: false in tests
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
})

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

const LOGIN_URL = 'http://localhost:8080/auth/login'

const validSession: AuthSession = { idToken: 'id123', refreshToken: 'ref123', features: ['manager'] }

describe('useLogin', () => {
  afterEach(() => {
    queryClient.clear()
  })

  it('calls onSuccess with valid credentials', async () => {
    server.use(
      http.post(LOGIN_URL, async ({ request }) => {
        const body = await request.json() as any
        if (body.email === 'test@test.com' && body.password === 'pass') {
          return HttpResponse.json(validSession, { status: 200 })
        }
        return HttpResponse.text('Invalid', { status: 400 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(() => useLogin(onSuccess, onError), { wrapper })

    result.current.mutate({ email: 'test@test.com', password: 'pass' })

    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    // react-query mutation onSuccess passes (data, variables, context)
    expect(onSuccess).toHaveBeenCalledWith(validSession, expect.any(Object), undefined, expect.any(Object))
    expect(onError).not.toHaveBeenCalled()
  })

  it('calls onError with NotConfirmedException when user is not confirmed', async () => {
    server.use(
      http.post(LOGIN_URL, () => {
        return HttpResponse.text('User is not confirmed.', { status: 400 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(() => useLogin(onSuccess, onError), { wrapper })

    result.current.mutate({ email: 'test@test.com', password: 'wrong' })

    await waitFor(() => expect(onError).toHaveBeenCalled())
    // react-query mutation onError passes (error, variables, context)
    expect(onError).toHaveBeenCalledWith(expect.any(NotConfirmedException), expect.any(Object), undefined, expect.any(Object))
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('calls onError on 500', async () => {
    server.use(
      http.post(LOGIN_URL, () => {
        return HttpResponse.text('Server error', { status: 500 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(() => useLogin(onSuccess, onError), { wrapper })

    result.current.mutate({ email: 'test@test.com', password: 'pass' })

    await waitFor(() => expect(onError).toHaveBeenCalled())
    // react-query mutation onError passes (error, variables, context)
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object), undefined, expect.any(Object))
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('calls onError when response is not valid AuthSession', async () => {
    server.use(
      http.post(LOGIN_URL, () => {
        return HttpResponse.json({ invalid: 'data' }, { status: 200 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(() => useLogin(onSuccess, onError), { wrapper })

    result.current.mutate({ email: 'test@test.com', password: 'pass' })

    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
