// config/socket.config.ts - Танзимоти Socket.IO
export const socketConfig = {
  // Префикси роут барои Socket.IO
  path: '/socket.io',

  // Агар CORS барои сокет лозим бошад
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },

  // Вақти маҳдудияти пайвастшавӣ (миллисония)
  pingTimeout: 60000,
  pingInterval: 25000,

  // Адади максималии пайвастҳо
  maxHttpBufferSize: 1e6, // 1 MB

  // Номҳои румҳо (rooms)
  rooms: {
    courierLocation: (courierId: string) => `courier:${courierId}:location`,
    orderTracking: (orderId: string) => `order:${orderId}:tracking`,
    userNotifications: (userId: string) => `user:${userId}:notifications`,
  },

  // Рӯйдодҳои сокет
  events: {
    // Аз клиент
    COURIER_UPDATE_LOCATION: 'courier:update-location',
    COURIER_ACCEPT_ORDER: 'courier:accept-order',
    COURIER_UPDATE_STATUS: 'courier:update-status',
    ORDER_TRACK: 'order:track',
    
    // Ба клиент
    ORDER_ASSIGNED: 'order:assigned',
    ORDER_STATUS_UPDATE: 'order:status-update',
    COURIER_LOCATION_UPDATE: 'courier:location-update',
    NEW_NOTIFICATION: 'notification:new',
  },
};
