function errorHandler(err, req, res, next) {
    console.error(err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(err.statusCode || 500).json({
        error: err.message || 'Something went wrong.',
    });
}

module.exports = errorHandler;