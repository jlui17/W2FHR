import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useIsDesktopView } from '../ScreenSizeHelpers'

describe('ScreenSizeHelpers', () => {
  let matchMediaMock: MockedFunction<typeof window.matchMedia>

  const createMediaQueryList = (query: string, matches: boolean): MediaQueryList => {
    return {
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
    }
  }

  beforeEach(() => {
    matchMediaMock = vi.fn().mockImplementation((query: string) => {
      const matches = query === '(min-width: 1024px)'
      return createMediaQueryList(query, matches)
    })
    window.matchMedia = matchMediaMock
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true when viewport is >= 1024px', () => {
    const { result } = renderHook(() => useIsDesktopView())
    expect(result.current).toBe(true) // mock defaults to matching 1024px query
  })

  it('returns false when viewport is < 1024px', () => {
    matchMediaMock.mockImplementation((query: string) =>
      createMediaQueryList(query, query !== '(min-width: 1024px)'),
    )

    const { result } = renderHook(() => useIsDesktopView())
    expect(result.current).toBe(false)
  })

  it('calls window.matchMedia with correct query', () => {
    renderHook(() => useIsDesktopView())
    expect(matchMediaMock).toHaveBeenCalledWith('(min-width: 1024px)')
  })
})
