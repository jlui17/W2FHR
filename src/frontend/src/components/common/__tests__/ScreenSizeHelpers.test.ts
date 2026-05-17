import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useIsDesktopView } from '../ScreenSizeHelpers'

describe('ScreenSizeHelpers', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>
  let listeners: Map<string, ((e: MediaQueryListEvent) => void)[]>

  beforeEach(() => {
    listeners = new Map()
    matchMediaMock = vi.fn().mockImplementation((query: string) => {
      const matches = query === '(min-width: 1024px)'
      const eventListeners: { [event: string]: ((e: MediaQueryListEvent) => void)[] } = {}
      
      const mql = {
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: (event: string, listener: (e: MediaQueryListEvent) => void) => {
          if (!eventListeners[event]) eventListeners[event] = []
          eventListeners[event].push(listener)
        },
        removeEventListener: (event: string, listener: (e: MediaQueryListEvent) => void) => {
          if (eventListeners[event]) {
            eventListeners[event] = eventListeners[event].filter(l => l !== listener)
          }
        },
        dispatchEvent: vi.fn(),
      }
      return mql
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
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query !== '(min-width: 1024px)', // desktop query returns false
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { result } = renderHook(() => useIsDesktopView())
    expect(result.current).toBe(false)
  })

  it('calls window.matchMedia with correct query', () => {
    renderHook(() => useIsDesktopView())
    expect(matchMediaMock).toHaveBeenCalledWith('(min-width: 1024px)')
  })
})
