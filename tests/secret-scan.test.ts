import { existsSync } from 'node:fs';
import { join } from 'node:path';

describe('repository safety baseline', () => {
  it('ships a secret scan script', () => {
    expect(existsSync(join(process.cwd(), 'scripts/secret-scan.mjs'))).toBe(true);
  });

  it('ships placeholder-only environment documentation', () => {
    expect(existsSync(join(process.cwd(), '.env.example'))).toBe(true);
  });
});
