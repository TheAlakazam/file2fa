export interface CompanyInfo {
    name: string
    countryName: string
    countryCode: string
    address: string
    zipCode: string
}

export async function fetchCompanyFromOpenFIGI(symbol: string): Promise<CompanyInfo> {
    const body = [{
        idType: 'TICKER',
        idValue: symbol,
        exchCode: 'US' // assumes US-listed RSU (e.g. NASDAQ/NYSE)
    }]
    const url = 'https://cors-proxy.piyushjaipuriyar.workers.dev?url='
        + 'https://api.openfigi.com/v3/mapping';


    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // You can set an OpenFIGI API key here if needed:
            // 'X-OPENFIGI-APIKEY': 'your-api-key'
        },
        body: JSON.stringify(body)
    })

    const data = await res.json()
    const result = data[0]?.data?.[0]

    return {
        name: result?.name || `Unknown (${symbol})`,
        countryName: result?.country || 'United States of America',
        countryCode: result?.country === 'United States' ? 'US' : '',
        address: '',    // OpenFIGI doesn't give full address
        zipCode: ''     // You may let the user override this later
    }
}
