import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api/expenses';
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Education', 'Travel', 'Other'];
const emptyForm = { title: '', amount: '', category: 'Food', expense_date: new Date().toISOString().slice(0, 10), description: '' };
const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value || 0));

export default function App() {
  const [page, setPage] = useState('Dashboard');
  const [expenses, setExpenses] = useState([]);
  const [totalInfo, setTotalInfo] = useState({ total: 0, count: 0 });
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ type: '', text: '' });

  const showNotice = (type, text) => {
    setNotice({ type, text });
    window.setTimeout(() => setNotice({ type: '', text: '' }), 3500);
  };

  const loadExpenses = useCallback(async () => {
    try {
      const [expenseResponse, totalResponse] = await Promise.all([
        axios.get(API),
        axios.get(`${API}/total`)
      ]);
      setExpenses(expenseResponse.data.data || []);
      setTotalInfo(totalResponse.data.data || { total: 0, count: 0 });
    } catch (error) {
      showNotice('error', error.response?.data?.message || 'Could not load expenses. Is the backend running?');
    }
  }, []);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  const filteredExpenses = useMemo(
    () => filter === 'All' ? expenses : expenses.filter((item) => item.category.toLowerCase() === filter.toLowerCase()),
    [expenses, filter]
  );

  const categoryTotal = useMemo(
    () => filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0),
    [filteredExpenses]
  );

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        description: form.description.trim() || null
      };
      if (editingId) {
        await axios.put(`${API}/${editingId}`, payload);
        showNotice('success', 'Expense updated successfully.');
      } else {
        await axios.post(API, payload);
        showNotice('success', 'Expense created successfully.');
      }
      resetForm();
      await loadExpenses();
      setPage('Dashboard');
    } catch (error) {
      showNotice('error', error.response?.data?.message || 'Could not save expense.');
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (expense) => {
    setForm({
      title: expense.title,
      amount: String(expense.amount),
      category: expense.category,
      expense_date: String(expense.expense_date).slice(0, 10),
      description: expense.description || ''
    });
    setEditingId(expense.id);
    setPage('Manage Expenses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteExpense = async (id) => {
    if (!window.confirm('Delete this expense? This action cannot be undone.')) return;
    try {
      await axios.delete(`${API}/${id}`);
      showNotice('success', 'Expense deleted successfully.');
      if (editingId === id) resetForm();
      await loadExpenses();
    } catch (error) {
      showNotice('error', error.response?.data?.message || 'Could not delete expense.');
    }
  };

  const navItems = ['Dashboard', 'Manage Expenses', 'About', 'Services'];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setPage('Dashboard')} aria-label="Go to dashboard">
          <span className="brand-mark">S</span><span>SpendWise<span className="brand-dot">.</span></span>
        </button>
        <p className="nav-caption">WORKSPACE</p>
        <nav>
          {navItems.map((item) => (
            <button key={item} className={`nav-item ${page === item ? 'active' : ''}`} onClick={() => setPage(item)}>
              <span className="nav-icon">{({ Dashboard: '▦', 'Manage Expenses': '↕', About: 'ⓘ', Services: '✦' })[item]}</span>
              {item}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help-icon">?</div>
          <div><strong>Need a hand?</strong><span>Keep your spending in check.</span></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div><p className="eyebrow">PERSONAL FINANCE</p><h1>{page}</h1></div>
          <div className="topbar-right"><span className="status-dot"></span><span>Expense workspace</span><div className="avatar">JK</div></div>
        </header>

        {notice.text && <div className={`notice ${notice.type}`} role="status">{notice.text}</div>}

        {page === 'Dashboard' && (
          <section className="page-content">
            <div className="welcome-row">
              <div><p className="eyebrow">YOUR MONEY, AT A GLANCE</p><h2>Make every rupee count.</h2><p className="muted">Track expenses, spot patterns, and stay in control.</p></div>
              <button className="primary-btn" onClick={() => { resetForm(); setPage('Manage Expenses'); }}>＋ Add expense</button>
            </div>
            <div className="stats-grid">
              <article className="stat-card featured"><div className="stat-top"><span>Total expenses</span><span className="stat-icon">₹</span></div><strong>{money(totalInfo.total)}</strong><small>Across all recorded expenses</small></article>
              <article className="stat-card"><div className="stat-top"><span>Transactions</span><span className="stat-icon blue">↗</span></div><strong>{totalInfo.count}</strong><small>Expense records saved</small></article>
              <article className="stat-card"><div className="stat-top"><span>Categories</span><span className="stat-icon purple">◈</span></div><strong>{new Set(expenses.map((e) => e.category.toLowerCase())).size}</strong><small>Categories in use</small></article>
            </div>
            <section className="panel">
              <div className="panel-heading"><div><h3>Recent expenses</h3><p className="muted">Your latest recorded transactions</p></div><button className="text-btn" onClick={() => setPage('Manage Expenses')}>Manage all →</button></div>
              <ExpenseTable expenses={expenses.slice(0, 5)} onEdit={startEdit} onDelete={deleteExpense} />
            </section>
            <div className="bottom-grid">
              <section className="panel category-panel"><div className="panel-heading"><div><h3>Spending by category</h3><p className="muted">Based on current records</p></div></div>
                {expenses.length === 0 ? <EmptyState /> : CATEGORIES.map((cat) => {
                  const amount = expenses.filter((e) => e.category.toLowerCase() === cat.toLowerCase()).reduce((sum, e) => sum + Number(e.amount), 0);
                  if (!amount) return null;
                  const percent = totalInfo.total ? amount / totalInfo.total * 100 : 0;
                  return <div className="category-line" key={cat}><div className="category-label"><span>{cat}</span><strong>{money(amount)}</strong></div><div className="bar-track"><div className="bar-fill" style={{ width: `${percent}%` }} /></div></div>;
                })}
              </section>
              <section className="tip-card"><div className="tip-symbol">✦</div><p className="eyebrow">A SMALL REMINDER</p><h3>Awareness is the first step to better spending.</h3><p>Record expenses as they happen to keep your overview useful and up to date.</p><button className="light-btn" onClick={() => setPage('Manage Expenses')}>Record an expense ↗</button></section>
            </div>
          </section>
        )}

        {page === 'Manage Expenses' && (
          <section className="page-content">
            <div className="welcome-row"><div><p className="eyebrow">TRACK EVERY TRANSACTION</p><h2>{editingId ? 'Update expense' : 'Expense manager'}</h2><p className="muted">Create, edit, filter, and organize your expenses.</p></div></div>
            <section className="panel form-panel">
              <div className="panel-heading"><div><h3>{editingId ? `Editing expense #${editingId}` : 'Add a new expense'}</h3><p className="muted">Fields marked * are required.</p></div>{editingId && <button className="text-btn" onClick={resetForm}>Cancel edit</button>}</div>
              <form onSubmit={handleSubmit} className="expense-form">
                <label>Expense title *<input name="title" value={form.title} onChange={handleChange} maxLength="120" placeholder="e.g. Monthly groceries" required /></label>
                <label>Amount (₹) *<input name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={handleChange} placeholder="0.00" required /></label>
                <label>Category *<select name="category" value={form.category} onChange={handleChange} required>{CATEGORIES.map((cat) => <option key={cat}>{cat}</option>)}</select></label>
                <label>Date *<input name="expense_date" type="date" value={form.expense_date} onChange={handleChange} required /></label>
                <label className="full-width">Description<textarea name="description" value={form.description} onChange={handleChange} maxLength="500" rows="3" placeholder="Add a note (optional)" /></label>
                <div className="form-actions full-width"><button className="primary-btn" disabled={busy}>{busy ? 'Saving…' : editingId ? 'Save changes' : 'Save expense'}</button><button type="button" className="secondary-btn" onClick={resetForm}>Clear</button></div>
              </form>
            </section>
            <section className="panel">
              <div className="panel-heading"><div><h3>All expenses</h3><p className="muted">{filteredExpenses.length} record(s) shown</p></div><label className="filter-label">Filter category <select value={filter} onChange={(e) => setFilter(e.target.value)}><option>All</option>{CATEGORIES.map((cat) => <option key={cat}>{cat}</option>)}</select></label></div>
              <div className="filter-total">Showing total: <strong>{money(categoryTotal)}</strong>{filter !== 'All' && <span> · {filter} only</span>}</div>
              <ExpenseTable expenses={filteredExpenses} onEdit={startEdit} onDelete={deleteExpense} />
            </section>
          </section>
        )}

        {page === 'About' && <InfoPage eyebrow="OUR APPROACH" title="Clarity for your everyday spending." intro="SpendWise is a simple expense-tracking demo designed to make personal spending easier to understand." cards={[['Simple by design', 'Add and manage expense records through a clear, focused interface.'], ['Data-driven overview', 'See total spending, transaction counts, and category summaries.'], ['Built for learning', 'A full-stack example connecting a React interface to a Node.js API and MySQL database.']]} />}
        {page === 'Services' && <InfoPage eyebrow="WHAT YOU CAN DO" title="Tools to keep your spending organized." intro="Use the expense workspace to record transactions and explore where your money goes." cards={[['Expense tracking', 'Create, view, edit, and delete expense records.'], ['Category filtering', 'Filter transactions by category and compare category totals.'], ['Spending summary', 'Calculate your overall expenses and count saved transactions.'], ['REST API', 'A Node.js and Express API provides the backend operations, with MySQL for persistence.']]} />}
      </main>
    </div>
  );
}

function ExpenseTable({ expenses, onEdit, onDelete }) {
  if (!expenses.length) return <EmptyState />;
  return <div className="table-wrap"><table><thead><tr><th>EXPENSE</th><th>CATEGORY</th><th>DATE</th><th>AMOUNT</th><th>ACTIONS</th></tr></thead><tbody>
    {expenses.map((expense) => <tr key={expense.id}><td><div className="expense-name"><span className="expense-symbol">{(expense.title || 'E').slice(0, 1).toUpperCase()}</span><div><strong>{expense.title}</strong><small>{expense.description || `Expense #${expense.id}`}</small></div></div></td><td><span className="category-pill">{expense.category}</span></td><td>{String(expense.expense_date).slice(0, 10)}</td><td className="amount-cell">{money(expense.amount)}</td><td><div className="actions"><button title="Edit expense" onClick={() => onEdit(expense)}>Edit</button><button title="Delete expense" className="delete-action" onClick={() => onDelete(expense.id)}>Delete</button></div></td></tr>)}
  </tbody></table></div>;
}

function EmptyState() {
  return <div className="empty-state"><div>▤</div><strong>No expenses found</strong><p>Add an expense or choose another category to see records here.</p></div>;
}

function InfoPage({ eyebrow, title, intro, cards }) {
  return <section className="page-content info-page"><div className="info-hero"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{intro}</p></div><div className="info-grid">{cards.map(([heading, body], index) => <article className="info-card" key={heading}><span className="info-number">0{index + 1}</span><h3>{heading}</h3><p>{body}</p></article>)}</div></section>;
}
