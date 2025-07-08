interface YahooDaily {
    timestamp: number[]
    indicators: {
        quote: {
            high: number[]
            close: number[]
        }[]
    }
}

export async function fetchPeakAndDec31Price(symbol: string): Promise<{ peak: number, dec31: number }> {
    const proxyUrl = `https://cors-proxy.piyushjaipuriyar.workers.dev?url=${encodeURIComponent(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1y&interval=1d`
    )}`


    const res = await fetch(proxyUrl)
    if (!res.ok) throw new Error('Failed to fetch Yahoo Finance prices')

    const data = await res.json()

    const series: YahooDaily = data.chart.result[0]
    const { timestamp } = series
    const { high, close } = series.indicators.quote[0]

    let peak = -Infinity
    let dec31 = 0

    for (let i = 0; i < timestamp.length; i++) {
        const dateStr = new Date(timestamp[i] * 1000).toISOString().split('T')[0]

        if (high[i] > peak) peak = high[i]
        if (dateStr.endsWith('-12-31')) dec31 = close[i]
    }

    return {
        peak: Number(peak.toFixed(2)),
        dec31: Number(dec31.toFixed(2))
    }
}
