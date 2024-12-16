
/**
 * Model for IOrder
 */
export interface IOrder  {
  /**
 * No description provided.
 */
id: number;
  /**
 * No description provided.
 */
petId: number;
  /**
 * No description provided.
 */
quantity: number;
  /**
 * No description provided.
 */
shipDate: string;
  /**
 * Order Status
 */
status: 'placed' | 'approved' | 'delivered';
  /**
 * No description provided.
 */
complete: boolean;
}