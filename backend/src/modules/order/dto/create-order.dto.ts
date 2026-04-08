// modules/order/dto/create-order.dto.ts - DTO барои эҷоди фармоиши нав
export class CreateOrderDto {
  /** Суроғаи гирифтан (аз куҷо) */
  pickupAddress!: string;

  /** Арзиши паҳноӣ (latitude) барои суроғаи гирифтан */
  pickupLat!: number;

  /** Арзиши дарозӣ (longitude) барои суроғаи гирифтан */
  pickupLng!: number;

  /** Суроғаи расонидан (ба куҷо) */
  deliveryAddress!: string;

  /** Арзиши паҳноӣ (latitude) барои суроғаи расонидан */
  deliveryLat!: number;

  /** Арзиши дарозӣ (longitude) барои суроғаи расонидан */
  deliveryLng!: number;

  /** Маблағи фармоиш (бидуни интиқол) */
  amount!: number;

  /** Эзоҳи клиент (ихтиёрӣ) */
  clientNote?: string;
}
