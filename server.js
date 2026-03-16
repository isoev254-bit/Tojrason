const express = require("express")
const http = require("http")
const { Server } = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: "*" }
})

app.use(express.json())

let orders = []
let couriers = []

app.post("/order", (req, res) => {
  const order = {
    id: Date.now(),
    location: req.body.location,
    status: "new"
  }

  orders.push(order)

  io.emit("new_order", order)

  res.json({ success: true, order })
})

io.on("connection", (socket) => {

  socket.on("courier_online", (data) => {
    couriers.push({
      id: socket.id,
      location: data.location
    })
  })

  socket.on("accept_order", (orderId) => {

    orders = orders.map(o => {
      if (o.id === orderId) {
        o.status = "accepted"
      }
      return o
    })

    io.emit("order_taken", orderId)
  })

})

server.listen(3000, () => {
  console.log("Server running on port 3000")
})
