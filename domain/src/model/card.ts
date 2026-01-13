import type { Color, Digit, Type } from "./types"

export function isColoredCard(card: Card): card is ColoredCard {
  return card.type !== 'WILD' && card.type !== 'DRAW4'
}

export function isNumberedCard(card: Card): card is NumberedCard {
  return card.type === 'NUMBERED'
}

type BaseCard<T extends Type> = Readonly<{
  type: T
}>

export type NumberedType = Extract<Type, 'NUMBERED'>
// 'SKIP' | 'REVERSE' | 'DRAW2'
export type ActionType = Exclude<Type, NumberedType | 'WILD' | 'DRAW4'>
export type WildType = Extract<Type, 'WILD' | 'DRAW4'>

export type NumberedCard = BaseCard<NumberedType> & Readonly<{
  color: Color
  number: Digit
}>

export type ActionCard = BaseCard<ActionType> & Readonly<{
  color: Color
}>

export type WildCard = BaseCard<WildType>

export type Card =
  | NumberedCard
  | ActionCard
  | WildCard

// NUMBERED | ACTION
export type ColoredCard =
  Extract<Card, { color: Color }>

export type Typed = Pick<Card, 'type'>
type CardType = Card['type']

type x = Pick<NumberedCard, 'type' | 'color'>
type y = Omit<NumberedCard, 'type'>

//partial