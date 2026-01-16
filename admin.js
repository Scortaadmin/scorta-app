/* ========================================
   SCORTA - Admin Module
   Handles all admin panel functionality
======================================== */

const AdminModule = {
    // ============================================
    // VERIFICATION MANAGEMENT
    // ============================================

    // Get all verification requests
    getVerificationRequests: function (status = 'all') {
        const requests = JSON.parse(localStorage.getItem('scorta_verifications')) || this._generateMockVerifications();

        if (status === 'all') return requests;
        return requests.filter(r => r.status === status);
    },

    // Approve verification
    approveVerification: function (requestId, notes = '') {
        const requests = JSON.parse(localStorage.getItem('scorta_verifications')) || [];
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) {
            return { success: false, message: 'Solicitud no encontrada' };
        }

        requests[index].status = 'approved';
        requests[index].reviewedAt = new Date().toISOString();
        requests[index].reviewedBy = AuthModule.getCurrentUser()?.name || 'Admin';
        requests[index].notes = notes;

        // Update user's verified status
        const users = JSON.parse(localStorage.getItem('scorta_users')) || [];
        const userIndex = users.findIndex(u => u.id === requests[index].userId);
        if (userIndex !== -1) {
            users[userIndex].verified = true;
            localStorage.setItem('scorta_users', JSON.stringify(users));
        }

        localStorage.setItem('scorta_verifications', JSON.stringify(requests));
        return { success: true, message: 'Verificación aprobada correctamente' };
    },

    // Reject verification
    rejectVerification: function (requestId, reason) {
        const requests = JSON.parse(localStorage.getItem('scorta_verifications')) || [];
        const index = requests.findIndex(r => r.id === requestId);

        if (index === -1) {
            return { success: false, message: 'Solicitud no encontrada' };
        }

        requests[index].status = 'rejected';
        requests[index].reviewedAt = new Date().toISOString();
        requests[index].reviewedBy = AuthModule.getCurrentUser()?.name || 'Admin';
        requests[index].rejectionReason = reason;

        localStorage.setItem('scorta_verifications', JSON.stringify(requests));
        return { success: true, message: 'Verificación rechazada' };
    },

    // Get verification statistics
    getVerificationStats: function () {
        const requests = this.getVerificationRequests();
        return {
            total: requests.length,
            pending: requests.filter(r => r.status === 'pending').length,
            approved: requests.filter(r => r.status === 'approved').length,
            rejected: requests.filter(r => r.status === 'rejected').length
        };
    },

    // ============================================
    // USER MANAGEMENT
    // ============================================

    // Get all users with filters
    getAllUsers: function (filters = {}) {
        let users = JSON.parse(localStorage.getItem('scorta_users')) || [];

        // Apply role filter
        if (filters.role && filters.role !== 'all') {
            users = users.filter(u => u.role === filters.role);
        }

        // Apply verified filter
        if (filters.verified !== undefined && filters.verified !== 'all') {
            const isVerified = filters.verified === 'true' || filters.verified === true;
            users = users.filter(u => u.verified === isVerified);
        }

        // Apply status filter (active/suspended)
        if (filters.status && filters.status !== 'all') {
            users = users.filter(u => u.status === filters.status || (!u.status && filters.status === 'active'));
        }

        return users;
    },

    // Search users
    searchUsers: function (query) {
        const users = this.getAllUsers();
        const lowerQuery = query.toLowerCase();

        return users.filter(u =>
            u.name?.toLowerCase().includes(lowerQuery) ||
            u.email?.toLowerCase().includes(lowerQuery) ||
            u.phone?.includes(query)
        );
    },

    // Get user details
    getUserDetails: function (userId) {
        const users = JSON.parse(localStorage.getItem('scorta_users')) || [];
        return users.find(u => u.id === userId);
    },

    // Suspend user
    suspendUser: function (userId, reason) {
        const users = JSON.parse(localStorage.getItem('scorta_users')) || [];
        const index = users.findIndex(u => u.id === userId);

        if (index === -1) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        users[index].status = 'suspended';
        users[index].suspendedAt = new Date().toISOString();
        users[index].suspensionReason = reason;

        localStorage.setItem('scorta_users', JSON.stringify(users));
        return { success: true, message: 'Usuario suspendido correctamente' };
    },

    // Activate user
    activateUser: function (userId) {
        const users = JSON.parse(localStorage.getItem('scorta_users')) || [];
        const index = users.findIndex(u => u.id === userId);

        if (index === -1) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        users[index].status = 'active';
        delete users[index].suspendedAt;
        delete users[index].suspensionReason;

        localStorage.setItem('scorta_users', JSON.stringify(users));
        return { success: true, message: 'Usuario activado correctamente' };
    },

    // Delete user (soft delete)
    deleteUser: function (userId) {
        const users = JSON.parse(localStorage.getItem('scorta_users')) || [];
        const index = users.findIndex(u => u.id === userId);

        if (index === -1) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        users[index].status = 'deleted';
        users[index].deletedAt = new Date().toISOString();

        localStorage.setItem('scorta_users', JSON.stringify(users));
        return { success: true, message: 'Usuario eliminado' };
    },

    // Get user statistics
    getUserStats: function () {
        const users = this.getAllUsers();
        return {
            total: users.filter(u => u.status !== 'deleted').length,
            clients: users.filter(u => u.role === 'client' && u.status !== 'deleted').length,
            providers: users.filter(u => u.role === 'provider' && u.status !== 'deleted').length,
            verified: users.filter(u => u.verified && u.status !== 'deleted').length,
            suspended: users.filter(u => u.status === 'suspended').length
        };
    },

    // ============================================
    // REPORTS MANAGEMENT
    // ============================================

    // Get all reports
    getReports: function (status = 'all') {
        const reports = JSON.parse(localStorage.getItem('scorta_reports')) || this._generateMockReports();

        if (status === 'all') return reports;
        return reports.filter(r => r.status === status);
    },

    // Assign report to admin
    assignReport: function (reportId, adminId) {
        const reports = JSON.parse(localStorage.getItem('scorta_reports')) || [];
        const index = reports.findIndex(r => r.id === reportId);

        if (index === -1) {
            return { success: false, message: 'Reporte no encontrado' };
        }

        reports[index].assignedTo = adminId;
        reports[index].assignedAt = new Date().toISOString();

        localStorage.setItem('scorta_reports', JSON.stringify(reports));
        return { success: true, message: 'Reporte asignado' };
    },

    // Resolve report
    resolveReport: function (reportId, resolution, notes) {
        const reports = JSON.parse(localStorage.getItem('scorta_reports')) || [];
        const index = reports.findIndex(r => r.id === reportId);

        if (index === -1) {
            return { success: false, message: 'Reporte no encontrado' };
        }

        reports[index].status = 'resolved';
        reports[index].resolution = resolution;
        reports[index].resolutionNotes = notes;
        reports[index].resolvedAt = new Date().toISOString();
        reports[index].resolvedBy = AuthModule.getCurrentUser()?.name || 'Admin';

        localStorage.setItem('scorta_reports', JSON.stringify(reports));
        return { success: true, message: 'Reporte resuelto correctamente' };
    },

    // Get report statistics
    getReportStats: function () {
        const reports = this.getReports();
        return {
            total: reports.length,
            pending: reports.filter(r => r.status === 'pending').length,
            assigned: reports.filter(r => r.status === 'assigned').length,
            resolved: reports.filter(r => r.status === 'resolved').length
        };
    },

    // ============================================
    // TRANSACTIONS MANAGEMENT
    // ============================================

    // Get all transactions
    getAllTransactions: function (filters = {}) {
        let transactions = JSON.parse(localStorage.getItem('scorta_transactions')) || this._generateMockTransactions();

        // Apply type filter
        if (filters.type && filters.type !== 'all') {
            transactions = transactions.filter(t => t.type === filters.type);
        }

        // Apply date filter
        if (filters.dateFrom) {
            transactions = transactions.filter(t => new Date(t.date) >= new Date(filters.dateFrom));
        }
        if (filters.dateTo) {
            transactions = transactions.filter(t => new Date(t.date) <= new Date(filters.dateTo));
        }

        // Apply user filter
        if (filters.userId) {
            transactions = transactions.filter(t => t.userId === filters.userId);
        }

        return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    // Process refund
    processRefund: function (transactionId, amount, reason) {
        const transactions = JSON.parse(localStorage.getItem('scorta_transactions')) || [];
        const original = transactions.find(t => t.id === transactionId);

        if (!original) {
            return { success: false, message: 'Transacción no encontrada' };
        }

        // Create refund transaction
        const refund = {
            id: 'txn_' + Date.now(),
            type: 'refund',
            amount: amount,
            originalTransactionId: transactionId,
            userId: original.userId,
            date: new Date().toISOString(),
            status: 'completed',
            reason: reason,
            processedBy: AuthModule.getCurrentUser()?.name || 'Admin'
        };

        transactions.push(refund);
        localStorage.setItem('scorta_transactions', JSON.stringify(transactions));

        return { success: true, message: 'Reembolso procesado correctamente', refund };
    },

    // Get transaction statistics
    getTransactionStats: function () {
        const transactions = this.getAllTransactions();
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

        const totalRevenue = transactions
            .filter(t => t.type === 'payment' && t.status === 'completed')
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        const monthlyRevenue = transactions
            .filter(t => t.type === 'payment' && t.status === 'completed' && new Date(t.date) >= lastMonth)
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        return {
            total: transactions.length,
            totalRevenue: totalRevenue,
            monthlyRevenue: monthlyRevenue,
            pendingRefunds: transactions.filter(t => t.type === 'refund' && t.status === 'pending').length
        };
    },

    // ============================================
    // DASHBOARD & ANALYTICS
    // ============================================

    // Get dashboard metrics
    getDashboardMetrics: function () {
        const userStats = this.getUserStats();
        const transactionStats = this.getTransactionStats();
        const verificationStats = this.getVerificationStats();
        const reportStats = this.getReportStats();

        // Calculate growth rates
        const users = this.getAllUsers();
        const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newUsersThisWeek = users.filter(u => new Date(u.createdAt) >= lastWeek).length;
        const growthRate = users.length > 0 ? ((newUsersThisWeek / users.length) * 100).toFixed(1) : 0;

        return {
            users: userStats.total,
            userGrowth: `+${growthRate}%`,
            providers: userStats.providers,
            clients: userStats.clients,
            revenue: transactionStats.totalRevenue,
            monthlyRevenue: transactionStats.monthlyRevenue,
            transactions: transactionStats.total,
            pendingVerifications: verificationStats.pending,
            pendingReports: reportStats.pending,
            verifiedUsers: userStats.verified
        };
    },

    // Get user growth data (for charts)
    getUserGrowthData: function (days = 30) {
        const users = this.getAllUsers();
        const data = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const count = users.filter(u => {
                const createdAt = new Date(u.createdAt);
                return createdAt >= date && createdAt < nextDate;
            }).length;

            data.push({
                date: date.toISOString().split('T')[0],
                count: count
            });
        }

        return data;
    },

    // Get revenue data (for charts)
    getRevenueData: function (days = 30) {
        const transactions = this.getAllTransactions({ type: 'payment' });
        const data = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const revenue = transactions.filter(t => {
                const txDate = new Date(t.date);
                return txDate >= date && txDate < nextDate && t.status === 'completed';
            }).reduce((sum, t) => sum + (t.amount || 0), 0);

            data.push({
                date: date.toISOString().split('T')[0],
                revenue: revenue
            });
        }

        return data;
    },

    // Get pending alerts
    getPendingAlerts: function () {
        const alerts = [];

        const verificationStats = this.getVerificationStats();
        if (verificationStats.pending > 0) {
            alerts.push({
                type: 'warning',
                message: `${verificationStats.pending} verificaciones pendientes`,
                action: 'verifications'
            });
        }

        const reportStats = this.getReportStats();
        if (reportStats.pending > 5) {
            alerts.push({
                type: 'danger',
                message: `${reportStats.pending} reportes sin asignar`,
                action: 'reports'
            });
        }

        const userStats = this.getUserStats();
        if (userStats.suspended > 0) {
            alerts.push({
                type: 'info',
                message: `${userStats.suspended} usuarios suspendidos`,
                action: 'users'
            });
        }

        return alerts;
    },

    // ============================================
    // PLATFORM SETTINGS
    // ============================================

    // Get platform settings
    getPlatformSettings: function () {
        const defaults = {
            commission: 15, // Percentage
            minServicePrice: 10,
            maxServicePrice: 1000,
            allowedCities: ['Quito', 'Guayaquil', 'Cuenca', 'Ambato', 'Manta'],
            categories: ['Acompañamiento', 'Masajes', 'Eventos', 'Modelaje'],
            requireVerification: true,
            autoApproveProfiles: false
        };

        return JSON.parse(localStorage.getItem('scorta_platform_settings')) || defaults;
    },

    // Update platform settings
    updatePlatformSettings: function (settings) {
        localStorage.setItem('scorta_platform_settings', JSON.stringify(settings));
        return { success: true, message: 'Configuración actualizada' };
    },

    // ============================================
    // MOCK DATA GENERATORS
    // ============================================

    _generateMockVerifications: function () {
        const verifications = [
            {
                id: 'ver_001',
                userId: 'demo_provider',
                userName: 'Valeria',
                userEmail: 'proveedor@demo.com',
                submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'pending',
                documents: {
                    front: '/api/placeholder/600/400',
                    back: '/api/placeholder/600/400',
                    selfie: '/api/placeholder/600/400'
                },
                documentType: 'Cédula'
            },
            {
                id: 'ver_002',
                userId: 'user_' + (Date.now() - 1000),
                userName: 'María González',
                userEmail: 'maria@example.com',
                submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'pending',
                documents: {
                    front: '/api/placeholder/600/400',
                    back: '/api/placeholder/600/400',
                    selfie: '/api/placeholder/600/400'
                },
                documentType: 'Pasaporte'
            },
            {
                id: 'ver_003',
                userId: 'demo_client',
                userName: 'Carlos Mendoza',
                userEmail: 'cliente@demo.com',
                submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'approved',
                reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                reviewedBy: 'Admin',
                notes: 'Documentos verificados correctamente',
                documents: {
                    front: '/api/placeholder/600/400',
                    back: '/api/placeholder/600/400',
                    selfie: '/api/placeholder/600/400'
                },
                documentType: 'Cédula'
            }
        ];

        localStorage.setItem('scorta_verifications', JSON.stringify(verifications));
        return verifications;
    },

    _generateMockReports: function () {
        const reports = [
            {
                id: 'rep_001',
                type: 'inappropriate_content',
                reportedBy: 'demo_client',
                reportedUser: 'user_provider_01',
                reportedUserName: 'Ana Martínez',
                description: 'Fotos inapropiadas en el perfil',
                status: 'pending',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                priority: 'high'
            },
            {
                id: 'rep_002',
                type: 'payment_issue',
                reportedBy: 'user_client_02',
                reportedUser: 'demo_provider',
                reportedUserName: 'Valeria',
                description: 'No se completó el servicio pero se realizó el cobro',
                status: 'assigned',
                assignedTo: 'demo_admin',
                assignedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                priority: 'medium'
            },
            {
                id: 'rep_003',
                type: 'fake_profile',
                reportedBy: 'user_client_03',
                reportedUser: 'user_provider_03',
                reportedUserName: 'Lucía Ramos',
                description: 'Sospecha de perfil falso con fotos de internet',
                status: 'resolved',
                resolution: 'Profile suspended',
                resolutionNotes: 'Perfil suspendido temporalmente mientras se investiga',
                resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                resolvedBy: 'Admin',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                priority: 'high'
            }
        ];

        localStorage.setItem('scorta_reports', JSON.stringify(reports));
        return reports;
    },

    _generateMockTransactions: function () {
        const transactions = [];
        const types = ['payment', 'deposit', 'withdrawal'];

        for (let i = 0; i < 50; i++) {
            const daysAgo = Math.floor(Math.random() * 30);
            const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

            transactions.push({
                id: 'txn_' + (Date.now() - i * 1000),
                type: types[Math.floor(Math.random() * types.length)],
                amount: Math.floor(Math.random() * 500) + 20,
                userId: i % 2 === 0 ? 'demo_client' : 'demo_provider',
                userName: i % 2 === 0 ? 'Carlos Mendoza' : 'Valeria',
                date: date.toISOString(),
                status: 'completed',
                description: 'Servicio de acompañamiento'
            });
        }

        localStorage.setItem('scorta_transactions', JSON.stringify(transactions));
        return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
};

// Initialize mock data if not exists
if (typeof window !== 'undefined') {
    if (!localStorage.getItem('scorta_verifications')) {
        AdminModule._generateMockVerifications();
    }
    if (!localStorage.getItem('scorta_reports')) {
        AdminModule._generateMockReports();
    }
    if (!localStorage.getItem('scorta_transactions')) {
        AdminModule._generateMockTransactions();
    }
}
