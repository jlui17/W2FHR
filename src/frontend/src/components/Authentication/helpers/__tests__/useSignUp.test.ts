import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/handlers'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useSignUp } from '../authentication'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
})

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

const SIGNUP_URL = 'http://localhost:8080/auth/employee'

describe('useSignUp', () => {
  afterEach(() => {
    queryClient.clear()
  })

  it('calls onSuccess with needsConfirmation=true on 201', async () => {
    server.use(
      http.post(SIGNUP_URL, () => {
        return HttpResponse.json({ needsConfirmation: true }, { status: 201 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(() => useSignUp({ onSuccess, onError }), { wrapper })

    result.current.mutate({ email: 'new@test.com', password: 'pass123!' })

    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    // react-query mutation onSuccess passes (data, variables, context)
    expect(onSuccess).toHaveBeenCalledWith({ needsConfirmation: true }, expect.any(Object), undefined, expect.any(Object))
  })

  it('calls onError on 400', async () => {
    server.use(
      http.post(SIGNUP_URL, () => {
        return HttpResponse.text('Bad request', { status: 400 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(() => useSignUp({ onSuccess, onError }), { wrapper })

    result.current.mutate({ email: 'existing@test.com', password: 'pass' })

    await waitFor(() => expect(onError).toHaveBeenCalled())
  })

  it('calls onError when 201 response is not valid SignUpResponse', async () => {
    server.use(
      http.post(SIGNUP_URL, () => {
        return HttpResponse.json({ notNeedsConfirmation: true }, { status: 201 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(() => useSignUp({ onSuccess, onError }), { wrapper })

    result.current.mutate({ email: 'test@test.com', password: 'validPass1!' })

    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('calls onError on 400', async () => {
    server.use(
      http.post(SIGNUP_URL, () => {
        return HttpResponse.text('Bad request', { status: 400 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(() => useSignUp({ onSuccess, onError }), { wrapper })

    result.current.mutate({ email: 'existing@test.com', password: 'pass' })

    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('calls onError on 500', async () => {
    server.use(
      http.post(SIGNUP_URL, () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(() => useSignUp({ onSuccess, onError }), { wrapper })

    result.current.mutate({ email: 'test@test.com', password: 'pass' })

    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
