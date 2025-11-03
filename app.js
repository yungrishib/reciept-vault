// ReceiptVault Pro - JavaScript Application
class ReceiptVaultApp {
    constructor() {
        this.receipts = [];
        this.settings = {
            theme: 'auto',
            currency: 'USD',
            aiServices: {
                tesseract: true,
                googleVision: false,
                azureVision: false,
                awsTextract: false
            },
            notifications: {
                warranty: true,
                budget: true
            }
        };
        this.currentTab = 'dashboard';
        this.filters = {};
        this.charts = {};
        
        // Initialize sample data
        this.sampleData = {
            categories: ["Food", "Shopping", "Transport", "Bills", "Entertainment", "Healthcare", "Gas", "Other"],
            paymentMethods: ["Cash", "Card", "Online", "Check"],
            warrantyOptions: ["None", "6 months", "1 year", "2 years", "3 years", "5 years", "10 years"],
            currencies: [
                {code: "USD", symbol: "$", name: "US Dollar"},
                {code: "EUR", symbol: "€", name: "Euro"},
                {code: "GBP", symbol: "£", name: "British Pound"},
                {code: "INR", symbol: "₹", name: "Indian Rupee"},
                {code: "JPY", symbol: "¥", name: "Japanese Yen"}
            ],
            sampleReceipts: [
                {
                    id: "1",
                    title: "Grocery Shopping",
                    store: "FreshMart Grocery",
                    amount: 45.67,
                    currency: "USD",
                    date: "2025-10-08",
                    category: "Food",
                    paymentMethod: "Card",
                    warranty: "None",
                    tags: ["groceries", "weekly"],
                    notes: "Weekly grocery shopping",
                    aiExtracted: true,
                    confidence: {store: 0.95, amount: 0.98, date: 0.92}
                },
                {
                    id: "2",
                    title: "Gas Station",
                    store: "Shell Station",
                    amount: 52.30,
                    currency: "USD", 
                    date: "2025-10-07",
                    category: "Gas",
                    paymentMethod: "Card",
                    warranty: "None",
                    tags: ["fuel", "commute"],
                    notes: "Full tank",
                    aiExtracted: false
                },
                {
                    id: "3",
                    title: "Electronics Store",
                    store: "TechWorld",
                    amount: 299.99,
                    currency: "USD",
                    date: "2025-10-05",
                    category: "Shopping",
                    paymentMethod: "Card", 
                    warranty: "2 years",
                    tags: ["electronics", "warranty"],
                    notes: "Wireless headphones",
                    aiExtracted: true,
                    confidence: {store: 0.88, amount: 0.99, date: 0.95}
                }
            ]
        };

        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.populateDropdowns();
        this.setupTheme();
        this.renderDashboard();
        this.renderReceipts();
        this.initializeCharts();
        
        // Set current date as default
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('receiptDate');
        if (dateInput) {
            dateInput.value = today;
        }
    }

