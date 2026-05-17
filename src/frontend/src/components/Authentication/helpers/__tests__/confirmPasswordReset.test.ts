import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/handlers'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { confirmPasswordReset } from '../authentication'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
})

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

const PASSWORD_URL = 'https://q4q2yztd56.execute-api.us-west-2.amazonaws.com/v1/auth/password'

describe('confirmPasswordReset', () => {
  afterEach(() => {
    queryClient.clear()
  })

  it('calls onSuccess on 200', async () => {
    server.use(
      http.put(PASSWORD_URL, async ({ request }) => {
        const body = await request.json() as any
        expect(body.email).toBe('test@test.com')
        expect(body.code).toBe('123456')
        expect(body.password).toBe('newPass1!')
        return new HttpResponse(null, { status: 200 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(
      () => confirmPasswordReset({ onSuccess, onError }),
      { wrapper }
    )

    result.current.mutate({ email: 'test@test.com', code: '123456', password: 'newPass1!' })

    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(onError).not.toHaveBeenCalled()
  })

  it('calls onError on 400', async () => {
    server.use(
      http.put(PASSWORD_URL, () => {
        return HttpResponse.text('Invalid code', { status: 400 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(
      () => confirmPasswordReset({ onSuccess, onError }),
      { wrapper }
    )

    result.current.mutate({ email: 'test@test.com', code: 'wrong', password: 'pass' })

    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('calls onError on 500', async () => {
    server.use(
      http.put(PASSWORD_URL, () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    const onSuccess = vi.fn()
    const onError = vi.fn()
    const { result } = renderHook(
      () => confirmPasswordReset({ onSuccess, onError }),
      { wrapper }
    )

    result.current.mutate({ email: 'test@test.com', code: '123456', password: 'newPass1!' })

    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
