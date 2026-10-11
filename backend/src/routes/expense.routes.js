const express = require("express");
const controller = require("../controllers/expense.controller");

const router = express.Router();

router.post("/", controller.create);
router.get("/", controller.getAll);
router.get("/total", controller.getTotal);
router.get("/category/:category", controller.getByCategory);
router.get("/summary/total", controller.getTotal);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
