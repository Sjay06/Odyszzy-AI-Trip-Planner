const costEstimator = {
  estimateHotelCost(hotels = []) {
    if (!Array.isArray(hotels) || hotels.length === 0) return 0;
    return hotels.reduce(
      (sum, h) => sum + (h.pricePerNight || h.price || 0) * (h.nights || 1),
      0
    );
  },

  estimateActivityCost(activities = []) {
    if (!Array.isArray(activities) || activities.length === 0) return 0;
    return activities.reduce(
      (sum, a) => sum + (a.price || 0),
      0
    );
  },

  estimateTransportCost(km = 0) {
    const costPerKm = 15; // INR per km (example)
    return km * costPerKm;
  },

  totalCost({ hotels = 0, activities = 0, transport = 0 }) {
    return hotels + activities + transport;
  }
};

export default costEstimator;
