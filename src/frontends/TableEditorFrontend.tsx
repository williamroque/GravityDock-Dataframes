import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import * as aq from 'arquero';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export const TableEditorFrontend: React.FC<{ nodeId: string }> = ({ nodeId }) => {
    const [data, setData] = useState<any>(null);
    const [rows, setRows] = useState<Record<string, any>[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [editingCell, setEditingCell] = useState<{ rowIdx: number; col: string } | null>(null);
    const [editingColumnIdx, setEditingColumnIdx] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');
    const [editColValue, setEditColValue] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const colInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const api = (window as any).api?.interactive;
        if (!api) return;

        api.requestData(nodeId);

        const unsubData = api.onData((incomingData: any) => {
            setData(incomingData);
            
            const outRaw = incomingData.output?.Data;
            const rawData = (outRaw && outRaw.__arqueroData)
                ? outRaw
                : (incomingData.properties?.tableData ? { __arqueroData: incomingData.properties.tableData } : null);
            
            if (rawData && rawData.__arqueroData) {
                try {
                    const table = aq.from(rawData.__arqueroData);
                    const cols = table.columnNames();
                    const newRows = table.objects();
                    if (cols.length > 0) {
                        setColumns(cols);
                    }
                    setRows(newRows);
                    setHasUnsavedChanges(false);
                } catch (e) {
                    console.error('Failed to parse arquero data:', e);
                }
            } else {
                setColumns(['Column1']);
                setRows([{ 'Column1': '' }]);
            }
        });

        return () => {
            if (unsubData) unsubData();
        };
    }, [nodeId]);

    useEffect(() => {
        if (editingCell && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingCell]);

    useEffect(() => {
        if (editingColumnIdx !== null && colInputRef.current) {
            colInputRef.current.focus();
            colInputRef.current.select();
        }
    }, [editingColumnIdx]);

    const handleSave = useCallback(() => {
        const api = (window as any).api?.interactive;
        if (api) {
            if (api.setProperty) {
                api.setProperty(nodeId, 'tableData', rows);
            } else {
                api.setOutput(nodeId, { Data: { __arqueroData: rows } });
            }
            setHasUnsavedChanges(false);
        }
    }, [nodeId, rows]);

    const createEmptyRow = useCallback((cols: string[]) => {
        const newRow: Record<string, any> = {};
        cols.forEach(col => {
            newRow[col] = null;
        });
        return newRow;
    }, []);

    const getNextColumnName = useCallback((existingCols: string[]) => {
        let idx = existingCols.length + 1;
        let name = `Column${idx}`;
        while (existingCols.includes(name)) {
            idx++;
            name = `Column${idx}`;
        }
        return name;
    }, []);

    const handleAddRow = () => {
        setRows([...rows, createEmptyRow(columns)]);
        setHasUnsavedChanges(true);
    };
    
    const handleDeleteRow = (idx: number) => {
        const newRows = [...rows];
        newRows.splice(idx, 1);
        setRows(newRows);
        setHasUnsavedChanges(true);
    };

    const handleAddColumn = () => {
        const newCol = getNextColumnName(columns);
        setColumns([...columns, newCol]);
        const newRows = rows.map(r => ({ ...r, [newCol]: null }));
        setRows(newRows);
        setHasUnsavedChanges(true);
    };

    const parseCellValue = (raw: string): any => {
        if (raw.trim() === '') return null;
        const num = Number(raw);
        return !isNaN(num) ? num : raw;
    };

    const commitCellToRows = (targetRows: Record<string, any>[], rowIdx: number, col: string, raw: string) => {
        const nextRows = [...targetRows];
        nextRows[rowIdx] = { ...nextRows[rowIdx], [col]: parseCellValue(raw) };
        return nextRows;
    };

    const startEditingCell = (targetRows: Record<string, any>[], rowIdx: number, col: string) => {
        const val = targetRows[rowIdx]?.[col];
        setEditingCell({ rowIdx, col });
        setEditValue(val === null || val === undefined ? '' : String(val));
    };

    const commitEdit = () => {
        if (!editingCell) return;
        const { rowIdx, col } = editingCell;
        const newRows = commitCellToRows(rows, rowIdx, col, editValue);
        setRows(newRows);
        setEditingCell(null);
        setHasUnsavedChanges(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!editingCell) return;
        const { rowIdx, col } = editingCell;
        const colIdx = columns.indexOf(col);

        if (e.key === 'Escape') {
            setEditingCell(null);
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            const nextRows = commitCellToRows(rows, rowIdx, col, editValue);
            setHasUnsavedChanges(true);

            if (e.shiftKey) {
                setRows(nextRows);
                if (rowIdx > 0) {
                    startEditingCell(nextRows, rowIdx - 1, col);
                } else {
                    setEditingCell(null);
                    setEditingColumnIdx(colIdx);
                    setEditColValue(col);
                }
            } else if (rowIdx < nextRows.length - 1) {
                setRows(nextRows);
                startEditingCell(nextRows, rowIdx + 1, col);
            } else {
                const appendedRows = [...nextRows, createEmptyRow(columns)];
                setRows(appendedRows);
                startEditingCell(appendedRows, rowIdx + 1, col);
            }
            return;
        }

        if (e.key === 'Tab') {
            e.preventDefault();
            const nextRows = commitCellToRows(rows, rowIdx, col, editValue);
            setHasUnsavedChanges(true);

            if (e.shiftKey) {
                setRows(nextRows);
                if (colIdx > 0) {
                    startEditingCell(nextRows, rowIdx, columns[colIdx - 1]);
                } else if (rowIdx > 0) {
                    startEditingCell(nextRows, rowIdx - 1, columns[columns.length - 1]);
                }
            } else if (colIdx < columns.length - 1) {
                setRows(nextRows);
                startEditingCell(nextRows, rowIdx, columns[colIdx + 1]);
            } else if (rowIdx < nextRows.length - 1) {
                setRows(nextRows);
                startEditingCell(nextRows, rowIdx + 1, columns[0]);
            } else {
                const appendedRows = [...nextRows, createEmptyRow(columns)];
                setRows(appendedRows);
                startEditingCell(appendedRows, rowIdx + 1, columns[0]);
            }
        }
    };

    const applyColEdit = (): { nextCols: string[]; nextRows: Record<string, any>[] } => {
        if (editingColumnIdx === null) return { nextCols: columns, nextRows: rows };
        const newColName = editColValue.trim() || `Column${editingColumnIdx + 1}`;
        const oldColName = columns[editingColumnIdx];

        if (oldColName === newColName) {
            return { nextCols: columns, nextRows: rows };
        }

        const nextCols = [...columns];
        nextCols[editingColumnIdx] = newColName;

        const nextRows = rows.map(r => {
            const nr = { ...r };
            nr[newColName] = nr[oldColName];
            delete nr[oldColName];
            return nr;
        });

        setColumns(nextCols);
        setRows(nextRows);
        setHasUnsavedChanges(true);
        return { nextCols, nextRows };
    };

    const commitColEdit = () => {
        if (editingColumnIdx === null) return;
        applyColEdit();
        setEditingColumnIdx(null);
    };

    const handleColKeyDown = (e: React.KeyboardEvent) => {
        if (editingColumnIdx === null) return;

        if (e.key === 'Escape') {
            setEditingColumnIdx(null);
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            const { nextCols, nextRows } = applyColEdit();
            const col = nextCols[editingColumnIdx];
            setEditingColumnIdx(null);

            if (!e.shiftKey) {
                if (nextRows.length === 0) {
                    const appendedRows = [createEmptyRow(nextCols)];
                    setRows(appendedRows);
                    setHasUnsavedChanges(true);
                    startEditingCell(appendedRows, 0, col);
                } else {
                    startEditingCell(nextRows, 0, col);
                }
            }
            return;
        }

        if (e.key === 'Tab') {
            e.preventDefault();
            const { nextCols, nextRows } = applyColEdit();

            if (e.shiftKey) {
                if (editingColumnIdx > 0) {
                    const prevIdx = editingColumnIdx - 1;
                    setEditingColumnIdx(prevIdx);
                    setEditColValue(nextCols[prevIdx]);
                }
            } else if (editingColumnIdx < nextCols.length - 1) {
                const nextIdx = editingColumnIdx + 1;
                setEditingColumnIdx(nextIdx);
                setEditColValue(nextCols[nextIdx]);
            } else {
                const newCol = getNextColumnName(nextCols);
                const updatedCols = [...nextCols, newCol];
                const updatedRows = nextRows.map(r => ({ ...r, [newCol]: null }));
                setColumns(updatedCols);
                setRows(updatedRows);
                setHasUnsavedChanges(true);
                setEditingColumnIdx(updatedCols.length - 1);
                setEditColValue(newCol);
            }
        }
    };

    if (!data) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--secondary-text-color)' }}>
                Loading table data...
            </div>
        );
    }

    return (
        <div style={{ 
            width: '100%', 
            height: '100%', 
            backgroundColor: 'var(--background-color)',
            color: 'var(--text-color)',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            boxSizing: 'border-box'
        }}>
            {/* Toolbar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                marginBottom: '16px',
                borderRadius: '12px',
                backgroundColor: 'var(--tertiary-color)',
                border: '1px solid var(--border-color)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, color: 'var(--primary-color)', fontSize: '15px' }}>
                        Dataframe Editor
                    </div>
                    <div style={{ color: 'var(--secondary-text-color)', fontSize: '12px', paddingLeft: '8px', borderLeft: '1px solid var(--border-color)' }}>
                        {rows.length} rows × {columns.length} cols
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handleAddColumn}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                            backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)',
                            fontSize: '12px', fontWeight: 500
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--secondary-color)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <PlusIcon style={{ width: 14, height: 14 }} /> Column
                    </button>
                    <button
                        onClick={handleAddRow}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                            backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)',
                            fontSize: '12px', fontWeight: 500
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--secondary-color)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <PlusIcon style={{ width: 14, height: 14 }} /> Row
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!hasUnsavedChanges}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 16px', borderRadius: '6px', 
                            cursor: hasUnsavedChanges ? 'pointer' : 'default',
                            backgroundColor: hasUnsavedChanges ? 'var(--primary-color)' : 'var(--secondary-color)', 
                            border: 'none', 
                            color: hasUnsavedChanges ? 'var(--background-color)' : 'var(--secondary-text-color)',
                            fontSize: '12px', fontWeight: 600,
                            opacity: hasUnsavedChanges ? 1 : 0.6
                        }}
                    >
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div style={{
                flex: 1,
                overflow: 'auto',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--tertiary-color)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                position: 'relative'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 'max-content' }}>
                    <thead>
                        <tr>
                            <th style={{
                                width: '40px',
                                padding: '10px 0',
                                borderBottom: '1px solid var(--border-color)',
                                borderRight: '1px solid var(--border-color)',
                                position: 'sticky', top: 0, left: 0,
                                backgroundColor: 'var(--glass-background-color)',
                                backdropFilter: 'blur(10px)', zIndex: 3
                            }}></th>
                            {columns.map((col, idx) => (
                                <th key={idx} 
                                    onClick={() => {
                                        setEditingColumnIdx(idx);
                                        setEditColValue(col);
                                    }}
                                    style={{ 
                                    padding: '0', 
                                    borderBottom: '1px solid var(--border-color)',
                                    borderRight: idx < columns.length - 1 ? '1px solid var(--border-color)' : 'none',
                                    textAlign: 'left',
                                    position: 'sticky', top: 0,
                                    backgroundColor: 'var(--glass-background-color)',
                                    backdropFilter: 'blur(10px)', zIndex: 2,
                                    fontWeight: 500,
                                    color: 'var(--text-color)',
                                    cursor: 'text',
                                    minWidth: '100px'
                                }}>
                                    <div style={{ padding: '10px 16px', opacity: editingColumnIdx === idx ? 0 : 1 }}>
                                        {col}
                                    </div>
                                    {editingColumnIdx === idx && (
                                        <input
                                            ref={colInputRef}
                                            value={editColValue}
                                            onChange={(e) => setEditColValue(e.target.value)}
                                            onBlur={commitColEdit}
                                            onKeyDown={handleColKeyDown}
                                            style={{
                                                position: 'absolute', top: 0, left: 0,
                                                width: '100%', height: '100%',
                                                padding: '9px 15px', boxSizing: 'border-box',
                                                border: '1px solid var(--primary-color)', outline: 'none',
                                                backgroundColor: 'var(--background-color)', color: 'var(--text-color)',
                                                fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'bold'
                                            }}
                                        />
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIdx) => (
                            <tr key={rowIdx} 
                                style={{ backgroundColor: rowIdx % 2 === 0 ? 'transparent' : 'var(--secondary-color)' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-highlight-color)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = rowIdx % 2 === 0 ? 'transparent' : 'var(--secondary-color)'}
                            >
                                <td style={{
                                    borderBottom: '1px solid var(--border-color)',
                                    borderRight: '1px solid var(--border-color)',
                                    textAlign: 'center',
                                    position: 'sticky', left: 0,
                                    backgroundColor: 'inherit', zIndex: 1
                                }}>
                                    <button 
                                        onClick={() => handleDeleteRow(rowIdx)}
                                        style={{ 
                                            background: 'none', border: 'none', color: 'var(--secondary-text-color)', 
                                            cursor: 'pointer', padding: '4px', opacity: 0.6 
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#ef4444'; }}
                                        onMouseLeave={e => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.color = 'var(--secondary-text-color)'; }}
                                    >
                                        <TrashIcon style={{ width: 14, height: 14 }} />
                                    </button>
                                </td>
                                {columns.map((col, colIdx) => {
                                    const val = row[col];
                                    const isEditing = editingCell?.rowIdx === rowIdx && editingCell?.col === col;
                                    const displayVal = val === null || val === undefined ? '' : String(val);
                                    const isNull = val === null || val === undefined;
                                    const isNumber = typeof val === 'number';

                                    return (
                                        <td key={colIdx} 
                                            onClick={() => {
                                                setEditingCell({ rowIdx, col });
                                                setEditValue(displayVal);
                                            }}
                                            style={{ 
                                                padding: '0', 
                                                borderBottom: '1px solid var(--border-color)',
                                                borderRight: colIdx < columns.length - 1 ? '1px solid var(--border-color)' : 'none',
                                                color: isNull ? 'var(--secondary-text-color)' : (isNumber ? 'var(--primary-color)' : 'var(--text-color)'),
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: '250px',
                                                fontFamily: isNumber ? "'Victor Mono', monospace" : 'inherit',
                                                cursor: 'text',
                                                position: 'relative'
                                            }}
                                        >
                                            <div style={{ padding: '8px 16px', opacity: isEditing ? 0 : (isNull ? 0.5 : 1) }}>
                                                {isNull ? 'null' : displayVal}
                                            </div>
                                            {isEditing && (
                                                <input
                                                    ref={inputRef}
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onBlur={commitEdit}
                                                    onKeyDown={handleKeyDown}
                                                    style={{
                                                        position: 'absolute', top: 0, left: 0,
                                                        width: '100%', height: '100%',
                                                        padding: '8px 16px', boxSizing: 'border-box',
                                                        border: '2px solid var(--primary-color)', outline: 'none',
                                                        backgroundColor: 'var(--background-color)', color: 'var(--text-color)',
                                                        fontFamily: 'inherit', fontSize: 'inherit'
                                                    }}
                                                />
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + 1} style={{ padding: '32px', textAlign: 'center', color: 'var(--secondary-text-color)' }}>
                                    No data. Click "Row" to add a row.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
