"use client"
import { useState } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function ReportsPage() {
    const [loading] = useState<boolean>(false)
    if (!loading) return <LoadingSpinner Data={"Cargando"} />
    return <>Reportes</>
}