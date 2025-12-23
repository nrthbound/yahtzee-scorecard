type UpperValue = number | 'scratch' | null
type LowerValue = number | boolean | 'scratch' | null

export function calculateUpper(upper: Record<string, UpperValue>) {
  const values = [
    upper.ones === 'scratch' || upper.ones === null ? 0 : upper.ones * 1,
    upper.twos === 'scratch' || upper.twos === null ? 0 : upper.twos * 2,
    upper.threes === 'scratch' || upper.threes === null ? 0 : upper.threes * 3,
    upper.fours === 'scratch' || upper.fours === null ? 0 : upper.fours * 4,
    upper.fives === 'scratch' || upper.fives === null ? 0 : upper.fives * 5,
    upper.sixes === 'scratch' || upper.sixes === null ? 0 : upper.sixes * 6,
  ]

  const subtotal = values.reduce((a, b) => a + b, 0)
  const bonus = subtotal >= 63 ? 35 : 0

  return {
    subtotal,
    bonus,
    total: subtotal + bonus
  }
}

export function calculateLower(lower: Record<string, LowerValue>) {
  // Helper function to get numeric value from different types
  const getValue = (val: LowerValue, fixedValue?: number): number => {
    if (val === 'scratch' || val === null) return 0;
    if (typeof val === 'boolean') return val ? (fixedValue || 0) : 0;
    return val;
  };

  const total =
    getValue(lower.threeOfAKind) +
    getValue(lower.fourOfAKind) +
    getValue(lower.fullHouse, 25) +
    getValue(lower.smallStraight, 30) +
    getValue(lower.largeStraight, 40) +
    getValue(lower.yahtzee, 50) +
    getValue(lower.chance);

  return total;
}

export function calculateGrandTotal(upper: Record<string, UpperValue>, lower: Record<string, LowerValue>) {
  const upperResult = calculateUpper(upper);
  const lowerTotal = calculateLower(lower);
  
  return {
    upperTotal: upperResult.total,
    lowerTotal: lowerTotal,
    grandTotal: upperResult.total + lowerTotal
  };
}

