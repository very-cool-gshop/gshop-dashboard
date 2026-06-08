const paymentMethodLabels: Record<string, string> = {
  credit_card: '信用卡',
  bank_transfer: '銀行轉帳',
  cod: '貨到付款',
}

export function formatPaymentMethod(method: string): string {
  return paymentMethodLabels[method] ?? method
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!
}
