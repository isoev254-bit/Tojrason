const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// ✅ Ҳамаи корбарон (Admin)
router.get("/", async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Танҳо admin дастрасӣ дорад" });
    }

    const result = await pool.query(
      "SELECT id, name, phone, role, created_at FROM users ORDER BY created_at DESC"
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Хатои сервер" });
  }
});

// ✅ Як корбар
router.get("/:id", async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: "Иҷозат нест" });
    }

    const result = await pool.query(
      "SELECT id, name, phone, role, created_at FROM users WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Корбар ёфт нашуд" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Хатои сервер" });
  }
});

// ✅ Профилро тағйир додан
router.put("/:id", async (req, res) => {
  try {
    if (req.user.id !== parseInt(req.params.id) && req.user.role !== "admin") {
      return res.status(403).json({ error: "Иҷозат нест" });
    }

    const { name, phone } = req.body;

    const result = await pool.query(
      `UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone)
       WHERE id = $3
       RETURNING id, name, phone, role`,
      [name, phone, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Корбар ёфт нашуд" });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Ин рақами телефон аллакай истифода шудааст" });
    }
    res.status(500).json({ error: "Хатои сервер" });
  }
});

// ✅ Корбарро нест кардан (Admin)
router.delete("/:id", async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Танҳо admin нест карда метавонад" });
    }

    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Корбар ёфт нашуд" });
    }

    res.json({ success: true, message: "Корбар нест карда шуд" });
  } catch (err) {
    res.status(500).json({ error: "Хатои сервер" });
  }
});

module.exports = router;
