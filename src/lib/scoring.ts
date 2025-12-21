export function calculateUpper(upper) {
  const values = [
    upper.ones ? upper.ones * 1 : 0,
    upper.twos ? upper.twos * 2 : 0,
    upper.threes ? upper.threes * 3 : 0,
    upper.fours ? upper.fours * 4 : 0,
    upper.fives ? upper.fives * 5 : 0,
    upper.sixes ? upper.sixes * 6 : 0,
  ]

  const subtotal = values.reduce((a, b) => a + b, 0)
  const bonus = subtotal >= 63 ? 35 : 0

  return {
    subtotal,
    bonus,
    total: subtotal + bonus
  }
}


