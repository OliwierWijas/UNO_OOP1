import { Card } from "../model/card";
import { Color, Digit, Type } from "../model/types";

export function mapCard(card: { type: string; color?: string; digit?: number | null }): Card<Type> {
  const type = card.type as Type;

  switch (type) {
    case 'NUMBERED':
      if (card.color === undefined) throw new Error("Missing color for NUMBERED card");
      if (card.digit === undefined || card.digit === null) throw new Error("Missing digit for NUMBERED card");
      return {
        type,
        color: card.color as Color,
        number: card.digit as Digit,
      };
    case 'SKIP':
    case 'REVERSE':
    case 'DRAW2':
      if (card.color === undefined) throw new Error(`Missing color for ${type} card`);
      return {
        type,
        color: card.color as Color,
      };
    case 'WILD':
    case 'DRAW4':
      return {
        type,
      };
    default:
      throw new Error(`Unknown card type: ${type}`);
  }
}