import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const visualDir = resolve(import.meta.dirname, '../../visual');
const configPath = resolve(import.meta.dirname, '../../../playwright.config.js');

function readVisualTestFile(filename) {
  return readFileSync(resolve(visualDir, filename), 'utf-8');
}

function getVisualSpecFiles() {
  return readdirSync(visualDir).filter((f) => f.endsWith('.spec.js'));
}

describe('Visual test skip conditions', () => {
  it('desktop visual tests use isMobile to skip mobile viewports', () => {
    const content = readVisualTestFile('charts-desktop.spec.js');
    expect(content).toContain('isMobile');
    expect(content).toMatch(/test\.skip\(\(\{.*isMobile.*\}\)\s*=>\s*isMobile\)/);
  });

  it('mobile visual tests use isMobile to skip non-mobile viewports', () => {
    const content = readVisualTestFile('charts-mobile.spec.js');
    expect(content).toContain('isMobile');
    expect(content).toMatch(/test\.skip\(\(\{.*isMobile.*\}\)\s*=>\s*!isMobile\)/);
  });

  it('no visual test files use the browserName string matching anti-pattern', () => {
    const specFiles = getVisualSpecFiles();
    expect(specFiles.length).toBeGreaterThan(0);

    for (const file of specFiles) {
      const content = readVisualTestFile(file);
      expect(content).not.toMatch(/['"]Mobile Chrome['"]/);
      expect(content).not.toMatch(/['"]Mobile Safari['"]/);
      expect(content).not.toMatch(/['"]mobile-chrome['"]/);
      expect(content).not.toMatch(/['"]mobile-safari['"]/);
    }
  });

  it('playwright config mobile projects use mobile device descriptors', () => {
    const configContent = readFileSync(configPath, 'utf-8');

    // Mobile projects should reference known mobile devices
    expect(configContent).toMatch(/name:\s*['"]mobile-chrome['"]/);
    expect(configContent).toMatch(/name:\s*['"]mobile-safari['"]/);

    // Verify they use device descriptors (not custom viewport configs)
    expect(configContent).toMatch(/['"]Pixel 7['"]/);
    expect(configContent).toMatch(/['"]iPhone 14['"]/);
  });
});
