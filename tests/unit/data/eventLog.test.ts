import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { parseCsv } from '@/data/csv';
import { getDataset } from '@/data/manifest';
import { normalizeEventLog } from '@/data/eventLog';

const fixturesDir = resolve(import.meta.dirname, '../../fixtures');
const dataDir = resolve(import.meta.dirname, '../../../public/data');

describe('event log dataset', () => {
  it('cat_event_log CSV is parseable with expected columns', () => {
    const csv = readFileSync(resolve(dataDir, 'cat_event_log'), 'utf-8');
    const rows = parseCsv(csv);

    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row).toHaveProperty('cat');
      expect(row).toHaveProperty('event_type');
      expect(row).toHaveProperty('description');
      expect(row).toHaveProperty('timestamp');
    }
  });

  it('manifest entry for event_log is present and well-formed', () => {
    const manifest = JSON.parse(readFileSync(resolve(dataDir, 'manifest.json'), 'utf-8'));
    const entry = manifest.find((d) => d.type === 'event_log');

    expect(entry).toBeDefined();
    expect(entry).toHaveProperty('id');
    expect(entry).toHaveProperty('title');
    expect(entry).toHaveProperty('file');
    expect(entry).toHaveProperty('type', 'event_log');
    expect(entry).toHaveProperty('cat');
    expect(entry).toHaveProperty('description');
  });

  it('event log dataset is discoverable via getDataset', () => {
    const manifest = JSON.parse(readFileSync(resolve(dataDir, 'manifest.json'), 'utf-8'));
    const dataset = getDataset(manifest, 'cat-event-log');

    expect(dataset).toBeDefined();
    expect(dataset.id).toBe('cat-event-log');
    expect(dataset.type).toBe('event_log');
    expect(dataset.file).toBe('/data/cat_event_log');
  });
});

describe('normalizeEventLog', () => {
  const rawRows = [
    {
      cat: 'Obi',
      event_type: 'Vet visit',
      description: 'Annual checkup',
      timestamp: '2026-01-15T10:00:00-05:00',
    },
    {
      cat: 'Cummings',
      event_type: 'Medication',
      description: 'Started new supplement',
      timestamp: '2026-02-01T09:00:00-05:00',
    },
  ];

  it('converts timestamp string to Date object', () => {
    const result = normalizeEventLog(rawRows);
    expect(result[0].timestamp).toBeInstanceOf(Date);
    expect(result[1].timestamp).toBeInstanceOf(Date);
  });

  it('adds dateKey in MM/DD/YYYY format', () => {
    const result = normalizeEventLog(rawRows);
    expect(result[0].dateKey).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(result[1].dateKey).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it('maps event_type to eventType', () => {
    const result = normalizeEventLog(rawRows);
    expect(result[0].eventType).toBe('Vet visit');
    expect(result[1].eventType).toBe('Medication');
    expect(result[0]).not.toHaveProperty('event_type');
  });

  it('preserves cat and description fields', () => {
    const result = normalizeEventLog(rawRows);
    expect(result[0].cat).toBe('Obi');
    expect(result[0].description).toBe('Annual checkup');
    expect(result[1].cat).toBe('Cummings');
    expect(result[1].description).toBe('Started new supplement');
  });

  it('returns empty array for empty input', () => {
    const result = normalizeEventLog([]);
    expect(result).toEqual([]);
  });

  it('handles single-row input', () => {
    const result = normalizeEventLog([rawRows[0]]);
    expect(result).toHaveLength(1);
    expect(result[0].cat).toBe('Obi');
    expect(result[0].timestamp).toBeInstanceOf(Date);
  });

  it('normalizes sample fixture CSV correctly', () => {
    const csv = readFileSync(resolve(fixturesDir, 'sample-event-log.csv'), 'utf-8');
    const parsed = parseCsv(csv);
    const result = normalizeEventLog(parsed);

    expect(result.length).toBe(parsed.length);
    for (const row of result) {
      expect(row.timestamp).toBeInstanceOf(Date);
      expect(row.dateKey).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      expect(row).toHaveProperty('cat');
      expect(row).toHaveProperty('eventType');
      expect(row).toHaveProperty('description');
    }
  });
});
