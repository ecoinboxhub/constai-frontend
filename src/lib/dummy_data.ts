/**
 * Dummy data layer based on real-world Nigerian construction market specs.
 * Platforms: Cutstruct, Jiji, NigerianPrice, NiMet.
 */

export const MATERIAL_PRICES = [
  // Cement & Concrete
  { id: "c-1", category: "Cement", name: "Dangote Cement (50kg)", price: 8500, unit: "bag", trend: "up", supplier: "Cutstruct" },
  { id: "c-2", category: "Cement", name: "BUA Cement (50kg)", price: 8200, unit: "bag", trend: "stable", supplier: "NigerianPrice" },
  { id: "c-3", category: "Cement", name: "Lafarge Elephant", price: 8400, unit: "bag", trend: "down", supplier: "Cutstruct" },
  
  // Steel & Reinforcement
  { id: "s-1", category: "Steel", name: "Iron Rod 12mm", price: 1250000, unit: "ton", trend: "up", supplier: "Cutstruct" },
  { id: "s-2", category: "Steel", name: "Iron Rod 16mm", price: 1250000, unit: "ton", trend: "up", supplier: "Cutstruct" },
  { id: "s-3", category: "Steel", name: "Iron Rod 10mm", price: 1250000, unit: "ton", trend: "up", supplier: "Cutstruct" },
  { id: "s-4", category: "Steel", name: "Binding Wire", price: 45000, unit: "roll", trend: "stable", supplier: "Jiji" },

  // Aggregates
  { id: "a-1", category: "Aggregates", name: "Granite (3/4 inch)", price: 295000, unit: "30-ton truck", trend: "up", supplier: "NigerianPrice" },
  { id: "a-2", category: "Aggregates", name: "Sharp Sand", price: 180000, unit: "20-ton truck", trend: "stable", supplier: "Jiji" },

  // Roofing
  { id: "r-1", category: "Roofing", name: "Aluminum Sheet (0.45mm)", price: 6500, unit: "meter", trend: "up", supplier: "Cutstruct" },
  { id: "r-2", category: "Roofing", name: "Stone Coated Tiles", price: 9500, unit: "sqm", trend: "stable", supplier: "Jiji" },
];

export const REGIONAL_WEATHER = [
  { city: "Lagos", temp: 31, condition: "Partly Cloudy", humidity: 78, risk: "Low", station: "NiMet" },
  { city: "Abuja", temp: 36, condition: "Sunny", humidity: 12, risk: "Moderate (Heat)", station: "NiMet" },
  { city: "Port Harcourt", temp: 29, condition: "Heavy Rain", humidity: 85, risk: "High (Flood)", station: "NiMet" },
  { city: "Kano", temp: 34, condition: "Dusty", humidity: 8, risk: "Moderate (Visibility)", station: "NiMet" },
];

export const COMPLIANCE_LOGS = [
  { id: "l-1", type: "NBC 2023", section: "4.2.1", status: "Pass", details: "Fire exit clearance verified." },
  { id: "l-2", type: "COREN Act", section: "Part II", status: "Warning", details: "Site Engineer license renewal due in 15 days." },
  { id: "l-3", type: "Safety", section: "PPE Policy", status: "Violation", details: "3 Workers detected without helmets at Zone B." },
];

export const PROJECTS = [
  { 
    id: "p1", 
    name: "Eko Atlantic Phase II", 
    location: "Victoria Island, Lagos",
    progress: 68,
    risk: 12,
    status: "On Track",
    budget: "₦4.2B",
    spent: "₦2.8B"
  },
  { 
    id: "p2", 
    name: "Lekki Deep Sea Port Storage", 
    location: "Ibeju-Lekki, Lagos",
    progress: 45,
    risk: 35,
    status: "Delayed",
    budget: "₦1.8B",
    spent: "₦0.9B"
  },
  { 
    id: "p3", 
    name: "Abuja Tech Hub Site B", 
    location: "Maitama, Abuja",
    progress: 92,
    risk: 5,
    status: "Near Completion",
    budget: "₦850M",
    spent: "₦780M"
  }
];
