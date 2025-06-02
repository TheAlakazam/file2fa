import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info, FileCheck, FileWarning } from 'lucide-react'

const UploadPage = () => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [fileName, setFileName] = useState<string | null>(null)
    const [fileError, setFileError] = useState<string | null>(null)
    const [fileAccepted, setFileAccepted] = useState(false)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const isValid = /\.(pdf|csv)$/i.test(file.name)
        if (!isValid) {
            setFileError('Only PDF or CSV files are supported.')
            setFileAccepted(false)
            setFileName(null)
        } else {
            setFileName(file.name)
            setFileAccepted(true)
            setFileError(null)
        }

        // You can trigger parsing logic here if needed
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-12 space-y-12">

            {/* Title */}
            <section className="text-center">
                <h1 className="text-3xl font-bold mb-2">Upload Your E*TRADE Transaction File</h1>
                <p className="text-muted-foreground text-base">
                    We’ll process the file locally and generate Schedule FA entries for you.
                </p>
            </section>

            {/* Upload Box */}
            <section className="border border-dashed border-border p-8 rounded-xl text-center space-y-6">
                <Input
                    type="file"
                    accept=".pdf,.csv"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                />

                <div className="space-y-2">
                    <p className="text-muted-foreground">Choose a PDF or CSV file exported from E*TRADE.</p>
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
                        <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                            <li>We support E*TRADE PDFs downloaded from the “Transactions” section.</li>
                            <li>You can also export as CSV.</li>
                            <li>No data is uploaded — everything runs in your browser.</li>
                            <li><a href="/help/file-formats" className="underline">View supported formats</a></li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default UploadPage
