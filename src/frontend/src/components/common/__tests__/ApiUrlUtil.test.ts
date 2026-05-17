import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getTimesheetApiUrlForEmployee, getScheduleForTimeRangeApiUrl, getSchedulingApiUrl, getAuthApiUrlForEmail, getAuthApiUrlForResetPassword } from '../ApiUrlUtil'

describe('ApiUrlUtil', () => {
  const originalEnv = { ...import.meta.env }

  beforeEach(() => {
    vi.stubEnv('MODE', 'development')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('getTimesheetApiUrlForEmployee', () => {
    it('appends upcoming=true when getUpcoming is true', () => {
      const url = getTimesheetApiUrlForEmployee(true)
      expect(url).toContain('upcoming=true')
    })

    it('appends upcoming=false when getUpcoming is false', () => {
      const url = getTimesheetApiUrlForEmployee(false)
      expect(url).toContain('upcoming=false')
    })
  })

  describe('getScheduleForTimeRangeApiUrl', () => {
    it('includes start and end dates', () => {
      const start = new Date('2024-06-10T12:00:00Z')
      const end = new Date('2024-06-16T12:00:00Z')
      const url = getScheduleForTimeRangeApiUrl(start, end)
      expect(url).toContain('start=')
      expect(url).toContain('end=')
      expect(url).toContain('/timesheet?')
    })
  })

  describe('getSchedulingApiUrl', () => {
    it('returns the scheduling API URL', () => {
      const url = getSchedulingApiUrl()
      expect(url).toContain('/scheduling')
    })
  })

  describe('getAuthApiUrlForEmail', () => {
    it('appends email to auth URL', () => {
      const url = getAuthApiUrlForEmail('test@example.com')
      expect(url).toContain('/auth/test@example.com')
    })
  })

  describe('getAuthApiUrlForResetPassword', () => {
    it('appends email as query param', () => {
      const url = getAuthApiUrlForResetPassword('test@example.com')
      expect(url).toContain('email=test@example.com')
    })
  })
})
