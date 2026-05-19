import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useIpds(contractId) {
  const [ipds, setIpds]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

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

  useEffect(() => { fetchIpds() }, [fetchIpds])

  const totals = ipds.reduce((acc, i) => ({
    estimated_plan_icv: acc.estimated_plan_icv + (i.estimated_plan_icv || 0),
    sum_plan_icv:       acc.sum_plan_icv       + (i.sum_plan_icv       || 0),
    credits_claim:      acc.credits_claim      + (i.credits_claim      || 0),
    actual_icv:         acc.actual_icv         + (i.actual_icv         || 0),
  }), { estimated_plan_icv: 0, sum_plan_icv: 0, credits_claim: 0, actual_icv: 0 })

  const addIpd = async (fields) => {
    const { data, error } = await supabase
      .from('ipds')
      .insert([{ ...fields, contract_id: contractId }])
      .select()
      .single()
    if (error) throw error
    setIpds(prev => [...prev, data].sort((a, b) => a.code.localeCompare(b.code)))
    return data
  }

  const updateIpd = async (id, fields) => {
    const { data, error } = await supabase
      .from('ipds')
      .update(fields)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setIpds(prev => prev.map(i => i.id === id ? data : i))
    return data
  }

  const deleteIpd = async (id) => {
    const { error } = await supabase.from('ipds').delete().eq('id', id)
    if (error) throw error
    setIpds(prev => prev.filter(i => i.id !== id))
  }

  return { ipds, loading, error, totals, refetch: fetchIpds, addIpd, updateIpd, deleteIpd }
}
