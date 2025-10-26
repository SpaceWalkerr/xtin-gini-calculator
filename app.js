// Xtin Gini - Advanced Financial Planning Calculator
// State Management
const appState = {
  assets: [],
  liabilities: [],
  goals: [],
  userProfile: {
    currentAge: 35,
    retirementAge: 60,
    monthlyIncome: 200000,
    monthlyExpenses: 120000,
    monthlySavings: 60000,
    lifeExpectancy: 85
  },
  editingAsset: null,
  editingLiability: null,
  editingGoal: null,
  charts: {}
};

// Utility Functions
const utils = {
  formatCurrency: (amount) => {
    return '₹' + Math.round(amount).toLocaleString('en-IN');
  },
  
  formatNumber: (num, decimals = 2) => {
    return Number(num).toFixed(decimals);
  },
  
  calculateFutureValue: (pv, rate, years) => {
    return pv * Math.pow(1 + rate / 100, years);
  },
  
  calculateSIP: (monthlyAmount, rate, years) => {
    const monthlyRate = rate / 12 / 100;
    const months = years * 12;
    if (monthlyRate === 0) return monthlyAmount * months;
    return monthlyAmount * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate * (1 + monthlyRate);
  },
  
  calculateEMI: (principal, rate, years) => {
    const monthlyRate = rate / 12 / 100;
    const months = years * 12;
    if (monthlyRate === 0) return principal / months;
    return principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  },
  
  calculateRequiredSIP: (futureValue, rate, years) => {
    const monthlyRate = rate / 12 / 100;
    const months = years * 12;
    if (monthlyRate === 0) return futureValue / months;
    return futureValue * monthlyRate / ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate));
  },
  
  normalRandom: () => {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
};

const chartColors = {
  primary: 'rgba(34, 197, 94, 1)',
  primaryTransparent: 'rgba(34, 197, 94, 0.1)',
  accent: 'rgba(249, 115, 22, 1)',
  gray: 'rgba(107, 114, 128, 1)',
  pie: [
    'rgba(34, 197, 94, 1)',
    'rgba(59, 130, 246, 1)',
    'rgba(249, 115, 22, 1)',
    'rgba(107, 114, 128, 1)',
    'rgba(239, 68, 68, 1)',
    'rgba(147, 51, 234, 1)',
    'rgba(236, 72, 153, 1)',
    'rgba(6, 182, 212, 1)'
  ],
  assetVsLiability: [
    'rgba(34, 197, 94, 1)',
    'rgba(239, 68, 68, 1)',
    'rgba(107, 114, 128, 1)'
  ]
};

// Navigation
const navigation = {
  init: () => {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.dataset.tab;
        navigation.switchTab(tab);
      });
    });
  },
  
  switchTab: (tabName) => {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.tab === tabName) {
        item.classList.add('active');
      }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Refresh data for specific tabs
    if (tabName === 'dashboard') dashboard.refresh();
    if (tabName === 'portfolio') portfolio.refresh();
  }
};

// Dashboard Module
const dashboard = {
  refresh: () => {
    const netWorth = networth.calculateNetWorth();
    const goalsCount = appState.goals.length;
    const healthScore = dashboard.calculateHealthScore();
    const totalLiabilities = networth.calculateTotalLiabilities();
    
    document.getElementById('dashNetWorth').textContent = utils.formatCurrency(netWorth);
    document.getElementById('dashGoalsCount').textContent = goalsCount;
    document.getElementById('dashHealthScore').textContent = Math.round(healthScore) + '%';
    document.getElementById('dashLiabilities').textContent = utils.formatCurrency(totalLiabilities);
    
    dashboard.renderAssetChart();
    dashboard.renderGoalsChart();
  },
  
  calculateHealthScore: () => {
    let score = 50; // Base score
    
    const netWorth = networth.calculateNetWorth();
    if (netWorth > 0) score += 20;
    if (netWorth > 5000000) score += 10;
    
    if (appState.goals.length > 0) score += 10;
    
    const assets = networth.calculateTotalAssets();
    const liabilities = networth.calculateTotalLiabilities();
    if (liabilities > 0) {
      const ratio = assets / liabilities;
      if (ratio > 2) score += 10;
    } else if (assets > 0) {
      score += 10;
    }
    
    return Math.min(score, 100);
  },
  
  renderAssetChart: () => {
    const canvas = document.getElementById('dashAssetChart');
    if (!canvas) return;
    
    if (appState.charts.dashAsset) {
      appState.charts.dashAsset.destroy();
    }
    
    const assetsByCategory = {};
    appState.assets.forEach(asset => {
      if (!assetsByCategory[asset.category]) {
        assetsByCategory[asset.category] = 0;
      }
      assetsByCategory[asset.category] += asset.value;
    });
    
    if (Object.keys(assetsByCategory).length === 0) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    
    const labels = Object.keys(assetsByCategory);
    const data = Object.values(assetsByCategory);
    
    appState.charts.dashAsset = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: chartColors.pie
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
  },
  
  renderGoalsChart: () => {
    const canvas = document.getElementById('dashGoalsChart');
    if (!canvas) return;
    
    if (appState.charts.dashGoals) {
      appState.charts.dashGoals.destroy();
    }
    
    if (appState.goals.length === 0) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    
    const labels = appState.goals.map(g => g.name);
    const progress = appState.goals.map(g => {
      const yearsRemaining = g.targetYear - new Date().getFullYear();
      const futureValue = utils.calculateFutureValue(g.currentCost, g.inflation, yearsRemaining);
      return Math.min((g.saved / futureValue) * 100, 100);
    });
    
    appState.charts.dashGoals = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Progress %',
          data: progress,
          backgroundColor: chartColors.primary
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }
};

