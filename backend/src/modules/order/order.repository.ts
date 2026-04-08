<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>order.repository.ts</title>
    <style>
        .code-container {
            background-color: #1e1e1e;
            color: #d4d4d4;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            position: relative;
            margin: 20px 0;
        }
        .copy-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background-color: #007acc;
            color: white;
            border: none;
            padding: 5px 12px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
        }
        .copy-btn:hover {
            background-color: #005a9e;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
    </style>
</head>
<body>
<div class="code-container">
    <button class="copy-btn" onclick="copyCode()">Копия кардан</button>
    <pre id="codeBlock">
// modules/order/order.repository.ts - Дастрасӣ ба базаи додаҳо барои фармоишҳо
import prisma from '../../config/db';
import { OrderResponse, CreateOrderData, UpdateOrderData } from './order.types';
import { OrderStatus, PaymentStatus } from '../../config/constants';
import logger from '../../config/logger';

export class OrderRepository {
  // Эҷоди фармоиши нав
  async create(data: CreateOrderData & {
    clientId: string;
    deliveryFee: number;
    totalAmount: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
  }): Promise<OrderResponse> {
    const order = await prisma.order.create({
      data: {
        clientId: data.clientId,
        pickupAddress: data.pickupAddress,
        pickupLat: data.pickupLat,
        pickupLng: data.pickupLng,
        deliveryAddress: data.deliveryAddress,
        deliveryLat: data.deliveryLat,
        deliveryLng: data.deliveryLng,
        amount: data.amount,
        deliveryFee: data.deliveryFee,
        totalAmount: data.totalAmount,
        clientNote: data.clientNote,
        status: data.status,
        paymentStatus: data.paymentStatus,
      },
      select: {
        id: true,
        clientId: true,
        courierId: true,
        pickupAddress: true,
        pickupLat: true,
        pickupLng: true,
        deliveryAddress: true,
        deliveryLat: true,
        deliveryLng: true,
        status: true,
        paymentStatus: true,
        amount: true,
        deliveryFee: true,
        totalAmount: true,
        clientNote: true,
        courierNote: true,
        assignedAt: true,
        pickedUpAt: true,
        deliveredAt: true,
        cancelledAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return order as OrderResponse;
  }

  // Ёфтани фармоиш бо ID
  async findById(id: string): Promise<OrderResponse | null> {
    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        clientId: true,
        courierId: true,
        pickupAddress: true,
        pickupLat: true,
        pickupLng: true,
        deliveryAddress: true,
        deliveryLat: true,
        deliveryLng: true,
        status: true,
        paymentStatus: true,
        amount: true,
        deliveryFee: true,
        totalAmount: true,
        clientNote: true,
        courierNote: true,
        assignedAt: true,
        pickedUpAt: true,
        deliveredAt: true,
        cancelledAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return order as OrderResponse | null;
  }

  // Навсозии фармоиш
  async update(id: string, data: UpdateOrderData): Promise<OrderResponse | null> {
    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.courierId !== undefined) updateData.courierId = data.courierId;
    if (data.courierNote !== undefined) updateData.courierNote = data.courierNote;
    if (data.assignedAt !== undefined) updateData.assignedAt = data.assignedAt;
    if (data.pickedUpAt !== undefined) updateData.pickedUpAt = data.pickedUpAt;
    if (data.deliveredAt !== undefined) updateData.deliveredAt = data.deliveredAt;
    if (data.cancelledAt !== undefined) updateData.cancelledAt = data.cancelledAt;

    try {
      const updated = await prisma.order.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          clientId: true,
          courierId: true,
          pickupAddress: true,
          pickupLat: true,
          pickupLng: true,
          deliveryAddress: true,
          deliveryLat: true,
          deliveryLng: true,
          status: true,
          paymentStatus: true,
          amount: true,
          deliveryFee: true,
          totalAmount: true,
          clientNote: true,
          courierNote: true,
          assignedAt: true,
          pickedUpAt: true,
          deliveredAt: true,
          cancelledAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return updated as OrderResponse;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return null; // фармоиш ёфт нашуд
      }
      throw error;
    }
  }

  // Ёфтани фармоишҳо бо филтрҳо
  async findAll(filters: {
    clientId?: string;
    courierId?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    fromDate?: Date;
    toDate?: Date;
    skip?: number;
    take?: number;
  }): Promise<OrderResponse[]> {
    const { clientId, courierId, status, paymentStatus, fromDate, toDate, skip, take } = filters;
    const where: any = {};

    if (clientId) where.clientId = clientId;
    if (courierId) where.courierId = courierId;
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = fromDate;
      if (toDate) where.createdAt.lte = toDate;
    }

    const orders = await prisma.order.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        clientId: true,
        courierId: true,
        pickupAddress: true,
        pickupLat: true,
        pickupLng: true,
        deliveryAddress: true,
        deliveryLat: true,
        deliveryLng: true,
        status: true,
        paymentStatus: true,
        amount: true,
        deliveryFee: true,
        totalAmount: true,
        clientNote: true,
        courierNote: true,
        assignedAt: true,
        pickedUpAt: true,
        deliveredAt: true,
        cancelledAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return orders as OrderResponse[];
  }

  // Шумораи умумии фармоишҳо барои саҳифабандӣ
  async count(filters: {
    clientId?: string;
    courierId?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<number> {
    const { clientId, courierId, status, paymentStatus, fromDate, toDate } = filters;
    const where: any = {};

    if (clientId) where.clientId = clientId;
    if (courierId) where.courierId = courierId;
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = fromDate;
      if (toDate) where.createdAt.lte = toDate;
    }

    return prisma.order.count({ where });
  }

  // Нест кардани фармоиш (агар лозим бошад)
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.order.delete({ where: { id } });
      return true;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }
}
    </pre>
</div>
<script>
function copyCode() {
    const code = document.getElementById('codeBlock').innerText;
    navigator.clipboard.writeText(code).then(() => {
        alert('Код копия карда шуд!');
    }).catch(() => {
        alert('Хатогӣ ҳангоми копия кардан');
    });
}
</script>
</body>
</html>
