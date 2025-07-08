import Papa from 'papaparse'

type FXPurpose = 'initial' | 'peak' | 'closing' | 'dividend' | 'sale'

const STORAGE_KEY_PREFIX = 'fx_sbi_ttbr_'
const FX_CACHE: Record<string, Record<string, number>> = {}

function getFxCsvUrl(currency: string): string {
    return `https://raw.githubusercontent.com/sahilgupta/sbi-fx-ratekeeper/main/csv_files/SBI_REFERENCE_RATES_${currency.toUpperCase()}.csv`
}

function getDateForPurpose(purpose: FXPurpose, refDate: string): string {
    const date = new Date(refDate)

    if (purpose === 'closing') {
        return `${date.getFullYear()}-12-31`
    }

    if (purpose === 'dividend' || purpose === 'sale') {
        const prevMonth = new Date(date.getFullYear(), date.getMonth(), 0)
        return prevMonth.toISOString().split('T')[0]
    }

    // Convert to YYYY-MM-DD format for 'initial' and 'peak'
    return date.toISOString().split('T')[0]
}

function findClosestDate(date: string, rates: Record<string, number>): string {
    const keys = Object.keys(rates).sort().reverse()
    for (const d of keys) {
        if (d <= date) return d
    }
    throw new Error(`No rate found for or before ${date}`)
}

async function loadFxMap(currency: string): Promise<Record<string, number>> {
    // LocalStorage cache
    const storageKey = `${STORAGE_KEY_PREFIX}${currency}`
    const localString = localStorage.getItem(storageKey)
    const local = localString ? JSON.parse(localString) : null
    if (local && Object.keys(local).length > 0) return local

    // Else fetch from GitHub
    const url = getFxCsvUrl(currency)
    const res = await fetch(url)
    const text = await res.text()

    const parsed = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
    }).data as any[]

    const map: Record<string, number> = {}
    parsed.forEach(row => {
        if (row.DATE && row['TT BUY']) {
            const dateOnly = row.DATE.split(' ')[0] // Extract date part from "2025-07-08 09:09"
            map[dateOnly] = parseFloat(row['TT BUY'])
        }
    })

    // Cache
    localStorage.setItem(storageKey, JSON.stringify(map))
    return map
}

export async function getFxRateForPurpose(
    purpose: FXPurpose,
    refDate: string,
    currency: string = 'USD'
): Promise<number> {
    const targetDate = getDateForPurpose(purpose, refDate)

    if (!FX_CACHE[currency]) {
        FX_CACHE[currency] = await loadFxMap(currency)
    }

    const dateToUse = FX_CACHE[currency][targetDate]
        ? targetDate
        : findClosestDate(targetDate, FX_CACHE[currency])

    return FX_CACHE[currency][dateToUse]
}
