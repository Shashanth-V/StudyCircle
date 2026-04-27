/**
 * Middleware factory to validate request body with Zod schema
 * @param {import('zod').ZodSchema} schema
 * @returns {Function} Express middleware
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        return res.status(400).json({ message: 'Validation error', errors });
      }
      req.body = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Middleware factory to validate request params with Zod schema
 * @param {import('zod').ZodSchema} schema
 * @returns {Function} Express middleware
 */
export const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.params);
      if (!result.success) {
        const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        return res.status(400).json({ message: 'Validation error', errors });
      }
      req.params = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
};