    loadData() {
        try {
            const savedReceipts = localStorage.getItem('receiptVault_receipts');
            const savedSettings = localStorage.getItem('receiptVault_settings');
            
            if (savedReceipts) {
                this.receipts = JSON.parse(savedReceipts);
            } else {
                // Load sample data on first run
                this.receipts = this.sampleData.sampleReceipts;
                this.saveData();
            }
            
            if (savedSettings) {
                this.settings = {...this.settings, ...JSON.parse(savedSettings)};
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.showToast('Error loading data', 'error');
        }
    }

    saveData() {
        try {
            localStorage.setItem('receiptVault_receipts', JSON.stringify(this.receipts));
            localStorage.setItem('receiptVault_settings', JSON.stringify(this.settings));
            this.updateStorageInfo();
        } catch (error) {
            console.error('Error saving data:', error);
            this.showToast('Error saving data', 'error');
        }
    }

    setupEventListeners() {
        // Navigation - FIXED
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = e.currentTarget.dataset.tab;
                if (tab) {
                    this.switchTab(tab);
                }
            });
        });

        // Menu handling
        const menuBtn = document.getElementById('menuBtn');
        const closeMenu = document.getElementById('closeMenu');
        const sideMenu = document.getElementById('sideMenu');
        
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                sideMenu.classList.remove('hidden');
            });
        }

        if (closeMenu) {
            closeMenu.addEventListener('click', () => {
                sideMenu.classList.add('hidden');
            });
        }

        // Menu actions
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.currentTarget.dataset.action;
                this.handleMenuAction(action);
            });
        });

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Receipt form
        const receiptForm = document.getElementById('receiptForm');
        if (receiptForm) {
            receiptForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveReceipt();
            });
        }

        // AI Scan - FIXED
        const aiScanBtn = document.getElementById('aiScanBtn');
        const receiptImage = document.getElementById('receiptImage');
        
        if (aiScanBtn && receiptImage) {
            aiScanBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('AI Scan button clicked');
                receiptImage.click();
            });

            receiptImage.addEventListener('change', (e) => {
                console.log('File input changed');
                if (e.target.files && e.target.files[0]) {
                    this.processReceiptImage(e.target.files[0]);
                }
            });
        }

        // Quick actions - FIXED
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.currentTarget.dataset.action;
                console.log('Quick action clicked:', action);
                if (action === 'scan') {
                    const imageInput = document.getElementById('receiptImage');
                    if (imageInput) {
                        imageInput.click();
                    }
                } else if (action === 'add-manual') {
                    this.switchTab('add');
                }
            });
        });

        // Search and filters
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.renderReceipts();
            });
        }

        const filterBtn = document.getElementById('filterBtn');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                const panel = document.getElementById('filtersPanel');
                if (panel) {
                    panel.classList.toggle('hidden');
                }
            });
        }

        const applyFilters = document.getElementById('applyFilters');
        if (applyFilters) {
            applyFilters.addEventListener('click', () => {
                this.applyFilters();
            });
        }

        const clearFilters = document.getElementById('clearFilters');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Settings modal
        const closeSettingsModal = document.getElementById('closeSettingsModal');
        if (closeSettingsModal) {
            closeSettingsModal.addEventListener('click', () => {
                document.getElementById('settingsModal').classList.add('hidden');
            });
        }

        const saveSettings = document.getElementById('saveSettings');
        if (saveSettings) {
            saveSettings.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        const cancelSettings = document.getElementById('cancelSettings');
        if (cancelSettings) {
            cancelSettings.addEventListener('click', () => {
                document.getElementById('settingsModal').classList.add('hidden');
            });
        }

        // Chart period selector
        const chartPeriod = document.getElementById('chartPeriod');
        if (chartPeriod) {
            chartPeriod.addEventListener('change', () => {
                this.updateCharts();
            });
        }

        // Save draft
        const saveDraftBtn = document.getElementById('saveDraftBtn');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => {
                this.saveDraft();
            });
        }

        // Clear all data
        const clearAllData = document.getElementById('clearAllData');
        if (clearAllData) {
            clearAllData.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                    this.clearAllData();
                }
            });
        }

        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.add('hidden');
            }
        });

        // Close side menu when clicking outside
        document.addEventListener('click', (e) => {
            const sideMenu = document.getElementById('sideMenu');
            const menuBtn = document.getElementById('menuBtn');
            
            if (sideMenu && menuBtn && !sideMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                sideMenu.classList.add('hidden');
            }
        });
    }

    switchTab(tabName) {
        console.log('Switching to tab:', tabName);
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeNavItem = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const activeTab = document.getElementById(tabName);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        this.currentTab = tabName;

        // Update content based on tab
        switch (tabName) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'receipts':
                this.renderReceipts();
                break;
            case 'analytics':
                setTimeout(() => this.updateCharts(), 100); // Delay to ensure tab is visible
                break;
        }
    }

    handleMenuAction(action) {
        const sideMenu = document.getElementById('sideMenu');
        if (sideMenu) {
            sideMenu.classList.add('hidden');
        }
        
        switch (action) {
            case 'settings':
                this.openSettingsModal();
                break;
            case 'export':
                this.exportData();
                break;
            case 'import':
                this.importData();
                break;
            case 'backup':
                this.showToast('Backup feature coming soon!', 'info');
                break;
            case 'help':
                this.showToast('Help documentation available online', 'info');
                break;
            case 'about':
                this.showToast('ReceiptVault Pro v1.0 - Premium Receipt Management', 'info');
                break;
        }
    }

    populateDropdowns() {
        // Categories
        const categorySelects = ['receiptCategory', 'categoryFilter'];
        categorySelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                if (selectId === 'categoryFilter') {
                    select.innerHTML = '<option value="">All Categories</option>';
                } else {
                    select.innerHTML = '';
                }
                this.sampleData.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    select.appendChild(option);
                });
            }
        });

        // Payment methods
        const paymentSelect = document.getElementById('receiptPayment');
        if (paymentSelect) {
            paymentSelect.innerHTML = '';
            this.sampleData.paymentMethods.forEach(method => {
                const option = document.createElement('option');
                option.value = method;
                option.textContent = method;
                paymentSelect.appendChild(option);
            });
        }

        // Warranty options
        const warrantySelect = document.getElementById('receiptWarranty');
        if (warrantySelect) {
            warrantySelect.innerHTML = '';
            this.sampleData.warrantyOptions.forEach(warranty => {
                const option = document.createElement('option');
                option.value = warranty;
                option.textContent = warranty;
                warrantySelect.appendChild(option);
            });
        }

        // Currencies
        const currencySelects = ['receiptCurrency', 'defaultCurrency'];
        currencySelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '';
                this.sampleData.currencies.forEach(currency => {
                    const option = document.createElement('option');
                    option.value = currency.code;
                    option.textContent = `${currency.name} (${currency.symbol})`;
                    select.appendChild(option);
                });
                select.value = this.settings.currency;
            }
        });
    }

    setupTheme() {
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = this.settings.theme;
            themeSelect.addEventListener('change', (e) => {
                this.settings.theme = e.target.value;
                this.applyTheme();
            });
        }
        this.applyTheme();
    }

    applyTheme() {
        const html = document.documentElement;
        
        if (this.settings.theme === 'dark') {
            html.setAttribute('data-color-scheme', 'dark');
        } else if (this.settings.theme === 'light') {
            html.setAttribute('data-color-scheme', 'light');
        } else {
            html.removeAttribute('data-color-scheme');
        }
    }

    toggleTheme() {
        const themes = ['auto', 'light', 'dark'];
        const currentIndex = themes.indexOf(this.settings.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        
        this.settings.theme = themes[nextIndex];
        this.applyTheme();
        this.saveData();
        
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = this.settings.theme;
        }
        
        this.showToast(`Theme changed to ${this.settings.theme}`, 'info');
    }

    renderDashboard() {
        this.updateStats();
        this.renderRecentReceipts();
    }

    updateStats() {
        const totalCount = this.receipts.length;
        const totalAmount = this.receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
        
        // Current month receipts
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyReceipts = this.receipts.filter(receipt => {
            const receiptDate = new Date(receipt.date);
            return receiptDate.getMonth() === currentMonth && receiptDate.getFullYear() === currentYear;
        });
        const monthlyAmount = monthlyReceipts.reduce((sum, receipt) => sum + receipt.amount, 0);
        
        const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;
        
        // Update DOM
        const totalReceiptsEl = document.getElementById('totalReceipts');
        const totalAmountEl = document.getElementById('totalAmount');
        const monthlyAmountEl = document.getElementById('monthlyAmount');
        const avgAmountEl = document.getElementById('avgAmount');
        
        if (totalReceiptsEl) totalReceiptsEl.textContent = totalCount;
        if (totalAmountEl) totalAmountEl.textContent = this.formatCurrency(totalAmount);
        if (monthlyAmountEl) monthlyAmountEl.textContent = this.formatCurrency(monthlyAmount);
        if (avgAmountEl) avgAmountEl.textContent = this.formatCurrency(avgAmount);
    }

    renderRecentReceipts() {
        const recentList = document.getElementById('recentList');
        if (!recentList) return;
        
        const recentReceipts = this.receipts
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        if (recentReceipts.length === 0) {
            recentList.innerHTML = '<p class="text-secondary">No receipts yet. Add your first receipt!</p>';
            return;
        }

        recentList.innerHTML = recentReceipts.map(receipt => `
            <div class="recent-item">
                <div class="recent-info">
                    <h4>${receipt.title}</h4>
                    <div class="recent-meta">${receipt.store} • ${this.formatDate(receipt.date)} • ${receipt.category}</div>
                </div>
                <div class="recent-amount">${this.formatCurrency(receipt.amount)}</div>
            </div>
        `).join('');
    }

    renderReceipts() {
        const receiptsList = document.getElementById('receiptsList');
        if (!receiptsList) return;
        
        let filteredReceipts = this.getFilteredReceipts();

        if (filteredReceipts.length === 0) {
            receiptsList.innerHTML = '<p class="text-secondary">No receipts match your criteria.</p>';
            return;
        }

        receiptsList.innerHTML = filteredReceipts.map(receipt => `
            <div class="receipt-card">
                <div class="receipt-header">
                    <h3 class="receipt-title">${receipt.title}</h3>
                    <div class="receipt-store">${receipt.store}</div>
                </div>
                <div class="receipt-body">
                    <div class="receipt-amount">${this.formatCurrency(receipt.amount)}</div>
                    <div class="receipt-meta">
                        <span class="receipt-date">${this.formatDate(receipt.date)}</span>
                        <span class="receipt-category">${receipt.category}</span>
                    </div>
                    ${receipt.notes ? `<p class="receipt-notes">${receipt.notes}</p>` : ''}
                    ${receipt.tags && receipt.tags.length > 0 ? `<div class="receipt-tags">${receipt.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
                    <div class="receipt-actions">
                        <button class="btn btn--outline btn--sm" onclick="app.editReceipt('${receipt.id}')">Edit</button>
                        <button class="btn btn--outline btn--sm" onclick="app.deleteReceipt('${receipt.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getFilteredReceipts() {
        let filtered = [...this.receipts];

        // Text search
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filtered = filtered.filter(receipt => 
                receipt.title.toLowerCase().includes(searchTerm) ||
                receipt.store.toLowerCase().includes(searchTerm) ||
                receipt.category.toLowerCase().includes(searchTerm) ||
                (receipt.notes && receipt.notes.toLowerCase().includes(searchTerm))
            );
        }

        // Category filter
        if (this.filters.category) {
            filtered = filtered.filter(receipt => receipt.category === this.filters.category);
        }

        // Date range filter
        if (this.filters.dateFrom) {
            filtered = filtered.filter(receipt => receipt.date >= this.filters.dateFrom);
        }

        if (this.filters.dateTo) {
            filtered = filtered.filter(receipt => receipt.date <= this.filters.dateTo);
        }

        // Amount range filter
        if (this.filters.amountMin !== undefined) {
            filtered = filtered.filter(receipt => receipt.amount >= this.filters.amountMin);
        }

        if (this.filters.amountMax !== undefined) {
            filtered = filtered.filter(receipt => receipt.amount <= this.filters.amountMax);
        }

        return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    applyFilters() {
        this.filters = {
            search: document.getElementById('searchInput')?.value || '',
            category: document.getElementById('categoryFilter')?.value || '',
            dateFrom: document.getElementById('dateFromFilter')?.value || '',
            dateTo: document.getElementById('dateToFilter')?.value || '',
            amountMin: parseFloat(document.getElementById('amountMinFilter')?.value) || undefined,
            amountMax: parseFloat(document.getElementById('amountMaxFilter')?.value) || undefined
        };

        this.renderReceipts();
        const filtersPanel = document.getElementById('filtersPanel');
        if (filtersPanel) {
            filtersPanel.classList.add('hidden');
        }
        this.showToast('Filters applied', 'success');
    }

    clearFilters() {
        this.filters = {};
        
        // Clear form fields
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const dateFromFilter = document.getElementById('dateFromFilter');
        const dateToFilter = document.getElementById('dateToFilter');
        const amountMinFilter = document.getElementById('amountMinFilter');
        const amountMaxFilter = document.getElementById('amountMaxFilter');
        
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = '';
        if (dateFromFilter) dateFromFilter.value = '';
        if (dateToFilter) dateToFilter.value = '';
        if (amountMinFilter) amountMinFilter.value = '';
        if (amountMaxFilter) amountMaxFilter.value = '';

        this.renderReceipts();
        const filtersPanel = document.getElementById('filtersPanel');
        if (filtersPanel) {
            filtersPanel.classList.add('hidden');
        }
        this.showToast('Filters cleared', 'success');
    }

    async processReceiptImage(file) {
        console.log('Processing receipt image:', file.name);
        this.showLoading('Processing receipt...');
        
        try {
            // Process with Tesseract.js (client-side OCR)
            if (this.settings.aiServices.tesseract && typeof Tesseract !== 'undefined') {
                console.log('Starting Tesseract OCR...');
                const result = await Tesseract.recognize(file, 'eng', {
                    logger: m => console.log(m)
                });
                
                const extractedText = result.data.text;
                console.log('Extracted text:', extractedText);
                const extractedData = this.parseReceiptText(extractedText);
                
                // Populate form with extracted data
                this.populateFormWithData(extractedData);
                this.switchTab('add');
                
                this.showToast('Receipt processed successfully!', 'success');
            } else {
                this.showToast('Please enable Tesseract AI service in settings', 'warning');
                this.switchTab('add');
            }
        } catch (error) {
            console.error('Error processing receipt:', error);
            this.showToast('Error processing receipt: ' + error.message, 'error');
            this.switchTab('add');
        } finally {
            this.hideLoading();
        }
    }

    parseReceiptText(text) {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        const data = {
            title: '',
            store: '',
            amount: 0,
            date: '',
            category: 'Other'
        };

        // Extract store name (usually first few lines)
        if (lines.length > 0) {
            data.store = lines[0];
            data.title = `Receipt from ${lines[0]}`;
        }

        // Extract amount (look for currency symbols and numbers)
        const amountRegex = /[\$€£¥₹]\s*(\d+\.?\d*)|(\d+\.?\d*)\s*[\$€£¥₹]/g;
        const amounts = [];
        
        lines.forEach(line => {
            const matches = line.match(amountRegex);
            if (matches) {
                matches.forEach(match => {
                    const num = parseFloat(match.replace(/[^\d.]/g, ''));
                    if (!isNaN(num) && num > 0) {
                        amounts.push(num);
                    }
                });
            }
        });

        if (amounts.length > 0) {
            // Usually the largest amount is the total
            data.amount = Math.max(...amounts);
        }

        // Extract date
        const dateRegex = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})|(\d{2,4}[-\/]\d{1,2}[-\/]\d{1,2})/g;
        lines.forEach(line => {
            const dateMatch = line.match(dateRegex);
            if (dateMatch) {
                try {
                    const date = new Date(dateMatch[0]);
                    if (!isNaN(date.getTime())) {
                        data.date = date.toISOString().split('T')[0];
                    }
                } catch (e) {
                    console.log('Date parsing error:', e);
                }
            }
        });

        // Categorize based on store name
        if (data.store) {
            const storeLower = data.store.toLowerCase();
            if (storeLower.includes('grocery') || storeLower.includes('market') || storeLower.includes('food')) {
                data.category = 'Food';
            } else if (storeLower.includes('gas') || storeLower.includes('fuel') || storeLower.includes('shell') || storeLower.includes('exxon')) {
                data.category = 'Gas';
            } else if (storeLower.includes('pharmacy') || storeLower.includes('hospital') || storeLower.includes('clinic')) {
                data.category = 'Healthcare';
            } else if (storeLower.includes('restaurant') || storeLower.includes('cafe') || storeLower.includes('pizza')) {
                data.category = 'Food';
            }
        }

        return data;
    }

    populateFormWithData(data) {
        const titleInput = document.getElementById('receiptTitle');
        const storeInput = document.getElementById('receiptStore');
        const amountInput = document.getElementById('receiptAmount');
        const dateInput = document.getElementById('receiptDate');
        const categorySelect = document.getElementById('receiptCategory');
        
        if (data.title && titleInput) titleInput.value = data.title;
        if (data.store && storeInput) storeInput.value = data.store;
        if (data.amount && amountInput) amountInput.value = data.amount;
        if (data.date && dateInput) dateInput.value = data.date;
        if (data.category && categorySelect) categorySelect.value = data.category;
    }

    saveReceipt() {
        const titleInput = document.getElementById('receiptTitle');
        const storeInput = document.getElementById('receiptStore');
        const amountInput = document.getElementById('receiptAmount');
        const currencySelect = document.getElementById('receiptCurrency');
        const dateInput = document.getElementById('receiptDate');
        const categorySelect = document.getElementById('receiptCategory');
        const paymentSelect = document.getElementById('receiptPayment');
        const warrantySelect = document.getElementById('receiptWarranty');
        const tagsInput = document.getElementById('receiptTags');
        const notesInput = document.getElementById('receiptNotes');
        
        if (!titleInput?.value || !storeInput?.value || !amountInput?.value) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }
        
        const receipt = {
            id: Date.now().toString(),
            title: titleInput.value,
            store: storeInput.value,
            amount: parseFloat(amountInput.value),
            currency: currencySelect?.value || 'USD',
            date: dateInput?.value || new Date().toISOString().split('T')[0],
            category: categorySelect?.value || 'Other',
            paymentMethod: paymentSelect?.value || 'Card',
            warranty: warrantySelect?.value || 'None',
            tags: tagsInput?.value ? tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            notes: notesInput?.value || '',
            aiExtracted: false,
            createdAt: new Date().toISOString()
        };

        this.receipts.unshift(receipt);
        this.saveData();
        this.clearForm();
        this.showToast('Receipt saved successfully!', 'success');
        this.switchTab('dashboard');
    }

    saveDraft() {
        const draft = {
            title: document.getElementById('receiptTitle')?.value || '',
            store: document.getElementById('receiptStore')?.value || '',
            amount: document.getElementById('receiptAmount')?.value || '',
            currency: document.getElementById('receiptCurrency')?.value || 'USD',
            date: document.getElementById('receiptDate')?.value || '',
            category: document.getElementById('receiptCategory')?.value || '',
            paymentMethod: document.getElementById('receiptPayment')?.value || '',
            warranty: document.getElementById('receiptWarranty')?.value || '',
            tags: document.getElementById('receiptTags')?.value || '',
            notes: document.getElementById('receiptNotes')?.value || ''
        };

        localStorage.setItem('receiptVault_draft', JSON.stringify(draft));
        this.showToast('Draft saved', 'info');
    }

    clearForm() {
        const form = document.getElementById('receiptForm');
        if (form) {
            form.reset();
            const today = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('receiptDate');
            const currencySelect = document.getElementById('receiptCurrency');
            
            if (dateInput) dateInput.value = today;
            if (currencySelect) currencySelect.value = this.settings.currency;
        }
    }

    editReceipt(id) {
        const receipt = this.receipts.find(r => r.id === id);
        if (!receipt) return;

        // Populate form with receipt data
        const fields = [
            ['receiptTitle', receipt.title],
            ['receiptStore', receipt.store],
            ['receiptAmount', receipt.amount],
            ['receiptCurrency', receipt.currency],
            ['receiptDate', receipt.date],
            ['receiptCategory', receipt.category],
            ['receiptPayment', receipt.paymentMethod],
            ['receiptWarranty', receipt.warranty],
            ['receiptTags', receipt.tags.join(', ')],
            ['receiptNotes', receipt.notes]
        ];

        fields.forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field) field.value = value;
        });

        // Remove the original receipt
        this.receipts = this.receipts.filter(r => r.id !== id);
        
        this.switchTab('add');
        this.showToast('Editing receipt', 'info');
    }

    deleteReceipt(id) {
        if (confirm('Are you sure you want to delete this receipt?')) {
            this.receipts = this.receipts.filter(r => r.id !== id);
            this.saveData();
            this.renderReceipts();
            this.renderDashboard();
            this.showToast('Receipt deleted', 'success');
        }
    }

    initializeCharts() {
        setTimeout(() => {
            // Category Chart
            const categoryCtx = document.getElementById('categoryChart');
            if (categoryCtx && typeof Chart !== 'undefined') {
                this.charts.category = new Chart(categoryCtx, {
                    type: 'doughnut',
                    data: {
                        labels: [],
                        datasets: [{
                            data: [],
                            backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            }

            // Trend Chart
            const trendCtx = document.getElementById('trendChart');
            if (trendCtx && typeof Chart !== 'undefined') {
                this.charts.trend = new Chart(trendCtx, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [{
                            label: 'Monthly Spending',
                            data: [],
                            borderColor: '#1FB8CD',
                            backgroundColor: 'rgba(31, 184, 205, 0.1)',
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }

            // Merchant Chart
            const merchantCtx = document.getElementById('merchantChart');
            if (merchantCtx && typeof Chart !== 'undefined') {
                this.charts.merchant = new Chart(merchantCtx, {
                    type: 'bar',
                    data: {
                        labels: [],
                        datasets: [{
                            label: 'Amount Spent',
                            data: [],
                            backgroundColor: '#FFC185'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        scales: {
                            x: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }

            // Payment Chart
            const paymentCtx = document.getElementById('paymentChart');
            if (paymentCtx && typeof Chart !== 'undefined') {
                this.charts.payment = new Chart(paymentCtx, {
                    type: 'pie',
                    data: {
                        labels: [],
                        datasets: [{
                            data: [],
                            backgroundColor: ['#B4413C', '#5D878F', '#DB4545', '#D2BA4C']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            }

            this.updateCharts();
        }, 500);
    }

    updateCharts() {
        if (this.currentTab !== 'analytics') return;
        
        const periodSelect = document.getElementById('chartPeriod');
        const period = periodSelect ? periodSelect.value : 'all';
        const filteredReceipts = this.getReceiptsByPeriod(period);

        this.updateCategoryChart(filteredReceipts);
        this.updateTrendChart(filteredReceipts);
        this.updateMerchantChart(filteredReceipts);
        this.updatePaymentChart(filteredReceipts);
    }

    getReceiptsByPeriod(period) {
        const now = new Date();
        let startDate;

        switch (period) {
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                return this.receipts;
        }

        return this.receipts.filter(receipt => new Date(receipt.date) >= startDate);
    }

    updateCategoryChart(receipts) {
        if (!this.charts.category) return;

        const categoryData = {};
        receipts.forEach(receipt => {
            categoryData[receipt.category] = (categoryData[receipt.category] || 0) + receipt.amount;
        });

        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);

        this.charts.category.data.labels = labels;
        this.charts.category.data.datasets[0].data = data;
        this.charts.category.update();
    }

    updateTrendChart(receipts) {
        if (!this.charts.trend) return;

        const monthlyData = {};
        receipts.forEach(receipt => {
            const month = new Date(receipt.date).toISOString().slice(0, 7);
            monthlyData[month] = (monthlyData[month] || 0) + receipt.amount;
        });

        const labels = Object.keys(monthlyData).sort();
        const data = labels.map(month => monthlyData[month]);

        this.charts.trend.data.labels = labels;
        this.charts.trend.data.datasets[0].data = data;
        this.charts.trend.update();
    }

    updateMerchantChart(receipts) {
        if (!this.charts.merchant) return;

        const merchantData = {};
        receipts.forEach(receipt => {
            merchantData[receipt.store] = (merchantData[receipt.store] || 0) + receipt.amount;
        });

        const sortedMerchants = Object.entries(merchantData)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        const labels = sortedMerchants.map(([merchant]) => merchant);
        const data = sortedMerchants.map(([,amount]) => amount);

        this.charts.merchant.data.labels = labels;
        this.charts.merchant.data.datasets[0].data = data;
        this.charts.merchant.update();
    }

    updatePaymentChart(receipts) {
        if (!this.charts.payment) return;

        const paymentData = {};
        receipts.forEach(receipt => {
            paymentData[receipt.paymentMethod] = (paymentData[receipt.paymentMethod] || 0) + receipt.amount;
        });

        const labels = Object.keys(paymentData);
        const data = Object.values(paymentData);

        this.charts.payment.data.labels = labels;
        this.charts.payment.data.datasets[0].data = data;
        this.charts.payment.update();
    }

    openSettingsModal() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.populateSettingsForm();
        }
    }

    populateSettingsForm() {
        const themeSelect = document.getElementById('themeSelect');
        const defaultCurrency = document.getElementById('defaultCurrency');
        const warrantyNotifications = document.getElementById('warrantyNotifications');
        const budgetNotifications = document.getElementById('budgetNotifications');
        
        if (themeSelect) themeSelect.value = this.settings.theme;
        if (defaultCurrency) defaultCurrency.value = this.settings.currency;
        if (warrantyNotifications) warrantyNotifications.checked = this.settings.notifications.warranty;
        if (budgetNotifications) budgetNotifications.checked = this.settings.notifications.budget;
        
        // AI Services
        const aiContainer = document.getElementById('aiServicesConfig');
        if (aiContainer) {
            aiContainer.innerHTML = Object.entries(this.settings.aiServices).map(([service, enabled]) => `
                <div class="ai-service-item">
                    <label class="checkbox-label">
                        <input type="checkbox" id="ai_${service}" ${enabled ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        ${service.charAt(0).toUpperCase() + service.slice(1).replace(/([A-Z])/g, ' $1')}
                    </label>
                </div>
            `).join('');
        }

        this.updateStorageInfo();
    }

    saveSettings() {
        const themeSelect = document.getElementById('themeSelect');
        const defaultCurrency = document.getElementById('defaultCurrency');
        const warrantyNotifications = document.getElementById('warrantyNotifications');
        const budgetNotifications = document.getElementById('budgetNotifications');
        
        if (themeSelect) this.settings.theme = themeSelect.value;
        if (defaultCurrency) this.settings.currency = defaultCurrency.value;
        if (warrantyNotifications) this.settings.notifications.warranty = warrantyNotifications.checked;
        if (budgetNotifications) this.settings.notifications.budget = budgetNotifications.checked;

        // AI Services
        Object.keys(this.settings.aiServices).forEach(service => {
            const checkbox = document.getElementById(`ai_${service}`);
            if (checkbox) {
                this.settings.aiServices[service] = checkbox.checked;
            }
        });

        this.applyTheme();
        this.saveData();
        
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        this.showToast('Settings saved', 'success');
    }

    updateStorageInfo() {
        const data = localStorage.getItem('receiptVault_receipts') || '[]';
        const sizeKB = Math.round((new Blob([data]).size / 1024) * 100) / 100;
        const storageUsed = document.getElementById('storageUsed');
        if (storageUsed) {
            storageUsed.textContent = sizeKB;
        }
    }

    exportData() {
        const data = {
            receipts: this.receipts,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receiptvault-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('Data exported successfully', 'success');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (data.receipts && Array.isArray(data.receipts)) {
                            this.receipts = data.receipts;
                            if (data.settings) {
                                this.settings = {...this.settings, ...data.settings};
                            }
                            this.saveData();
                            this.renderDashboard();
                            this.renderReceipts();
                            this.showToast('Data imported successfully', 'success');
                        } else {
                            throw new Error('Invalid file format');
                        }
                    } catch (error) {
                        this.showToast('Error importing data', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    clearAllData() {
        localStorage.removeItem('receiptVault_receipts');
        localStorage.removeItem('receiptVault_settings');
        localStorage.removeItem('receiptVault_draft');
        
        this.receipts = [];
        this.settings = {
            theme: 'auto',
            currency: 'USD',
            aiServices: {
                tesseract: true,
                googleVision: false,
                azureVision: false,
                awsTextract: false
            },
            notifications: {
                warranty: true,
                budget: true
            }
        };

        this.renderDashboard();
        this.renderReceipts();
        this.updateCharts();
        this.showToast('All data cleared', 'success');
    }

    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            const spinner = overlay.querySelector('.loading-spinner p');
            if (spinner) spinner.textContent = message;
            overlay.classList.remove('hidden');
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `<p class="toast-message">${message}</p>`;
        
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    formatCurrency(amount) {
        const currency = this.sampleData.currencies.find(c => c.code === this.settings.currency);
        const symbol = currency ? currency.symbol : '$';
        return `${symbol}${amount.toFixed(2)}`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ReceiptVaultApp();
});

// Service Worker registration for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}