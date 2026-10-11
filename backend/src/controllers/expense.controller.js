const service = require("../services/expense.service");

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

const create = asyncHandler(async (req, res) => {
  const expense = await service.create(req.body);
  res
    .status(201)
    .json({ message: "Expense created successfully.", data: expense });
});

const getAll = asyncHandler(async (_req, res) => {
  res.json({ data: await service.getAll() });
});

const getById = asyncHandler(async (req, res) => {
  res.json({ data: await service.getById(req.params.id) });
});

const update = asyncHandler(async (req, res) => {
  res.json({
    message: "Expense updated successfully.",
    data: await service.update(req.params.id, req.body),
  });
});

const remove = asyncHandler(async (req, res) => {
  res.json(await service.remove(req.params.id));
});

const getByCategory = asyncHandler(async (req, res) => {
  res.json({ data: await service.getByCategory(req.params.category) });
});

const getTotal = asyncHandler(async (req, res) => {
  const category = req.query.category;
  const result = await service.getTotal(category);

  res.json({ data: result });
});

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  getByCategory,
  getTotal,
};
