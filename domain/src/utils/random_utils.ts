export type Randomizer = (bound: number) => number

export const standardRandomizer: Randomizer = (n) => Math.floor(Math.random() * n)

export type Shuffler<T> = (cards: T[]) => void

export function standardShuffler<T>(cards: T[]) {
  for (let i = 0; i < cards.length - 1; i++) {
    const j = Math.floor(Math.random() * (cards.length - i) + i)
    const temp = cards[j]
    cards[j] = cards[i]
    cards[i] = temp
  }
}
