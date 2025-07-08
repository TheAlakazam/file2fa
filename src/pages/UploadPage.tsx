import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info, FileCheck, FileWarning } from 'lucide-react'

import { extractTextFromPDF } from '@/lib/pdfImage'
import { extractStockSymbol, ParsedEtradeRow, parseEtradeOcr } from '@/lib/parseEtrade'
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
    const [parsedRows, setParsedRows] = useState<ParsedEtradeRow[]>([])
    const navigate = useNavigate();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const isValid = /\.pdf$/i.test(file.name)
        if (!isValid) {
            setFileError('Only PDF files are supported.')
            setFileAccepted(false)
            setFileName(null)
            return
        }

        setFileName(file.name)
        setFileAccepted(true)
        setFileError(null)

        if (file.name.toLowerCase().endsWith('.pdf')) {
            try {
                const pages = await extractTextFromPDF(file)
                const raw = pages.join('\n')
                setOcrText(raw) // reuse ocrText to hold structured text

                const parsedData = parseEtradeOcr(raw)
                setParsedRows(parsedData)
                const stockSymbol = extractStockSymbol(raw);
                const [companyInfo, { peak, dec31 }] = await Promise.all([
                    fetchCompanyFromOpenFIGI(stockSymbol),
                    fetchPeakAndDec31Price(stockSymbol)
                ])

                const scheduleFaRows = await mapToScheduleFA(parsedData, companyInfo, peak, dec31);
                navigate('/results', { state: { rows: scheduleFaRows, stockSymbol } })
            } catch (err) {
                console.error('PDF text extraction failed:', err)
                setFileError('Failed to extract text from PDF.')
                setOcrText(null)
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
                <Input
                    type="file"
                    accept=".pdf"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                />

                <div className="space-y-2">
                    <p className="text-muted-foreground">Choose a PDF file exported from E*TRADE.</p>
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
            </section>

            {/* Help Section */}
            <section className="bg-muted p-6 rounded-lg">
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