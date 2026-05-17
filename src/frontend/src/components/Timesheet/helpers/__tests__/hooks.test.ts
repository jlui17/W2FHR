import { describe, it, expect } from 'vitest'
import { isTimesheetData, TimesheetData } from '../hooks'

describe('isTimesheetData', () => {
  const validData: TimesheetData = {
    shifts: [
      {
        date: '2024-06-01',
        shiftTitle: 'Morning',
        startTime: '08:00',
        endTime: '16:00',
        breakDuration: '1:00',
        netHours: 7,
        employeeName: 'John Doe',
      },
    ],
  }

  it('returns true for valid timesheet data', () => {
    expect(isTimesheetData(validData)).toBe(true)
  })

  it('returns false for non-object types', () => {
    expect(isTimesheetData('string')).toBe(false)
    expect(isTimesheetData(42)).toBe(false)
    expect(isTimesheetData(undefined)).toBe(false)
    expect(isTimesheetData(true)).toBe(false)
  })

  it('throws for null (typeof null is "object", then "in" throws)', () => {
    // typeof null === "object" in JS, so the implementation tries "shifts" in null → TypeError
    expect(() => isTimesheetData(null)).toThrow(TypeError)
  })

  it('returns false when shifts is not an array', () => {
    expect(isTimesheetData({ shifts: 'not-array' })).toBe(false)
  })

  it('returns false when shifts is missing', () => {
    expect(isTimesheetData({ other: 'field' })).toBe(false)
  })

  it('returns false when shift item is missing required fields', () => {
    expect(isTimesheetData({ shifts: [{ date: '2024-01-01' }] })).toBe(false)
  })

  it('returns false when shift item is missing one specific field', () => {
    expect(
      isTimesheetData({
        shifts: [
          {
            date: '2024-01-01',
            shiftTitle: 'Morning',
            startTime: '08:00',
            endTime: '16:00',
            breakDuration: '1:00',
            netHours: 7,
            // missing employeeName
          },
        ],
      })
    ).toBe(false)
  })

  it('returns true for empty shifts array', () => {
    expect(isTimesheetData({ shifts: [] })).toBe(true)
  })

  it('returns true for multiple valid shifts', () => {
    const data = {
      shifts: [
        {
          date: '2024-06-01',
          shiftTitle: 'Morning',
          startTime: '08:00',
          endTime: '16:00',
          breakDuration: '1:00',
          netHours: 7,
          employeeName: 'John',
        },
        {
          date: '2024-06-02',
          shiftTitle: 'Evening',
          startTime: '16:00',
          endTime: '00:00',
          breakDuration: '0:30',
          netHours: 7.5,
          employeeName: 'Jane',
        },
      ],
    }
    expect(isTimesheetData(data)).toBe(true)
  })

  it('returns false when an item is not an object (like a string in shifts)', () => {
    expect(
      isTimesheetData({
        shifts: ['not-an-object'],
      })
    ).toBe(false)
  })
})
