import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useUrgentItems() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetch() }, [])

    async function fetch() {
        const { data } = await supabase
            .from('urgent_items')
            .select('*, contracts(name)')
            .order('due_date')
        setItems(data || [])
        setLoading(false)
    }

    async function upload(file, meta) {
        const path = `urgent/${Date.now()}_${file.name}`
        const { error: upErr } = await supabase.storage
            .from('urgent-docs')
            .upload(path, file)
        if (upErr) return { error: upErr.message }

        const { data: { publicUrl } } = supabase.storage
            .from('urgent-docs')
            .getPublicUrl(path)

        const { error: dbErr } = await supabase
            .from('urgent_items')
            .insert({ ...meta, file_url: publicUrl, file_name: file.name })
        if (dbErr) return { error: dbErr.message }

        await fetch()
        return { success: true }
    }

    async function updateStatus(id, status) {
        await supabase.from('urgent_items').update({ status }).eq('id', id)
        await fetch()
    }

    const counts = {
        overdue: items.filter(i => i.status === 'Overdue').length,
        urgent: items.filter(i => i.status === 'Urgent').length,
        pending: items.filter(i => i.status === 'Pending').length,
        total: items.filter(i => i.status !== 'Done').length,
    }

    return { items, loading, upload, updateStatus, counts }
}