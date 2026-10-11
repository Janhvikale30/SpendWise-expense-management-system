CREATE DATABASE IF NOT EXISTS expense_management;
USE expense_management;

CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    category VARCHAR(60) NOT NULL,
    expense_date DATE NOT NULL,
    description VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_expense_amount CHECK (amount > 0)
);

INSERT INTO expenses (title, amount, category, expense_date, description)
SELECT 'Weekly groceries', 1250.00, 'Food', '2026-10-10', 'Groceries for the week'
WHERE NOT EXISTS (SELECT 1 FROM expenses WHERE title = 'Weekly groceries' AND category = 'Food');
