import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/handlers'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useSendSignUpConfirmationCode } from '../authentication'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
})

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

const VERIFY_URL = 'http://localhost:8080/auth/verify'

describe('useSendSignUpConfirmationCode', () => {
  afterEach(() => {
    queryClient.clear()
  })

  it('calls onSuccess on 200', async () => {
    server.use(
      http.post(VERIFY_URL, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('email')).toBe('test@test.com')
        return new HttpResponse(null, { status: 200 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(
      () => useSendSignUpConfirmationCode({ onSuccess, onError }),
      { wrapper }
    )

    result.current.mutate({ email: 'test@test.com' })

    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(onError).not.toHaveBeenCalled()
  })

  it('calls onError on 400', async () => {
    server.use(
      http.post(VERIFY_URL, () => {
        return HttpResponse.text('Bad request', { status: 400 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(
      () => useSendSignUpConfirmationCode({ onSuccess, onError }),
      { wrapper }
    )

    result.current.mutate({ email: 'bad@test.com' })

    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('calls onError on 404', async () => {
    server.use(
      http.post(VERIFY_URL, () => {
        return HttpResponse.text('Not found', { status: 404 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(
      () => useSendSignUpConfirmationCode({ onSuccess, onError }),
      { wrapper }
    )

    result.current.mutate({ email: 'nonexistent@test.com' })

    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('calls onError on 500', async () => {
    server.use(
      http.post(VERIFY_URL, () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(
      () => useSendSignUpConfirmationCode({ onSuccess, onError }),
      { wrapper }
    )

    result.current.mutate({ email: 'test@test.com' })

    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
