import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useIcvTracker(contractId) {
  const [ipds, setIpds] = useState([])
  const [milestones, setMilestones] = useState({}) // keyed by ipd_id
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
    // strip generated columns — Supabase computes these server-side
    delete payload.est_plan_icv
    delete payload.actual_icv
    delete payload.balance_icv
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
    delete payload.est_plan_icv
    delete payload.actual_icv
    delete payload.balance_icv
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

  return {
    ipds, milestones, loading, milestonesLoading, error,
    fetchIpds, fetchMilestones, addIpd, updateIpd, deleteIpd,
    addMilestone, updateMilestone, deleteMilestone,
  }
}
