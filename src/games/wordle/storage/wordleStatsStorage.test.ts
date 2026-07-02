import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'
import { recordWordleResult } from './wordleStatsStorage'

describe('wordleStatsStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('records a won game', () => {
    const stats = recordWordleResult('pl', {
      dateKey: '2026-06-23',
      won: true,
      attempts: 3,
    })

    expect(stats.gamesPlayed).toBe(1)
    expect(stats.gamesWon).toBe(1)
    expect(stats.currentStreak).toBe(1)
    expect(stats.maxStreak).toBe(1)
    expect(stats.guessDistribution).toEqual([
      0, 0, 1, 0, 0, 0,
    ])
  })

  it('does not record the same date twice', () => {
    recordWordleResult('pl', {
      dateKey: '2026-06-23',
      won: true,
      attempts: 3,
    })

    const stats = recordWordleResult('pl', {
      dateKey: '2026-06-23',
      won: true,
      attempts: 2,
    })

    expect(stats.gamesPlayed).toBe(1)
    expect(stats.gamesWon).toBe(1)
    expect(stats.guessDistribution).toEqual([
      0, 0, 1, 0, 0, 0,
    ])
  })

  it('increments a consecutive winning streak', () => {
    recordWordleResult('en', {
      dateKey: '2026-06-22',
      won: true,
      attempts: 4,
    })

    const stats = recordWordleResult('en', {
      dateKey: '2026-06-23',
      won: true,
      attempts: 2,
    })

    expect(stats.currentStreak).toBe(2)
    expect(stats.maxStreak).toBe(2)
  })

  it('resets the streak after a loss', () => {
    recordWordleResult('en', {
      dateKey: '2026-06-22',
      won: true,
      attempts: 4,
    })

    const stats = recordWordleResult('en', {
      dateKey: '2026-06-23',
      won: false,
      attempts: 6,
    })

    expect(stats.gamesPlayed).toBe(2)
    expect(stats.gamesWon).toBe(1)
    expect(stats.currentStreak).toBe(0)
  })
})