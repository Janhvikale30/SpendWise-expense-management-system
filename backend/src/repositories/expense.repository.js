const db = require("../config/db");

async function create(expense) {
  const [result] = await db.execute(
    `INSERT INTO expenses
      (title, amount, category, expense_date, description)
     VALUES (?, ?, ?, ?, ?)`,
    [
      expense.title,
      expense.amount,
      expense.category,
      expense.expense_date,
      expense.description ?? null,
    ],
  );

  return findById(result.insertId);
}

async function findAll() {
  const [rows] = await db.execute(
    `SELECT
       id,
       title,
       amount,
       category,
       DATE_FORMAT(expense_date, '%Y-%m-%d') AS expense_date,
       description,
       created_at
     FROM expenses
     ORDER BY expense_date DESC, id DESC`,
  );

  return rows;
}

async function findById(id) {
  const [rows] = await db.execute(
    `SELECT
       id,
       title,
       amount,
       category,
       DATE_FORMAT(expense_date, '%Y-%m-%d') AS expense_date,
       description,
       created_at
     FROM expenses
     WHERE id = ?`,
    [id],
  );

  return rows[0] || null;
}

async function update(id, expense) {
  const fields = Object.keys(expense);

  if (fields.length === 0) {
    return findById(id);
  }

  // Only allow editable fields.
  const allowedFields = [
    "title",
    "amount",
    "category",
    "expense_date",
    "description",
  ];

  const invalidFields = fields.filter(
    (field) => !allowedFields.includes(field),
  );

  if (invalidFields.length > 0) {
    throw new Error(`Unknown field(s): ${invalidFields.join(", ")}.`);
  }

  const assignments = fields.map((field) => `\`${field}\` = ?`).join(", ");

  const values = fields.map((field) => expense[field]);

  await db.execute(`UPDATE expenses SET ${assignments} WHERE id = ?`, [
    ...values,
    id,
  ]);

  return findById(id);
}

async function remove(id) {
  const [result] = await db.execute("DELETE FROM expenses WHERE id = ?", [id]);

  return result.affectedRows > 0;
}

async function findByCategory(category) {
  const [rows] = await db.execute(
    `SELECT
       id,
       title,
       amount,
       category,
       DATE_FORMAT(expense_date, '%Y-%m-%d') AS expense_date,
       description,
       created_at
     FROM expenses
     WHERE LOWER(category) = LOWER(?)
     ORDER BY expense_date DESC, id DESC`,
    [category],
  );

  return rows;
}

async function total(category) {
  const sql = category
    ? `SELECT
         COALESCE(SUM(amount), 0) AS total,
         COUNT(*) AS count
       FROM expenses
       WHERE LOWER(category) = LOWER(?)`
    : `SELECT
         COALESCE(SUM(amount), 0) AS total,
         COUNT(*) AS count
       FROM expenses`;

  const [rows] = category
    ? await db.execute(sql, [category])
    : await db.execute(sql);

  return {
    total: Number(rows[0].total),
    count: Number(rows[0].count),
    ...(category ? { category } : {}),
  };
}

module.exports = {
  create,
  findAll,
  findById,
  update,
  remove,
  findByCategory,
  total,
};
