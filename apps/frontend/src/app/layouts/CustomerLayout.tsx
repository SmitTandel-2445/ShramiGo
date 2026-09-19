import { Outlet } from 'react-router-dom'
import { BottomNavigation } from '@/components/common/BottomNavigation'

export function CustomerLayout() {
  return <div className="app-shell"><Outlet /><BottomNavigation role="customer" /></div>
}
