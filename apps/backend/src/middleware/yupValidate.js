const validateBody = (schema) => {
  return async (req, res, next) => {
    try {
      const validatedBody = await schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      req.body = validatedBody;
      next();
    } catch (err) {
      return res.status(422).json({
        status: 'fail',
        message: 'Validation failed',
        errors: (err.inner || []).map((issue) => ({
          field: issue.path,
          message: issue.message,
        })),
      });
    }
  };
};

export { validateBody };
