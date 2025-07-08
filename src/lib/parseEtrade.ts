import getCurrencyCode from 'currency-symbol-map'
export interface ParsedEtradeRow {
    benefitType: string
    orderDate: string
    orderType: string
    priceType: string
    sharesToExercise: number
    sharesToSell: number
    exercisedQty: number
    soldQty: number
    executionPrice: number
    currency: string
}

export function parseEtradeOcr(text: string): ParsedEtradeRow[] {
    const lines = text.split('\n')
    const result: ParsedEtradeRow[] = []

    // Pattern 1: Original format - Restricted <date> Sell Mkt <numbers>
    const pattern1 = /Restricted\s+(\d{2}\/\d{2}\/\d{4})\s+Sell\s+Mkt\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+([^\d\s])([\d.]+)/

    // Pattern 2: New format - Restricted <date> Sell Restricted Mkt <numbers>
    const pattern2 = /Restricted\s+(\d{2}\/\d{2}\/\d{4})\s+Sell\s+Restricted\s+Mkt\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+\$?([\d.]+)/


    for (const line of lines) {

        // Try pattern 1 first
        let match = line.match(pattern1)
        let currency = 'USD'
        let price = ''
        let orderDate = ''
        let ex = ''
        let sell = ''
        let exercised = ''
        let sold = ''

        if (match) {
            [, orderDate, ex, sell, exercised, sold, , price] = match
            const currencySymbol = match[6]
            currency = getCurrencyCode(currencySymbol.trim()) || 'USD'
        } else {
            // Try pattern 2
            match = line.match(pattern2)
            if (match) {
                [, orderDate, ex, sell, exercised, sold, price] = match
                currency = 'USD' // Default to USD for $ symbol
            }
        }

        if (match) {

            result.push({
                benefitType: 'Restricted Stock',
                orderDate,
                orderType: 'Sell',
                priceType: 'Mkt',
                sharesToExercise: parseInt(ex),
                sharesToSell: parseInt(sell),
                exercisedQty: parseInt(exercised),
                soldQty: parseInt(sold),
                executionPrice: parseFloat(price),
                currency
            })
        }
    }


    return result
}

export function extractStockSymbol(text: string): string {
    const match = text.match(/Stock Plan\s+\((\w+)\)/)
    return match?.[1] || 'UNKNOWN'
}

