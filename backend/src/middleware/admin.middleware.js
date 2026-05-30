export function requireAdmin(req, res, next) {
  const provided = req.headers['x-admin-secret'];
  const expected = process.env.ADMIN_SECRET;
  if (!expected || !provided || provided !== expected) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}
