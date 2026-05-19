import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useContracts() {
    const [contracts, setContracts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchContracts = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('contracts')
            .select('*')
            .order('id')
        if (error) setError(error.message)
        else setContracts(data)
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchContracts()
    }, [fetchContracts])

    const totals = contracts.reduce((acc, c) => ({
        obligation: acc.obligation + (c.obligation_value || 0),
        icv_planned: acc.icv_planned + (c.total_icv_planned || 0),
        icv_balance: acc.icv_balance + (c.icv_balance || 0),
        approved_icv: acc.approved_icv + (c.approved_planned_icv || 0),
    }), { obligation: 0, icv_planned: 0, icv_balance: 0, approved_icv: 0 })

    const addContract = async (fields) => {
        const { data, error } = await supabase
            .from('contracts')
            .insert([fields])
            .select()
            .single()
        if (error) throw error
        setContracts(prev => [...prev, data].sort((a, b) => a.id - b.id))
        return data
    }

    const updateContract = async (id, fields) => {
        const { data, error } = await supabase
            .from('contracts')
            .update(fields)
            .eq('id', id)
            .select()
            .single()
        if (error) throw error
        setContracts(prev => prev.map(c => c.id === id ? data : c))
        return data
    }

    const deleteContract = async (id) => {
        const { error } = await supabase
            .from('contracts')
            .delete()
            .eq('id', id)
        if (error) throw error
        setContracts(prev => prev.filter(c => c.id !== id))
    }

    return {
        contracts, loading, error, totals,
        refetch: fetchContracts,
        addContract, updateContract, deleteContract,
    }
}
