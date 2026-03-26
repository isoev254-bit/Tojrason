async function createOrder() {
  const order = {
    id: Date.now(),
    from: "Dushanbe",
    to: "Yovon"
  };

  await fetch("http://localhost:3000/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(order)
  });

  alert("Заказ отправлен");
}
