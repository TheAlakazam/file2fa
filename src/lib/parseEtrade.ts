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

    console.log('=== PARSING DEBUG ===')
    console.log('Total lines:', lines.length)
    console.log('Pattern 1:', pattern1)
    console.log('Pattern 2:', pattern2)
    
    for (const line of lines) {
        if (line.includes('Restricted') || line.includes('Sell') || line.includes('Mkt')) {
            console.log('Potential match line:', line)
        }
        
        // Try pattern 1 first
        let match = line.match(pattern1)
        let currency = 'USD'
        let price = ''
        
        if (match) {
            const [, orderDate, ex, sell, exercised, sold, currencySymbol, priceStr] = match
            currency = getCurrencyCode(currencySymbol.trim()) || 'USD'
            price = priceStr
        } else {
            // Try pattern 2
            match = line.match(pattern2)
            if (match) {
                const [, orderDate, ex, sell, exercised, sold, priceStr] = match
                currency = 'USD' // Default to USD for $ symbol
                price = priceStr
            }
        }
        
        if (match) {
            const [, orderDate, ex, sell, exercised, sold] = match

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

    console.log('=== PARSING RESULTS ===')
    console.log('Found', result.length, 'rows')
    console.log('Results:', result)
    
    return result
}

export function extractStockSymbol(text: string): string {
    const match = text.match(/Stock Plan\s+\((\w+)\)/)
    return match?.[1] || 'UNKNOWN'
}

