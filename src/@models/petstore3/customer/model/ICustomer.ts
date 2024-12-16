
/**
 * Model for ICustomer
 */
export interface ICustomer  {
  /**
 * No description provided.
 */
id: number;
  /**
 * No description provided.
 */
username: string;
  /**
 * No description provided.
 */
address: { street: string; city: string; state: string; zip: string; }[];
}