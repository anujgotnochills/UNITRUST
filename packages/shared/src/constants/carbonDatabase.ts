/**
 * Predefined Carbon Footprint Database
 * Carbon scores are in metric tons CO₂ equivalent (tCO₂e)
 * Sources: Apple Environmental Reports, EPA, IEA estimates (approximated for demo)
 */

export type SustainabilityTag = 'Green' | 'Neutral' | 'High Impact';

export interface CarbonEntry {
  keywords: string[];
  category: string;
  carbonScore: number;        // metric tons CO₂e
  sustainabilityTag: SustainabilityTag;
  label: string;              // human-readable match label
}

export const CARBON_DATABASE: CarbonEntry[] = [
  // ═══════════════════════════════════════
  // ELECTRONICS
  // ═══════════════════════════════════════

  // Computers & Laptops
  { keywords: ['macbook', 'laptop', 'notebook'],            category: 'Electronics', carbonScore: 0.42,  sustainabilityTag: 'Neutral',     label: 'Laptop / MacBook' },
  { keywords: ['desktop', 'pc', 'computer', 'imac'],        category: 'Electronics', carbonScore: 0.55,  sustainabilityTag: 'Neutral',     label: 'Desktop Computer' },
  { keywords: ['server', 'workstation'],                     category: 'Electronics', carbonScore: 1.20,  sustainabilityTag: 'High Impact', label: 'Server / Workstation' },

  // Phones & Tablets
  { keywords: ['iphone', 'smartphone', 'phone', 'mobile'],  category: 'Electronics', carbonScore: 0.07,  sustainabilityTag: 'Green',       label: 'Smartphone' },
  { keywords: ['ipad', 'tablet'],                            category: 'Electronics', carbonScore: 0.15,  sustainabilityTag: 'Neutral',     label: 'Tablet' },

  // Displays
  { keywords: ['monitor', 'display', 'screen'],             category: 'Electronics', carbonScore: 0.35,  sustainabilityTag: 'Neutral',     label: 'Monitor / Display' },
  { keywords: ['tv', 'television'],                          category: 'Electronics', carbonScore: 0.50,  sustainabilityTag: 'Neutral',     label: 'Television' },
  { keywords: ['projector'],                                 category: 'Electronics', carbonScore: 0.40,  sustainabilityTag: 'Neutral',     label: 'Projector' },

  // Audio
  { keywords: ['airpods', 'headphones', 'earbuds', 'earphones'], category: 'Electronics', carbonScore: 0.03, sustainabilityTag: 'Green',   label: 'Headphones / Earbuds' },
  { keywords: ['speaker', 'soundbar', 'homepod'],           category: 'Electronics', carbonScore: 0.12,  sustainabilityTag: 'Neutral',     label: 'Speaker / Soundbar' },

  // Gaming
  { keywords: ['ps5', 'playstation', 'xbox', 'nintendo', 'gaming console', 'console'], category: 'Electronics', carbonScore: 0.38, sustainabilityTag: 'Neutral', label: 'Gaming Console' },

  // Peripherals & Accessories
  { keywords: ['camera', 'dslr', 'gopro', 'webcam'],        category: 'Electronics', carbonScore: 0.20,  sustainabilityTag: 'Neutral',     label: 'Camera' },
  { keywords: ['printer', 'scanner'],                        category: 'Electronics', carbonScore: 0.30,  sustainabilityTag: 'Neutral',     label: 'Printer / Scanner' },
  { keywords: ['keyboard'],                                  category: 'Electronics', carbonScore: 0.02,  sustainabilityTag: 'Green',       label: 'Keyboard' },
  { keywords: ['mouse', 'trackpad'],                         category: 'Electronics', carbonScore: 0.02,  sustainabilityTag: 'Green',       label: 'Mouse / Trackpad' },
  { keywords: ['charger', 'adapter', 'power bank'],          category: 'Electronics', carbonScore: 0.01,  sustainabilityTag: 'Green',       label: 'Charger / Power Bank' },
  { keywords: ['router', 'modem', 'wifi'],                   category: 'Electronics', carbonScore: 0.08,  sustainabilityTag: 'Green',       label: 'Router / Modem' },
  { keywords: ['smartwatch', 'watch', 'apple watch', 'fitbit'], category: 'Electronics', carbonScore: 0.04, sustainabilityTag: 'Green',     label: 'Smartwatch' },
  { keywords: ['drone'],                                     category: 'Electronics', carbonScore: 0.25,  sustainabilityTag: 'Neutral',     label: 'Drone' },
  { keywords: ['hard drive', 'ssd', 'hdd', 'storage', 'usb', 'pendrive', 'flash drive'], category: 'Electronics', carbonScore: 0.03, sustainabilityTag: 'Green', label: 'Storage Device' },
  { keywords: ['gpu', 'graphics card'],                      category: 'Electronics', carbonScore: 0.15,  sustainabilityTag: 'Neutral',     label: 'Graphics Card' },
  { keywords: ['ram', 'memory'],                             category: 'Electronics', carbonScore: 0.05,  sustainabilityTag: 'Green',       label: 'RAM Module' },

  // ═══════════════════════════════════════
  // VEHICLES
  // ═══════════════════════════════════════
  { keywords: ['electric car', 'ev', 'tesla'],               category: 'Vehicle', carbonScore: 3.50,  sustainabilityTag: 'High Impact', label: 'Electric Vehicle' },
  { keywords: ['car', 'sedan', 'suv', 'hatchback', 'coupe'], category: 'Vehicle', carbonScore: 6.00,  sustainabilityTag: 'High Impact', label: 'Car / SUV' },
  { keywords: ['motorcycle', 'bike', 'scooter', 'moped'],    category: 'Vehicle', carbonScore: 1.80,  sustainabilityTag: 'High Impact', label: 'Motorcycle / Scooter' },
  { keywords: ['bicycle', 'cycle', 'e-bike'],                category: 'Vehicle', carbonScore: 0.05,  sustainabilityTag: 'Green',       label: 'Bicycle' },
  { keywords: ['truck', 'lorry', 'pickup'],                  category: 'Vehicle', carbonScore: 12.00, sustainabilityTag: 'High Impact', label: 'Truck' },
  { keywords: ['bus'],                                       category: 'Vehicle', carbonScore: 20.00, sustainabilityTag: 'High Impact', label: 'Bus' },
  { keywords: ['boat', 'yacht', 'ship'],                     category: 'Vehicle', carbonScore: 15.00, sustainabilityTag: 'High Impact', label: 'Boat / Yacht' },
  { keywords: ['tractor', 'farm'],                           category: 'Vehicle', carbonScore: 8.00,  sustainabilityTag: 'High Impact', label: 'Tractor' },

  // ═══════════════════════════════════════
  // DOCUMENTS
  // ═══════════════════════════════════════
  { keywords: ['deed', 'title'],                             category: 'Document', carbonScore: 0.02, sustainabilityTag: 'Green', label: 'Title Deed' },
  { keywords: ['certificate', 'diploma', 'degree'],          category: 'Document', carbonScore: 0.01, sustainabilityTag: 'Green', label: 'Certificate / Diploma' },
  { keywords: ['passport', 'id', 'license', 'permit'],       category: 'Document', carbonScore: 0.01, sustainabilityTag: 'Green', label: 'ID / License' },
  { keywords: ['contract', 'agreement', 'bond'],             category: 'Document', carbonScore: 0.01, sustainabilityTag: 'Green', label: 'Legal Contract' },
  { keywords: ['invoice', 'receipt', 'bill'],                 category: 'Document', carbonScore: 0.005, sustainabilityTag: 'Green', label: 'Invoice / Receipt' },
  { keywords: ['will', 'testament'],                          category: 'Document', carbonScore: 0.01, sustainabilityTag: 'Green', label: 'Will / Testament' },

  // ═══════════════════════════════════════
  // PROPERTY
  // ═══════════════════════════════════════
  { keywords: ['apartment', 'flat', 'house', 'villa', 'bungalow', 'home'], category: 'Property', carbonScore: 50.00, sustainabilityTag: 'High Impact', label: 'Residential Property' },
  { keywords: ['plot', 'land', 'acre'],                      category: 'Property', carbonScore: 0.10,  sustainabilityTag: 'Green',       label: 'Land / Plot' },
  { keywords: ['office', 'commercial', 'shop', 'store'],     category: 'Property', carbonScore: 35.00, sustainabilityTag: 'High Impact', label: 'Commercial Property' },
  { keywords: ['warehouse', 'godown', 'factory'],            category: 'Property', carbonScore: 25.00, sustainabilityTag: 'High Impact', label: 'Warehouse / Factory' },
  { keywords: ['garage', 'parking'],                         category: 'Property', carbonScore: 5.00,  sustainabilityTag: 'High Impact', label: 'Garage / Parking' },
  { keywords: ['farm', 'farmland', 'agricultural'],          category: 'Property', carbonScore: 2.00,  sustainabilityTag: 'High Impact', label: 'Farmland' },

  // ═══════════════════════════════════════
  // OTHER / MISCELLANEOUS
  // ═══════════════════════════════════════
  { keywords: ['furniture', 'chair', 'table', 'desk', 'sofa', 'couch', 'bed'], category: 'Other', carbonScore: 0.20, sustainabilityTag: 'Neutral', label: 'Furniture' },
  { keywords: ['painting', 'art', 'artwork', 'sculpture'],   category: 'Other', carbonScore: 0.05, sustainabilityTag: 'Green',   label: 'Art / Painting' },
  { keywords: ['jewelry', 'ring', 'necklace', 'bracelet', 'gold', 'silver', 'diamond'], category: 'Other', carbonScore: 0.08, sustainabilityTag: 'Green', label: 'Jewelry' },
  { keywords: ['bag', 'backpack', 'luggage', 'suitcase'],    category: 'Other', carbonScore: 0.10, sustainabilityTag: 'Green',   label: 'Bag / Luggage' },
  { keywords: ['shoes', 'sneakers', 'boots', 'sandals'],     category: 'Other', carbonScore: 0.14, sustainabilityTag: 'Neutral', label: 'Footwear' },
  { keywords: ['guitar', 'piano', 'violin', 'instrument', 'drums'], category: 'Other', carbonScore: 0.15, sustainabilityTag: 'Neutral', label: 'Musical Instrument' },
  { keywords: ['book', 'textbook', 'novel'],                 category: 'Other', carbonScore: 0.01, sustainabilityTag: 'Green',   label: 'Book' },
  { keywords: ['clothing', 'jacket', 'coat', 'dress', 'suit'], category: 'Other', carbonScore: 0.08, sustainabilityTag: 'Green', label: 'Clothing / Apparel' },
  { keywords: ['toy', 'game', 'board game', 'lego'],         category: 'Other', carbonScore: 0.05, sustainabilityTag: 'Green',   label: 'Toy / Game' },
  { keywords: ['watch', 'clock'],                             category: 'Other', carbonScore: 0.06, sustainabilityTag: 'Green',   label: 'Watch / Clock' },
  { keywords: ['appliance', 'refrigerator', 'fridge', 'washing machine', 'dishwasher', 'microwave', 'oven', 'ac', 'air conditioner'], category: 'Other', carbonScore: 0.80, sustainabilityTag: 'Neutral', label: 'Home Appliance' },
  { keywords: ['bicycle helmet', 'sports', 'equipment', 'gym'], category: 'Other', carbonScore: 0.10, sustainabilityTag: 'Green', label: 'Sports Equipment' },
];

/**
 * Fallback carbon scores per category — used when no keyword match is found
 */
export const CATEGORY_DEFAULTS: Record<string, { carbonScore: number; sustainabilityTag: SustainabilityTag; label: string }> = {
  'Electronics': { carbonScore: 0.25, sustainabilityTag: 'Neutral',     label: 'General Electronics' },
  'Vehicle':     { carbonScore: 3.00, sustainabilityTag: 'High Impact', label: 'General Vehicle' },
  'Document':    { carbonScore: 0.01, sustainabilityTag: 'Green',       label: 'General Document' },
  'Property':    { carbonScore: 10.0, sustainabilityTag: 'High Impact', label: 'General Property' },
  'Other':       { carbonScore: 0.10, sustainabilityTag: 'Green',       label: 'Miscellaneous Item' },
};

/**
 * Global fallback when even the category doesn't match
 */
export const GLOBAL_FALLBACK = {
  carbonScore: 0.10,
  sustainabilityTag: 'Green' as SustainabilityTag,
  label: 'Unknown Item',
};
