export const COMPANY_CLASSIFICATIONS: Record<string, string> = {
  '1': 'Enterprise',
  '2': 'Limited Liability',
  '3': 'Trustees',
  '4': 'Limited Partnership',
  '5': 'Limited Liability Partnership',
};

export const NIGERIAN_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
];

export interface CompanyRegistrationFormData {
  company_classification: string;
  rc_number: string;
  company_name: string;
  email: string;
  primary_phone: string;
  address_line: string;
  address_city: string;
  address_country: string;
  address_postal_zone: string;
  state: string;
  tin: string;
  nrs_business_id: string;
  nrs_service_id: string;
}

export interface CacLookupResult {
  found: boolean;
  status: string;
  message: string | null;
  company: {
    company_name: string;
    rc_number: string;
    email: string;
    primary_phone: string;
    address_line: string;
    address_city: string;
    address_country: string;
    address_postal_zone?: string | null;
    state: string;
    tin?: string | null;
  } | null;
}
