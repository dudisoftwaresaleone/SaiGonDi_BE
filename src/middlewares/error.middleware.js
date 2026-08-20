const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500

  // Log full stack trace only for server errors (5xx) or unhandled exceptions
  if (statusCode >= 500) {
    console.error('[SERVER ERROR]', err)
  } else {
    // Concise log for expected client-side errors (4xx like 404 Not Found, 401 Unauthorized)
    console.warn(`[API WARN] ${statusCode} - ${err.message}`)
  }

  if (err.statusCode) {
    res.status(err.statusCode).json({ message: err.message })
  } else {
    res.status(500).json({ message: 'Something went wrong!' })
  }
}

export { errorHandler }
