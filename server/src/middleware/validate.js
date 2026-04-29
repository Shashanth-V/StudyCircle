export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const errors = {};
      error.errors.forEach(err => {
        errors[err.path.join('.')] = err.message;
      });
      return res.status(400).json({ message: 'Validation Error', errors });
    }
    next(error);
  }
};
