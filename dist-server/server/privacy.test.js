import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
/** Privacy invariants as executable tests — these fail the build if anyone
 *  adds persistent search history or browser storage of searches. */
const read = (p) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf8');
describe('privacy architecture', () => {
    it('frontend never persists searches (no local/session storage anywhere in src)', () => {
        const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
        const src = walk(path.resolve(process.cwd(), 'src')).filter(f => /\.(ts|tsx)$/.test(f)).map(f => fs.readFileSync(f, 'utf8')).join('\n');
        // Actual API usage only — explanatory comments mentioning the words are fine.
        expect(src).not.toMatch(/(?:localStorage|sessionStorage)\s*\.\s*(?:getItem|setItem|removeItem)/);
        expect(src).not.toMatch(/(?:window\.)?(?:localStorage|sessionStorage)\s*\[/);
    });
    it('DB schema has no user/search-history tables', () => {
        const sql = read('db/migrations/001_init.sql').toLowerCase();
        expect(sql).not.toMatch(/create table (users|user_searches|search_history|sessions)\b/);
    });
    it('server never logs request query strings', () => {
        const srv = read('server/index.ts');
        expect(srv).not.toMatch(/console\.log\([^)]*req\.query/);
    });
    it('no login/register routes exist', () => {
        const srv = read('server/index.ts') + read('src/App.tsx');
        expect(srv.toLowerCase()).not.toMatch(/\/login|\/register|\/signup|sign-in/);
    });
});
