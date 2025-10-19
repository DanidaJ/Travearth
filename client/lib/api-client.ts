// API client for backend integration
// Configure your backend URL in .env.local

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export class APIClient {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  // Trip Planning APIs
  static async createTripPlan(data: any) {
    return this.request("/trips", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  static async getTripPlan(id: string) {
    return this.request(`/trips/${id}`)
  }

  static async updateTripPlan(id: string, data: any) {
    return this.request(`/trips/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  // Carbon Footprint APIs
  static async calculateCarbonFootprint(tripData: any) {
    return this.request("/carbon/calculate", {
      method: "POST",
      body: JSON.stringify(tripData),
    })
  }

  static async trackActualFootprint(tripId: string, locationData: any) {
    return this.request(`/carbon/track/${tripId}`, {
      method: "POST",
      body: JSON.stringify(locationData),
    })
  }

  // Sustainability Score APIs
  static async getSustainabilityScore(entityType: string, entityId: string) {
    return this.request(`/sustainability/${entityType}/${entityId}`)
  }

  // Hotel APIs
  static async getHotels(destinationId: string) {
    return this.request(`/hotels?destination=${destinationId}`)
  }

  static async registerHotel(hotelData: any) {
    return this.request("/hotels/register", {
      method: "POST",
      body: JSON.stringify(hotelData),
    })
  }

  // Activity APIs
  static async getActivities(destinationId: string) {
    return this.request(`/activities?destination=${destinationId}`)
  }

  // Eco Recommendations APIs
  static async getEcoRecommendations(tripId: string) {
    return this.request(`/recommendations/${tripId}`)
  }

  // Gamification APIs
  static async getUserBadges(userId: string) {
    return this.request(`/users/${userId}/badges`)
  }

  static async getEcoScore(userId: string) {
    return this.request(`/users/${userId}/eco-score`)
  }

  // Crisis Alerts APIs
  static async getCrisisAlerts(destinationIds: string[]) {
    return this.request(`/alerts?destinations=${destinationIds.join(",")}`)
  }

  // Sharing APIs
  static async generateShareCode(tripId: string) {
    return this.request(`/trips/${tripId}/share`, {
      method: "POST",
    })
  }

  static async getTripByShareCode(shareCode: string) {
    return this.request(`/trips/shared/${shareCode}`)
  }

  // Flight APIs (Amadeus)
  static async searchFlights(data: {
    origin: string
    destination: string
    departureDate: string
    adults?: number
    travelClass?: "ECONOMY" | "BUSINESS"
  }) {
    return this.request("/flights/search", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  static async searchMultiCityFlights(data: {
    routes: Array<{ origin: string; destination: string; date: string }>
    adults?: number
    travelClass?: "ECONOMY" | "BUSINESS"
  }) {
    return this.request("/flights/multi-city", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  static async searchAirports(keyword: string) {
    return this.request(`/flights/airports?keyword=${encodeURIComponent(keyword)}`)
  }

  static async getAirlineInfo(code: string) {
    return this.request(`/flights/airline/${code}`)
  }
}
