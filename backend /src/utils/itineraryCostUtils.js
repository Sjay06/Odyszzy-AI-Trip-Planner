// backend/src/utils/itineraryCostUtils.js
export function computeTotalsFromItinerary(itinerary) {
    if (!itinerary) {
      return { hotels: 0, activities: 0, total: 0 };
    }
  
    const hotelsArr = Array.isArray(itinerary.hotels) ? itinerary.hotels : [];
    const activitiesArr = Array.isArray(itinerary.activities)
      ? itinerary.activities
      : [];
  
    const hotels = hotelsArr.reduce((sum, h) => {
      const price =
        typeof h.pricePerNight === "number" ? h.pricePerNight : 0;
      const nights = typeof h.nights === "number" ? h.nights : 0;
      return sum + price * nights;
    }, 0);
  
    const activities = activitiesArr.reduce((sum, a) => {
      const price = typeof a.price === "number" ? a.price : 0;
      return sum + price;
    }, 0);
  
    const total = hotels + activities;
  
    return { hotels, activities, total };
  }
  