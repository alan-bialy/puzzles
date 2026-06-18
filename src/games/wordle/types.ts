export type LetterState = 'correct' | 'present' | 'absent'

export type GameStatus = 'playing' | 'won' | 'lost'

export type EvaluatedLetter = {
  letter: string
  state: LetterState
}

export type GuessEvaluation = EvaluatedLetter[]

export type WordleDictionary = {
  answers: string[]
  allowed: Set<string>
}