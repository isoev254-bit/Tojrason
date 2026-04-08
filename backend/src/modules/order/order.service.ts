// modules/order/order.service.ts - Логикаи тиҷоратии фармоишҳо
import { OrderRepository } from './order.repository';
import { CreateOrderData, UpdateOrderData, OrderResponse, OrderFilters, PaginatedOrders } from './order.types';
import { constants, OrderStatus, PaymentStatus } from '../../config/constants';
import logger from '../../config/logger';

export class OrderService {
  private repository: OrderRepository;

  constructor() {
    this.repository = new OrderRepository();
  }

  // Эҷоди фармоиши нав
  async createOrder(clientId: string, data: CreateOrderData): Promise<OrderResponse> {
    // Ҳисоб кардани арзиши интиқол (метавон лоикаи мураккабтар дошта бошад)
    const deliveryFee = this.calculateDeliveryFee(data.pickupLat, data.pickupLng, data.deliveryLat, data.deliveryLng);
    const totalAmount = data.amount + deliveryFee;

    const orderData = {
      clientId,
      pickupAddress: data.pickupAddress,
      pickupLat: data.pickupLat,
      pickupLng: data.pickupLng,
      deliveryAddress: data.deliveryAddress,
      deliveryLat: data.deliveryLat,
      deliveryLng: data.deliveryLng,
      amount: data.amount,
      deliveryFee,
      totalAmount,
      clientNote: data.clientNote,
      status: constants.ORDER_STATUS.PENDING as OrderStatus,
      paymentStatus: constants.PAYMENT_STATUS.PENDING as PaymentStatus,
    };

    const order = await this.repository.create(orderData);
    logger.info(`Фармоиши нав эҷод шуд: ${order.id} аз ҷониби клиент ${clientId}`);
    return order;
  }

  // Гирифтани фармоиш бо ID
  async getOrderById(orderId: string): Promise<OrderResponse | null> {
    return this.repository.findById(orderId);
  }

  // Навсозии фармоиш
  async updateOrder(orderId: string, data: UpdateOrderData): Promise<OrderResponse | null> {
    const updated = await this.repository.update(orderId, data);
    if (updated) {
      logger.info(`Фармоиш навсозӣ шуд: ${orderId}`, data);
    }
    return updated;
  }

  // Навсозии статуси фармоиш
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderResponse | null> {
    const updateData: UpdateOrderData = { status };
    // Агар статус ба PICKED_UP тағйир ёбад, вақтро сабт кун
    if (status === constants.ORDER_STATUS.PICKED_UP) {
      updateData.pickedUpAt = new Date();
    }
    // Агар статус ба DELIVERED тағйир ёбад
    if (status === constants.ORDER_STATUS.DELIVERED) {
      updateData.deliveredAt = new Date();
    }
    // Агар статус ба CANCELLED тағйир ёбад
    if (status === constants.ORDER_STATUS.CANCELLED) {
      updateData.cancelledAt = new Date();
    }
    const updated = await this.repository.update(orderId, updateData);
    if (updated) {
      logger.info(`Статуси фармоиш ${orderId} ба ${status} тағйир ёфт`);
    }
    return updated;
  }

  // Таъин кардани курьер ба фармоиш
  async assignCourier(orderId: string, courierId: string): Promise<OrderResponse | null> {
    const updateData: UpdateOrderData = {
      courierId,
      assignedAt: new Date(),
      status: constants.ORDER_STATUS.ASSIGNED,
    };
    const updated = await this.repository.update(orderId, updateData);
    if (updated) {
      logger.info(`Курьер ${courierId} ба фармоиш ${orderId} таъин шуд`);
    }
    return updated;
  }

  // Гирифтани фармоишҳои клиент
  async getOrdersByClient(clientId: string, filters?: OrderFilters): Promise<PaginatedOrders> {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.repository.findAll({
        clientId,
        status: filters?.status,
        paymentStatus: filters?.paymentStatus,
        fromDate: filters?.fromDate,
        toDate: filters?.toDate,
        skip,
        take: limit,
      }),
      this.repository.count({
        clientId,
        status: filters?.status,
        paymentStatus: filters?.paymentStatus,
        fromDate: filters?.fromDate,
        toDate: filters?.toDate,
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Гирифтани фармоишҳои курьер
  async getOrdersByCourier(courierId: string, filters?: OrderFilters): Promise<PaginatedOrders> {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.repository.findAll({
        courierId,
        status: filters?.status,
        paymentStatus: filters?.paymentStatus,
        fromDate: filters?.fromDate,
        toDate: filters?.toDate,
        skip,
        take: limit,
      }),
      this.repository.count({
        courierId,
        status: filters?.status,
        paymentStatus: filters?.paymentStatus,
        fromDate: filters?.fromDate,
        toDate: filters?.toDate,
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Бекор кардани фармоиш (танҳо клиент ё админ)
  async cancelOrder(orderId: string, userId: string, role: string): Promise<OrderResponse | null> {
    const order = await this.repository.findById(orderId);
    if (!order) {
      throw new Error('Фармоиш ёфт нашуд');
    }
    // Санҷиши иҷозат: танҳо соҳиби фармоиш ё админ метавонад бекор кунад
    if (order.clientId !== userId && role !== 'ADMIN') {
      throw new Error('Шумо иҷозати бекор кардани ин фармоишро надоред');
    }
    // Агар фармоиш аллакай расонида шуда бошад, бекор кардан мумкин нест
    if (order.status === constants.ORDER_STATUS.DELIVERED) {
      throw new Error('Фармоиши расонидашударо бекор кардан мумкин нест');
    }
    return this.updateOrderStatus(orderId, constants.ORDER_STATUS.CANCELLED);
  }

  // Ҳисоб кардани арзиши интиқол (ба асоси масофа)
  private calculateDeliveryFee(pickupLat: number, pickupLng: number, deliveryLat: number, deliveryLng: number): number {
    // Барои соддагӣ, арзиши собит. Дар ҳақиқат бояд масофаро ҳисоб кард.
    // Метавон формулаи Ҳаверсинро истифода бурд.
    const distance = this.calculateDistance(pickupLat, pickupLng, deliveryLat, deliveryLng);
    const baseFee = constants.BASE_DELIVERY_FEE;
    const extraFee = Math.max(0, Math.floor(distance / 1000) - 1) * constants.COST_PER_KM;
    return baseFee + extraFee;
  }

  // Ҳисоб кардани масофа (метр) байни ду нуқта (формулаи Ҳаверсин)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Радиуси Замин (метр)
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}
