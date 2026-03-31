const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// ✅ Ҳамаи фармоишҳо (Admin ҳамаро, Client танҳо худашро мебинад)
router.get("/", async (req, res) => {
  try {
    let query, params;

    if (req.user.role === "admin") {
      query = `
        SELECT o.*, 
          u.name AS client_name, u.phone AS client_phone,
          cu.name AS courier_name
        FROM orders o
        LEFT JOIN users u ON o.client_id = u.id
        LEFT JOIN couriers c ON o.courier_id = c.id
        LEFT JOIN users cu ON c.user_id = cu.id
        ORDER BY o.created_at DESC
      `;
      params = [];
    } else if (req.user.role === "courier") {
      query = `
        SELECT o.*, u.name AS client_name, u.phone AS client_phone
        FROM orders o
        LEFT JOIN users u ON o.client_id = u.id
        LEFT JOIN couriers c ON o.courier_id = c.id
        WHERE c.user_id = $1 OR o.status = 'new'
        ORDER BY o.created_at DESC
      `;
      params = [req.user.id];
    } else {
      query = `
        SELECT o.*, cu.name AS courier_name
        FROM orders o
        LEFT JOIN couriers c ON o.courier_id = c.id
        LEFT JOIN users cu ON c.user_id = cu.id
        WHERE o.client_id = $1
        ORDER BY o.created_at DESC
      `;
      params = [req.user.id];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Get orders error:", err.message);
    res.status(500).json({ error: "Хатои сервер" });
  }
});

// ✅ Як фармоишро гирифтан
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, 
        u.name AS client_name, u.phone AS client_phone,
        cu.name AS courier_name, cu.phone AS courier_phone
      FROM orders o
      LEFT JOIN users u ON o.client_id = u.id
      LEFT JOIN couriers c ON o.courier_id = c.id
      LEFT JOIN users cu ON c.user_id = cu.id
      WHERE o.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Фармоиш ёфт нашуд" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Хатои сервер" });
  }
});

// ✅ Фармоиши нав сохтан (Client)
router.post("/", async (req, res) => {
  try {
    const { pickup_address, delivery_address, description, price } = req.body;

    if (!pickup_address || !delivery_address) {
      return res.status(400).json({ error: "Суроғаи гирифтан ва расонидан лозиманд" });
    }

    const result = await pool.query(
      `INSERT INTO orders (client_id, pickup_address, delivery_address, description, price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, pickup_address, delivery_address, description || null, price || null]
    );

    res.status(201).json({
      success: true,
      message: "Фармоиш сохта шуд!",
      order: result.rows[0],
    });
  } catch (err) {
    console.error("Create order error:", err.message);
    res.status(500).json({ error: "Хатои сервер" });
  }
});

// ✅ Фармоишро тағйир додан
router.put("/:id", async (req, res) => {
  try {
    const { pickup_address, delivery_address, description, price } = req.body;

    const result = await pool.query(
      `UPDATE orders 
       SET pickup_address = COALESCE($1, pickup_address),
           delivery_address = COALESCE($2, delivery_address),
           description = COALESCE($3, description),
           price = COALESCE($4, price),
           updated_at = NOW()
       WHERE id = $5 AND (client_id = $6 OR $7 = 'admin')
       RETURNING *`,
      [pickup_address, delivery_address, description, price, req.params.id, req.user.id, req.user.role]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Фармоиш ёфт нашуд ё иҷозат нест" });
    }

    res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Хатои сервер" });
  }
});

// ✅ Статуси фармоишро иваз кардан (Courier/Admin)
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["new", "accepted", "picked_up", "delivered", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Статус нодуруст аст" });
    }

    let query, params;

    if (status === "accepted" && req.user.role === "courier") {
      // Курер фармоишро қабул мекунад
      const courier = await pool.query("SELECT id FROM couriers WHERE user_id = $1", [req.user.id]);
      if (courier.rows.length === 0) {
        return res.status(400).json({ error: "Шумо ҳамчун курер сабт нашудаед" });
      }

      query = `
        UPDATE orders SET status = $1, courier_id = $2, updated_at = NOW()
        WHERE id = $3 AND status = 'new'
        RETURNING *
      `;
      params = [status, courier.rows[0].id, req.params.id];

      // Статуси курерро busy кардан
      await pool.query("UPDATE couriers SET status = 'busy' WHERE id = $1", [courier.rows[0].id]);
    } else if (status === "delivered" && req.user.role === "courier") {
      query = `
        UPDATE orders SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `;
      params = [status, req.params.id];

      // Курерро озод кардан
      const courier = await pool.query("SELECT id FROM couriers WHERE user_id = $1", [req.user.id]);
      if (courier.rows.length > 0) {
        await pool.query("UPDATE couriers SET status = 'free' WHERE id = $1", [courier.rows[0].id]);
      }
    } else {
      query = `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`;
      params = [status, req.params.id];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Фармоиш ёфт нашуд" });
    }

    res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    console.error("Status update error:", err.message);
    res.status(500).json({ error: "Хатои сервер" });
  }
});

// ✅ Фармоишро нест кардан (Admin)
router.delete("/:id", async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Танҳо admin нест карда метавонад" });
    }

    const result = await pool.query("DELETE FROM orders WHERE id = $1 RETURNING id", [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Фармоиш ёфт нашуд" });
    }

    res.json({ success: true, message: "Фармоиш нест карда шуд" });
  } catch (err) {
    res.status(500).json({ error: "Хатои сервер" });
  }
});

module.exports = router;
