import type { Color, Digit, Type } from "./types"

type MutableCard<T extends Type> = {
  type: T
}

type MutableWildCard<T extends Extract<Type, 'WILD' | 'DRAW4'>> = MutableCard<T> & {
  type: T
}

type MutableColoredCard<T extends Type> = MutableCard<T> & {
  color: Color
}

export type MutableTypedCard<T extends Exclude<Type, 'NUMBERED'>> = MutableColoredCard<
  Exclude<Type, 'NUMBERED'>
> & {
  type: T
}

type MutableNumberedCard<T extends Extract<Type, 'NUMBERED'>> = MutableColoredCard<T> & {
  type: T
  number: Digit
}

export type Card<T extends Type> = T extends 'NUMBERED'
  ? Readonly<MutableNumberedCard<'NUMBERED'>>
  : T extends 'SKIP' | 'REVERSE' | 'DRAW2'
    ? Readonly<MutableTypedCard<T>>
    : T extends 'WILD' | 'DRAW4'
      ? Readonly<MutableWildCard<T>>
      : never
