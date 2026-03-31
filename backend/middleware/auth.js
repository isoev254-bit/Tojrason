const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "tojrason_secret_key_2024";

// ✅ Бақайдгирӣ (Register)
router.post("/register", async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ error: "Ном, телефон ва парол лозиманд" });
    }

    // Санҷиши такрорӣ
    const existing = await pool.query("SELECT id FROM users WHERE phone = $1", [phone]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Ин рақами телефон аллакай сабт шудааст" });
    }

    // Паролро hash кардан
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = ["admin", "client", "courier"].includes(role) ? role : "client";

    const result = await pool.query(
      "INSERT INTO users (name, phone, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, phone, role",
      [name, phone, hashedPassword, userRole]
    );

    const user = result.rows[0];

    // Агар курер бошад, ба ҷадвали couriers илова мекунем
    if (userRole === "courier") {
      await pool.query(
        "INSERT INTO couriers (user_id, status) VALUES ($1, 'free')",
        [user.id]
      );
    }

    // Токен сохтан
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Бақайдгирӣ бо муваффақият!",
      token,
      user,
    });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Хатои сервер" });
  }
});

// ✅ Даромадан (Login)
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: "Телефон ва парол лозиманд" });
    }

    const result = await pool.query("SELECT * FROM users WHERE phone = $1", [phone]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Телефон ё парол нодуруст аст" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Телефон ё парол нодуруст аст" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Хуш омадед!",
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Хатои сервер" });
  }
});

// ✅ Профили ман
router.get("/me", async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "Токен лозим аст" });

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await pool.query(
      "SELECT id, name, phone, role, created_at FROM users WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Корбар ёфт нашуд" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(401).json({ error: "Токен нодуруст аст" });
  }
});

module.exports = router;
