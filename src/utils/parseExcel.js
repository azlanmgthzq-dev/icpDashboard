import * as XLSX from 'xlsx'

export function parseContractsFromExcel(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true })
                const ws = wb.Sheets['Summary overall']
                if (!ws) return reject('Sheet "Summary overall" not found')

                const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })
                const contracts = []

                // Known contract names to match against
                const knownContracts = [
                    'ISS 2 TP400-D6',
                    'GSP Makila',
                    'TP400-D6 Hardware',
                    'ISS 2 TP400-D6 Additional',
                    'ISS 2 TP400-D6 Extension',
                ]

                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i]

                    const no = row[1]
                    const name = row[2]
                    const obligation = row[4]

                    // no boleh string "1" atau number 1
                    if (no === null || no === undefined) continue
                    const noNum = Number(no)
                    if (isNaN(noNum) || noNum < 1 || noNum > 10) continue

                    if (!name || typeof name !== 'string') continue
                    if (!obligation || typeof obligation !== 'number') continue

                    // Match against known contracts
                    const matched = knownContracts.find(k =>
                        name.trim().toLowerCase().includes(k.toLowerCase().slice(0, 6))
                    )
                    if (!matched) continue

                    // Avoid duplicate — only take first occurrence
                    if (contracts.find(c => c.name === matched)) continue

                    contracts.push({
                        name: matched,
                        obligation_value: row[4] || 0,
                        total_icv_planned: row[5] || 0,
                        icv_balance: row[6] || 0,
                        pct_icv_planned: row[7] || 0,
                        pct_icv_balance: row[8] || 0,
                        est_nominal_planned: row[9] || null,
                        actual_nominal_planned: row[10] || null,
                        current_actual_icv: row[11] || null,
                        approved_planned_icv: row[12] || 0,
                        approved_icv_claim: row[13] || null,
                        project_progress_claim: row[14] || null,
                    })
                }
                resolve(contracts)
            } catch (err) {
                reject(err.message)
            }
        }
        reader.onerror = () => reject('Failed to read file')
        reader.readAsArrayBuffer(file)
    })
}

