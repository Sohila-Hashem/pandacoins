import Papa from 'papaparse';

export const toCSV = (data: any[]): string => {
    return Papa.unparse(data, {
        header: true,
        skipEmptyLines: true,
    });
};

export const fromCSV = <T>(csv: string): T[] => {
    const result = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
    });

    if (result.errors.length > 0) {
        console.warn('CSV parsing errors:', result.errors);
    }

    return result.data as T[];
};
