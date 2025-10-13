import type { Card } from "../model/card"
import type { Color, Digit, Type } from "../model/types"
import { standardShuffler } from "./random_utils"


export class DeckFactory {
  static DIGITS: readonly Digit[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const

  // Create NUMBERED cards for a given color
  static createNumberedCards(color: Color): Card<'NUMBERED'>[] {
    return [
      ...this.DIGITS.map((n) => ({ type: 'NUMBERED' as const, color, number: n })),
      ...this.DIGITS.slice(1).map((n) => ({ type: 'NUMBERED' as const, color, number: n })),
    ]
  }

  // Create colored typed cards: SKIP, REVERSE, DRAW2
  static createTypedCards<T extends Exclude<Type, 'NUMBERED' | 'WILD' | 'DRAW4'>>(
    type: T,
    color: Color,
    n: number,
  ): Card<T>[] {
    return Array.from({ length: n }, () => ({ type, color }) as Card<T>)
  }

  // Create wild cards: WILD, DRAW4
  static createWildCards<T extends Extract<Type, 'WILD' | 'DRAW4'>>(type: T, n: number): Card<T>[] {
    return Array.from({ length: n }, () => ({ type }) as Card<T>)
  }

  static createFullDeck(): Card<Type>[] {
    const COLORS: Color[] = ['BLUE', 'RED', 'GREEN', 'YELLOW']
    const TYPED_TYPES: Exclude<Type, 'NUMBERED' | 'WILD' | 'DRAW4'>[] = ['SKIP', 'REVERSE', 'DRAW2']
    const WILD_TYPES: Extract<Type, 'WILD' | 'DRAW4'>[] = ['WILD', 'DRAW4']

    const cards = [
      ...COLORS.flatMap((color) => this.createNumberedCards(color)),
      ...TYPED_TYPES.flatMap((type) =>
        COLORS.flatMap((color) => this.createTypedCards(type, color, 2)),
      ),
      ...WILD_TYPES.flatMap((type) => this.createWildCards(type, 4)),
    ]

    standardShuffler(cards)
    
    return cards
  }
}
