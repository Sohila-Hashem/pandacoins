import { fromCSV, toCSV } from '../lib/csv-utils';
import { ExpensesWorkerType } from '../api/expenses';

/**
 * Web Worker for handling CSV processing off-main-thread.
 */

globalThis.onmessage = (event: MessageEvent) => {
    const { type, payload } = event.data;

    try {
        switch (type) {
            case ExpensesWorkerType.GENERATE_CSV: {
                const csv = toCSV(payload);
                self.postMessage({ type: 'SUCCESS', payload: csv });
                break;
            }
            case ExpensesWorkerType.PARSE_CSV: {
                const data = fromCSV(payload);
                self.postMessage({ type: 'SUCCESS', payload: data });
                break;
            }
            default:
                self.postMessage({ type: 'ERROR', error: 'Unknown message type' });
        }
    } catch (error) {
        self.postMessage({
            type: 'ERROR',
            error: error instanceof Error ? error.message : 'An unknown error occurred in the worker'
        });
    }
};
