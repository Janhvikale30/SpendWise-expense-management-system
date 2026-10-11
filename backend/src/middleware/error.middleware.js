function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, _req, res, _next) {
  console.error(err);
  const statusCode = err.statusCode || (err.code === 'ER_DUP_ENTRY' ? 409 : 500);
  res.status(statusCode).json({
    message: statusCode === 500 ? 'Internal server error.' : err.message
  });
}

module.exports = { notFound, errorHandler };
