const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let orders = [];

// create order
app.post("/orders", (req, res) => {
  const order = req.body;
  orders.push(order);
  console.log("NEW ORDER:", order);
  res.json({ success: true });
});

// get all orders
app.get("/orders", (req, res) => {
  res.json(orders);
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
