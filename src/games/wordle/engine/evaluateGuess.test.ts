import { describe, expect, it } from 'vitest'
import { evaluateGuess } from './evaluateGuess'

describe('evaluateGuess', () => {
  it('marks correct letters', () => {
    expect(evaluateGuess('kotek', 'kotek')).toEqual([
      { letter: 'k', state: 'correct' },
      { letter: 'o', state: 'correct' },
      { letter: 't', state: 'correct' },
      { letter: 'e', state: 'correct' },
      { letter: 'k', state: 'correct' },
    ])
  })

  it('handles present and absent letters', () => {
    expect(evaluateGuess('kotek', 'temat')).toEqual([
      { letter: 't', state: 'present' },
      { letter: 'e', state: 'present' },
      { letter: 'm', state: 'absent' },
      { letter: 'a', state: 'absent' },
      { letter: 't', state: 'absent' },
    ])
  })

  it('handles duplicated letters correctly', () => {
    expect(evaluateGuess('kotek', 'kokos')).toEqual([
      { letter: 'k', state: 'correct' },
      { letter: 'o', state: 'correct' },
      { letter: 'k', state: 'absent' },
      { letter: 'o', state: 'absent' },
      { letter: 's', state: 'absent' },
    ])
  })
})