import { ParsedEtradeRow } from '@/lib/parseEtrade'
import { getFxRateForPurpose } from '@/lib/fxRate'
import { CompanyInfo } from '@/lib/companyInfo'

export interface ScheduleFARow {
    countryName: string
    countryCode: string
    nameOfEntity: string
    addressOfEntity: string
    zipCode: string
    natureOfEntity: string
    dateOfAcquisition: string
    initialValueINR: number
    peakValueINR: number
    closingValueINR: number
    totalGrossCreditedINR: number
    totalGrossProceedsINR: number
    currency: string
    sharesHeld: number
}

export async function mapToScheduleFA(
    rows: ParsedEtradeRow[],
    company: CompanyInfo,
    peakPrice: number,
    dec31Price: number
): Promise<ScheduleFARow[]> {
    const scheduleRows: ScheduleFARow[] = []

    for (const row of rows) {
        const sharesHeld = row.exercisedQty - row.soldQty
        if (sharesHeld <= 0) continue

        const fxInitial = await getFxRateForPurpose('initial', row.orderDate, row.currency)
        const fxPeak = await getFxRateForPurpose('peak', row.orderDate, row.currency)
        const fxClosing = await getFxRateForPurpose('closing', row.orderDate, row.currency)

        const initialValueINR = row.executionPrice * row.exercisedQty * fxInitial
        const peakValueINR = peakPrice * row.exercisedQty * fxPeak
        const closingValueINR = dec31Price * sharesHeld * fxClosing

        scheduleRows.push({
            countryName: company.countryName,
            countryCode: company.countryCode,
            nameOfEntity: company.name,
            addressOfEntity: company.address,
            zipCode: company.zipCode,
            natureOfEntity: `Listed Company`,
            dateOfAcquisition: row.orderDate,
            initialValueINR,
            peakValueINR,
            closingValueINR,
            totalGrossCreditedINR: 0,
            totalGrossProceedsINR: 0,
            currency: row.currency,
            sharesHeld,
        })
    }

    return scheduleRows
}
