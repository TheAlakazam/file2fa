import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker?worker'

pdfjsLib.GlobalWorkerOptions.workerPort = new pdfWorker()

export async function extractTextFromPDF(file: File): Promise<string[]> {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    const allPagesText: string[] = []

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()

        // Preserve line breaks using y-coordinate sorting
        const lines = content.items
            .filter((item: any) => item.str?.trim())
            .map((item: any) => ({
                str: item.str,
                y: item.transform[5], // Y coordinate for grouping lines
                x: item.transform[4], // X coordinate (optional)
            }))
            .sort((a, b) => b.y - a.y) // Higher Y = higher on page

        const groupedByLine = new Map<number, string[]>()

        for (const { str, y } of lines) {
            const key = Math.round(y / 5) * 5
            const existing = groupedByLine.get(key) || []
            groupedByLine.set(key, [...existing, str])
        }

        const pageText = Array.from(groupedByLine.values())
            .map((line) => line.join(' '))
            .join('\n')

        allPagesText.push(pageText)
    }

    return allPagesText
}
