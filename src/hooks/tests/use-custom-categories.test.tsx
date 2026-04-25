import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { useCustomCategories, CustomCategoriesProvider } from '../use-custom-categories';
import * as api from '@/api/custom-categories';
import { toast } from 'sonner';

vi.mock('@/api/custom-categories', () => ({
    getCustomCategories: vi.fn(),
    addCustomCategory: vi.fn(),
    deleteCustomCategory: vi.fn(),
    updateCustomCategory: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const wrapper = ({ children }: { children: ReactNode }) => (
    <CustomCategoriesProvider>{children}</CustomCategoriesProvider>
);

describe('useCustomCategories', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('loads custom categories on mount', async () => {
        const categories = ['Travel', 'Food'];
        vi.mocked(api.getCustomCategories).mockReturnValue({ success: true, data: categories });

        const { result } = renderHook(() => useCustomCategories(), { wrapper });

        expect(result.current.customCategories).toEqual(categories);
        expect(api.getCustomCategories).toHaveBeenCalledTimes(1);
    });

    it('shows error toast if loading fails', async () => {
        vi.mocked(api.getCustomCategories).mockReturnValue({ error: 'Failed to load' });

        renderHook(() => useCustomCategories(), { wrapper });

        expect(toast.error).toHaveBeenCalledWith('Failed to load');
    });

    it('adds a new category successfully', async () => {
        vi.mocked(api.getCustomCategories).mockReturnValue({ success: true, data: [] });
        vi.mocked(api.addCustomCategory).mockReturnValue({ success: true });

        const { result } = renderHook(() => useCustomCategories(), { wrapper });

        await act(async () => {
            result.current.add('New Cat');
        });

        expect(api.addCustomCategory).toHaveBeenCalledWith('New Cat');
        expect(result.current.customCategories).toContain('New Cat');
        expect(toast.success).toHaveBeenCalledWith('Category added!');
    });

    it('shows error toast if adding fails', async () => {
        vi.mocked(api.getCustomCategories).mockReturnValue({ success: true, data: [] });
        vi.mocked(api.addCustomCategory).mockReturnValue({ error: 'Add failed' });

        const { result } = renderHook(() => useCustomCategories(), { wrapper });

        await act(async () => {
            result.current.add('Bad Cat');
        });

        expect(toast.error).toHaveBeenCalledWith('Add failed');
        expect(result.current.customCategories).not.toContain('Bad Cat');
    });

    it('deletes a category successfully', async () => {
        vi.mocked(api.getCustomCategories).mockReturnValue({ success: true, data: ['Cat 1', 'Cat 2'] });
        vi.mocked(api.deleteCustomCategory).mockReturnValue({ success: true });

        const { result } = renderHook(() => useCustomCategories(), { wrapper });

        await act(async () => {
            result.current.remove('Cat 1');
        });

        expect(api.deleteCustomCategory).toHaveBeenCalledWith('Cat 1');
        expect(result.current.customCategories).toEqual(['Cat 2']);
        expect(toast.success).toHaveBeenCalledWith('Category deleted!');
    });

    it('updates a category successfully', async () => {
        vi.mocked(api.getCustomCategories).mockReturnValue({ success: true, data: ['Old Name'] });
        vi.mocked(api.updateCustomCategory).mockReturnValue({ success: true });

        const { result } = renderHook(() => useCustomCategories(), { wrapper });

        await act(async () => {
            result.current.update('Old Name', 'New Name');
        });

        expect(api.updateCustomCategory).toHaveBeenCalledWith('Old Name', 'New Name');
        expect(result.current.customCategories).toEqual(['New Name']);
        expect(toast.success).toHaveBeenCalledWith('Category updated!');
    });

    it('throws error when used outside of CustomCategoriesProvider', () => {
        // Prevent console.error from cluttering the test output
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        expect(() => renderHook(() => useCustomCategories())).toThrow(
            'useCustomCategories must be used within a CustomCategoriesProvider'
        );
        
        consoleSpy.mockRestore();
    });

    it('shows error toast if deleting fails', async () => {
        vi.mocked(api.getCustomCategories).mockReturnValue({ success: true, data: ['Cat 1'] });
        vi.mocked(api.deleteCustomCategory).mockReturnValue({ error: 'Delete failed' });

        const { result } = renderHook(() => useCustomCategories(), { wrapper });

        await act(async () => {
            result.current.remove('Cat 1');
        });

        expect(toast.error).toHaveBeenCalledWith('Delete failed');
        expect(result.current.customCategories).toContain('Cat 1');
    });

    it('shows error toast if updating fails', async () => {
        vi.mocked(api.getCustomCategories).mockReturnValue({ success: true, data: ['Old Name'] });
        vi.mocked(api.updateCustomCategory).mockReturnValue({ error: 'Update failed' });

        const { result } = renderHook(() => useCustomCategories(), { wrapper });

        await act(async () => {
            result.current.update('Old Name', 'New Name');
        });

        expect(toast.error).toHaveBeenCalledWith('Update failed');
        expect(result.current.customCategories).toContain('Old Name');
        expect(result.current.customCategories).not.toContain('New Name');
    });

    it('refreshes categories successfully', async () => {
        vi.mocked(api.getCustomCategories).mockReturnValue({ success: true, data: ['Initial'] });
        
        const { result } = renderHook(() => useCustomCategories(), { wrapper });
        expect(result.current.customCategories).toEqual(['Initial']);

        // Simulate external change
        vi.mocked(api.getCustomCategories).mockReturnValue({ success: true, data: ['Initial', 'Refreshed'] });

        await act(async () => {
            result.current.refresh();
        });

        expect(result.current.customCategories).toEqual(['Initial', 'Refreshed']);
    });

    it('shows error toast if refresh fails', async () => {
        vi.mocked(api.getCustomCategories).mockReturnValue({ success: true, data: ['Initial'] });
        const { result } = renderHook(() => useCustomCategories(), { wrapper });

        vi.mocked(api.getCustomCategories).mockReturnValue({ error: 'Refresh failed' });

        await act(async () => {
            result.current.refresh();
        });

        expect(toast.error).toHaveBeenCalledWith('Refresh failed');
    });

    it('sets isInitialized to true after mount', async () => {
        vi.mocked(api.getCustomCategories).mockReturnValue({ success: true, data: [] });
        const { result } = renderHook(() => useCustomCategories(), { wrapper });
        
        expect(result.current.isInitialized).toBe(true);
    });
});
