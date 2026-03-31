const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const authMiddleware = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const courierRoutes = require("./routes/couriers");
const userRoutes = require("./routes/users");

app.use("/api/auth", authRoutes);
app.use("/api/orders", authMiddleware, orderRoutes);
app.use("/api/couriers", authMiddleware, courierRoutes);
app.use("/api/users", authMiddleware, userRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Tojrason Delivery API кор мекунад!" });
});

// Ҷадвалҳоро сохтан
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('admin', 'client', 'courier')),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS couriers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'free' CHECK (status IN ('free', 'busy', 'offline')),
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES users(id),
        courier_id INTEGER REFERENCES couriers(id),
        pickup_address VARCHAR(255) NOT NULL,
        delivery_address VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2),
        status VARCHAR(30) DEFAULT 'new' 
          CHECK (status IN ('new', 'accepted', 'picked_up', 'delivered', 'cancelled')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Ҷадвалҳо бо муваффақият сохта шуданд");
  } catch (err) {
    console.error("❌ Хатои DB:", err.message);
  }
}

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server кор мекунад: http://localhost:${PORT}`);
  });
});
