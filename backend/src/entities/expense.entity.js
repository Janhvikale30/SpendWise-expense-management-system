const ALLOWED_FIELDS = ['title', 'amount', 'category', 'expense_date', 'description'];

function validateExpense(payload, { partial = false } = {}) {
  const errors = [];
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return ['Request body must be a JSON object.'];
  }

  const required = ['title', 'amount', 'category', 'expense_date'];
  if (!partial) {
    for (const field of required) {
      if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
        errors.push(`${field} is required.`);
      }
    }
  }

  if (payload.title !== undefined &&
      (typeof payload.title !== 'string' || payload.title.trim().length < 1 || payload.title.trim().length > 120)) {
    errors.push('title must be a string between 1 and 120 characters.');
  }

  if (payload.amount !== undefined &&
      (!Number.isFinite(Number(payload.amount)) || Number(payload.amount) <= 0)) {
    errors.push('amount must be a positive number.');
  }

  if (payload.category !== undefined &&
      (typeof payload.category !== 'string' || payload.category.trim().length < 1 || payload.category.trim().length > 60)) {
    errors.push('category must be a string between 1 and 60 characters.');
  }

  if (payload.expense_date !== undefined &&
      (typeof payload.expense_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(payload.expense_date) ||
       Number.isNaN(Date.parse(`${payload.expense_date}T00:00:00Z`)))) {
    errors.push('expense_date must be a valid date in YYYY-MM-DD format.');
  }

  if (payload.description !== undefined &&
      payload.description !== null &&
      (typeof payload.description !== 'string' || payload.description.length > 500)) {
    errors.push('description must be a string of at most 500 characters.');
  }

  const unknownFields = Object.keys(payload).filter((field) => !ALLOWED_FIELDS.includes(field));
  if (unknownFields.length) errors.push(`Unknown field(s): ${unknownFields.join(', ')}.`);

  return errors;
}

function normalizeExpense(payload) {
  const normalized = {};
  if (payload.title !== undefined) normalized.title = payload.title.trim();
  if (payload.amount !== undefined) normalized.amount = Number(payload.amount);
  if (payload.category !== undefined) normalized.category = payload.category.trim();
  if (payload.expense_date !== undefined) normalized.expense_date = payload.expense_date;
  if (payload.description !== undefined) {
    normalized.description = payload.description === null ? null : payload.description.trim();
  }
  return normalized;
}

module.exports = { validateExpense, normalizeExpense };
