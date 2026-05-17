import { describe, it, expect } from 'vitest'
import { dateToFormatForUser, dateToFormatForApi } from '../constants'

describe('dateToFormatForUser', () => {
  it('formats a date in PST timezone with full weekday/month/day/year', () => {
    // June 1, 2023, noon UTC = June 1, 2023, 5am PST
    const date = new Date('2023-06-01T12:00:00Z')
    const result = dateToFormatForUser(date)
    expect(result).toContain('2023')
    expect(result).toContain('June')
    expect(result).toContain('1')
  })

  it('handles DST transition (March vs November)', () => {
    // November date (PST, UTC-8)
    const nov = new Date('2024-11-15T12:00:00Z')
    expect(dateToFormatForUser(nov)).toContain('November')
    // June date (PDT, UTC-7)  
    const jun = new Date('2024-06-15T12:00:00Z')
    expect(dateToFormatForUser(jun)).toContain('June')
  })
})

describe('dateToFormatForApi', () => {
  it('returns YYYY-MM-DD in PST', () => {
    // June 15, 2024 UTC noon = June 15, 2024 5am PDT
    const date = new Date('2024-06-15T12:00:00Z')
    expect(dateToFormatForApi(date)).toBe('2024-06-15')
  })

  it('handles date near midnight UTC crossing PST day boundary', () => {
    // December 31, 2024 07:00 UTC = December 30, 2024 23:00 PST
    const date = new Date('2024-12-31T07:00:00Z')
    expect(dateToFormatForApi(date)).toBe('2024-12-30')
  })

  it('pads single digit month and day', () => {
    const date = new Date('2024-01-05T12:00:00Z')
    expect(dateToFormatForApi(date)).toBe('2024-01-05')
  })
})
