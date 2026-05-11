import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useUrgentItems() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchItems() }, [])

    async function fetchItems() {
        const { data } = await supabase
            .from('urgent_items')
            .select('*, contracts(name)')
            .order('due_date')
        setItems(data || [])
        setLoading(false)
    }

    async function addItem({ title, due_date, file_link, uploaded_by, status }) {
        const { error } = await supabase
            .from('urgent_items')
            .insert([{ title, due_date, file_link, uploaded_by, status }])
        if (error) return { error: error.message }
        await fetchItems()
        return { success: true }
    }

    async function updateStatus(id, status) {
        await supabase.from('urgent_items').update({ status }).eq('id', id)
        await fetchItems()
    }

    const counts = {
        overdue: items.filter(i => i.status === 'Overdue').length,
        urgent: items.filter(i => i.status === 'Urgent').length,
        pending: items.filter(i => i.status === 'Pending').length,
        total: items.filter(i => i.status !== 'Done').length,
    }

    return { items, loading, addItem, updateStatus, counts }
}