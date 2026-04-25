import { describe, it, expect, vi } from 'vitest';
import { toCSV, fromCSV } from '../csv-utils';

describe('CSV Utils', () => {
    describe('toCSV', () => {
        it('should convert array of objects to CSV string', () => {
            const data = [
                { name: 'John', age: 30 },
                { name: 'Jane', age: 25 }
            ];
            const csv = toCSV(data);
            expect(csv).toContain('name,age');
            expect(csv).toContain('John,30');
            expect(csv).toContain('Jane,25');
        });

        it('should handle empty array', () => {
            const csv = toCSV([]);
            expect(csv).toBe('');
        });
    });

    describe('fromCSV', () => {
        it('should convert CSV string to array of objects', () => {
            const csv = 'name,age\nJohn,30\nJane,25';
            const data = fromCSV<{ name: string, age: number }>(csv);
            expect(data).toHaveLength(2);
            expect(data[0]).toEqual({ name: 'John', age: 30 });
            expect(data[1]).toEqual({ name: 'Jane', age: 25 });
        });

        it('should handle empty string', () => {
            const data = fromCSV('');
            expect(data).toEqual([]);
        });

        it('should warn on CSV errors', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            // Invalid CSV (e.g. mismatched quotes)
            const invalidCsv = '"unclosed quote,age\nJohn,30';
            fromCSV(invalidCsv);
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });
});
