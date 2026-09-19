import os
import re
import glob
import shutil

frontend_dir = os.path.join(os.path.dirname(__file__), '../apps/frontend/src')

moves = {
    # Auth
    'pages/customer/Login.tsx': 'features/auth/CustomerLogin.tsx',
    'pages/customer/Register.tsx': 'features/auth/CustomerRegister.tsx',
    'pages/customer/RoleSelection.tsx': 'features/auth/CustomerRoleSelection.tsx',
    'pages/customer/Splash.tsx': 'features/auth/CustomerSplash.tsx',
    'pages/customer/Welcome.tsx': 'features/auth/CustomerWelcome.tsx',
    'pages/worker/Login.tsx': 'features/auth/WorkerLogin.tsx',
    'pages/worker/Register.tsx': 'features/auth/WorkerRegister.tsx',
    'pages/worker/RoleSelection.tsx': 'features/auth/WorkerRoleSelection.tsx',
    'pages/worker/Splash.tsx': 'features/auth/WorkerSplash.tsx',
    'pages/worker/Welcome.tsx': 'features/auth/WorkerWelcome.tsx',
    'pages/Admin/Login.tsx': 'features/auth/AdminLogin.tsx',
    'components/auth/ProtectedRoute.tsx': 'features/auth/ProtectedRoute.tsx',
    'services/auth.ts': 'features/auth/authService.ts',

    # Services
    'pages/customer/Services.tsx': 'features/services/Services.tsx',
    'pages/customer/BookService.tsx': 'features/services/BookService.tsx',
    'pages/customer/AIRecommendations.tsx': 'features/services/AIRecommendations.tsx',
    'services/services.ts': 'features/services/servicesService.ts',
    'services/ai.ts': 'features/services/aiService.ts',
    'data/servicesData.ts': 'features/services/servicesData.ts',

    # Workers
    'pages/worker/Dashboard.tsx': 'features/workers/WorkerDashboard.tsx',
    'pages/worker/Profile.tsx': 'features/workers/WorkerProfile.tsx',
    'pages/worker/Skills.tsx': 'features/workers/WorkerSkills.tsx',
    'pages/worker/Welfare.tsx': 'features/workers/WorkerWelfare.tsx',
    'pages/worker/Availability.tsx': 'features/workers/WorkerAvailability.tsx',
    'pages/customer/SearchWorkers.tsx': 'features/workers/SearchWorkers.tsx',
    'pages/customer/WorkerDetails.tsx': 'features/workers/WorkerDetails.tsx',
    'services/worker.ts': 'features/workers/workerService.ts',
    'data/workerData.ts': 'features/workers/workerData.ts',

    # Bookings
    'pages/customer/BookingHistory.tsx': 'features/bookings/CustomerBookingHistory.tsx',
    'pages/customer/BookingTracking.tsx': 'features/bookings/BookingTracking.tsx',
    'pages/customer/BookingConfirmation.tsx': 'features/bookings/BookingConfirmation.tsx',
    'pages/worker/JobRequests.tsx': 'features/bookings/WorkerJobRequests.tsx',
    'pages/worker/JobDetails.tsx': 'features/bookings/WorkerJobDetails.tsx',
    'pages/worker/ActiveJob.tsx': 'features/bookings/WorkerActiveJob.tsx',
    'services/bookings.ts': 'features/bookings/bookingService.ts',
    'data/bookingData.ts': 'features/bookings/bookingData.ts',

    # Payments
    'pages/customer/Payment.tsx': 'features/payments/Payment.tsx',
    'pages/customer/Invoice.tsx': 'features/payments/Invoice.tsx',
    'pages/worker/Earnings.tsx': 'features/payments/WorkerEarnings.tsx',

    # Reviews
    'pages/customer/Rating.tsx': 'features/reviews/Rating.tsx',
    'services/reviews.ts': 'features/reviews/reviewsService.ts',

    # Admin
    'pages/Admin/Dashboard.tsx': 'features/admin/AdminDashboard.tsx',
    'pages/Admin/Bookings.tsx': 'features/admin/AdminBookings.tsx',
    'pages/Admin/Reports.tsx': 'features/admin/AdminReports.tsx',
    'pages/Admin/Users.tsx': 'features/admin/AdminUsers.tsx',
    'pages/Admin/Workers.tsx': 'features/admin/AdminWorkers.tsx',
    'pages/Admin/Notifications.tsx': 'features/admin/AdminNotifications.tsx',
    'services/admin.ts': 'features/admin/adminService.ts',

    # Other / Common pages
    'pages/customer/Home.tsx': 'features/auth/CustomerHome.tsx',
    'pages/customer/CustomerPages.tsx': 'features/auth/CustomerPages.tsx',
    'pages/worker/WorkerPages.tsx': 'features/workers/WorkerPages.tsx',
    'pages/customer/Profile.tsx': 'features/auth/CustomerProfile.tsx',
    'pages/customer/Notification.tsx': 'features/auth/CustomerNotification.tsx',
    'pages/worker/Notification.tsx': 'features/workers/WorkerNotification.tsx',
    'services/notifications.ts': 'features/auth/notificationsService.ts',
    'services/profile.ts': 'features/auth/profileService.ts',
    'data/customerData.ts': 'features/auth/customerData.ts',

    # Components
    'components/common/Avatar.tsx': 'components/common/Avatar.tsx',
    'components/common/Badge.tsx': 'components/common/Badge.tsx',
    'components/common/Button.tsx': 'components/common/Button.tsx',
    'components/common/Card.tsx': 'components/common/Card.tsx',
    'components/common/Input.tsx': 'components/common/Input.tsx',
    'components/common/LanguageSelector.tsx': 'components/common/LanguageSelector.tsx',
    'components/common/LoadingScreen.tsx': 'components/common/LoadingScreen.tsx',
    'components/common/PageContainer.tsx': 'components/common/PageContainer.tsx',
    'components/common/PlaceholderPage.tsx': 'components/common/PlaceholderPage.tsx',
    'components/common/ThemeToggle.tsx': 'components/common/ThemeToggle.tsx',
    'components/BrandLogo.tsx': 'components/common/BrandLogo.tsx',
    'components/navigation/BottomNavigation.tsx': 'components/common/BottomNavigation.tsx',
    'components/navigation/Header.tsx': 'components/common/Header.tsx',
    'components/common/CustomerBottomNav.tsx': 'components/common/CustomerBottomNav.tsx',
    'components/common/WorkerBottomNav.tsx': 'components/common/WorkerBottomNav.tsx',

    # Libs & Utils
    'services/api.ts': 'lib/api.ts',
    'utils/profileImage.ts': 'lib/profileImage.ts',
    'constants/appConstants.ts': 'lib/appConstants.ts'
}

print("Moving files...")
for src_rel, dest_rel in moves.items():
    src_abs = os.path.join(frontend_dir, src_rel.replace('/', os.sep))
    dest_abs = os.path.join(frontend_dir, dest_rel.replace('/', os.sep))
    
    if os.path.exists(src_abs):
        os.makedirs(os.path.dirname(dest_abs), exist_ok=True)
        shutil.move(src_abs, dest_abs)
        print(f"Moved {src_rel} to {dest_rel}")
    else:
        print(f"File not found: {src_rel}")

print("Replacing relative imports with aliases...")
for root, _, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # For every import, if it starts with '.' or '..', we might need to resolve it manually or let the user fix it.
            # Actually, using regex to blindly replace relative with `@/` is risky because we don't know the exact new path.
            # We can use VSCode's auto-fix or TS compiler if possible, but we don't have those.
            # We will just write a simplistic fix or manually update `main.tsx` and `App.tsx` and `routes`.
            # Let's not blindly replace with regex, I'll remove the regex replace for now and fix major broken imports in routes/app manually.
