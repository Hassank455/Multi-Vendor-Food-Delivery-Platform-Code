import { PaymentMethod } from "../../generated/prisma/enums";

export interface UpdateCustomerProfileDto {
  name?: string;
  email?: string;
  phone?: string;
}

export interface CreateCustomerReviewDto {
  orderId: number;
  rating: number;
  comment?: string | null;
}

// export interface UpsertPaymentPreferenceDto {
//   method: PaymentMethod;
// }
