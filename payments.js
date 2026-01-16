/* ========================================
   SCORTA - Payments Module
   Mock payment gateway integration
======================================== */

const PaymentModule = {
    // Process payment
    processPayment: function (amount, method, metadata = {}) {
        return new Promise((resolve, reject) => {
            // Simulate API call delay
            setTimeout(() => {
                // Validate amount
                if (!amount || amount <= 0) {
                    reject({ success: false, message: 'Monto inválido' });
                    return;
                }

                // Validate payment method
                if (!method || !method.id) {
                    reject({ success: false, message: 'Método de pago no válido' });
                    return;
                }

                // Create transaction
                const transaction = {
                    id: 'txn_' + Date.now(),
                    amount: parseFloat(amount),
                    method: method,
                    status: 'completed',
                    metadata: metadata,
                    createdAt: new Date().toISOString(),
                    userId: this._getCurrentUserId()
                };

                // Save transaction
                this._saveTransaction(transaction);

                // Update user balance if wallet payment
                if (method.type === 'wallet') {
                    this._updateWalletBalance(-amount);
                }

                resolve({
                    success: true,
                    transaction: transaction,
                    message: 'Pago procesado exitosamente'
                });
            }, 2000); // Simulate 2s processing time
        });
    },

    // Add payment method
    addPaymentMethod: function (cardData) {
        const methods = this.getPaymentMethods();

        // Validate card
        if (!Utils.validateCreditCard(cardData.number)) {
            return { success: false, message: 'Número de tarjeta inválido' };
        }

        const cardType = Utils.getCardType(cardData.number);
        const last4 = cardData.number.slice(-4);

        const newMethod = {
            id: 'pm_' + Date.now(),
            type: 'card',
            cardType: cardType,
            last4: last4,
            expiryMonth: cardData.expiryMonth,
            expiryYear: cardData.expiryYear,
            holderName: cardData.holderName,
            isDefault: methods.length === 0, // First card is default
            addedAt: new Date().toISOString()
        };

        methods.push(newMethod);
        localStorage.setItem('scorta_payment_methods', JSON.stringify(methods));

        return { success: true, method: newMethod };
    },

    // Remove payment method
    removePaymentMethod: function (methodId) {
        let methods = this.getPaymentMethods();
        const index = methods.findIndex(m => m.id === methodId);

        if (index === -1) {
            return { success: false, message: 'Método de pago no encontrado' };
        }

        methods.splice(index, 1);
        localStorage.setItem('scorta_payment_methods', JSON.stringify(methods));

        return { success: true };
    },

    // Set default payment method
    setDefaultPaymentMethod: function (methodId) {
        const methods = this.getPaymentMethods();

        methods.forEach(m => {
            m.isDefault = m.id === methodId;
        });

        localStorage.setItem('scorta_payment_methods', JSON.stringify(methods));
        return { success: true };
    },

    // Get all payment methods
    getPaymentMethods: function () {
        return JSON.parse(localStorage.getItem('scorta_payment_methods')) || [];
    },

    // Get default payment method
    getDefaultPaymentMethod: function () {
        const methods = this.getPaymentMethods();
        return methods.find(m => m.isDefault) || methods[0] || null;
    },

    // Get transaction history
    getTransactionHistory: function (limit = 50) {
        const userId = this._getCurrentUserId();
        const allTransactions = JSON.parse(localStorage.getItem('scorta_transactions')) || [];

        return allTransactions
            .filter(t => t.userId === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    },

    // Get transaction by ID
    getTransaction: function (transactionId) {
        const transactions = JSON.parse(localStorage.getItem('scorta_transactions')) || [];
        return transactions.find(t => t.id === transactionId);
    },

    // Generate receipt
    generateReceipt: function (transactionId) {
        const transaction = this.getTransaction(transactionId);

        if (!transaction) {
            return { success: false, message: 'Transacción no encontrada' };
        }

        const receipt = {
            id: 'receipt_' + transactionId,
            transactionId: transaction.id,
            amount: transaction.amount,
            method: transaction.method,
            date: transaction.createdAt,
            metadata: transaction.metadata,
            receiptNumber: 'RCP-' + Date.now(),
            generatedAt: new Date().toISOString()
        };

        return { success: true, receipt: receipt };
    },

    // Request refund (simulation)
    requestRefund: function (transactionId, reason = '') {
        const transaction = this.getTransaction(transactionId);

        if (!transaction) {
            return { success: false, message: 'Transacción no encontrada' };
        }

        if (transaction.status === 'refunded') {
            return { success: false, message: 'Esta transacción ya fue reembolsada' };
        }

        // Update transaction status
        const allTransactions = JSON.parse(localStorage.getItem('scorta_transactions')) || [];
        const index = allTransactions.findIndex(t => t.id === transactionId);

        if (index !== -1) {
            allTransactions[index].status = 'refunded';
            allTransactions[index].refundReason = reason;
            allTransactions[index].refundedAt = new Date().toISOString();
            localStorage.setItem('scorta_transactions', JSON.stringify(allTransactions));
        }

        // Restore wallet balance if applicable
        if (transaction.method.type === 'wallet') {
            this._updateWalletBalance(transaction.amount);
        }

        return {
            success: true,
            message: 'Reembolso procesado. Los fondos estarán disponibles en 3-5 días hábiles.'
        };
    },

    // Get wallet balance
    getWalletBalance: function () {
        const userId = this._getCurrentUserId();
        const balances = JSON.parse(localStorage.getItem('scorta_wallet_balances')) || {};
        return balances[userId] || 0;
    },

    // Add funds to wallet
    addFundsToWallet: function (amount, paymentMethodId) {
        if (amount <= 0) {
            return { success: false, message: 'Monto inválido' };
        }

        const method = this.getPaymentMethods().find(m => m.id === paymentMethodId);
        if (!method) {
            return { success: false, message: 'Método de pago no encontrado' };
        }

        // Process payment first
        return this.processPayment(amount, method, {
            type: 'wallet_topup',
            description: 'Recarga de billetera'
        }).then(result => {
            if (result.success) {
                this._updateWalletBalance(amount);
                return {
                    success: true,
                    newBalance: this.getWalletBalance(),
                    message: 'Fondos agregados exitosamente'
                };
            }
            return result;
        });
    },

    // Private helper methods
    _getCurrentUserId: function () {
        const user = JSON.parse(localStorage.getItem('scorta_current_user'));
        return user ? user.id : 'guest';
    },

    _saveTransaction: function (transaction) {
        const transactions = JSON.parse(localStorage.getItem('scorta_transactions')) || [];
        transactions.push(transaction);
        localStorage.setItem('scorta_transactions', JSON.stringify(transactions));
    },

    _updateWalletBalance: function (amount) {
        const userId = this._getCurrentUserId();
        const balances = JSON.parse(localStorage.getItem('scorta_wallet_balances')) || {};
        balances[userId] = (balances[userId] || 0) + amount;
        localStorage.setItem('scorta_wallet_balances', JSON.stringify(balances));
    },

    // Initialize demo wallet
    initializeDemoWallet: function () {
        const userId = this._getCurrentUserId();
        const balances = JSON.parse(localStorage.getItem('scorta_wallet_balances')) || {};

        if (userId !== 'guest' && !balances[userId]) {
            balances[userId] = 100; // $100 initial balance for demo
            localStorage.setItem('scorta_wallet_balances', JSON.stringify(balances));
        }
    }
};

// Initialize on load
if (typeof window !== 'undefined') {
    window.PaymentModule = PaymentModule;
}
