import type { Card, NumberedCard, ActionCard, WildCard, ActionType, WildType } from "../model/card"
import type { Color, Digit } from "../model/types"
import { standardShuffler } from "./random_utils"


export class DeckFactory {
  static DIGITS: readonly Digit[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const

  // Create NUMBERED cards for a given color
  static createNumberedCards(color: Color): NumberedCard[] {
    return [
      ...this.DIGITS.map((n) => ({
        type: "NUMBERED" as const /*as const because it didnt understand that its a type not string*/,
        color,
        number: n,
      })),
      ...this.DIGITS.slice(1).map((n) => ({
        type: "NUMBERED" as const,
        color,
        number: n,
      })),
    ]
  }

  // Create colored typed cards: SKIP, REVERSE, DRAW2
  static createActionCards(
    type: ActionType,
    color: Color,
    count: number,
  ): ActionCard[] {
    return Array.from({ length: count }, () => ({
      type,
      color,
    }))
  }

  // Create wild cards: WILD, DRAW4
  static createWildCards(type: WildType, count: number): WildCard[] {
    return Array.from({ length: count }, () => ({
      type,
    }))
  }

  static createFullDeck(): Card[] {
    const COLORS: readonly Color[] = ["BLUE", "RED", "GREEN", "YELLOW"]
    const ACTION_TYPES: readonly ActionType[] = ["SKIP", "REVERSE", "DRAW2"]
    const WILD_TYPES: readonly WildType[] = ["WILD", "DRAW4"]

    const cards: Card[] = [
      ...COLORS.flatMap((color) =>
        this.createNumberedCards(color)
      ),

      ...ACTION_TYPES.flatMap((type) =>
        COLORS.flatMap((color) =>
          this.createActionCards(type, color, 2)
        )
      ),

      ...WILD_TYPES.flatMap((type) =>
        this.createWildCards(type, 4)
      ),
    ]

    standardShuffler(cards)
    return cards
  }
}
