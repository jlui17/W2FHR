import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React, { useContext } from 'react'
import { AuthenticationContext, AuthenticationContextProvider } from '../AuthenticationContextProvider'
import { AuthSession } from '../Authentication/helpers/authentication'

describe('AuthenticationContextProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  function useAuthContext() {
    return useContext(AuthenticationContext)
  }

  function renderAuthHook() {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthenticationContextProvider>{children}</AuthenticationContextProvider>
    )
    return renderHook(() => useAuthContext(), { wrapper })
  }

  it('provides isLoggedIn returning false initially', () => {
    const { result } = renderAuthHook()
    expect(result.current.isLoggedIn()).toBe(false)
  })

  it('saves and retrieves auth session', () => {
    const { result } = renderAuthHook()
    const session: AuthSession = { idToken: 'token123', refreshToken: 'refresh123', features: ['manager'] }
    
    act(() => { result.current.saveAuthSession(session) })
    
    const retrieved = result.current.getAuthSession()
    expect(retrieved).not.toBeNull()
    expect(retrieved?.idToken).toBe('token123')
    expect(retrieved?.features).toEqual(['manager'])
  })

  it('saves merged auth session when called twice', () => {
    const { result } = renderAuthHook()
    act(() => { result.current.saveAuthSession({ idToken: 'first', refreshToken: 'r1', features: ['a'] }) })
    // Empty array [] is truthy in JS, so it overwrites features via || operator
    act(() => { result.current.saveAuthSession({ idToken: 'second', refreshToken: '', features: [] }) })
    
    const retrieved = result.current.getAuthSession()
    expect(retrieved?.idToken).toBe('second')
    // refreshToken '' is falsy, so 'r1' (first) is kept
    expect(retrieved?.refreshToken).toBe('r1')
    // features [] is truthy, so it overwrites ['a']
    expect(retrieved?.features).toEqual([])
  })

  it('logout removes auth session', () => {
    const { result } = renderAuthHook()
    act(() => { result.current.saveAuthSession({ idToken: 'tok', refreshToken: 'ref', features: [] }) })
    act(() => { result.current.logout() })
    
    expect(result.current.getAuthSession()).toBeNull()
  })

  it('stayLoggedIn defaults to false', () => {
    const { result } = renderAuthHook()
    expect(result.current.stayLoggedIn()).toBe(false)
  })

  it('setStayLoggedIn persists value', () => {
    const { result } = renderAuthHook()
    act(() => { result.current.setStayLoggedIn(true) })
    expect(result.current.stayLoggedIn()).toBe(true)
  })

  it('hasAccessToFeature checks features array', () => {
    const { result } = renderAuthHook()
    act(() => { result.current.saveAuthSession({ idToken: 'tok', refreshToken: 'ref', features: ['manager', 'scheduling'] }) })
    expect(result.current.hasAccessToFeature('manager')).toBe(true)
    expect(result.current.hasAccessToFeature('nonexistent')).toBe(false)
  })

  it('isLoggedIn returns false for expired JWT', () => {
    const { result } = renderAuthHook()
    // Create a JWT that's already expired (exp claim in the past)
    // jwt: header.payload.signature where payload = {"exp": 1000000000} (Sep 2001, expired)
    const expiredJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEwMDAwMDAwMDAsImlhdCI6MTAwMDAwMDAwMH0.4YwGv8G8v8G8v8G8v8G8v8G8v8G8v8G8v8G8'
    
    act(() => {
      result.current.saveAuthSession({ idToken: expiredJwt, refreshToken: 'ref', features: [] })
    })
    
    expect(result.current.isLoggedIn()).toBe(false)
  })

  it('isLoggedIn returns false for invalid JWT string', () => {
    const { result } = renderAuthHook()
    
    act(() => {
      result.current.saveAuthSession({ idToken: 'not-a-valid-jwt', refreshToken: 'ref', features: [] })
    })
    
    expect(result.current.isLoggedIn()).toBe(false)
  })
})
