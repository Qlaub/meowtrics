import type { CsvRow } from '@/types'

export async function fetchCsv(filePath: string): Promise<CsvRow[]> {
  const res = await fetch(import.meta.env.BASE_URL + filePath.replace(/^\//, ''))
  if (!res.ok) throw new Error(`Failed to load ${filePath}`)
  const text = await res.text()
  return parseCsv(text)
}

export function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headerLine = lines[0]
  if (!headerLine) return []
  const headers = headerLine.split(',')
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line)
    const row: CsvRow = {}
    headers.forEach((h, i) => {
      row[h.trim()] = values[i]?.trim() ?? ''
    })
    return row
  })
}

function splitCsvLine(line: string): string[] {
  // Simple split — data has no commas in values based on the schema
  return line.split(',')
}
