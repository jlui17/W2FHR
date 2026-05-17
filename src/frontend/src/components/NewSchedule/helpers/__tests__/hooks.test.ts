import { describe, it, expect } from 'vitest'
import { getGamesTemplate, getWWTemplate, getBlankTemplate, NewScheduleSchemaFormData } from '../hooks'

const shiftTimes = [
  '12:00 am', '12:15 am', '12:30 am', '12:45 am',
  '1:00 am', '1:15 am', '1:30 am', '1:45 am',
  '2:00 am', '2:15 am', '2:30 am', '2:45 am',
  '3:00 am', '3:15 am', '3:30 am', '3:45 am',
  '4:00 am', '4:15 am', '4:30 am', '4:45 am',
  '5:00 am', '5:15 am', '5:30 am', '5:45 am',
  '6:00 am', '6:15 am', '6:30 am', '6:45 am',
  '7:00 am', '7:15 am', '7:30 am', '7:45 am',
  '8:00 am', '8:15 am', '8:30 am', '8:45 am',
  '9:00 am', '9:15 am', '9:30 am', '9:45 am',
  '10:00 am', '10:15 am', '10:30 am', '10:45 am',
  '11:00 am', '11:15 am', '11:30 am', '11:45 am',
  '12:00 pm', '12:15 pm', '12:30 pm', '12:45 pm',
  '1:00 pm', '1:15 pm', '1:30 pm', '1:45 pm',
  '2:00 pm', '2:15 pm', '2:30 pm', '2:45 pm',
  '3:00 pm', '3:15 pm', '3:30 pm', '3:45 pm',
  '4:00 pm', '4:15 pm', '4:30 pm', '4:45 pm',
  '5:00 pm', '5:15 pm', '5:30 pm', '5:45 pm',
  '6:00 pm', '6:15 pm', '6:30 pm', '6:45 pm',
  '7:00 pm', '7:15 pm', '7:30 pm', '7:45 pm',
  '8:00 pm', '8:15 pm', '8:30 pm', '8:45 pm',
  '9:00 pm', '9:15 pm', '9:30 pm', '9:45 pm',
  '10:00 pm', '10:15 pm', '10:30 pm', '10:45 pm',
  '11:00 pm', '11:15 pm', '11:30 pm', '11:45 pm'
]

describe('getBlankTemplate', () => {
  it('returns a template with one empty shift', () => {
    const template = getBlankTemplate()
    expect(template.shifts).toHaveLength(1)
    expect(template.shifts[0].employee).toBe('')
    expect(template.shifts[0].shiftTitle).toBe('')
    expect(template.shifts[0].startTime).toBe('')
    expect(template.shifts[0].endTime).toBe('')
    expect(template.shifts[0].breakDuration).toBe('')
    expect(template.shifts[0].designation).toBe('Games')
  })
})

describe('getGamesTemplate', () => {
  it('returns shifts with correct designation', () => {
    const template = getGamesTemplate('10:00 am', '6:00 pm', shiftTimes)
    expect(template.shifts.length).toBeGreaterThan(0)
    for (const shift of template.shifts) {
      expect(shift.designation).toBe('Games')
      expect(shift.employee).toBe('') // all unassigned
    }
  })

  it('supervisors and managers get earlier start time (3 slots back)', () => {
    const startTime = '12:00 pm'
    const endTime = '6:00 pm'
    const template = getGamesTemplate(startTime, endTime, shiftTimes)
    
    const supervisor = template.shifts.find(s => s.shiftTitle === 'Games Supervisor')
    expect(supervisor).toBeDefined()
    expect(supervisor!.startTime).not.toBe(startTime)
    expect(supervisor!.startTime).toBe('11:15 am') // 3 slots back from 12:00 pm
    expect(supervisor!.endTime).toBe(endTime)
  })

  it('handles startTime at beginning of array (no 3-slot rollback)', () => {
    const template = getGamesTemplate('12:00 am', '8:00 am', shiftTimes)
    expect(template.shifts.length).toBeGreaterThan(0)
    // Should not crash even though 3 slots back would be negative
  })

  it('contains expected game booth shift titles', () => {
    const template = getGamesTemplate('10:00 am', '6:00 pm', shiftTimes)
    const titles = template.shifts.map(s => s.shiftTitle)
    expect(titles).toContain('1. High Striker')
    expect(titles).toContain('Games Supervisor')
    expect(titles).toContain('Assistant Manager')
    expect(titles).toContain('General Manager')
  })

  it('all shifts have break duration of 00:30:00', () => {
    const template = getGamesTemplate('10:00 am', '6:00 pm', shiftTimes)
    for (const shift of template.shifts) {
      expect(shift.breakDuration).toBe('00:30:00')
    }
  })
})

describe('getWWTemplate', () => {
  it('returns shifts with Water Walkers designation', () => {
    const template = getWWTemplate('10:00 am', '6:00 pm', shiftTimes)
    expect(template.shifts.length).toBeGreaterThan(0)
    for (const shift of template.shifts) {
      expect(shift.designation).toBe('Water Walkers')
    }
  })

  it('breaker gets later start time (3 slots forward)', () => {
    const startTime = '10:00 am'
    const template = getWWTemplate(startTime, '6:00 pm', shiftTimes)
    const breaker = template.shifts.find(s => s.shiftTitle === 'Water Walkers Breaker')
    expect(breaker).toBeDefined()
    expect(breaker!.startTime).not.toBe(startTime)
    expect(breaker!.startTime).toBe('10:45 am') // 3 slots forward from 10:00 am
  })

  it('handles startTime near end of array (no 3-slot forward overflow)', () => {
    const template = getWWTemplate('11:45 pm', '11:45 pm', shiftTimes)
    expect(template.shifts.length).toBeGreaterThan(0)
    // Should not crash even though 3 slots forward would overflow
  })

  it('contains expected WW shift titles', () => {
    const template = getWWTemplate('10:00 am', '6:00 pm', shiftTimes)
    const titles = template.shifts.map(s => s.shiftTitle)
    expect(titles).toContain('Water Walkers Attendant')
    expect(titles).toContain('Water Walkers Breaker')
    expect(titles).toContain('Water Walkers Supervisor')
  })

  it('all shifts have break duration of 00:30:00', () => {
    const template = getWWTemplate('10:00 am', '6:00 pm', shiftTimes)
    for (const shift of template.shifts) {
      expect(shift.breakDuration).toBe('00:30:00')
    }
  })
})
