import Papa from 'papaparse'

export interface ParsedCSVRow {
    purchaseDate: string
    stockSymbol: string
    amount: number
    currency: string
    purchasePrice: number
    purchasedQty: number
}

export function parseCsvFile(csvText: string): ParsedCSVRow[] {
    const { data, errors } = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
    })

    if (errors.length > 0) {
        throw new Error('CSV parsing error: ' + errors.map(e => e.message).join(', '))
    }

    // Normalize and map fields
    return (data as any[]).map(row => ({
        purchaseDate: row['Purchase Date'] || '',
        stockSymbol: row['Stock Symbol'] || '',
        amount: Number(row['Amount'] ?? 0),
        currency: row['Currency'] || '',
        purchasePrice: Number(row['Purchase Price'] ?? 0),
        purchasedQty: Number(row['Purchased Qty'] ?? 0)
    }))
}
