import { apiRequest } from "./api-client.js";

export async function fetchCurrentParkingRate() {
  return apiRequest("/api/parking-rates/current");
}
