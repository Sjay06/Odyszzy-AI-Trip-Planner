import costEstimator from "../utils/costEstimator.js";
import hotelAgent from "./HotelAgent.js";
import activityAgent from "./ActivityAgent.js";

export default async function budgetConstraintAgent(destination, days, budget) {
  // Validate inputs
  if (!destination || typeof days !== "number" || days <= 0) {
    throw new Error("Invalid input: destination and days are required, days must be > 0");
  }
  if (typeof budget !== "number" || budget <= 0) {
    throw new Error("Invalid input: budget must be a number greater than 0");
  }

  // Calculate budget per day for hotel and activities
  const dailyBudget = budget / days;
  const hotelBudgetPerNight = dailyBudget * 0.4; // Allocate 40% for hotels
  const activityBudgetPerDay = dailyBudget * 0.3; // Allocate 30% for activities
  
  // Get AI-generated options with budget constraints
  const hotels = await hotelAgent(destination, hotelBudgetPerNight);
  const activities = await activityAgent(destination, activityBudgetPerDay);
  
  // Calculate costs
  const hotelOptions = hotels.map(hotel => ({
    ...hotel,
    totalCost: hotel.pricePerNight * days
  }));
  
  // Filter hotels within budget
  const affordableHotels = hotelOptions.filter(h => {
    const remainingBudget = budget - h.totalCost;
    const minActivityCost = Math.min(...activities.map(a => a.price));
    return remainingBudget >= minActivityCost * days; // Ensure we can afford at least one activity per day
  });
  
  // If no affordable hotels, use the cheapest
  const selectedHotels = affordableHotels.length > 0 
    ? affordableHotels 
    : [hotelOptions.reduce((cheapest, current) => 
        current.pricePerNight < cheapest.pricePerNight ? current : cheapest
      )];
  
  // Calculate remaining budget after hotel
  const cheapestHotel = selectedHotels[0];
  const hotelCost = cheapestHotel.totalCost;
  const remainingBudget = budget - hotelCost;
  
  // Estimate transport cost (assume 50km per day at ₹20/km)
  const transportKm = days * 50;
  const transportCost = costEstimator.estimateTransportCost(transportKm);
  const activityBudget = remainingBudget - transportCost;
  
  // Select activities that fit within budget
  const budgetPerDay = activityBudget / days;
  const affordableActivities = activities.filter(a => a.price <= budgetPerDay);
  
  // Prioritize free activities
  const freeActivities = affordableActivities.filter(a => a.price === 0);
  const paidActivities = affordableActivities.filter(a => a.price > 0);
  
  // Select activities per day
  const selectedActivities = [];
  let remainingActivityBudget = budgetPerDay;
  
  // Add free activities first
  freeActivities.forEach(activity => {
    selectedActivities.push(activity);
  });
  
  // Add paid activities that fit
  paidActivities.forEach(activity => {
    if (activity.price <= remainingActivityBudget) {
      selectedActivities.push(activity);
      remainingActivityBudget -= activity.price;
    }
  });
  
  // Calculate final cost
  const totalActivityCost = selectedActivities.reduce((sum, a) => sum + a.price, 0) * days;
  const finalCost = hotelCost + transportCost + totalActivityCost;
  
  return {
    budgetBreakdown: {
      hotel: hotelCost,
      transport: transportCost,
      activities: totalActivityCost,
      total: finalCost,
      remaining: budget - finalCost
    },
    recommendations: {
      hotels: selectedHotels,
      activities: selectedActivities,
      transportKm,
      suggestions: generateSuggestions(budget, finalCost, remainingBudget)
    }
  };
}

function generateSuggestions(budget, finalCost, remaining) {
  const suggestions = [];
  
  if (remaining < 0) {
    suggestions.push({
      type: "warning",
      message: `Budget exceeded by ₹${Math.abs(remaining)}. Consider reducing days or selecting cheaper options.`
    });
  } else if (remaining > budget * 0.2) {
    suggestions.push({
      type: "opportunity",
      message: `You have ₹${remaining} remaining. Consider upgrading accommodation or adding more activities.`
    });
  } else {
    suggestions.push({
      type: "success",
      message: `Perfect! Your trip fits within budget with ₹${remaining} remaining for emergencies.`
    });
  }
  
  return suggestions;
}

