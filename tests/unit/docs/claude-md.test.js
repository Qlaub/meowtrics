import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const claudeMdPath = resolve(import.meta.dirname, '../../../CLAUDE.md');
const content = readFileSync(claudeMdPath, 'utf-8');

describe('CLAUDE.md documentation', () => {
  it('does not contain outdated "no test framework" statement', () => {
    expect(content).not.toContain('No test framework is set up yet');
  });

  it('documents test commands', () => {
    expect(content).toContain('test:unit');
    expect(content).toContain('test:e2e');
    expect(content).toContain('test:visual');
    expect(content).toContain('test:a11y');
    expect(content).toContain('test:all');
  });

  it('documents the tests/ directory', () => {
    expect(content).toContain('tests/');
  });

  it('mentions Vitest and Playwright frameworks', () => {
    expect(content).toContain('Vitest');
    expect(content).toContain('Playwright');
  });
});
