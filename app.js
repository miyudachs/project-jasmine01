// トランザクションデータを管理
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currentFilter = 'all';

// DOM要素の取得
const form = document.getElementById('transactionForm');
const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category');
const amountInput = document.getElementById('amount');
const descriptionInput = document.getElementById('description');
const dateInput = document.getElementById('date');
const transactionsList = document.getElementById('transactionsList');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const balanceEl = document.getElementById('balance');
const clearAllBtn = document.getElementById('clearAll');
const filterBtns = document.querySelectorAll('.filter-btn');

// 今日の日付をデフォルト設定
dateInput.valueAsDate = new Date();

// カテゴリーを種類に応じて変更
typeSelect.addEventListener('change', (e) => {
    const type = e.target.value;
    categorySelect.innerHTML = '';
    
    if (type === 'income') {
        const incomeCategories = ['給与', '副業', 'ボーナス', '投資', 'その他'];
        incomeCategories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
    } else {
        const expenseCategories = ['食費', '交通費', '娯楽', '光熱費', '通信費', '医療費', '教育費', '衣服', 'その他'];
        expenseCategories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
    }
});

// フォーム送信
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const transaction = {
        id: Date.now(),
        type: typeSelect.value,
        category: categorySelect.value,
        amount: parseFloat(amountInput.value),
        description: descriptionInput.value,
        date: dateInput.value
    };
    
    transactions.push(transaction);
    saveTransactions();
    updateUI();
    form.reset();
    dateInput.valueAsDate = new Date();
    
    // 成功メッセージ（オプション）
    showNotification('取引を登録しました！');
});

// フィルターボタン
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        displayTransactions();
    });
});

// 全削除ボタン
clearAllBtn.addEventListener('click', () => {
    if (confirm('すべての取引を削除してもよろしいですか？')) {
        transactions = [];
        saveTransactions();
        updateUI();
        showNotification('すべての取引を削除しました');
    }
});

// トランザクションを削除
function deleteTransaction(id) {
    if (confirm('この取引を削除してもよろしいですか？')) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        updateUI();
        showNotification('取引を削除しました');
    }
}

// ローカルストレージに保存
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// UI全体を更新
function updateUI() {
    calculateSummary();
    displayTransactions();
}

// 合計金額を計算
function calculateSummary() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expense;
    
    totalIncomeEl.textContent = formatCurrency(income);
    totalExpenseEl.textContent = formatCurrency(expense);
    balanceEl.textContent = formatCurrency(balance);
}

// トランザクションリストを表示
function displayTransactions() {
    let filteredTransactions = transactions;
    
    if (currentFilter !== 'all') {
        filteredTransactions = transactions.filter(t => t.type === currentFilter);
    }
    
    // 日付順にソート（新しい順）
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredTransactions.length === 0) {
        transactionsList.innerHTML = '<p class="no-data">取引がありません</p>';
        return;
    }
    
    transactionsList.innerHTML = filteredTransactions.map(t => `
        <div class="transaction-item ${t.type}">
            <div class="transaction-info">
                <div class="transaction-header">
                    <span class="transaction-category">${t.category}</span>
                    <span class="transaction-type-badge ${t.type}">
                        ${t.type === 'income' ? '収入' : '支出'}
                    </span>
                </div>
                ${t.description ? `<div class="transaction-description">${t.description}</div>` : ''}
                <div class="transaction-date">${formatDate(t.date)}</div>
            </div>
            <div class="transaction-amount ${t.type}">
                ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
            </div>
            <button class="btn-delete" onclick="deleteTransaction(${t.id})">削除</button>
        </div>
    `).join('');
}

// 通貨フォーマット
function formatCurrency(amount) {
    return '¥' + amount.toLocaleString('ja-JP');
}

// 日付フォーマット
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    
    return `${year}年${month}月${day}日 (${weekday})`;
}

// 通知メッセージを表示
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// アニメーション用CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 初期表示
updateUI();
