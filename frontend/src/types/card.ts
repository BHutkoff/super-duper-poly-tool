export interface Card {
  id: number;

  name: string;

  attribute?: string;

  race?: string;

  level?: number;
  rank?: number;
  linkval?: number;

  type: string;

  desc: string;

  frameType?: string;
}