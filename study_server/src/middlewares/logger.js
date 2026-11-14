export const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        console.log(req.method, req.path, Date.now() - start);
    })
    next();
}