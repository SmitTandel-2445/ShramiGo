import os
import re

frontend_dir = os.path.join(os.path.dirname(__file__), '../apps/frontend/src')

# Mapping from old paths to new paths
replacements = [
    # Contracts
    (r"import\s+(.*?)\s+from\s+['\"](\.\./)+types/booking['\"]", r"import \1 from '@shramigo/contracts'"),
    (r"import\s+(.*?)\s+from\s+['\"](\.\./)+types/customer['\"]", r"import \1 from '@shramigo/contracts'"),
    (r"import\s+(.*?)\s+from\s+['\"](\.\./)+types/service['\"]", r"import \1 from '@shramigo/contracts'"),
    (r"import\s+(.*?)\s+from\s+['\"](\.\./)+types/worker['\"]", r"import \1 from '@shramigo/contracts'"),
    
    # App Layer
    (r"from\s+['\"](\.\./)+routes/AppRoutes['\"]", r"from '@/app/router/AppRoutes'"),
    (r"from\s+['\"](\.\./)+routes/CustomerRoutes['\"]", r"from '@/app/router/CustomerRoutes'"),
    (r"from\s+['\"](\.\./)+routes/WorkerRoutes['\"]", r"from '@/app/router/WorkerRoutes'"),
    (r"from\s+['\"](\.\./)+context/LanguageContext['\"]", r"from '@/app/providers/LanguageContext'"),
    (r"from\s+['\"](\.\./)+context/ThemeContext['\"]", r"from '@/app/providers/ThemeContext'"),
    (r"from\s+['\"](\.\./)+layouts/CustomerLayout['\"]", r"from '@/app/layouts/CustomerLayout'"),
    (r"from\s+['\"](\.\./)+layouts/WorkerLayout['\"]", r"from '@/app/layouts/WorkerLayout'"),

    # Components
    (r"from\s+['\"](\.\./)+components/BrandLogo['\"]", r"from '@/components/common/BrandLogo'"),
    (r"from\s+['\"](\.\./)+components/common/(.*?)['\"]", r"from '@/components/common/\2'"),
    (r"from\s+['\"](\.\./)+components/navigation/(.*?)['\"]", r"from '@/components/common/\2'"),
    (r"from\s+['\"](\.\./)+components/auth/ProtectedRoute['\"]", r"from '@/features/auth/ProtectedRoute'"),

    # Libs
    (r"from\s+['\"](\.\./)+services/api['\"]", r"from '@/lib/api'"),
    (r"from\s+['\"](\.\./)+utils/profileImage['\"]", r"from '@/lib/profileImage'"),
    (r"from\s+['\"](\.\./)+constants/appConstants['\"]", r"from '@/lib/appConstants'"),

    # Features - Auth
    (r"from\s+['\"](\.\./)+services/auth['\"]", r"from '@/features/auth/authService'"),
    (r"from\s+['\"](\.\./)+services/profile['\"]", r"from '@/features/auth/profileService'"),
    (r"from\s+['\"](\.\./)+services/notifications['\"]", r"from '@/features/auth/notificationsService'"),
    (r"from\s+['\"](\.\./)+data/customerData['\"]", r"from '@/features/auth/customerData'"),

    # Features - Services
    (r"from\s+['\"](\.\./)+services/services['\"]", r"from '@/features/services/servicesService'"),
    (r"from\s+['\"](\.\./)+services/ai['\"]", r"from '@/features/services/aiService'"),
    (r"from\s+['\"](\.\./)+data/servicesData['\"]", r"from '@/features/services/servicesData'"),

    # Features - Workers
    (r"from\s+['\"](\.\./)+services/worker['\"]", r"from '@/features/workers/workerService'"),
    (r"from\s+['\"](\.\./)+data/workerData['\"]", r"from '@/features/workers/workerData'"),

    # Features - Bookings
    (r"from\s+['\"](\.\./)+services/bookings['\"]", r"from '@/features/bookings/bookingService'"),
    (r"from\s+['\"](\.\./)+data/bookingData['\"]", r"from '@/features/bookings/bookingData'"),

    # Features - Reviews
    (r"from\s+['\"](\.\./)+services/reviews['\"]", r"from '@/features/reviews/reviewsService'"),

    # Features - Admin
    (r"from\s+['\"](\.\./)+services/admin['\"]", r"from '@/features/admin/adminService'"),
    
    # Internal Feature Imports (relative inside the same old folder, e.g. './Login' in CustomerPages)
    (r"from\s+['\"](\./)Login['\"]", r"from './CustomerLogin'"),
    (r"from\s+['\"](\./)Register['\"]", r"from './CustomerRegister'"),
    (r"from\s+['\"](\./)RoleSelection['\"]", r"from './CustomerRoleSelection'"),
]

for root, _, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            new_content = content
            for old_pat, new_pat in replacements:
                new_content = re.sub(old_pat, new_pat, new_content)

            # Fix specific internal imports for WorkerPages and AppRoutes
            if file == 'AppRoutes.tsx':
                new_content = re.sub(r"from\s+['\"]\.\./pages/customer/(.*?)['\"]", r"from '@/features/auth/Customer\1'", new_content)
                new_content = re.sub(r"from\s+['\"]\.\./pages/worker/(.*?)['\"]", r"from '@/features/workers/Worker\1'", new_content)
                new_content = re.sub(r"from\s+['\"]\.\./pages/Admin/(.*?)['\"]", r"from '@/features/admin/Admin\1'", new_content)

            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
