const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// ✅ Ҳамаи курерҳо (Admin)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.status, c.latitude, c.longitude, c.updated_at,
              u.name, u.phone
       FROM couriers c
       JOIN users u ON c.user_id = u.id
       ORDER BY c.status, u.name`
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Хатои сервер" });
  }
});

// ✅ Курерҳои озод (барои admin ҳангоми таъинкунӣ)
router.get("/free", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.latitude, c.longitude,
              u.name, u.phone
       FROM couriers c
       JOIN users u ON c.user_id = u.id
       WHERE c.status = 'free'
       ORDER BY u.name`
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Хатои сервер" });
  }
});

// ✅ Маълумоти як курер
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.name, u.phone,
        (SELECT COUNT(*) FROM orders WHERE courier_id = c.id AND status = 'delivered') AS completed_orders,
        (SELECT COUNT(*) FROM orders WHERE courier_id = c.id AND status IN ('accepted', 'picked_up')) AS active_orders
       FROM couriers c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Курер ёфт нашуд" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Хатои сервер" });
  }
});

// ✅ Ҷойгоҳи курерро навсозӣ кардан (Courier худаш)
router.patch("/location", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ error: "Координатаҳо лозиманд" });
    }

    const result = await pool.query(
      `UPDATE couriers 
       SET latitude = $1, longitude = $2, updated_at = NOW()
       WHERE user_id = $3
       RETURNING id, latitude, longitude, status`,
      [latitude, longitude, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Шумо ҳамчун курер сабт нашудаед" });
    }

    res.json({ success: true, courier: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Хатои сервер" });
  }
});

// ✅ Статуси курерро иваз кардан (online/offline)
router.patch("/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["free", "busy", "offline"].includes(status)) {
      return res.status(400).json({ error: "Статус нодуруст аст" });
    }

    const result = await pool.query(
      `UPDATE couriers SET status = $1, updated_at = NOW()
       WHERE user_id = $2
       RETURNING id, status`,
      [status, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Курер ёфт нашуд" });
    }

    res.json({ success: true, courier: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Хатои сервер" });
  }
});

// ✅ Фармоишҳои курер
router.get("/:id/orders", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.name AS client_name, u.phone AS client_phone
       FROM orders o
       JOIN users u ON o.client_id = u.id
       WHERE o.courier_id = $1
       ORDER BY o.created_at DESC`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Хатои сервер" });
  }
});

module.exports = router;
