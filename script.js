const setCookie = (name, value) => {
  const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expiryDate.toUTCString()};path=/`;
};

const getCookie = (name) => {
  const cookies = document.cookie.split("; ").map(c => c.split("="));
  const match = cookies.find(([key]) => key === name);
  return match ? decodeURIComponent(match[1]) : null;
};

// === INITIAL STATE ===
let transactions = JSON.parse(getCookie("transactions") || "[]");

// === DOM ELEMENTS ===
const form = document.getElementById("transaction-form");
const description = document.getElementById("description");
const amount = document.getElementById("amount");
const transactionList = document.getElementById("transaction-list");
const incomeEl = document.getElementById("total-income");
const expenseEl = document.getElementById("total-expense");
const balanceEl = document.getElementById("balance");

// === RENDER UI ===
const renderTransactions = (filter = "all") => {
  transactionList.innerHTML = "";

  transactions.forEach((t, i) => {
    if ((filter === "income" && t.amount < 0) || (filter === "expense" && t.amount > 0)) return;

    const li = document.createElement("li");
    li.className = `flex justify-between items-center p-2 border rounded ${t.amount > 0 ? "bg-green-50" : "bg-red-50"}`;
    li.innerHTML = `
      <span>${t.description} (KSH${t.amount > 0 ? "+" : ""}${t.amount})</span>
      <button onclick="removeTransaction(${i})" class="text-red-600 hover:underline">Remove</button>
    `;
    transactionList.appendChild(li);
  });

  updateSummary();
};

const updateSummary = () => {
  const { income, expense } = transactions.reduce(
    (totals, t) => {
      t.amount > 0 ? (totals.income += t.amount) : (totals.expense += t.amount);
      return totals;
    },
    { income: 0, expense: 0 }
  );

  incomeEl.textContent = `KSH${income}`;
  expenseEl.textContent = `KSH${Math.abs(expense)}`;
  balanceEl.textContent = `KSH${income + expense}`;
};

// === EVENT HANDLERS ===
const addTransaction = (e) => {
  e.preventDefault();
  const desc = description.value.trim();
  const amt = parseFloat(amount.value);

  if (!desc || isNaN(amt)) return alert("Please enter a valid description and amount.");

  transactions.push({ description: desc, amount: amt });
  setCookie("transactions", JSON.stringify(transactions));
  form.reset();
  renderTransactions();
};

const removeTransaction = (index) => {
  transactions.splice(index, 1);
  setCookie("transactions", JSON.stringify(transactions));
  renderTransactions();
};

const filterTransactions = (type) => renderTransactions(type);

form.addEventListener("submit", addTransaction);
renderTransactions();
