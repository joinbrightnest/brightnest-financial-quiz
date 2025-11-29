import { redirect } from 'next/navigation';

export default function AppHomePage() {
    // Redirect to admin dashboard
    redirect('/admin/dashboard');
}
