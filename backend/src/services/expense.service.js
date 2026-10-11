const repository = require('../repositories/expense.repository');
const { validateExpense, normalizeExpense } = require('../entities/expense.entity');

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function validateId(rawId) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) throw new AppError('Expense ID must be a positive integer.', 400);
  return id;
}

async function create(payload) {
  const errors = validateExpense(payload);
  if (errors.length) throw new AppError(errors.join(' '), 400);
  return repository.create(normalizeExpense(payload));
}

async function getAll() {
  return repository.findAll();
}

async function getById(rawId) {
  const id = validateId(rawId);
  const expense = await repository.findById(id);
  if (!expense) throw new AppError('Expense not found.', 404);
  return expense;
}

async function update(rawId, payload) {
  const id = validateId(rawId);
  const existing = await repository.findById(id);
  if (!existing) throw new AppError('Expense not found.', 404);
  const errors = validateExpense(payload, { partial: true });
  if (errors.length) throw new AppError(errors.join(' '), 400);
  const normalized = normalizeExpense(payload);
  if (Object.keys(normalized).length === 0) throw new AppError('Provide at least one field to update.', 400);
  return repository.update(id, normalized);
}

async function remove(rawId) {
  const id = validateId(rawId);
  const removed = await repository.remove(id);
  if (!removed) throw new AppError('Expense not found.', 404);
  return { message: 'Expense deleted successfully.' };
}

async function getByCategory(category) {
  if (typeof category !== 'string' || !category.trim()) throw new AppError('Category is required.', 400);
  return repository.findByCategory(category.trim());
}

async function getTotal(category) {
  if (category !== undefined && !category.trim()) throw new AppError('Category cannot be empty.', 400);
  return repository.total(category ? category.trim() : null);
}

module.exports = { AppError, create, getAll, getById, update, remove, getByCategory, getTotal };
