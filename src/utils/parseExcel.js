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

        // Group rows by IPD — sub-rows have null code
        const ipdGroups = {}
        const ipdOrder = []
        let currentCode = null

        for (let i = headerRowIdx + 1; i < rows.length; i++) {
          const row = rows[i]
          const codeVal = row[iCode]
          const descVal = iDesc >= 0 ? getStr(row[iDesc]) : null

          if (codeVal && String(codeVal).toUpperCase().startsWith('IPD') && descVal) {
            // New IPD main row
            currentCode = getStr(row[iCode])
            if (!ipdGroups[currentCode]) {
              ipdGroups[currentCode] = { mainRow: row, subRows: [] }
              ipdOrder.push(currentCode)
            }
          } else if (currentCode && !codeVal) {
            // Skip total/summary rows — nominal > 5M or sum_icv > 50M (grand totals)
            const nom = row[iEstNom]
            const icv = row[iSumPlanICV]
            if (nom && typeof nom === 'number' && nom > 5000000) continue
            if (icv && typeof icv === 'number' && icv > 50000000) continue

            // Sub-row valid — belongs to currentCode
            ipdGroups[currentCode].subRows.push(row)
          } else if (currentCode && codeVal && !String(codeVal).toUpperCase().startsWith('IPD')) {
            // Non-IPD code like 'Draft' — stop adding sub-rows to currentCode
            currentCode = null
          } else if (codeVal && String(codeVal).toUpperCase().startsWith('IPD') && !descVal) {
            // IPD code exists but no description — also sub-row
            const code = getStr(row[iCode])
            if (ipdGroups[code]) {
              ipdGroups[code].subRows.push(row)
            } else if (currentCode) {
              ipdGroups[currentCode].subRows.push(row)
            }
          }
        }

        // Now build IPDs with aggregated values
        const ipds = []

        for (const code of ipdOrder) {
          const { mainRow, subRows } = ipdGroups[code]
          const allRows = [mainRow, ...subRows]

          // Sum numeric fields across all sub-rows
          function sumCol(colIdx) {
            if (colIdx < 0) return null
            const total = allRows.reduce((s, r) => {
              const v = getNum(r[colIdx])
              return s + (v || 0)
            }, 0)
            return total || null
          }

          // Take first non-null value for non-numeric fields
          function firstStr(colIdx) {
            if (colIdx < 0) return null
            for (const r of allRows) {
              const v = getStr(r[colIdx])
              if (v) return v
            }
            return null
          }

          function firstDate(colIdx) {
            if (colIdx < 0) return null
            for (const r of allRows) {
              const v = getDate(r[colIdx])
              if (v) return v
            }
            return null
          }

          // Credits claim & completion
          const creditsTotal = sumCol(iCredits)
          const sumPlanTotal = sumCol(iSumPlanICV)
          const completionPct = sumPlanTotal && creditsTotal
            ? (creditsTotal / sumPlanTotal) * 100
            : 0

          ipds.push({
            code,
            description: firstStr(iDesc),
            new_ipd_code: firstStr(iNewIPD),
            new_title: firstStr(iNewTitle),
            sub_projects: firstStr(iSubProj),
            category_type: firstStr(iCatType),
            objectives: firstStr(iObj),
            beneficiary: firstStr(iBenef),
            milestones: firstStr(iMilestone),
            project_owner: firstStr(iOwner),
            project_category: firstStr(iProjCat),
            submission_approval_date: firstStr(iSubApproval),
            plan_start: firstDate(iPlanStart),
            tentative_completion: firstDate(iTentComp),
            estimated_nominal_value: sumCol(iEstNom),
            actual_nominal_value: sumCol(iActNom),
            multiplier: getNum(mainRow[iMult]),
            estimated_plan_icv: sumCol(iEstPlanICV),
            actual_icv: sumCol(iActICV),
            sum_plan_icv: sumCol(iSumPlanICV),
            pct_of_total_icp: getNum(mainRow[iPctICP]),
            credits_claim: creditsTotal,
            claim_submission_date: firstStr(iClaimDate),
            progress_update: firstStr(iProgUpdate),
            claim_pct: completionPct / 100,
            claim_progress: firstStr(iClaimProg),
            activity_progress: firstStr(iActProg),
            bip_comments: firstStr(iBipComments),
            status: firstStr(iClaimProg) || 'Pending',
            completion_pct: completionPct,
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