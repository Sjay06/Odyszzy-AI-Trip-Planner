// backend/src/agents/FlightSearchAgent.js
import axios from "axios";

const BASE_URL = "https://test.api.amadeus.com";

// Minimal baggage table – extend as needed
const AIRLINE_BAGGAGE = {
  // INDIA (Major)
  "6E": { carryOn: "7kg", checked: "15kg", extra: "₹600/kg", dims: "55x35x25cm" },     // IndiGo
  "AI": { carryOn: "8kg", checked: "25kg", extra: "₹2500/bag", dims: "55x40x20cm" },   // Air India
  "UK": { carryOn: "7kg", checked: "23kg", extra: "₹2800/bag", dims: "55x38x25cm" },   // Vistara
  "SG": { carryOn: "7kg", checked: "15kg", extra: "₹700/kg",  dims: "55x40x20cm" },    // SpiceJet
  "9W": { carryOn: "7kg", checked: "25kg", extra: "₹3000/bag",dims: "55x40x20cm" },    // Jet Airways
  "G9": { carryOn: "7kg", checked: "20kg", extra: "₹2500/bag",dims: "55x35x25cm" },    // Air Arabia

  // INTERNATIONAL – Gulf / ME / Asia
  "EK": { carryOn: "7kg", checked: "30kg", extra: "$100/bag", dims: "55x38x20cm" },    // Emirates
  "QR": { carryOn: "7kg", checked: "30kg", extra: "QAR300/bag",dims: "50x37x25cm" },   // Qatar Airways
  "SV": { carryOn: "7kg", checked: "23kg", extra: "SAR250/bag",dims: "50x37x25cm" },   // Saudia
  "WY": { carryOn: "7kg", checked: "30kg", extra: "OMR30/bag", dims: "55x40x25cm" },   // Oman Air
  "GF": { carryOn: "7kg", checked: "23kg", extra: "$80/bag",  dims: "55x40x23cm" },    // Gulf Air
  "UL": { carryOn: "7kg", checked: "20kg", extra: "LKR5000/bag",dims: "55x38x20cm" },  // SriLankan
  "SQ": { carryOn: "7kg", checked: "30kg", extra: "$120/bag", dims: "55x40x20cm" },    // Singapore Airlines
  "MH": { carryOn: "7kg", checked: "20kg", extra: "MYR150/bag",dims: "56x36x23cm" },   // Malaysia Airlines
  "CX": { carryOn: "7kg", checked: "30kg", extra: "HKD600/bag",dims: "56x36x23cm" },   // Cathay Pacific
  "JL": { carryOn: "10kg",checked: "23kg", extra: "¥5000/bag", dims: "55x40x25cm" },   // Japan Airlines
  "NH": { carryOn: "10kg",checked: "23kg", extra: "¥5000/bag", dims: "55x40x25cm" },   // ANA
  "KE": { carryOn: "10kg",checked: "23kg", extra: "KRW50000/bag",dims: "55x40x20cm" }, // Korean Air
  "OZ": { carryOn: "10kg",checked: "23kg", extra: "KRW50000/bag",dims: "55x40x20cm" }, // Asiana

  // EUROPE
  "LH": { carryOn: "8kg", checked: "23kg", extra: "€75/bag",  dims: "55x40x23cm" },    // Lufthansa
  "AF": { carryOn: "12kg",checked: "23kg", extra: "€70/bag",  dims: "55x35x25cm" },    // Air France
  "KL": { carryOn: "12kg",checked: "23kg", extra: "€70/bag",  dims: "55x35x25cm" },    // KLM
  "BA": { carryOn: "23kg",checked: "23kg", extra: "£65/bag",  dims: "56x45x25cm" },    // British Airways
  "LX": { carryOn: "8kg", checked: "23kg", extra: "CHF80/bag",dims: "55x40x23cm" },    // SWISS
  "OS": { carryOn: "8kg", checked: "23kg", extra: "€75/bag",  dims: "55x40x23cm" },    // Austrian
  "AY": { carryOn: "8kg", checked: "23kg", extra: "€60/bag",  dims: "55x40x23cm" },    // Finnair
  "SK": { carryOn: "8kg", checked: "23kg", extra: "€60/bag",  dims: "55x40x23cm" },    // SAS
  "TK": { carryOn: "8kg", checked: "30kg", extra: "$100/bag", dims: "55x40x23cm" },    // Turkish Airlines
  "FR": { carryOn: "10kg",checked: "0kg",  extra: "€25–€40/bag",dims: "55x40x20cm" },  // Ryanair (no free checked)
  "U2": { carryOn: "15kg",checked: "0kg",  extra: "£24–£37/bag",dims: "45x36x20cm" },  // easyJet (no free checked)

  // NORTH AMERICA
  "AA": { carryOn: "10kg",checked: "23kg", extra: "$75/bag",  dims: "56x36x23cm" },    // American Airlines
  "DL": { carryOn: "10kg",checked: "23kg", extra: "$75/bag",  dims: "56x35x23cm" },    // Delta Air Lines
  "UA": { carryOn: "10kg",checked: "23kg", extra: "$75/bag",  dims: "56x35x22cm" },    // United Airlines
  "WS": { carryOn: "10kg",checked: "23kg", extra: "CAD75/bag",dims: "53x38x23cm" },    // WestJet
  "AC": { carryOn: "10kg",checked: "23kg", extra: "CAD70/bag",dims: "55x40x23cm" },    // Air Canada
  "B6": { carryOn: "10kg",checked: "23kg", extra: "$65/bag",  dims: "56x35x23cm" },    // JetBlue
  "WN": { carryOn: "10kg",checked: "2 x 23kg", extra: "$75/bag",dims: "61x41x28cm" },  // Southwest (2 free checked typical)
  "AS": { carryOn: "10kg",checked: "23kg", extra: "$75/bag",  dims: "56x36x23cm" },    // Alaska Airlines

  // LATAM / AFRICA
  "LA": { carryOn: "8kg", checked: "23kg", extra: "$60/bag",  dims: "55x35x25cm" },    // LATAM
  "AV": { carryOn: "10kg",checked: "23kg", extra: "$60/bag",  dims: "55x35x25cm" },    // Avianca
  "CM": { carryOn: "10kg",checked: "23kg", extra: "$40–$60/bag",dims: "56x36x26cm" },  // Copa
  "ET": { carryOn: "7kg", checked: "2 x 23kg", extra: "$80/bag",dims: "55x40x23cm" },  // Ethiopian
  "KQ": { carryOn: "7kg", checked: "23kg", extra: "$60/bag",  dims: "55x40x23cm" },    // Kenya Airways
  "SA": { carryOn: "7kg", checked: "23kg", extra: "$60/bag",  dims: "56x36x23cm" },    // South African Airways

  // DEFAULT fallback
  DEFAULT: { carryOn: "7kg", checked: "23kg", extra: "₹2500/bag", dims: "55x40x20cm" },
};


