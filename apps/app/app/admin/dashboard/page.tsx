import { redirect } from 'next/navigation';

export default function AdminDashboard() {
  // Redirect old /admin/dashboard URL to the new quiz-analytics route
  redirect('/admin/quiz-analytics');
}
