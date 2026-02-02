export async function fetchCsv(filePath) {
  const res = await fetch(import.meta.env.BASE_URL + filePath.replace(/^\//, ''))
  if (!res.ok) throw new Error(`Failed to load ${filePath}`)
  const text = await res.text()
  return parseCsv(text)
}

export function parseCsv(text) {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',')
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line)
    const row = {}
    headers.forEach((h, i) => {
      row[h.trim()] = values[i]?.trim() ?? ''
    })
    return row
  })
}

function splitCsvLine(line) {
  // Simple split — data has no commas in values based on the schema
  return line.split(',')
}
