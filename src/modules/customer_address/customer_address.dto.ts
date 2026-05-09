export interface CustomerAddressDto {
  id?: number;
  customerId: number;
  street: string;
  city: string;
  buildingNo?: string | null;
  postalCode?: string | null;
  governorate: string;
}

export interface CustomerAddressLookupDto {
  customerId: number;
  customerAddressId: number;
}
