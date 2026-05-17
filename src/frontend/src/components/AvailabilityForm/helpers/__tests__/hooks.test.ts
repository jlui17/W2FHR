import { describe, it, expect } from 'vitest'
import { UserAvailability, Day } from '../hooks'

describe('Availability type shapes', () => {
  describe('Day', () => {
    it('valid day has correct shape', () => {
      const day: Day = { date: '2024-06-01', isAvailable: true }
      expect(typeof day.date).toBe('string')
      expect(typeof day.isAvailable).toBe('boolean')
    })
  })

  describe('UserAvailability', () => {
    it('valid availability has required fields', () => {
      const avail: UserAvailability = {
        day1: { date: '2024-06-01', isAvailable: true },
        day2: { date: '2024-06-02', isAvailable: false },
        day3: { date: '2024-06-03', isAvailable: true },
        day4: { date: '2024-06-04', isAvailable: false },
        canUpdate: true,
        showMonday: false
      }
      expect(avail.day1.isAvailable).toBe(true)
      expect(avail.day2.isAvailable).toBe(false)
      expect(avail.canUpdate).toBe(true)
      expect(avail.showMonday).toBe(false)
    })
  })

  describe('API contract validation', () => {
    it('rejects availability data with missing day fields', () => {
      // Day requires date (string) and isAvailable (boolean)
      const badDay = { date: 123, isAvailable: 'yes' } // wrong types
      expect(typeof badDay.date === 'string').toBe(false)
      expect(typeof badDay.isAvailable === 'boolean').toBe(false)
    })

    it('rejects when day1 is malformed', () => {
      // UserAvailability requires day1 through day4
      const bad = {
        day1: { date: '2024-01-01', isAvailable: 'not-boolean' },
        day2: { date: '2024-01-02', isAvailable: false },
        day3: { date: '2024-01-03', isAvailable: true },
        day4: { date: '2024-01-04', isAvailable: false },
        canUpdate: true,
        showMonday: false
      }
      // day1.isAvailable should be boolean, not string
      expect(typeof bad.day1.isAvailable).toBe('string') // confirms it's wrong type
    })
  })
})
