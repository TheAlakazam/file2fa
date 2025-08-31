import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info, FileCheck, FileWarning, Loader2 } from 'lucide-react'

import { extractTextFromPDF } from '@/lib/pdfImage'
import { extractStockSymbol, parseEtradeOcr } from '@/lib/parseEtrade'
import { parseCsvFile } from '@/lib/parseCsv'
import { useNavigate } from 'react-router-dom'
import { mapToScheduleFA } from '@/lib/scheduleFAUtil'
import { fetchCompanyFromOpenFIGI } from '@/lib/companyInfo'
import { fetchPeakAndDec31Price } from '@/lib/fetchPrice'

const UploadPage = () => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [fileName, setFileName] = useState<string | null>(null)
    const [fileError, setFileError] = useState<string | null>(null)
    const [fileAccepted, setFileAccepted] = useState(false)
    const [ocrText, setOcrText] = useState<string | null>(null)
    const [parsedRows, setParsedRows] = useState<any[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [processingStep, setProcessingStep] = useState('')
    const [fileType, setFileType] = useState<'pdf' | 'csv'>('pdf')
    const navigate = useNavigate();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const isPdf = file.name.toLowerCase().endsWith('.pdf')
        const isCsv = file.name.toLowerCase().endsWith('.csv')
        if ((fileType === 'pdf' && !isPdf) || (fileType === 'csv' && !isCsv)) {
            setFileError(`Only ${fileType.toUpperCase()} files are supported.`)
            setFileAccepted(false)
            setFileName(null)
            return
        }

        setFileName(file.name)
        setFileAccepted(true)
        setFileError(null)

        if (isPdf) {
            try {
                setIsProcessing(true)
                setProcessingStep('Extracting text from PDF...')

                const pages = await extractTextFromPDF(file)
                const raw = pages.join('\n')
                setOcrText(raw)

                setProcessingStep('Parsing transaction data...')
                const parsedData = parseEtradeOcr(raw)
                setParsedRows(parsedData)
                const stockSymbol = extractStockSymbol(raw);

                setProcessingStep('Fetching company information...')
                const [companyInfo, { peak, dec31 }] = await Promise.all([
                    fetchCompanyFromOpenFIGI(stockSymbol),
                    fetchPeakAndDec31Price(stockSymbol)
                ])

                setProcessingStep('Generating Schedule FA entries...')
                const scheduleFaRows = await mapToScheduleFA(parsedData, companyInfo, peak, dec31);

                setIsProcessing(false)
                navigate('/results', { state: { rows: scheduleFaRows, stockSymbol } })
            } catch (err) {
                console.error('PDF text extraction failed:', err)
                setFileError('Failed to extract text from PDF.')
                setOcrText(null)
                setIsProcessing(false)
            }
        } else if (isCsv) {
            try {
                setIsProcessing(true)
                setProcessingStep('Parsing CSV data...')
                const text = await file.text()
                const parsedData = parseCsvFile(text)
                setParsedRows(parsedData)

                // Map CSV data to ScheduleFARow[]
                setProcessingStep('Fetching company information...')
                const stockSymbol = parsedData[0]?.stockSymbol || 'UNKNOWN'
                const [companyInfo, { peak, dec31 }] = await Promise.all([
                    fetchCompanyFromOpenFIGI(stockSymbol),
                    fetchPeakAndDec31Price(stockSymbol)
                ])

                setProcessingStep('Generating Schedule FA entries...')
                // Map CSV to ScheduleFARow[]
                const scheduleFaRows = await Promise.all(parsedData.map(async row => {
                    // Use INR conversion for all values
                    const fxInitial = await import('@/lib/fxRate').then(m => m.getFxRateForPurpose('initial', row.purchaseDate, row.currency))
                    const fxPeak = await import('@/lib/fxRate').then(m => m.getFxRateForPurpose('peak', row.purchaseDate, row.currency))
                    const fxClosing = await import('@/lib/fxRate').then(m => m.getFxRateForPurpose('closing', row.purchaseDate, row.currency))

                    const initialValueINR = row.purchasePrice * row.purchasedQty * fxInitial
                    const peakValueINR = peak * row.purchasedQty * fxPeak
                    const closingValueINR = dec31 * row.purchasedQty * fxClosing

                    return {
                        countryName: companyInfo.countryName,
                        countryCode: companyInfo.countryCode,
                        nameOfEntity: companyInfo.name,
                        addressOfEntity: companyInfo.address,
                        zipCode: companyInfo.zipCode,
                        natureOfEntity: 'Listed Company',
                        dateOfAcquisition: row.purchaseDate,
                        initialValueINR,
                        peakValueINR,
                        closingValueINR,
                        totalGrossCreditedINR: 0,
                        totalGrossProceedsINR: 0,
                        currency: row.currency,
                        sharesHeld: row.purchasedQty,
                    }
                }))

                setIsProcessing(false)
                navigate('/results', { state: { rows: scheduleFaRows, stockSymbol } })
            } catch (err) {
                console.error('CSV parsing failed:', err)
                setFileError('Failed to parse CSV file.')
                setIsProcessing(false)
            }
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-12 space-y-12">

            {/* Title */}
            <section className="text-center">
                <h1 className="text-3xl font-bold mb-2">Upload Your E*TRADE Transaction File</h1>
                <p className="text-muted-foreground text-base">
                    We'll process the file locally and generate Schedule FA entries for you.
                </p>
            </section>

            {/* Upload Box */}
            <section className="border border-dashed border-border p-8 rounded-xl text-center space-y-6">
                <div className="flex justify-center gap-4 mb-4">
                    <Button variant={fileType === 'pdf' ? 'default' : 'outline'} onClick={() => setFileType('pdf')}>PDF</Button>
                    <Button variant={fileType === 'csv' ? 'default' : 'outline'} onClick={() => setFileType('csv')}>CSV</Button>
                </div>
                <Input
                    type="file"
                    accept={fileType === 'pdf' ? '.pdf' : '.csv'}
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                />

                <div className="space-y-2">
                    <p className="text-muted-foreground">
                        {fileType === 'pdf' ? 'Choose a PDF file exported from E*TRADE.' : 'Choose a CSV file with the required columns.'}
                    </p>
                    <Button onClick={() => fileInputRef.current?.click()}>Select File</Button>
                </div>

                {/* Feedback */}
                {fileAccepted && fileName && (
                    <Alert variant="default">
                        <FileCheck className="h-4 w-4 text-green-500" />
                        <AlertTitle>File Loaded</AlertTitle>
                        <AlertDescription>{fileName}</AlertDescription>
                    </Alert>
                )}

                {fileError && (
                    <Alert variant="destructive">
                        <FileWarning className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{fileError}</AlertDescription>
                    </Alert>
                )}

                {isProcessing && (
                    <Alert>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <AlertTitle>Processing...</AlertTitle>
                        <AlertDescription>{processingStep}</AlertDescription>
                    </Alert>
                )}
            </section>

            {/* Help Section */}
            <section className="bg-muted p-6 rounded-lg space-y-6">
                <div className="flex items-start gap-4">
                    <Info className="h-5 w-5 mt-1 text-muted-foreground" />
                    <div>
                        <h2 className="text-lg font-medium mb-1">Need Help?</h2>
                        <div className="text-muted-foreground text-sm space-y-3">
                            <p className="font-medium">How to get the correct PDF from E*TRADE:</p>
                            <ol className="list-decimal list-inside space-y-1 ml-2">
                                <li>Log on to E*TRADE</li>
                                <li>Go to <strong>At Work</strong> → <strong>My Account</strong></li>
                                <li>Go to <strong>Gains and Losses</strong></li>
                                <li>Select the time period, stock plan and then click <strong>Apply</strong></li>
                                <li>Then click <strong>Print</strong> for the document</li>
                            </ol>
                            <p className="text-xs mt-2">💡 No data is uploaded — everything runs in your browser.</p>
                        </div>
                    </div>
                </div>

                {/* CSV Help Section */}
                <div className="mt-6">
                    <h2 className="text-lg font-medium mb-2">CSV Upload Format</h2>
                    <div className="text-muted-foreground text-sm space-y-2">
                        <p>To upload a CSV, your file must have the following headers:</p>
                        <div className="overflow-auto">
                            <pre className="bg-background border rounded p-2 text-xs whitespace-pre">Purchase Date,Stock Symbol,Amount,Currency,Purchase Price,Purchased Qty</pre>
                        </div>
                        <ul className="list-disc ml-6 text-xs text-muted-foreground">
                            <li><strong>Amount (in currency)</strong>: The total amount paid for the purchase, in the specified currency.</li>
                        </ul>

                        <Button
                            className="mt-2"
                            onClick={() => {
                                const csv = `Purchase Date,Stock Symbol,Amount,Currency,Purchase Price,Purchased Qty\n`;
                                const blob = new Blob([csv], { type: 'text/csv' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'sample.csv';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                            }}
                        >Download Sample CSV</Button>
                    </div>
                </div>
            </section>

            {/* OCR Result (dev mode only) */}
            {import.meta.env.DEV && ocrText && (
                <section className="bg-muted p-6 rounded-lg text-sm whitespace-pre-wrap font-mono">
                    <h2 className="font-semibold mb-2">OCR Extracted Text:</h2>
                    <div>{ocrText}</div>
                </section>
            )}

            {import.meta.env.DEV && parsedRows.length > 0 && (
                <section className="bg-muted p-6 rounded-lg text-sm">
                    <h2 className="font-semibold mb-2">Parsed Transactions:</h2>
                    <pre className="whitespace-pre-wrap font-mono">{JSON.stringify(parsedRows, null, 2)}</pre>
                </section>
            )}

        </div>
    )
}

export default UploadPage