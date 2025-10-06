// A function that returns a (possibly) random number from 0 to bound - 1
export type Randomizer = (bound: number) => number

// Uniformly selected pseudo-random number
export const standardRandomizer: Randomizer = (n) => Math.floor(Math.random() * n)

// A function that shuffles the given array
export type Shuffler<T> = (cards: T[]) => void

// Perfect shuffle using the Fisher-Yates method
export function standardShuffler<T>(cards: T[]) {
  for (let i = 0; i < cards.length - 1; i++) {
    const j = Math.floor(Math.random() * (cards.length - i) + i)
    const temp = cards[j]
    cards[j] = cards[i]
    cards[i] = temp
  }
}