// Net Worth Module
const networth = {
  init: () => {
    document.getElementById('addAssetBtn').addEventListener('click', () => networth.showAssetForm());
    document.getElementById('cancelAssetBtn').addEventListener('click', () => networth.hideAssetForm());
    document.getElementById('saveAssetBtn').addEventListener('click', () => networth.saveAsset());
    
    document.getElementById('addLiabilityBtn').addEventListener('click', () => networth.showLiabilityForm());
    document.getElementById('cancelLiabilityBtn').addEventListener('click', () => networth.hideLiabilityForm());
    document.getElementById('saveLiabilityBtn').addEventListener('click', () => networth.saveLiability());
    
    networth.renderAssets();
    networth.renderLiabilities();
  },
  
  showAssetForm: () => {
    document.getElementById('assetFormContainer').style.display = 'block';
    appState.editingAsset = null;
    document.getElementById('assetName').value = '';
    document.getElementById('assetCategory').value = 'Real Estate';
    document.getElementById('assetValue').value = '';
    document.getElementById('assetReturn').value = '';
  },
  
  hideAssetForm: () => {
    document.getElementById('assetFormContainer').style.display = 'none';
    appState.editingAsset = null;
  },
  
  saveAsset: () => {
    const name = document.getElementById('assetName').value;
    const category = document.getElementById('assetCategory').value;
    const value = parseFloat(document.getElementById('assetValue').value);
    const returnRate = parseFloat(document.getElementById('assetReturn').value);
    
    if (!name || isNaN(value) || isNaN(returnRate)) {
      alert('Please fill all fields correctly');
      return;
    }
    
    const asset = {
      id: appState.editingAsset ? appState.editingAsset.id : Date.now(),
      name,
      category,
      value,
      return: returnRate
    };
    
    if (appState.editingAsset) {
      const index = appState.assets.findIndex(a => a.id === appState.editingAsset.id);
      appState.assets[index] = asset;
    } else {
      appState.assets.push(asset);
    }
    
    networth.hideAssetForm();
    networth.renderAssets();
    networth.updateSummary();
  },
  
  editAsset: (id) => {
    const asset = appState.assets.find(a => a.id === id);
    if (!asset) return;
    
    appState.editingAsset = asset;
    document.getElementById('assetFormContainer').style.display = 'block';
    document.getElementById('assetName').value = asset.name;
    document.getElementById('assetCategory').value = asset.category;
    document.getElementById('assetValue').value = asset.value;
    document.getElementById('assetReturn').value = asset.return;
  },
  
  deleteAsset: (id) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    appState.assets = appState.assets.filter(a => a.id !== id);
    networth.renderAssets();
    networth.updateSummary();
  },
  
  renderAssets: () => {
    const tbody = document.getElementById('assetsTableBody');
    if (appState.assets.length === 0) {
      tbody.innerHTML = '<tr class="empty-state"><td colspan="5">No assets added yet. Click "Add Asset" to get started.</td></tr>';
    } else {
      tbody.innerHTML = appState.assets.map(asset => `
        <tr>
          <td>${asset.name}</td>
          <td>${asset.category}</td>
          <td>${utils.formatCurrency(asset.value)}</td>
          <td>${asset.return}%</td>
          <td>
            <button class="action-btn" onclick="networth.editAsset(${asset.id})">Edit</button>
            <button class="action-btn delete" onclick="networth.deleteAsset(${asset.id})">Delete</button>
          </td>
        </tr>
      `).join('');
    }
    
    const total = networth.calculateTotalAssets();
    document.getElementById('totalAssets').textContent = utils.formatCurrency(total);
  },
  
  calculateTotalAssets: () => {
    return appState.assets.reduce((sum, asset) => sum + asset.value, 0);
  },
  
  showLiabilityForm: () => {
    document.getElementById('liabilityFormContainer').style.display = 'block';
    appState.editingLiability = null;
    document.getElementById('liabilityName').value = '';
    document.getElementById('liabilityType').value = 'Home Loan';
    document.getElementById('liabilityAmount').value = '';
    document.getElementById('liabilityRate').value = '';
    document.getElementById('liabilityEMI').value = '';
    document.getElementById('liabilityTenure').value = '';
  },
  
  hideLiabilityForm: () => {
    document.getElementById('liabilityFormContainer').style.display = 'none';
    appState.editingLiability = null;
  },
  
  saveLiability: () => {
    const name = document.getElementById('liabilityName').value;
    const type = document.getElementById('liabilityType').value;
    const amount = parseFloat(document.getElementById('liabilityAmount').value);
    const rate = parseFloat(document.getElementById('liabilityRate').value);
    const emi = parseFloat(document.getElementById('liabilityEMI').value);
    const tenure = parseFloat(document.getElementById('liabilityTenure').value);
    
    if (!name || isNaN(amount) || isNaN(rate)) {
      alert('Please fill all required fields correctly');
      return;
    }
    
    const liability = {
      id: appState.editingLiability ? appState.editingLiability.id : Date.now(),
      name,
      type,
      amount,
      rate,
      emi,
      tenure
    };
    
    if (appState.editingLiability) {
      const index = appState.liabilities.findIndex(l => l.id === appState.editingLiability.id);
      appState.liabilities[index] = liability;
    } else {
      appState.liabilities.push(liability);
    }
    
    networth.hideLiabilityForm();
    networth.renderLiabilities();
    networth.updateSummary();
  },
  
  editLiability: (id) => {
    const liability = appState.liabilities.find(l => l.id === id);
    if (!liability) return;
    
    appState.editingLiability = liability;
    document.getElementById('liabilityFormContainer').style.display = 'block';
    document.getElementById('liabilityName').value = liability.name;
    document.getElementById('liabilityType').value = liability.type;
    document.getElementById('liabilityAmount').value = liability.amount;
    document.getElementById('liabilityRate').value = liability.rate;
    document.getElementById('liabilityEMI').value = liability.emi;
    document.getElementById('liabilityTenure').value = liability.tenure;
  },
  
  deleteLiability: (id) => {
    if (!confirm('Are you sure you want to delete this liability?')) return;
    appState.liabilities = appState.liabilities.filter(l => l.id !== id);
    networth.renderLiabilities();
    networth.updateSummary();
  },
  
  renderLiabilities: () => {
    const tbody = document.getElementById('liabilitiesTableBody');
    if (appState.liabilities.length === 0) {
      tbody.innerHTML = '<tr class="empty-state"><td colspan="6">No liabilities added yet.</td></tr>';
    } else {
      tbody.innerHTML = appState.liabilities.map(liability => `
        <tr>
          <td>${liability.name}</td>
          <td>${liability.type}</td>
          <td>${utils.formatCurrency(liability.amount)}</td>
          <td>${liability.rate}%</td>
          <td>${utils.formatCurrency(liability.emi)}</td>
          <td>
            <button class="action-btn" onclick="networth.editLiability(${liability.id})">Edit</button>
            <button class="action-btn delete" onclick="networth.deleteLiability(${liability.id})">Delete</button>
          </td>
        </tr>
      `).join('');
    }
    
    const total = networth.calculateTotalLiabilities();
    document.getElementById('totalLiabilities').textContent = utils.formatCurrency(total);
  },
  
  calculateTotalLiabilities: () => {
    return appState.liabilities.reduce((sum, liability) => sum + liability.amount, 0);
  },
  
  calculateNetWorth: () => {
    return networth.calculateTotalAssets() - networth.calculateTotalLiabilities();
  },
  
  updateSummary: () => {
    const assets = networth.calculateTotalAssets();
    const liabilities = networth.calculateTotalLiabilities();
    const netWorthValue = networth.calculateNetWorth();
    
    document.getElementById('summaryAssets').textContent = utils.formatCurrency(assets);
    document.getElementById('summaryLiabilities').textContent = utils.formatCurrency(liabilities);
    document.getElementById('summaryNetWorth').textContent = utils.formatCurrency(netWorthValue);
    
    networth.renderCharts();
  },
  
  renderCharts: () => {
    // Asset Allocation Chart
    const allocationCanvas = document.getElementById('assetAllocationChart');
    if (appState.charts.assetAllocation) {
      appState.charts.assetAllocation.destroy();
    }
    
    const assetsByCategory = {};
    appState.assets.forEach(asset => {
      if (!assetsByCategory[asset.category]) {
        assetsByCategory[asset.category] = 0;
      }
      assetsByCategory[asset.category] += asset.value;
    });
    
    if (Object.keys(assetsByCategory).length > 0) {
      appState.charts.assetAllocation = new Chart(allocationCanvas, {
        type: 'pie',
        data: {
          labels: Object.keys(assetsByCategory),
          datasets: [{
            data: Object.values(assetsByCategory),
            backgroundColor: chartColors.pie
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
    
    // Assets vs Liabilities Chart
    const comparisonCanvas = document.getElementById('assetVsLiabilityChart');
    if (appState.charts.assetVsLiability) {
      appState.charts.assetVsLiability.destroy();
    }
    
    const assets = networth.calculateTotalAssets();
    const liabilities = networth.calculateTotalLiabilities();
    
    appState.charts.assetVsLiability = new Chart(comparisonCanvas, {
      type: 'bar',
      data: {
        labels: ['Assets', 'Liabilities', 'Net Worth'],
        datasets: [{
          label: 'Amount (₹)',
          data: [assets, liabilities, assets - liabilities],
          backgroundColor: chartColors.assetVsLiability
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }
};

// Goals Module
const goals = {
  init: () => {
    document.getElementById('addGoalBtn').addEventListener('click', () => goals.showGoalForm());
    document.getElementById('cancelGoalBtn').addEventListener('click', () => goals.hideGoalForm());
    document.getElementById('saveGoalBtn').addEventListener('click', () => goals.saveGoal());
    
    goals.renderGoals();
  },
  
  showGoalForm: () => {
    document.getElementById('goalFormContainer').style.display = 'block';
    appState.editingGoal = null;
    document.getElementById('goalName').value = '';
    document.getElementById('goalCategory').value = 'Education';
    document.getElementById('goalCurrentCost').value = '';
    document.getElementById('goalTargetYear').value = new Date().getFullYear() + 10;
    document.getElementById('goalPriority').value = 'High';
    document.getElementById('goalInflation').value = '7';
    document.getElementById('goalSaved').value = '0';
    document.getElementById('goalReturn').value = '12';
  },
  
  hideGoalForm: () => {
    document.getElementById('goalFormContainer').style.display = 'none';
    appState.editingGoal = null;
  },
  
  saveGoal: () => {
    const name = document.getElementById('goalName').value;
    const category = document.getElementById('goalCategory').value;
    const currentCost = parseFloat(document.getElementById('goalCurrentCost').value);
    const targetYear = parseInt(document.getElementById('goalTargetYear').value);
    const priority = document.getElementById('goalPriority').value;
    const inflation = parseFloat(document.getElementById('goalInflation').value);
    const saved = parseFloat(document.getElementById('goalSaved').value);
    const returnRate = parseFloat(document.getElementById('goalReturn').value);
    
    if (!name || isNaN(currentCost) || isNaN(targetYear)) {
      alert('Please fill all required fields correctly');
      return;
    }
    
    const goal = {
      id: appState.editingGoal ? appState.editingGoal.id : Date.now(),
      name,
      category,
      currentCost,
      targetYear,
      priority,
      inflation,
      saved,
      return: returnRate
    };
    
    if (appState.editingGoal) {
      const index = appState.goals.findIndex(g => g.id === appState.editingGoal.id);
      appState.goals[index] = goal;
    } else {
      appState.goals.push(goal);
    }
    
    goals.hideGoalForm();
    goals.renderGoals();
  },
  
  editGoal: (id) => {
    const goal = appState.goals.find(g => g.id === id);
    if (!goal) return;
    
    appState.editingGoal = goal;
    document.getElementById('goalFormContainer').style.display = 'block';
    document.getElementById('goalName').value = goal.name;
    document.getElementById('goalCategory').value = goal.category;
    document.getElementById('goalCurrentCost').value = goal.currentCost;
    document.getElementById('goalTargetYear').value = goal.targetYear;
    document.getElementById('goalPriority').value = goal.priority;
    document.getElementById('goalInflation').value = goal.inflation;
    document.getElementById('goalSaved').value = goal.saved;
    document.getElementById('goalReturn').value = goal.return;
  },
  
  deleteGoal: (id) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    appState.goals = appState.goals.filter(g => g.id !== id);
    goals.renderGoals();
  },
  
  renderGoals: () => {
    const container = document.getElementById('goalsCardsContainer');
    if (appState.goals.length === 0) {
      container.innerHTML = '<div class="empty-state-card"><p>No goals added yet. Click "Add Goal" to start planning.</p></div>';
    } else {
      container.innerHTML = appState.goals.map(goal => {
        const yearsRemaining = goal.targetYear - new Date().getFullYear();
        const futureValue = utils.calculateFutureValue(goal.currentCost, goal.inflation, yearsRemaining);
        const progressPercent = Math.min((goal.saved / futureValue) * 100, 100);
        
        let status = 'on-track';
        let statusText = 'On Track';
        if (progressPercent < 30) {
          status = 'critical';
          statusText = 'Critical';
        } else if (progressPercent < 60) {
          status = 'needs-attention';
          statusText = 'Needs Attention';
        }
        
        const monthlySIPRequired = yearsRemaining > 0 ? utils.calculateRequiredSIP(futureValue - goal.saved, goal.return, yearsRemaining) : 0;
        
        return `
          <div class="goal-card">
            <div class="goal-header">
              <div>
                <div class="goal-title">${goal.name}</div>
                <div class="goal-category">${goal.category}</div>
              </div>
              <div class="goal-priority ${goal.priority.toLowerCase()}">${goal.priority}</div>
            </div>
            <div class="goal-details">
              <div class="goal-detail-item">
                <span class="goal-detail-label">Target Year:</span>
                <span class="goal-detail-value">${goal.targetYear}</span>
              </div>
              <div class="goal-detail-item">
                <span class="goal-detail-label">Years Remaining:</span>
                <span class="goal-detail-value">${yearsRemaining} years</span>
              </div>
              <div class="goal-detail-item">
                <span class="goal-detail-label">Future Value:</span>
                <span class="goal-detail-value">${utils.formatCurrency(futureValue)}</span>
              </div>
              <div class="goal-detail-item">
                <span class="goal-detail-label">Already Saved:</span>
                <span class="goal-detail-value">${utils.formatCurrency(goal.saved)}</span>
              </div>
              <div class="goal-detail-item">
                <span class="goal-detail-label">Monthly SIP Needed:</span>
                <span class="goal-detail-value">${utils.formatCurrency(monthlySIPRequired)}</span>
              </div>
            </div>
            <div class="goal-progress">
              <div class="goal-progress-label">
                <span>Progress</span>
                <span>${utils.formatNumber(progressPercent, 1)}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercent}%"></div>
              </div>
            </div>
            <div class="goal-status ${status}">${statusText}</div>
            <div class="goal-actions">
              <button class="btn btn--sm btn--secondary" onclick="goals.editGoal(${goal.id})">Edit</button>
              <button class="btn btn--sm btn--outline" onclick="goals.deleteGoal(${goal.id})">Delete</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }
};

// Portfolio Module
const portfolio = {
  refresh: () => {
    portfolio.calculatePortfolio();
  },
  
  calculatePortfolio: () => {
    const assetsByCategory = {};
    const totalValue = networth.calculateTotalAssets();
    
    appState.assets.forEach(asset => {
      if (!assetsByCategory[asset.category]) {
        assetsByCategory[asset.category] = {
          value: 0,
          returns: []
        };
      }
      assetsByCategory[asset.category].value += asset.value;
      assetsByCategory[asset.category].returns.push(asset.return);
    });
    
    let weightedReturn = 0;
    const tbody = document.getElementById('portfolioTableBody');
    
    if (Object.keys(assetsByCategory).length === 0) {
      tbody.innerHTML = '<tr class="empty-state"><td colspan="5">No portfolio data available</td></tr>';
      document.getElementById('portfolioWeightedReturn').textContent = '0%';
      document.getElementById('portfolioTotalValue').textContent = '₹0';
      document.getElementById('portfolioAssetClasses').textContent = '0';
      return;
    }
    
    tbody.innerHTML = Object.entries(assetsByCategory).map(([category, data]) => {
      const allocation = (data.value / totalValue) * 100;
      const avgReturn = data.returns.reduce((a, b) => a + b, 0) / data.returns.length;
      const contribution = (allocation / 100) * avgReturn;
      weightedReturn += contribution;
      
      return `
        <tr>
          <td>${category}</td>
          <td>${utils.formatCurrency(data.value)}</td>
          <td>${utils.formatNumber(allocation, 1)}%</td>
          <td>${utils.formatNumber(avgReturn, 1)}%</td>
          <td>${utils.formatNumber(contribution, 2)}%</td>
        </tr>
      `;
    }).join('');
    
    document.getElementById('portfolioWeightedReturn').textContent = utils.formatNumber(weightedReturn, 2) + '%';
    document.getElementById('portfolioTotalValue').textContent = utils.formatCurrency(totalValue);
    document.getElementById('portfolioAssetClasses').textContent = Object.keys(assetsByCategory).length;
    
    portfolio.renderDistributionChart();
  },
  
  renderDistributionChart: () => {
    const canvas = document.getElementById('portfolioDistChart');
    if (appState.charts.portfolioDist) {
      appState.charts.portfolioDist.destroy();
    }
    
    const assetsByCategory = {};
    appState.assets.forEach(asset => {
      if (!assetsByCategory[asset.category]) {
        assetsByCategory[asset.category] = 0;
      }
      assetsByCategory[asset.category] += asset.value;
    });
    
    if (Object.keys(assetsByCategory).length === 0) return;
    
    appState.charts.portfolioDist = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: Object.keys(assetsByCategory),
        datasets: [{
          data: Object.values(assetsByCategory),
          backgroundColor: chartColors.pie
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
  },
  
  init: () => {
    document.getElementById('calculateRiskBtn').addEventListener('click', () => portfolio.calculateRisk());
  },
  
  calculateRisk: () => {
    const horizon = parseInt(document.getElementById('riskHorizon').value);
    const tolerance = document.getElementById('riskTolerance').value;
    
    let equity = 50;
    let debt = 40;
    let others = 10;
    
    if (tolerance === 'Conservative') {
      equity = 30;
      debt = 60;
      others = 10;
    } else if (tolerance === 'Aggressive') {
      equity = 70;
      debt = 20;
      others = 10;
    }
    
    // Adjust for horizon
    if (horizon > 15) {
      equity += 10;
      debt -= 10;
    } else if (horizon < 5) {
      equity -= 10;
      debt += 10;
    }
    
    equity = Math.max(0, Math.min(100, equity));
    debt = Math.max(0, Math.min(100, debt));
    
    document.getElementById('recEquity').textContent = equity + '%';
    document.getElementById('recDebt').textContent = debt + '%';
    document.getElementById('recOthers').textContent = others + '%';
    document.getElementById('riskRecommendations').style.display = 'block';
  }
};

// Planner Module
const planner = {
  init: () => {
    document.getElementById('calculateProjectionBtn').addEventListener('click', () => planner.calculateProjections());
    
    // Scenario sliders
    document.getElementById('savingsAdjSlider').addEventListener('input', (e) => {
      document.getElementById('savingsAdjLabel').textContent = e.target.value + '%';
      planner.updateScenario();
    });
    
    document.getElementById('returnAdjSlider').addEventListener('input', (e) => {
      document.getElementById('returnAdjLabel').textContent = e.target.value + '%';
      planner.updateScenario();
    });
    
    document.getElementById('retirementAdjSlider').addEventListener('input', (e) => {
      document.getElementById('retirementAdjLabel').textContent = e.target.value + ' years';
      planner.updateScenario();
    });
  },
  
  calculateProjections: () => {
    const currentAge = parseInt(document.getElementById('plannerCurrentAge').value);
    const retirementAge = parseInt(document.getElementById('plannerRetirementAge').value);
    const currentSavings = parseFloat(document.getElementById('plannerSavings').value);
    const monthlySavings = parseFloat(document.getElementById('plannerMonthlySavings').value);
    const returnRate = parseFloat(document.getElementById('plannerReturn').value);
    const years = retirementAge - currentAge;
    
    const projectedCorpus = utils.calculateSIP(monthlySavings, returnRate, years) + utils.calculateFutureValue(currentSavings, returnRate, years);
    const totalInvested = currentSavings + (monthlySavings * 12 * years);
    const totalReturns = projectedCorpus - totalInvested;
    
    document.getElementById('projectedCorpus').textContent = utils.formatCurrency(projectedCorpus);
    document.getElementById('totalInvested').textContent = utils.formatCurrency(totalInvested);
    document.getElementById('totalReturns').textContent = utils.formatCurrency(totalReturns);
    document.getElementById('projectionResults').style.display = 'block';
    
    planner.renderProjectionChart(years, monthlySavings, currentSavings, returnRate);
    planner.baseProjection = { projectedCorpus, years, monthlySavings, currentSavings, returnRate, retirementAge };
    planner.updateScenario();
  },
  
  renderProjectionChart: (years, monthlySavings, currentSavings, returnRate) => {
    const canvas = document.getElementById('projectionChart');
    if (appState.charts.projection) {
      appState.charts.projection.destroy();
    }
    
    const labels = [];
    const data = [];
    let corpus = currentSavings;
    
    for (let i = 0; i <= years; i++) {
      labels.push('Year ' + i);
      data.push(corpus);
      corpus = corpus * (1 + returnRate / 100) + (monthlySavings * 12);
    }
    
    appState.charts.projection = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Projected Wealth (₹)',
          data: data,
          borderColor: chartColors.primary,
          backgroundColor: chartColors.primaryTransparent,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  },
  
  updateScenario: () => {
    if (!planner.baseProjection) return;
    
    const savingsAdj = parseFloat(document.getElementById('savingsAdjSlider').value);
    const returnAdj = parseFloat(document.getElementById('returnAdjSlider').value);
    const retirementAdj = parseInt(document.getElementById('retirementAdjSlider').value);
    
    const adjustedSavings = planner.baseProjection.monthlySavings * (1 + savingsAdj / 100);
    const adjustedReturn = planner.baseProjection.returnRate + returnAdj;
    const adjustedYears = planner.baseProjection.years + retirementAdj;
    
    const adjustedCorpus = utils.calculateSIP(adjustedSavings, adjustedReturn, adjustedYears) + 
                          utils.calculateFutureValue(planner.baseProjection.currentSavings, adjustedReturn, adjustedYears);
    
    const change = adjustedCorpus - planner.baseProjection.projectedCorpus;
    const changePercent = (change / planner.baseProjection.projectedCorpus) * 100;
    
    document.getElementById('scenarioResult').textContent = utils.formatCurrency(adjustedCorpus);
    document.getElementById('scenarioChange').textContent = 
      (change >= 0 ? '↑ ' : '↓ ') + utils.formatCurrency(Math.abs(change)) + 
      ' (' + (change >= 0 ? '+' : '') + utils.formatNumber(changePercent, 1) + '%)';
    document.getElementById('scenarioChange').style.color = change >= 0 ? 'var(--color-success)' : 'var(--color-error)';
  }
};

// Required Return Module
const requiredReturn = {
  init: () => {
    document.getElementById('calculateRequiredReturnBtn').addEventListener('click', () => requiredReturn.calculate());
  },
  
  calculate: () => {
    const currentSavings = parseFloat(document.getElementById('rrCurrentSavings').value);
    const monthlyContribution = parseFloat(document.getElementById('rrMonthlyContribution').value);
    const expectedReturn = parseFloat(document.getElementById('rrExpectedReturn').value);
    
    // Calculate total needed for all goals
    let totalNeeded = 0;
    appState.goals.forEach(goal => {
      const yearsRemaining = goal.targetYear - new Date().getFullYear();
      if (yearsRemaining > 0) {
        const futureValue = utils.calculateFutureValue(goal.currentCost, goal.inflation, yearsRemaining);
        totalNeeded += futureValue;
      }
    });
    
    if (totalNeeded === 0) {
      alert('Please add some goals first');
      return;
    }
    
    // Find the maximum years
    const maxYears = Math.max(...appState.goals.map(g => g.targetYear - new Date().getFullYear()));
    
    // Calculate projected corpus at expected return
    const projectedCorpus = utils.calculateSIP(monthlyContribution, expectedReturn, maxYears) + 
                           utils.calculateFutureValue(currentSavings, expectedReturn, maxYears);
    
    // Calculate required return using iterative method
    const requiredReturnRate = requiredReturn.findRequiredReturn(currentSavings, monthlyContribution, totalNeeded, maxYears);
    
    const gap = requiredReturnRate - expectedReturn;
    
    document.getElementById('rrTotalNeeded').textContent = utils.formatCurrency(totalNeeded);
    document.getElementById('rrProjected').textContent = utils.formatCurrency(projectedCorpus);
    document.getElementById('rrRequired').textContent = utils.formatNumber(requiredReturnRate, 2) + '%';
    document.getElementById('rrGap').textContent = utils.formatNumber(gap, 2) + '%';
    
    // Feasibility assessment
    const indicator = document.getElementById('feasibilityIndicator');
    indicator.className = 'feasibility-indicator';
    
    let feasibility = '';
    let recommendations = [];
    
    if (requiredReturnRate < 12) {
      feasibility = 'achievable';
      indicator.querySelector('.feasibility-label').textContent = '✓ Achievable - Your goals are realistic';
      recommendations.push('Your goals are on track with a reasonable return expectation');
      recommendations.push('Consider diversifying across equity mutual funds and index funds');
      recommendations.push('Maintain discipline in your monthly investments');
    } else if (requiredReturnRate < 18) {
      feasibility = 'challenging';
      indicator.querySelector('.feasibility-label').textContent = '⚠ Challenging - Requires aggressive strategy';
      recommendations.push('Your goals require an aggressive investment approach');
      recommendations.push('Consider increasing your monthly contributions');
      recommendations.push('Focus on high-growth equity investments');
      recommendations.push('Review and prioritize your goals');
    } else {
      feasibility = 'difficult';
      indicator.querySelector('.feasibility-label').textContent = '✗ Very Difficult - Goals need adjustment';
      recommendations.push('Required return is very high and risky to achieve');
      recommendations.push('Consider extending goal timelines');
      recommendations.push('Significantly increase monthly contributions');
      recommendations.push('Re-evaluate goal priorities and costs');
      recommendations.push('Consider partial funding of lower priority goals');
    }
    
    indicator.classList.add(feasibility);
    
    const recList = document.getElementById('rrRecommendationsList');
    recList.innerHTML = recommendations.map(r => `<li>${r}</li>`).join('');
    
    document.getElementById('requiredReturnResults').style.display = 'block';
  },
  
  findRequiredReturn: (pv, pmt, fv, years) => {
    // Newton-Raphson method to find required return
    let rate = 12; // Initial guess
    const tolerance = 0.001;
    const maxIterations = 100;
    
    for (let i = 0; i < maxIterations; i++) {
      const monthlyRate = rate / 12 / 100;
      const months = years * 12;
      
      // Calculate corpus at current rate
      const sipValue = pmt * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate * (1 + monthlyRate);
      const pvValue = pv * Math.pow(1 + rate / 100, years);
      const totalValue = sipValue + pvValue;
      
      const error = totalValue - fv;
      
      if (Math.abs(error) < tolerance) {
        return rate;
      }
      
      // Derivative approximation
      const delta = 0.01;
      const monthlyRate2 = (rate + delta) / 12 / 100;
      const sipValue2 = pmt * (Math.pow(1 + monthlyRate2, months) - 1) / monthlyRate2 * (1 + monthlyRate2);
      const pvValue2 = pv * Math.pow(1 + (rate + delta) / 100, years);
      const totalValue2 = sipValue2 + pvValue2;
      
      const derivative = (totalValue2 - totalValue) / delta;
      
      // Newton-Raphson update
      rate = rate - error / derivative;
      rate = Math.max(0, Math.min(50, rate)); // Clamp between 0 and 50%
    }
    
    return rate;
  }
};

// Monte Carlo Module
const monteCarlo = {
  init: () => {
    document.getElementById('runMonteCarloBtn').addEventListener('click', () => monteCarlo.runSimulation());
  },
  
  runSimulation: () => {
    const initial = parseFloat(document.getElementById('mcInitial').value);
    const monthly = parseFloat(document.getElementById('mcMonthly').value);
    const years = parseInt(document.getElementById('mcYears').value);
    const meanReturn = parseFloat(document.getElementById('mcMeanReturn').value);
    const volatility = parseFloat(document.getElementById('mcVolatility').value);
    const target = parseFloat(document.getElementById('mcTarget').value);
    const simulations = parseInt(document.getElementById('mcSimulations').value);
    
    const results = [];
    
    for (let sim = 0; sim < simulations; sim++) {
      let corpus = initial;
      
      for (let year = 0; year < years; year++) {
        // Generate random return
        const randomReturn = meanReturn + (utils.normalRandom() * volatility);
        corpus = corpus * (1 + randomReturn / 100) + (monthly * 12);
      }
      
      results.push(corpus);
    }
    
    // Sort results
    results.sort((a, b) => a - b);
    
    // Calculate statistics
    const median = results[Math.floor(results.length / 2)];
    const percentile10 = results[Math.floor(results.length * 0.1)];
    const percentile90 = results[Math.floor(results.length * 0.9)];
    const successCount = results.filter(r => r >= target).length;
    const probability = (successCount / simulations) * 100;
    
    document.getElementById('mcProbability').textContent = utils.formatNumber(probability, 1) + '%';
    document.getElementById('mcMedian').textContent = utils.formatCurrency(median);
    document.getElementById('mcBest').textContent = utils.formatCurrency(percentile90);
    document.getElementById('mcWorst').textContent = utils.formatCurrency(percentile10);
    
    monteCarlo.renderDistribution(results, target);
    document.getElementById('monteCarloResults').style.display = 'block';
  },
  
  renderDistribution: (results, target) => {
    const canvas = document.getElementById('mcDistributionChart');
    if (appState.charts.mcDistribution) {
      appState.charts.mcDistribution.destroy();
    }
    
    // Create histogram
    const bins = 20;
    const min = Math.min(...results);
    const max = Math.max(...results);
    const binSize = (max - min) / bins;
    
    const histogram = new Array(bins).fill(0);
    const labels = [];
    
    results.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
      histogram[binIndex]++;
    });
    
    for (let i = 0; i < bins; i++) {
      const binStart = min + (i * binSize);
      labels.push(utils.formatCurrency(binStart));
    }
    
    appState.charts.mcDistribution = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Frequency',
          data: histogram,
          backgroundColor: chartColors.primary
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
};

// Retirement Module
const retirement = {
  init: () => {
    document.getElementById('calculateRetirementBtn').addEventListener('click', () => retirement.calculate());
  },
  
  calculate: () => {
    const currentAge = parseInt(document.getElementById('retCurrentAge').value);
    const retirementAge = parseInt(document.getElementById('retRetirementAge').value);
    const lifeExpectancy = parseInt(document.getElementById('retLifeExpectancy').value);
    const currentExpenses = parseFloat(document.getElementById('retCurrentExpenses').value);
    const expensePercent = parseFloat(document.getElementById('retExpensePercent').value);
    const inflation = parseFloat(document.getElementById('retInflation').value);
    const postReturn = parseFloat(document.getElementById('retPostReturn').value);
    const existingCorpus = parseFloat(document.getElementById('retExistingCorpus').value);
    const monthlyContribution = parseFloat(document.getElementById('retMonthlyContribution').value);
    const preReturn = parseFloat(document.getElementById('retPreReturn').value);
    
    const yearsToRetirement = retirementAge - currentAge;
    const yearsInRetirement = lifeExpectancy - retirementAge;
    
    // Calculate retirement expenses
    const retirementExpenses = currentExpenses * (expensePercent / 100);
    const futureMonthlyExpenses = retirementExpenses * Math.pow(1 + inflation / 100, yearsToRetirement);
    const annualExpenses = futureMonthlyExpenses * 12;
    
    // Calculate corpus needed using 4% rule (adjusted for post-retirement return)
    const corpusNeeded = (annualExpenses * yearsInRetirement) / (1 + postReturn / 100);
    
    // Calculate projected corpus
    const sipCorpus = utils.calculateSIP(monthlyContribution, preReturn, yearsToRetirement);
    const existingGrowth = utils.calculateFutureValue(existingCorpus, preReturn, yearsToRetirement);
    const projectedCorpus = sipCorpus + existingGrowth;
    
    const surplus = projectedCorpus - corpusNeeded;
    
    // Calculate how long corpus will last
    let yearsLast = 0;
    let remainingCorpus = projectedCorpus;
    while (remainingCorpus > 0 && yearsLast < 100) {
      remainingCorpus = remainingCorpus * (1 + postReturn / 100) - annualExpenses * Math.pow(1 + inflation / 100, yearsLast);
      yearsLast++;
    }
    
    document.getElementById('retCorpusNeeded').textContent = utils.formatCurrency(corpusNeeded);
    document.getElementById('retProjectedCorpus').textContent = utils.formatCurrency(projectedCorpus);
    document.getElementById('retSurplus').textContent = utils.formatCurrency(surplus);
    document.getElementById('retSurplus').style.color = surplus >= 0 ? 'var(--color-success)' : 'var(--color-error)';
    document.getElementById('retYearsLast').textContent = yearsLast + ' years';
    
    retirement.renderChart(projectedCorpus, annualExpenses, yearsInRetirement, postReturn, inflation);
    document.getElementById('retirementResults').style.display = 'block';
  },
  
  renderChart: (initialCorpus, annualExpenses, years, returnRate, inflation) => {
    const canvas = document.getElementById('retirementChart');
    if (appState.charts.retirement) {
      appState.charts.retirement.destroy();
    }
    
    const labels = [];
    const data = [];
    let corpus = initialCorpus;
    let expenses = annualExpenses;
    
    for (let i = 0; i <= Math.min(years, 50); i++) {
      labels.push('Year ' + i);
      data.push(Math.max(0, corpus));
      corpus = corpus * (1 + returnRate / 100) - expenses;
      expenses = expenses * (1 + inflation / 100);
    }
    
    appState.charts.retirement = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Retirement Corpus (₹)',
          data: data,
          borderColor: chartColors.primary,
          backgroundColor: chartColors.primaryTransparent,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
};

// Calculators Module
const calculators = {
  init: () => {
    document.getElementById('calculateEMIBtn').addEventListener('click', () => calculators.calculateEMI());
    document.getElementById('calculateSIPBtn').addEventListener('click', () => calculators.calculateSIP());
    document.getElementById('calculateInflationBtn').addEventListener('click', () => calculators.calculateInflation());
  },
  
  calculateEMI: () => {
    const loanAmount = parseFloat(document.getElementById('emiLoanAmount').value);
    const rate = parseFloat(document.getElementById('emiRate').value);
    const tenure = parseFloat(document.getElementById('emiTenure').value);
    
    const emi = utils.calculateEMI(loanAmount, rate, tenure);
    const totalAmount = emi * tenure * 12;
    const totalInterest = totalAmount - loanAmount;
    
    document.getElementById('emiMonthly').textContent = utils.formatCurrency(emi);
    document.getElementById('emiTotalInterest').textContent = utils.formatCurrency(totalInterest);
    document.getElementById('emiTotalAmount').textContent = utils.formatCurrency(totalAmount);
    
    calculators.renderEMIChart(loanAmount, totalInterest);
    document.getElementById('emiResults').style.display = 'block';
  },
  
  renderEMIChart: (principal, interest) => {
    const canvas = document.getElementById('emiChart');
    if (appState.charts.emi) {
      appState.charts.emi.destroy();
    }
    
    appState.charts.emi = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: ['Principal', 'Interest'],
        datasets: [{
          data: [principal, interest],
          backgroundColor: [chartColors.primary, chartColors.accent]
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
  },
  
  calculateSIP: () => {
    const monthly = parseFloat(document.getElementById('sipMonthly').value);
    const returnRate = parseFloat(document.getElementById('sipReturn').value);
    const period = parseFloat(document.getElementById('sipPeriod').value);
    
    const maturityValue = utils.calculateSIP(monthly, returnRate, period);
    const invested = monthly * 12 * period;
    const returns = maturityValue - invested;
    
    document.getElementById('sipInvested').textContent = utils.formatCurrency(invested);
    document.getElementById('sipReturns').textContent = utils.formatCurrency(returns);
    document.getElementById('sipMaturity').textContent = utils.formatCurrency(maturityValue);
    
    calculators.renderSIPChart(invested, returns);
    document.getElementById('sipResults').style.display = 'block';
  },
  
  renderSIPChart: (invested, returns) => {
    const canvas = document.getElementById('sipChart');
    if (appState.charts.sip) {
      appState.charts.sip.destroy();
    }
    
    appState.charts.sip = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Invested Amount', 'Returns'],
        datasets: [{
          data: [invested, returns],
          backgroundColor: [chartColors.primary, chartColors.gray]
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
  },
  
  calculateInflation: () => {
    const amount = parseFloat(document.getElementById('inflationAmount').value);
    const years = parseFloat(document.getElementById('inflationYears').value);
    const rate = parseFloat(document.getElementById('inflationRate').value);
    
    const futureValue = utils.calculateFutureValue(amount, rate, years);
    const loss = futureValue - amount;
    const retained = (amount / futureValue) * 100;
    
    document.getElementById('inflationFutureValue').textContent = utils.formatCurrency(futureValue);
    document.getElementById('inflationLoss').textContent = utils.formatCurrency(loss);
    document.getElementById('inflationRetained').textContent = utils.formatNumber(retained, 1) + '%';
    
    document.getElementById('inflationResults').style.display = 'block';
  }
};

// Reports Module
const reports = {
  init: () => {
    document.getElementById('generateReportBtn').addEventListener('click', () => reports.generateReport());
    document.getElementById('exportJSONBtn').addEventListener('click', () => reports.exportJSON());
    document.getElementById('importJSONBtn').addEventListener('click', () => {
      document.getElementById('importFileInput').click();
    });
    document.getElementById('importFileInput').addEventListener('change', (e) => reports.importJSON(e));
    document.getElementById('printReportBtn').addEventListener('click', () => window.print());
  },
  
  generateReport: () => {
    const includeNetWorth = document.getElementById('reportNetWorth').checked;
    const includeGoals = document.getElementById('reportGoals').checked;
    const includePortfolio = document.getElementById('reportPortfolio').checked;
    
    let html = '<div class="report-section"><h3>Financial Planning Report</h3>';
    html += `<p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p></div>`;
    
    if (includeNetWorth) {
      const assets = networth.calculateTotalAssets();
      const liabilities = networth.calculateTotalLiabilities();
      const netWorthValue = networth.calculateNetWorth();
      
      html += '<div class="report-section">';
      html += '<h3>Net Worth Statement</h3>';
      html += `<p><strong>Total Assets:</strong> ${utils.formatCurrency(assets)}</p>`;
      html += `<p><strong>Total Liabilities:</strong> ${utils.formatCurrency(liabilities)}</p>`;
      html += `<p><strong>Net Worth:</strong> ${utils.formatCurrency(netWorthValue)}</p>`;
      html += '<h4>Assets Breakdown</h4><ul>';
      appState.assets.forEach(asset => {
        html += `<li>${asset.name} (${asset.category}): ${utils.formatCurrency(asset.value)}</li>`;
      });
      html += '</ul></div>';
    }
    
    if (includeGoals && appState.goals.length > 0) {
      html += '<div class="report-section"><h3>Financial Goals</h3><ul>';
      appState.goals.forEach(goal => {
        const yearsRemaining = goal.targetYear - new Date().getFullYear();
        const futureValue = utils.calculateFutureValue(goal.currentCost, goal.inflation, yearsRemaining);
        html += `<li><strong>${goal.name}</strong> (${goal.category})<br>`;
        html += `Target Year: ${goal.targetYear}, Future Value: ${utils.formatCurrency(futureValue)}<br>`;
        html += `Priority: ${goal.priority}, Already Saved: ${utils.formatCurrency(goal.saved)}</li>`;
      });
      html += '</ul></div>';
    }
    
    if (includePortfolio) {
      html += '<div class="report-section"><h3>Portfolio Summary</h3>';
      html += `<p><strong>Total Portfolio Value:</strong> ${utils.formatCurrency(networth.calculateTotalAssets())}</p>`;
      html += '</div>';
    }
    
    document.getElementById('reportContent').innerHTML = html;
    document.getElementById('reportPreview').style.display = 'block';
  },
  
  exportJSON: () => {
    const data = {
      assets: appState.assets,
      liabilities: appState.liabilities,
      goals: appState.goals,
      userProfile: appState.userProfile,
      exportDate: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'xtin-gini-data-' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
  
  importJSON: (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.assets) appState.assets = data.assets;
        if (data.liabilities) appState.liabilities = data.liabilities;
        if (data.goals) appState.goals = data.goals;
        if (data.userProfile) appState.userProfile = data.userProfile;
        
        // Refresh all views
        networth.renderAssets();
        networth.renderLiabilities();
        networth.updateSummary();
        goals.renderGoals();
        dashboard.refresh();
        
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data: ' + error.message);
      }
    };
    reader.readAsText(file);
  }
};

// Sample Data
const sampleData = {
  load: () => {
    appState.assets = [
      { id: 1, name: 'Primary Residence', category: 'Real Estate', value: 25000000, return: 8 },
      { id: 2, name: 'Fixed Deposits', category: 'Fixed Deposits', value: 2500000, return: 7 },
      { id: 3, name: 'Equity Mutual Funds', category: 'Mutual Funds', value: 1500000, return: 12 },
      { id: 4, name: 'Gold', category: 'Gold', value: 1000000, return: 8 },
      { id: 5, name: 'Cash', category: 'Cash', value: 500000, return: 4 }
    ];
    
    appState.liabilities = [
      { id: 1, name: 'Home Loan', type: 'Home Loan', amount: 8000000, rate: 8.5, emi: 95000, tenure: 15 },
      { id: 2, name: 'Car Loan', type: 'Car Loan', amount: 500000, rate: 9, emi: 15000, tenure: 3 }
    ];
    
    appState.goals = [
      { id: 1, name: "Daughter's Education", category: 'Education', currentCost: 2500000, targetYear: 2030, priority: 'High', inflation: 8, saved: 500000, return: 12 },
      { id: 2, name: "Son's Wedding", category: 'Wedding', currentCost: 3000000, targetYear: 2035, priority: 'High', inflation: 7, saved: 200000, return: 12 },
      { id: 3, name: 'Retirement Corpus', category: 'Retirement', currentCost: 50000000, targetYear: 2045, priority: 'High', inflation: 6, saved: 5000000, return: 12 },
      { id: 4, name: 'Dream Home', category: 'Home Purchase', currentCost: 8000000, targetYear: 2028, priority: 'Medium', inflation: 8, saved: 1000000, return: 12 }
    ];
    
    networth.renderAssets();
    networth.renderLiabilities();
    networth.updateSummary();
    goals.renderGoals();
    dashboard.refresh();
    
    alert('Sample data loaded successfully!');
  }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  navigation.init();
  networth.init();
  goals.init();
  portfolio.init();
  planner.init();
  requiredReturn.init();
  monteCarlo.init();
  retirement.init();
  calculators.init();
  reports.init();
  
  dashboard.refresh();
  
  document.getElementById('loadSampleData').addEventListener('click', () => sampleData.load());
  document.getElementById('resetData').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      appState.assets = [];
      appState.liabilities = [];
      appState.goals = [];
      networth.renderAssets();
      networth.renderLiabilities();
      networth.updateSummary();
      goals.renderGoals();
      dashboard.refresh();
      alert('All data has been reset.');
    }
  });
});

// Make functions globally accessible for onclick handlers
window.networth = networth;
window.goals = goals;