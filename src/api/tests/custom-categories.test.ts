import { describe, it, expect, beforeEach, vi } from 'vitest';
import { addCustomCategory, deleteCustomCategory, updateCustomCategory } from '@/api/custom-categories';
import * as storage from '@/lib/storage';

vi.mock('@/lib/storage', () => ({
    loadCustomCategories: vi.fn(),
    saveCustomCategories: vi.fn(),
}));

const mockLoad = vi.mocked(storage.loadCustomCategories);
const mockSave = vi.mocked(storage.saveCustomCategories);

beforeEach(() => {
    vi.clearAllMocks();
    mockLoad.mockReturnValue([]);
});

// ─── addCustomCategory ────────────────────────────────────────────────────────

describe('addCustomCategory', () => {
    it('returns error for empty string', () => {
        expect(addCustomCategory('')).toEqual({ error: 'Category name cannot be empty.' });
        expect(mockSave).not.toHaveBeenCalled();
    });

    it('returns error for whitespace-only string', () => {
        expect(addCustomCategory('   ')).toEqual({ error: 'Category name cannot be empty.' });
        expect(mockSave).not.toHaveBeenCalled();
    });

    it('returns error when category already exists as a preset category', () => {
        // 'Food' is a preset category defined in CATEGORIES_SORTED
        expect(addCustomCategory('Food')).toEqual({ error: 'Category already exists.' });
        expect(mockSave).not.toHaveBeenCalled();
    });

    it('returns error when category already exists as a custom category', () => {
        mockLoad.mockReturnValue(['MyCategory']);
        expect(addCustomCategory('MyCategory')).toEqual({ error: 'Category already exists.' });
        expect(mockSave).not.toHaveBeenCalled();
    });

    it('trims whitespace before duplicate check', () => {
        mockLoad.mockReturnValue(['MyCategory']);
        expect(addCustomCategory('  MyCategory  ')).toEqual({ error: 'Category already exists.' });
        expect(mockSave).not.toHaveBeenCalled();
    });

    it('adds a new unique category and returns success', () => {
        mockLoad.mockReturnValue(['Existing']);
        const result = addCustomCategory('NewCategory');
        expect(result).toEqual({ success: true });
        expect(mockSave).toHaveBeenCalledWith(['Existing', 'NewCategory']);
    });

    it('trims the category before saving', () => {
        const result = addCustomCategory('  Trimmed  ');
        expect(result).toEqual({ success: true });
        expect(mockSave).toHaveBeenCalledWith(['Trimmed']);
    });

    it('returns error when loadCustomCategories throws', () => {
        mockLoad.mockImplementation(() => { throw new Error('Storage failure'); });
        expect(addCustomCategory('ValidCategory')).toEqual({ error: 'Failed to add category.' });
    });
});

// ─── deleteCustomCategory ─────────────────────────────────────────────────────

describe('deleteCustomCategory', () => {
    it('returns error for empty string', () => {
        expect(deleteCustomCategory('')).toEqual({ error: 'Category name cannot be empty.' });
        expect(mockSave).not.toHaveBeenCalled();
    });

    it('returns error for whitespace-only string', () => {
        expect(deleteCustomCategory('   ')).toEqual({ error: 'Category name cannot be empty.' });
        expect(mockSave).not.toHaveBeenCalled();
    });

    it('removes the matching category and returns success', () => {
        mockLoad.mockReturnValue(['Alpha', 'Beta', 'Gamma']);
        const result = deleteCustomCategory('Beta');
        expect(result).toEqual({ success: true });
        expect(mockSave).toHaveBeenCalledWith(['Alpha', 'Gamma']);
    });

    it('trims the category name before filtering', () => {
        mockLoad.mockReturnValue(['Alpha', 'Beta']);
        const result = deleteCustomCategory('  Beta  ');
        expect(result).toEqual({ success: true });
        expect(mockSave).toHaveBeenCalledWith(['Alpha']);
    });

    it('returns success even when the category does not exist (no-op delete)', () => {
        mockLoad.mockReturnValue(['Alpha']);
        const result = deleteCustomCategory('NonExistent');
        expect(result).toEqual({ success: true });
        expect(mockSave).toHaveBeenCalledWith(['Alpha']);
    });

    it('returns error when loadCustomCategories throws', () => {
        mockLoad.mockImplementation(() => { throw new Error('Storage failure'); });
        expect(deleteCustomCategory('Alpha')).toEqual({ error: 'Failed to delete category.' });
    });
});

// ─── updateCustomCategory ─────────────────────────────────────────────────────

describe('updateCustomCategory', () => {
    it.each([
        { case: 'oldName empty', old: '', new: 'NewName' },
        { case: 'newName empty', old: 'OldName', new: '' },
        { case: 'oldName whitespace', old: '   ', new: 'NewName' },
        { case: 'newName whitespace', old: 'OldName', new: '   ' },
    ])('returns error when $case', ({ old, new: newName }) => {
        expect(updateCustomCategory(old, newName)).toEqual({
            error: 'Category name cannot be empty.',
        });
        expect(mockSave).not.toHaveBeenCalled();
    });

    it('returns error when newName already exists as a preset category', () => {
        mockLoad.mockReturnValue(['OldName']);
        // 'Food' is a preset category
        expect(updateCustomCategory('OldName', 'Food')).toEqual({ error: 'Category already exists.' });
        expect(mockSave).not.toHaveBeenCalled();
    });

    it('returns error when newName already exists as another custom category', () => {
        mockLoad.mockReturnValue(['OldName', 'Existing']);
        expect(updateCustomCategory('OldName', 'Existing')).toEqual({ error: 'Category already exists.' });
        expect(mockSave).not.toHaveBeenCalled();
    });

    it('renames the category and returns success', () => {
        mockLoad.mockReturnValue(['Alpha', 'Beta']);
        const result = updateCustomCategory('Alpha', 'Renamed');
        expect(result).toEqual({ success: true });
        expect(mockSave).toHaveBeenCalledWith(['Renamed', 'Beta']);
    });

    it('trims both names before processing', () => {
        mockLoad.mockReturnValue(['Alpha', 'Beta']);
        const result = updateCustomCategory('  Alpha  ', '  Renamed  ');
        expect(result).toEqual({ success: true });
        expect(mockSave).toHaveBeenCalledWith(['Renamed', 'Beta']);
    });

    it('only renames exact matches, leaving others unchanged', () => {
        mockLoad.mockReturnValue(['Alpha', 'AlphaExtra', 'Beta']);
        const result = updateCustomCategory('Alpha', 'Renamed');
        expect(result).toEqual({ success: true });
        expect(mockSave).toHaveBeenCalledWith(['Renamed', 'AlphaExtra', 'Beta']);
    });

    it('returns error when loadCustomCategories throws', () => {
        mockLoad.mockImplementation(() => { throw new Error('Storage failure'); });
        expect(updateCustomCategory('OldName', 'NewName')).toEqual({ error: 'Failed to update category.' });
    });
});
