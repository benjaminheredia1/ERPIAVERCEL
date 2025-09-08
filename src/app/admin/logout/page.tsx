"use client"
import { createClient } from "@/lib/supabase/client";
import {useRouter} from "next/navigation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
export default function Logout() { 
    const supabase = createClient();
    const router = useRouter();
    supabase.auth.signOut();
    router.push('/login')
    return <LoadingSpinner Data="Cerrando sesión" />
}