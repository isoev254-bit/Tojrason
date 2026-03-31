const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "tojrason_secret_key_2024";

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Токен дода нашудааст" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Токен нодуруст ё мӯҳлаташ гузаштааст" });
  }
}

module.exports = authMiddleware;
