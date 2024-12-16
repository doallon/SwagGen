
/**
 * Model for IPet
 */
export interface IPet  {
  /**
 * No description provided.
 */
id: number;
  /**
 * No description provided.
 */
name: string;
  /**
 * No description provided.
 */
category: { id: integer;
name: string; };
  /**
 * No description provided.
 */
photoUrls: string[];
  /**
 * No description provided.
 */
tags: { id: number; name: string; }[];
  /**
 * pet status in the store
 */
status: 'available' | 'pending' | 'sold';
}