export function parseIPDsFromExcel(file, contractName) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true })

                const sheetMap = {
                    'ISS 2 TP400-D6': 'ISS 2 TP400',
                    'GSP Makila': 'GSP Makila',
                    'TP400-D6 Hardware': 'Hardware TP400',
                    'ISS 2 TP400-D6 Additional': 'ISS 2 Additional',
                    'ISS 2 TP400-D6 Extension': 'ISS 2 Extension',
                }

                const sheetName = sheetMap[contractName]
                if (!sheetName || !wb.Sheets[sheetName])
                    return reject(`Sheet not found for: ${contractName}`)

                const ws = wb.Sheets[sheetName]
                const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })


                // Find header row
                let headerRowIdx = -1
                let headerRow = []
                for (let i = 0; i < rows.length; i++) {
                    if (rows[i].some(c => String(c || '').toUpperCase().trim() === 'CODE')) {
                        headerRowIdx = i
                        headerRow = rows[i]
                        break
                    }
                }
                if (headerRowIdx === -1) return reject(`Header row not found in ${sheetName}`)

                // Build column map
                const colMap = {}
                headerRow.forEach((h, idx) => {
                    if (!h) return
                    colMap[String(h).toUpperCase().trim()] = idx
                })

                // Helper functions — declare ONCE outside loop
                function col(...names) {
                    for (const n of names) {
                        if (colMap[n] !== undefined) return colMap[n]
                    }
                    return -1
                }
                function getStr(val) { return val ? String(val).trim() : null }
                function getNum(val) { return typeof val === 'number' ? val : null }
                function getDate(val) {
                    if (val instanceof Date) return val.toISOString().split('T')[0]
                    if (typeof val === 'number') {
                        return new Date(Math.round((val - 25569) * 86400 * 1000))
                            .toISOString().split('T')[0]
                    }
                    return null
                }

                // Column indices — declare ONCE outside loop
                const iCode = col('CODE')
                const iDesc = col('DESCRIPTION', 'NEW TITTLE', 'NEW TITLE')
                const iNewIPD = col('NEW IPD')
                const iNewTitle = col('NEW TITTLE', 'NEW TITLE')
                const iSubProj = col('SUB-PROJECTS', 'SUBPROJECT')
                const iCatType = col('CATEGORY/ TYPE', 'CATEGORY/TYPE', 'CATEGORY TYPE')
                const iObj = col('OBJECTIVES')
                const iBenef = col('BENEFICIARY')
                const iMilestone = col('MILESTONES')
                const iOwner = col('PROJECT OWNER')
                const iProjCat = col('PROJECT CATEGORY')
                const iSubApproval = col('SUBMISSION AND APPROVAL DATE')
                const iPlanStart = col('PLAN START')
                const iTentComp = col('TENTATIVE COMPLETION DATE')
                const iEstNom = col('ESTIMATED NOMINAL VALUE')
                const iActNom = col('ACTUAL NOMINAL VALUE')
                const iMult = col('MULTIPLIER')
                const iEstPlanICV = col('ESTIMATED PLAN ICV')
                const iActICV = col('ACTUAL ICV')
                const iSumPlanICV = col('SUM PLAN ICV')
                const iPctICP = col('% OF TOTAL ICP')
                const iCredits = col('CREDITS CLAIM')
                const iClaimDate = col('CLAIM SUBMISSION AND APPROVAL DATE')
                const iProgUpdate = col('PROGRESS UPDATE')
                const iClaimPct = col('CLAIM %', 'PROGRESS')
                const iClaimProg = col('CLAIM PROGRESS')
                const iActProg = col('ACTIVITY PROGRESS', 'ACTIVITY  PROGRESS')
                const iBipComments = col('BIP COMMENTS:')

                const ipds = []

                for (let i = headerRowIdx + 1; i < rows.length; i++) {
                    const row = rows[i]

                    // Skip if no IPD code
                    const codeVal = row[iCode]
                    if (!codeVal || !String(codeVal).toUpperCase().startsWith('IPD')) continue

                    // Skip sub-rows with no description
                    const descVal = iDesc >= 0 ? getStr(row[iDesc]) : null
                    if (!descVal) continue

                    ipds.push({
                        code: getStr(row[iCode]),
                        description: descVal,
                        new_ipd_code: iNewIPD >= 0 ? getStr(row[iNewIPD]) : null,
                        new_title: iNewTitle >= 0 ? getStr(row[iNewTitle]) : null,
                        sub_projects: iSubProj >= 0 ? getStr(row[iSubProj]) : null,
                        category_type: iCatType >= 0 ? getStr(row[iCatType]) : null,
                        objectives: iObj >= 0 ? getStr(row[iObj]) : null,
                        beneficiary: iBenef >= 0 ? getStr(row[iBenef]) : null,
                        milestones: iMilestone >= 0 ? getStr(row[iMilestone]) : null,
                        project_owner: iOwner >= 0 ? getStr(row[iOwner]) : null,
                        project_category: iProjCat >= 0 ? getStr(row[iProjCat]) : null,
                        submission_approval_date: iSubApproval >= 0 ? getStr(row[iSubApproval]) : null,
                        plan_start: iPlanStart >= 0 ? getDate(row[iPlanStart]) : null,
                        tentative_completion: iTentComp >= 0 ? getDate(row[iTentComp]) : null,
                        estimated_nominal_value: iEstNom >= 0 ? getNum(row[iEstNom]) : null,
                        actual_nominal_value: iActNom >= 0 ? getNum(row[iActNom]) : null,
                        multiplier: iMult >= 0 ? getNum(row[iMult]) : null,
                        estimated_plan_icv: iEstPlanICV >= 0 ? getNum(row[iEstPlanICV]) : null,
                        actual_icv: iActICV >= 0 ? getNum(row[iActICV]) : null,
                        sum_plan_icv: iSumPlanICV >= 0 ? getNum(row[iSumPlanICV]) : null,
                        pct_of_total_icp: iPctICP >= 0 ? getNum(row[iPctICP]) : null,
                        credits_claim: iCredits >= 0 ? getNum(row[iCredits]) : null,
                        claim_submission_date: iClaimDate >= 0 ? getStr(row[iClaimDate]) : null,
                        progress_update: iProgUpdate >= 0 ? getStr(row[iProgUpdate]) : null,
                        claim_pct: iClaimPct >= 0 ? (getNum(row[iClaimPct]) || 0) : 0,
                        claim_progress: iClaimProg >= 0 ? getStr(row[iClaimProg]) : null,
                        activity_progress: iActProg >= 0 ? getStr(row[iActProg]) : null,
                        bip_comments: iBipComments >= 0 ? getStr(row[iBipComments]) : null,
                        status: iClaimProg >= 0 ? (getStr(row[iClaimProg]) || 'Pending') : 'Pending',
                        completion_pct: iClaimPct >= 0 ? ((getNum(row[iClaimPct]) || 0) * 100) : 0,
                    })
                }

                resolve(ipds)
            } catch (err) {
                reject(err.message)
            }
        }
        reader.onerror = () => reject('Failed to read file')
        reader.readAsArrayBuffer(file)
    })
}