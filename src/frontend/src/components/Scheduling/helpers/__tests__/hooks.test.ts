import { describe, it, expect } from 'vitest'
import { convertSchedulingDataFromAPI, SchedulingData, isSchedulingDataFromAPI } from '../hooks'

const validApiData = {
  availability: {
    '2024-11-01': [{ name: 'John Doe', position: 'Attendant' }],
    '2024-11-02': [{ name: 'Jane Smith', position: 'Supervisor' }]
  },
  scheduledEmployees: {
    '2024-11-01': [{ name: 'John Doe' }]
  },
  metadata: {
    shiftTitles: ['Games Supervisor', 'Water Walkers Attendant', 'Assistant Manager'],
    shiftTimes: ['08:00 am', '12:00 pm', '04:00 pm'],
    breakDurations: ['00:00:00', '00:30:00', '01:00:00']
  },
  showMonday: false,
  disableUpdates: false,
  startOfWeek: '2024-11-01'
}

describe('isSchedulingDataFromAPI', () => {
  it('returns true for valid data', () => {
    // Clone because isSchedulingDataFromAPI mutates startOfWeek to a Date
    const data = JSON.parse(JSON.stringify(validApiData))
    expect(isSchedulingDataFromAPI(data)).toBe(true)
  })

  it('returns false for null', () => {
    expect(isSchedulingDataFromAPI(null)).toBe(false)
  })

  it('returns false when missing availability', () => {
    const { availability, ...rest } = validApiData
    expect(isSchedulingDataFromAPI(rest)).toBe(false)
  })

  it('returns false when missing metadata', () => {
    const { metadata, ...rest } = validApiData
    expect(isSchedulingDataFromAPI(rest)).toBe(false)
  })

  it('returns false when metadata has wrong shape', () => {
    const bad = { ...validApiData, metadata: { shiftTitles: 'not-array', shiftTimes: [], breakDurations: [] } }
    expect(isSchedulingDataFromAPI(bad)).toBe(false)
  })

  it('returns false when showMonday is not boolean', () => {
    const bad = { ...validApiData, showMonday: 'true' }
    expect(isSchedulingDataFromAPI(bad)).toBe(false)
  })

  it('returns false when availability has invalid employee', () => {
    const bad = {
      ...validApiData,
      availability: { '2024-11-01': [{ name: 123, position: 'Attendant' }] }
    }
    expect(isSchedulingDataFromAPI(bad)).toBe(false)
  })
})

describe('convertSchedulingDataFromAPI', () => {
  it('converts API data to SchedulingData', () => {
    const data = JSON.parse(JSON.stringify(validApiData))
    const result = convertSchedulingDataFromAPI(data as any)
    expect(result.metadata.shiftTitles).toBeInstanceOf(Set)
    expect(result.metadata.shiftTitles.has('Games Supervisor')).toBe(true)
    expect(result.showMonday).toBe(false)
    expect(result.disableUpdates).toBe(false)
    expect(result.startOfWeek).toBeInstanceOf(Date)
  })

  it('converts startOfWeek string to Date', () => {
    const data = JSON.parse(JSON.stringify(validApiData))
    const result = convertSchedulingDataFromAPI(data as any)
    expect(result.startOfWeek).toBeInstanceOf(Date)
    expect(result.startOfWeek.getFullYear()).toBe(2024)
  })

  it('converts availability keys to formatted dates', () => {
    const data = JSON.parse(JSON.stringify(validApiData))
    const result = convertSchedulingDataFromAPI(data as any)
    const keys = Object.keys(result.availability)
    expect(keys.length).toBe(2)
    // Dates should be formatted with day of week and full month
    expect(keys[0]).toContain('2024')
  })

  it('converts scheduledEmployees arrays to Sets', () => {
    const data = JSON.parse(JSON.stringify(validApiData))
    const result = convertSchedulingDataFromAPI(data as any)
    const employees = result.scheduledEmployees
    const firstKey = Object.keys(employees)[0]
    expect(employees[firstKey]).toBeInstanceOf(Set)
  })

  it('sorts days chronologically', () => {
    const data = JSON.parse(JSON.stringify(validApiData))
    const result = convertSchedulingDataFromAPI(data as any)
    expect(result.days.length).toBe(2)
    // days should be in order: first date is before second date
    const date0 = new Date(result.days[0])
    const date1 = new Date(result.days[1])
    expect(date0.getTime()).toBeLessThan(date1.getTime())
    // both formatted dates contain the year
    expect(result.days[0]).toContain('2024')
  })

  it('handles empty availability', () => {
    const empty = { ...validApiData, availability: {}, scheduledEmployees: {} }
    const data = JSON.parse(JSON.stringify(empty))
    const result = convertSchedulingDataFromAPI(data as any)
    expect(Object.keys(result.availability).length).toBe(0)
    expect(result.days.length).toBe(0)
  })

  it('has shiftTitles as Set in metadata', () => {
    const data = JSON.parse(JSON.stringify(validApiData))
    const result = convertSchedulingDataFromAPI(data as any)
    expect(result.metadata.shiftTitles.has('Games Supervisor')).toBe(true)
    expect(result.metadata.shiftTitles.has('Assistant Manager')).toBe(true)
  })
})
