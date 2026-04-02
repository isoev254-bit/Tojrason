const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

app.use("/admin", express.static(path.join(__dirname, "../frontend/admin")));
app.use("/client", express.static(path.join(__dirname, "../frontend/client")));
app.use("/courier", express.static(path.join(__dirname, "../frontend/courier")));
app.use("/shared", express.static(path.join(__dirname, "../shared")));

let nextOrderId = 1;
const orders = [];
const couriers = [
  { id: "c1", name: "Фирдавс Ҷамолов", phone: "+992 93 123 45", status: "offline", lat: 38.562, lng: 68.778, vehicle: "🏍 Мотосикл", socketId: null },
  { id: "c2", name: "Рустам Аҳмадов", phone: "+992 90 234 56", status: "offline", lat: 38.555, lng: 68.769, vehicle: "🚗 Мошин", socketId: null },
  { id: "c3", name: "Сорбон Мирзоев", phone: "+992 92 345 67", status: "offline", lat: 38.568, lng: 68.782, vehicle: "🏍 Мотосикл", socketId: null },
];

app.get("/api/orders", (req, res) => res.json(orders));
app.get("/api/couriers", (req, res) => res.json(couriers.map(c => ({ ...c, socketId: undefined }))));

app.get("/", (req, res) => {
  res.send(`<h2>Tojrason Delivery Server</h2><ul><li><a href="/client/">Client</a></li><li><a href="/courier/">Courier</a></li><li><a href="/admin/">Admin</a></li></ul><p>Orders: ${orders.length} | Online: ${couriers.filter(c => c.status === "online").length}</p>`);
});

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("new-order", (data) => {
    const order = { id: nextOrderId++, fromAddr: data.fromAddr || "", toAddr: data.toAddr || "", fromCoords: data.fromCoords, toCoords: data.toCoords, weight: data.weight || 0, cargoType: data.cargoType || "parcel", cargoLabel: data.cargoLabel || "Баста", distance: data.distance || "—", price: data.price || 0, fromPhone: data.fromPhone || "", toPhone: data.toPhone || "", status: "pending", courierId: null, courierName: null, courierPhone: null, courierLat: null, courierLng: null, clientSocketId: socket.id, routeGeo: data.routeGeo || null, createdAt: new Date().toISOString() };
    orders.push(order);
    socket.emit("order-confirmed", order);
    couriers.filter(c => c.status === "online" && c.socketId).forEach(c => { io.to(c.socketId).emit("new-order-available", order); });
    io.emit("admin-update", { type: "new-order", order, orders, couriers: couriers.map(c => ({ ...c, socketId: undefined })) });
  });

  socket.on("courier-online", (data) => {
    const c = couriers.find(x => x.id === data.courierId);
    if (c) { c.status = "online"; c.socketId = socket.id; c.lat = data.lat || c.lat; c.lng = data.lng || c.lng; socket.emit("pending-orders", orders.filter(o => o.status === "pending")); io.emit("admin-update", { type: "courier-online", orders, couriers: couriers.map(c => ({ ...c, socketId: undefined })) }); }
  });

  socket.on("courier-offline", (data) => {
    const c = couriers.find(x => x.id === data.courierId);
    if (c) { c.status = "offline"; c.socketId = null; io.emit("admin-update", { type: "courier-offline", orders, couriers: couriers.map(c => ({ ...c, socketId: undefined })) }); }
  });

  socket.on("accept-order", (data) => {
    const order = orders.find(o => o.id === data.orderId && o.status === "pending");
    const courier = couriers.find(c => c.id === data.courierId);
    if (!order || !courier) return;
    order.status = "accepted"; order.courierId = courier.id; order.courierName = courier.name; order.courierPhone = courier.phone; order.courierLat = courier.lat; order.courierLng = courier.lng; courier.status = "busy";
    if (order.clientSocketId) { io.to(order.clientSocketId).emit("order-accepted", { order, courier: { name: courier.name, phone: courier.phone, lat: courier.lat, lng: courier.lng } }); }
    couriers.forEach(c => { if (c.socketId && c.id !== courier.id) io.to(c.socketId).emit("order-taken", { orderId: order.id }); });
    io.emit("admin-update", { type: "order-accepted", order, orders, couriers: couriers.map(c => ({ ...c, socketId: undefined })) });
  });

  socket.on("reject-order", (data) => { /* pending мемонад */ });

  socket.on("courier-location", (data) => {
    const c = couriers.find(x => x.id === data.courierId);
    if (c) { c.lat = data.lat; c.lng = data.lng; orders.filter(o => o.courierId === c.id && (o.status === "accepted" || o.status === "delivering")).forEach(o => { o.courierLat = data.lat; o.courierLng = data.lng; if (o.clientSocketId) io.to(o.clientSocketId).emit("courier-moved", { orderId: o.id, lat: data.lat, lng: data.lng, courierName: c.name }); }); io.emit("admin-courier-moved", { courierId: c.id, lat: data.lat, lng: data.lng, name: c.name }); }
  });

  socket.on("order-delivered", (data) => {
    const order = orders.find(o => o.id === data.orderId);
    const courier = couriers.find(c => c.id === data.courierId);
    if (!order) return;
    order.status = "delivered"; if (courier) courier.status = "online";
    if (order.clientSocketId) io.to(order.clientSocketId).emit("order-delivered", { order });
    io.emit("admin-update", { type: "order-delivered", order, orders, couriers: couriers.map(c => ({ ...c, socketId: undefined })) });
    if (courier && courier.socketId) io.to(courier.socketId).emit("pending-orders", orders.filter(o => o.status === "pending"));
  });

  socket.on("disconnect", () => {
    const c = couriers.find(x => x.socketId === socket.id);
    if (c) { c.status = "offline"; c.socketId = null; io.emit("admin-update", { type: "courier-offline", orders, couriers: couriers.map(c => ({ ...c, socketId: undefined })) }); }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => { console.log(`Tojrason Server: http://localhost:${PORT}`); });