async function getToken() {
  const AMADEUS_KEY = process.env.AMADEUS_CLIENT_ID;
  const AMADEUS_SECRET = process.env.AMADEUS_CLIENT_SECRET;

  if (!AMADEUS_KEY || !AMADEUS_SECRET) {
    throw new Error("AMADEUS_CLIENT_ID/SECRET missing in .env");
  }

  const res = await axios.post(
    `${BASE_URL}/v1/security/oauth2/token`,
    `grant_type=client_credentials&client_id=${AMADEUS_KEY}&client_secret=${AMADEUS_SECRET}`,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return res.data.access_token;
}

async function getAirlineName(carrierCode, token) {
  try {
    const res = await axios.get(`${BASE_URL}/v1/reference-data/airlines`, {
      params: { airlineCodes: carrierCode },
      headers: { Authorization: `Bearer ${token}` },
    });

    const info = res.data?.data?.[0] || {};
    const businessName = info.businessName || info.commonName;

    // Always prefer a human-readable business name if available
    return businessName || carrierCode;
  } catch {
    // If the lookup fails, still fall back to code so UI does not break
    return carrierCode;
  }
}

async function searchFlightOffers(originIata, destIata, date, token) {
  const params = {
    originLocationCode: originIata,
    destinationLocationCode: destIata,
    departureDate: date,        // YYYY-MM-DD
    adults: 1,
    max: 20,
    currencyCode: "INR",
  };
  const url = `${BASE_URL}/v2/shopping/flight-offers`;

  console.log("DEBUG calling flight-offers:", url, params);

  const res = await axios.get(url, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });

  const offers = res.data?.data || [];
  return offers.map((offer) => {
    const it = offer.itineraries[0];
    const seg = it.segments[0];
    return {
      rawOffer: offer,
      id: offer.id,
      carrierCode: seg.carrierCode,
      flightNumber: seg.number,
      departure: seg.departure.at,
      arrival: seg.arrival.at,
      duration: it.duration,
      price: parseFloat(offer.price.total),
      currency: offer.price.currency,
      stops: it.segments.length - 1,
    };
  });
}

export default async function flightSearchAgent(origin, destination, date) {
  console.log("DEBUG entered flightSearchAgent:", { origin, destination, date });

  if (!origin || !destination || !date) {
    throw new Error("origin, destination, date are required");
  }

  const token = await getToken();

  // For now treat origin/destination as IATA directly
  const originIata = origin.toUpperCase();
  const destIata = destination.toUpperCase();

  console.log("DEBUG resolved:", { originIata, destIata, date });

  const baseOffers = await searchFlightOffers(originIata, destIata, date, token);

  if (!baseOffers.length) {
    return {
      origin,
      originIata,
      destination,
      destIata,
      searchDate: date,
      totalFlights: 0,
      allFlights: [],
      cheapestFlight: null,
      averagePrice: null,
    };
  }

  // Attach airlineName + baggage with defaults
  const enriched = await Promise.all(
    baseOffers.map(async (f) => {
      const airlineName = await getAirlineName(f.carrierCode, token);
      const bag = AIRLINE_BAGGAGE[f.carrierCode] || AIRLINE_BAGGAGE.DEFAULT;
      return {
        ...f,
        airlineName,
        baggage: {
          carryOn: bag.carryOn,
          checked: bag.checked,
          extra: bag.extra,
          cabinDimensions: bag.dims,
        },
      };
    })
  );

  enriched.sort((a, b) => a.price - b.price);
  const avg = enriched.reduce((s, f) => s + f.price, 0) / enriched.length;

  return {
    origin,
    originIata,
    destination,
    destIata,
    searchDate: date,
    totalFlights: enriched.length,
    cheapestFlight: enriched[0],
    allFlights: enriched,
    averagePrice: Math.round(avg),
  };
}
