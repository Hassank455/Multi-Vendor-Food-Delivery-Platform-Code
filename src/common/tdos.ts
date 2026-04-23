import { Request } from "express";

export interface CustomRequest extends Request {
  user?: {
    id: number;
  };
  customer?: {
    id: number;
  };
  storeId?: string;
}
