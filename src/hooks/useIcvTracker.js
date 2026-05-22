import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const GENERATED_COLS = ['est_plan_icv', 'actual_icv', 'balance_to_claim', 'icv_variance']

export function useIcvTracker(contractId) {
  const [ipds, setIpds] = useState([])
  const [milestones, setMilestones] = useState({}) // keyed by ipd_id
  const [vendors, setVendors] = useState({}) // keyed by milestone_id
  const [claimSubmissions, setClaimSubmissions] = useState({}) // keyed by `${contractId}_${ipdId}`
  const [loading, setLoading] = useState(true)
  const [milestonesLoading, setMilestonesLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchIpds = useCallback(async () => {
    if (!contractId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('ipds')
      .select('*')
      .eq('contract_id', contractId)
      .order('code')
    if (error) setError(error.message)
    else setIpds(data || [])
    setLoading(false)
  }, [contractId])

  const fetchMilestones = useCallback(async (ipdId) => {
    setMilestonesLoading(true)
    const { data, error } = await supabase
      .from('ipd_milestones')
      .select('*')
      .eq('ipd_id', ipdId)
      .order('created_at')
    if (!error) {
      setMilestones(prev => ({ ...prev, [ipdId]: data || [] }))
    }
    setMilestonesLoading(false)
  }, [])

  useEffect(() => { fetchIpds() }, [fetchIpds])

  const addIpd = async (fields) => {
    const { data, error } = await supabase
      .from('ipds')
      .insert([{ ...fields, contract_id: contractId }])
      .select()
      .single()
    if (error) throw error
    setIpds(prev => [...prev, data])
    return data
  }

  const addMilestone = async (ipdId, fields) => {
    const payload = { ...fields, ipd_id: ipdId }
    GENERATED_COLS.forEach(col => delete payload[col])
    const { data, error } = await supabase
      .from('ipd_milestones')
      .insert([payload])
      .select()
      .single()
    if (error) throw error
    setMilestones(prev => ({
      ...prev,
      [ipdId]: [...(prev[ipdId] || []), data],
    }))
    return data
  }

  const updateMilestone = async (ipdId, milestoneId, fields) => {
    const payload = { ...fields }
    GENERATED_COLS.forEach(col => delete payload[col])
    const { data, error } = await supabase
      .from('ipd_milestones')
      .update(payload)
      .eq('id', milestoneId)
      .select()
      .single()
    if (error) throw error
    setMilestones(prev => ({
      ...prev,
      [ipdId]: (prev[ipdId] || []).map(m => m.id === milestoneId ? data : m),
    }))
    return data
  }

  const deleteMilestone = async (ipdId, milestoneId) => {
    const { error } = await supabase
      .from('ipd_milestones')
      .delete()
      .eq('id', milestoneId)
    if (error) throw error
    setMilestones(prev => ({
      ...prev,
      [ipdId]: (prev[ipdId] || []).filter(m => m.id !== milestoneId),
    }))
  }

  const updateIpd = async (ipdId, fields) => {
    const { data, error } = await supabase
      .from('ipds')
      .update(fields)
      .eq('id', ipdId)
      .select()
      .single()
    if (error) throw error
    setIpds(prev => prev.map(i => i.id === ipdId ? data : i))
    return data
  }

  const deleteIpd = async (ipdId) => {
    // Delete child milestones first in case no cascade FK is set
    await supabase.from('ipd_milestones').delete().eq('ipd_id', ipdId)
    const { error } = await supabase.from('ipds').delete().eq('id', ipdId)
    if (error) throw error
    setIpds(prev => prev.filter(i => i.id !== ipdId))
    setMilestones(prev => {
      const next = { ...prev }
      delete next[ipdId]
      return next
    })
  }

  // ─── Vendor CRUD ─────────────────────────────────────────────────────────────

  const fetchVendors = useCallback(async (milestoneId) => {
    const { data, error } = await supabase
      .from('milestone_vendors')
      .select('*')
      .eq('milestone_id', milestoneId)
      .order('created_at')
    if (!error) {
      setVendors(prev => ({ ...prev, [milestoneId]: data || [] }))
    }
    return data || []
  }, [])

  const addVendor = async ({ milestone_id, submission_no, vendor_name, amount, invoice_link }) => {
    const { data, error } = await supabase
      .from('milestone_vendors')
      .insert([{ milestone_id, submission_no, vendor_name, amount, invoice_link }])
      .select()
      .single()
    if (error) throw error
    setVendors(prev => ({
      ...prev,
      [milestone_id]: [...(prev[milestone_id] || []), data],
    }))
    return data
  }

  const updateVendor = async (id, fields) => {
    const { data, error } = await supabase
      .from('milestone_vendors')
      .update(fields)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setVendors(prev => {
      const next = { ...prev }
      for (const key of Object.keys(next)) {
        if (next[key].some(v => v.id === id)) {
          next[key] = next[key].map(v => v.id === id ? data : v)
        }
      }
      return next
    })
    return data
  }

  const deleteVendor = async (id, milestoneId) => {
    const { error } = await supabase
      .from('milestone_vendors')
      .delete()
      .eq('id', id)
    if (error) throw error
    setVendors(prev => ({
      ...prev,
      [milestoneId]: (prev[milestoneId] || []).filter(v => v.id !== id),
    }))
  }

  // ─── Claim Submission CRUD ───────────────────────────────────────────────────

  const fetchClaimSubmissions = useCallback(async (cId, iId) => {
    let q = supabase
      .from('claim_submissions')
      .select('*')
      .order('submission_no')
    if (cId) q = q.eq('contract_id', cId)
    if (iId) q = q.eq('ipd_id', iId)
    const { data, error } = await q
    const key = `${cId}_${iId}`
    if (!error) {
      setClaimSubmissions(prev => ({ ...prev, [key]: data || [] }))
    }
    return data || []
  }, [])

  const addClaimSubmission = async ({ contract_id, ipd_id, submission_no, submission_date, status, claim_form_link, notes }) => {
    const { data, error } = await supabase
      .from('claim_submissions')
      .insert([{ contract_id, ipd_id, submission_no, submission_date, status, claim_form_link, notes }])
      .select()
      .single()
    if (error) throw error
    const key = `${contract_id}_${ipd_id}`
    setClaimSubmissions(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), data].sort((a, b) =>
        (a.submission_no || '').localeCompare(b.submission_no || '')
      ),
    }))
    return data
  }

  const updateClaimSubmission = async (id, fields) => {
    const { data, error } = await supabase
      .from('claim_submissions')
      .update(fields)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setClaimSubmissions(prev => {
      const next = { ...prev }
      for (const key of Object.keys(next)) {
        if (next[key].some(cs => cs.id === id)) {
          next[key] = next[key].map(cs => cs.id === id ? data : cs)
        }
      }
      return next
    })
    return data
  }

  const deleteClaimSubmission = async (id, cId, iId) => {
    const { error } = await supabase
      .from('claim_submissions')
      .delete()
      .eq('id', id)
    if (error) throw error
    const key = `${cId}_${iId}`
    setClaimSubmissions(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter(cs => cs.id !== id),
    }))
  }

  return {
    ipds, milestones, vendors, claimSubmissions,
    loading, milestonesLoading, error,
    fetchIpds, fetchMilestones, addIpd, updateIpd, deleteIpd,
    addMilestone, updateMilestone, deleteMilestone,
    fetchVendors, addVendor, updateVendor, deleteVendor,
    fetchClaimSubmissions, addClaimSubmission, updateClaimSubmission, deleteClaimSubmission,
  }
}
