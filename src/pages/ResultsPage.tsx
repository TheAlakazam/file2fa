import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ScheduleFARow } from '@/lib/scheduleFAUtil'
import { Button } from '@/components/ui/button'

const ResultsPage: React.FC = () => {
    const { state } = useLocation()
    const rows: ScheduleFARow[] = state?.rows
    const stockSymbol: string = state?.stockSymbol

    const navigate = useNavigate()

    if (!rows || rows.length === 0) {
        return (
            <div className="p-6 text-center">
                <p>No results found. Please upload a file first.</p>
                <button onClick={() => navigate('/upload')} className="underline text-blue-600">
                    Go back to upload
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    Schedule FA Results <span className="text-muted-foreground">({stockSymbol})</span>
                </h1>
                <Button
                    onClick={() => navigate('/upload')}
                    variant="outline"
                >
                    Upload Another File
                </Button>
            </div>
            <div className="overflow-auto border rounded-lg">
                {rows.length > 0 && (
                    <table className="min-w-full border mt-6 text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-2 text-left">Country</th>
                                <th className="p-2 text-left">Entity</th>
                                <th className="p-2 text-left">Nature</th>
                                <th className="p-2 text-left">Shares Held</th>
                                <th className="p-2 text-left">Acquired</th>
                                <th className="p-2 text-left">Initial Value</th>
                                <th className="p-2 text-left">Peak Value</th>
                                <th className="p-2 text-left">Closing Value</th>
                                <th className="p-2 text-left">Gross Proceeds</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <tr key={i} className="border-t">
                                    <td className="p-2">{row.countryName}</td>
                                    <td className="p-2">{row.nameOfEntity}</td>
                                    <td className="p-2">{row.natureOfEntity}</td>
                                    <td className='p-2'>{row.sharesHeld.toLocaleString()}</td>
                                    <td className="p-2">{row.dateOfAcquisition}</td>
                                    <td className="p-2">₹{row.initialValueINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="p-2">₹{row.peakValueINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="p-2">₹{row.closingValueINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="p-2">₹{row.totalGrossProceedsINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export default ResultsPage
