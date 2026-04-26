import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { parseContractsFromExcel, parseIPDsFromExcel } from '../utils/parseExcel'

const CONTRACTS = [
    'ISS 2 TP400-D6',
    'GSP Makila',
    'TP400-D6 Hardware',
    'ISS 2 TP400-D6 Additional',
    'ISS 2 TP400-D6 Extension',
]

export default function ExcelUpload({ onSuccess }) {
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [log, setLog] = useState([])
    const [dragOver, setDragOver] = useState(false)

    function addLog(msg, type = 'info') {
        setLog(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }])
    }

    async function handleUpload() {
        if (!file) return
        setLoading(true)
        setLog([])

        try {
            // 1. Parse contracts
            addLog('Parsing contracts from Excel...', 'info')
            const contracts = await parseContractsFromExcel(file)
            addLog(`Found ${contracts.length} contracts`, 'success')

            // 2. Get existing contracts from DB
            const { data: existingContracts } = await supabase
                .from('contracts').select('id, name')

            const contractIdMap = {}
            existingContracts?.forEach(c => { contractIdMap[c.name] = c.id })

            // 3. Upsert contracts
            for (const contract of contracts) {
                const existing = existingContracts?.find(c =>
                    c.name.toLowerCase().includes(contract.name.toLowerCase().slice(0, 10))
                )
                if (existing) {
                    const { error } = await supabase
                        .from('contracts')
                        .update({
                            obligation_value: contract.obligation_value,
                            total_icv_planned: contract.total_icv_planned,
                            icv_balance: contract.icv_balance,
                            pct_icv_planned: contract.pct_icv_planned,
                            pct_icv_balance: contract.pct_icv_balance,
                            approved_planned_icv: contract.approved_planned_icv,
                        })
                        .eq('id', existing.id)
                    if (error) addLog(`Error updating ${existing.name}: ${error.message}`, 'error')
                    else addLog(`Updated: ${existing.name}`, 'success')
                }
            }

            // 4. Parse & upsert IPDs for each contract
            for (const contractName of CONTRACTS) {
                try {
                    addLog(`Parsing IPDs for ${contractName}...`, 'info')
                    const ipds = await parseIPDsFromExcel(file, contractName)

                    const contractId = existingContracts?.find(c => c.name === contractName)?.id
                    if (!contractId) {
                        addLog(`Contract ID not found for ${contractName}`, 'error')
                        continue
                    }

                    // Delete old IPDs for this contract then re-insert
                    await supabase.from('ipds').delete().eq('contract_id', contractId)

                    const toInsert = ipds.map(ipd => ({ ...ipd, contract_id: contractId }))
                    if (toInsert.length > 0) {
                        const { error } = await supabase.from('ipds').insert(toInsert)
                        if (error) addLog(`Error inserting IPDs: ${error.message}`, 'error')
                        else addLog(`Inserted ${toInsert.length} IPDs for ${contractName}`, 'success')
                    } else {
                        addLog(`No IPDs found for ${contractName}`, 'warn')
                    }
                } catch (err) {
                    addLog(`Skipped ${contractName}: ${err}`, 'warn')
                }
            }

            addLog('Upload complete!', 'success')
            onSuccess?.()

        } catch (err) {
            addLog(`Failed: ${err}`, 'error')
        }
        setLoading(false)
    }

    const logColors = { info: '#6b7280', success: '#3B6D11', error: '#A32D2D', warn: '#854F0B' }

    return (
        <div style={{
            background: '#fff', border: '0.5px solid #e5e7eb',
            borderRadius: 12, padding: '20px',
        }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, color: '#111827' }}>
                Import from Excel
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
                Upload Master_Tracker_Compilation_ReFormat.xlsx — contracts & IPDs akan auto-update
            </div>

            {/* Drop zone */}
            <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                    e.preventDefault(); setDragOver(false)
                    const f = e.dataTransfer.files[0]
                    if (f?.name.endsWith('.xlsx')) setFile(f)
                }}
                onClick={() => document.getElementById('excel-input').click()}
                style={{
                    border: `2px dashed ${dragOver ? '#378ADD' : file ? '#1D9E75' : '#d1d5db'}`,
                    borderRadius: 10, padding: '28px', textAlign: 'center',
                    cursor: 'pointer', background: dragOver ? '#EBF3FB' : file ? '#F0FBF4' : '#fafafa',
                    transition: 'all 0.2s', marginBottom: 12,
                }}
            >
                <input
                    id="excel-input" type="file" accept=".xlsx" hidden
                    onChange={e => setFile(e.target.files[0])}
                />
                <div style={{ fontSize: 28, marginBottom: 8 }}>
                    {file ? '✅' : '📊'}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: file ? '#3B6D11' : '#374151' }}>
                    {file ? file.name : 'Drop .xlsx file here or click to browse'}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                    {file
                        ? `${(file.size / 1024).toFixed(0)} KB — ready to upload`
                        : 'Supports: Master_Tracker_Compilation_ReFormat.xlsx'
                    }
                </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    style={{
                        flex: 1, padding: '10px', borderRadius: 8,
                        background: !file || loading ? '#e5e7eb' : '#1F4E79',
                        border: 'none', color: '#fff', fontSize: 13,
                        fontWeight: 500, cursor: !file || loading ? 'not-allowed' : 'pointer',
                    }}
                >
                    {loading ? '⏳ Processing...' : '⬆️ Upload & Sync to Database'}
                </button>
                {file && (
                    <button
                        onClick={() => { setFile(null); setLog([]) }}
                        style={{
                            padding: '10px 14px', borderRadius: 8,
                            border: '0.5px solid #e5e7eb', background: '#fff',
                            color: '#6b7280', fontSize: 13, cursor: 'pointer',
                        }}
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Log output */}
            {log.length > 0 && (
                <div style={{
                    background: '#f9fafb', borderRadius: 8,
                    border: '0.5px solid #e5e7eb',
                    padding: '10px 12px', maxHeight: 200, overflowY: 'auto',
                }}>
                    {log.map((l, i) => (
                        <div key={i} style={{
                            fontSize: 11, color: logColors[l.type],
                            padding: '2px 0', fontFamily: 'monospace',
                            display: 'flex', gap: 8,
                        }}>
                            <span style={{ color: '#9ca3af' }}>{l.time}</span>
                            <span>{l.type === 'success' ? '✓' : l.type === 'error' ? '✗' : l.type === 'warn' ? '!' : '·'}</span>
                            <span>{l.msg}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}