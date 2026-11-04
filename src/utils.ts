import * as aq from 'arquero';

export function sanitizeTable(table: any): any {
    if (!table || typeof table.numRows !== 'function') return table;
    if (
        table.numCols() === 2 &&
        table.columnNames()[0] === 'key' &&
        table.columnNames()[1] === 'value' &&
        table.numRows() > 0 &&
        Array.isArray(table.get('value', 0))
    ) {
        try {
            const colMap: Record<string, any[]> = {};
            const colNames: string[] = [];
            const n = table.numRows();
            for (let i = 0; i < n; i++) {
                const k = String(table.get('key', i));
                const v = table.get('value', i);
                colMap[k] = Array.isArray(v) ? v : [v];
                colNames.push(k);
            }
            return aq.table(colMap, colNames);
        } catch {
            return table;
        }
    }
    return table;
}

export function extractTable(data: any): aq.internal.Table | null {
    if (!data) return null;
    let current = data;

    for (let i = 0; i < 5; i++) {
        if (!current || typeof current !== 'object') break;
        if (typeof current.numRows === 'function' && typeof current.objects === 'function') {
            return sanitizeTable(current as aq.internal.Table);
        }
        if (current.__arqueroData) {
            try {
                const t = Array.isArray(current.__arqueroData)
                    ? aq.from(current.__arqueroData, current.columns)
                    : aq.table(current.__arqueroData, current.columns);
                return sanitizeTable(t);
            } catch {
                break;
            }
        }
        if (current._data && typeof current._data === 'object') {
            try {
                const t = aq.table(current._data, current._names);
                return sanitizeTable(t);
            } catch {
                break;
            }
        }
        if (current.type === 'core:dataframe' && current.content) {
            current = current.content;
            continue;
        }
        if (current.Data !== undefined) {
            current = current.Data;
            continue;
        }
        if (current.Dataframe !== undefined) {
            current = current.Dataframe;
            continue;
        }
        if (current.dataframe !== undefined) {
            current = current.dataframe;
            continue;
        }
        if (current.table !== undefined) {
            current = current.table;
            continue;
        }
        if (current.content !== undefined) {
            current = current.content;
            continue;
        }
        break;
    }

    if (!current) return null;
    let table: aq.internal.Table | null = null;
    if (typeof current.numRows === 'function' && typeof current.objects === 'function') {
        table = current as aq.internal.Table;
    } else if (current.__arqueroData) {
        try {
            table = Array.isArray(current.__arqueroData)
                ? aq.from(current.__arqueroData, current.columns)
                : aq.table(current.__arqueroData, current.columns);
        } catch {
            return null;
        }
    } else if (current._data && typeof current._data === 'object') {
        try {
            table = aq.table(current._data, current._names);
        } catch {
            return null;
        }
    } else if (Array.isArray(current)) {
        try {
            table = aq.from(current);
        } catch {
            return null;
        }
    } else if (Array.isArray(current.rows)) {
        try {
            table = aq.from(current.rows, current.columns);
        } catch {
            return null;
        }
    } else if (current.columns && Array.isArray(current.columns)) {
        try {
            const emptyCols: Record<string, any[]> = {};
            for (const col of current.columns) {
                emptyCols[col] = [];
            }
            table = aq.table(emptyCols, current.columns);
        } catch {
            return null;
        }
    }

    return sanitizeTable(table);
}
