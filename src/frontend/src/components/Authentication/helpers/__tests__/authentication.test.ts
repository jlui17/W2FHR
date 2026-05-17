import { describe, it, expect } from 'vitest'
import { isAuthSession, NotConfirmedException } from '../authentication'

// Note: isSignUpResponse is a private (non-exported) function in authentication.ts.
// It validates SignUpResponse data via useSignUp's 201 handler internally.
// We test its behavior indirectly through useSignUp hook tests.

describe('isAuthSession', () => {
  it('returns true for valid auth session', () => {
    const session = { idToken: 'abc', refreshToken: 'def', features: ['manager'] }
    expect(isAuthSession(session)).toBe(true)
  })

  it('returns false for null', () => {
    expect(isAuthSession(null)).toBe(false)
  })

  it('returns false for non-object', () => {
    expect(isAuthSession('string')).toBe(false)
    expect(isAuthSession(42)).toBe(false)
  })

  it('returns false when idToken is missing', () => {
    expect(isAuthSession({ refreshToken: 'def', features: [] })).toBe(false)
  })

  it('returns false when refreshToken is missing', () => {
    expect(isAuthSession({ idToken: 'abc', features: [] })).toBe(false)
  })

  it('returns false when features is not an array', () => {
    expect(isAuthSession({ idToken: 'abc', refreshToken: 'def', features: 'not-array' })).toBe(false)
  })

  it('returns true with empty features array', () => {
    expect(isAuthSession({ idToken: 'abc', refreshToken: 'def', features: [] })).toBe(true)
  })
})

describe('NotConfirmedException', () => {
  it('is an instance of Error', () => {
    const err = new NotConfirmedException()
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(NotConfirmedException)
  })
})
