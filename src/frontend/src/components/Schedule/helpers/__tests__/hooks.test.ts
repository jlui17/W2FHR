import { describe, it, expect } from 'vitest'
import { sampleData } from '../hooks'

describe('Schedule helpers', () => {
  describe('sampleData', () => {
    it('has expected structure', () => {
      expect(sampleData.shifts).toBeInstanceOf(Array)
      expect(sampleData.shifts.length).toBeGreaterThan(0)
    })

    it('each shift has required fields', () => {
      for (const shift of sampleData.shifts) {
        expect(shift).toHaveProperty('date')
        expect(shift).toHaveProperty('shiftTitle')
        expect(shift).toHaveProperty('startTime')
        expect(shift).toHaveProperty('endTime')
        expect(shift).toHaveProperty('breakDuration')
        expect(shift).toHaveProperty('netHours')
        expect(shift).toHaveProperty('employeeName')
        expect(shift.date).toBeInstanceOf(Date)
        expect(typeof shift.netHours).toBe('number')
      }
    })
  })
})

describe('ScheduleData conversion logic', () => {
  it('converts shift string dates to Date objects', () => {
    for (const shift of sampleData.shifts) {
      expect(shift.date).toBeInstanceOf(Date)
      expect(isNaN(shift.date.getTime())).toBe(false)
    }
  })

  it('preserves netHours as number', () => {
    for (const shift of sampleData.shifts) {
      expect(typeof shift.netHours).toBe('number')
      expect(shift.netHours).toBeGreaterThan(0)
    }
  })

  it('preserves employee name', () => {
    const names = sampleData.shifts.map(s => s.employeeName)
    expect(names).toContain('John Doe')
    expect(names).toContain('Jane Smith')
    expect(names).toContain('Alice Johnson')
  })

  it('handles all shift titles from conversion', () => {
    const titles = sampleData.shifts.map(s => s.shiftTitle)
    expect(titles).toContain('Morning')
    expect(titles).toContain('Evening')
    expect(titles).toContain('Night')
  })

  it('converts break duration strings correctly', () => {
    for (const shift of sampleData.shifts) {
      expect(typeof shift.breakDuration).toBe('string')
      expect(shift.breakDuration).toMatch(/^\d+:\d{2}$/)
    }
  })
})
