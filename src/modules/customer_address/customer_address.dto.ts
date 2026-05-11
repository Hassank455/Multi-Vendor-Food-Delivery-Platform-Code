export interface CreateCustomerAddressDto {
  street: string;
  city: string;
  buildingNo?: string | null;
  postalCode?: string | null;
  governorate: string;
}

export interface UpdateCustomerAddressDto {
  street?: string;
  city?: string;
  buildingNo?: string | null;
  postalCode?: string | null;
  governorate?: string;
}

export interface CustomerAddressLookupDto {
  customerId: number;
  customerAddressId: number;
}
