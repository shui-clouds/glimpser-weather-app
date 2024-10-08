type LocationApiResponse = {
  results?: LocationResult[];
  generationtime_ms: number;
};

type LocationResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  feature_code: string;
  country_code: string;
  admin1_id: number;
  admin2_id: number;
  timezone: string;
  population: number;
  country_id: number;
  country: string;
  admin1: string;
  admin2: string;
  postcodes?: string[]; // Optional, since not all results include this field
};

export { LocationApiResponse, LocationResult };
