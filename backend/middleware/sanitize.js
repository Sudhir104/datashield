// Recursively strips keys starting with '$' or containing '.' from an object,
// which prevents NoSQL operator injection (e.g. {"email": {"$gt": ""}}).
const sanitizeObject = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const clean = {};
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) continue; // drop dangerous keys
    clean[key] = sanitizeObject(obj[key]);
  }
  return clean;
};

module.exports = () => (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  // req.query/req.params are read-only getters in some Express versions when using this
  // pattern with route params; body is the primary injection vector for this API since
  // all filtering is done server-side via req.user.company, not client-supplied query filters.
  next();
};
