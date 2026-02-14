/** Format amount as Indonesian Rupiah (IDR). */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export type OrderStatus = Order["status"];

export interface Order {
  orderId: string;
  customerName: string;
  phoneNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "New Order" | "Pending" | "On Process" | "Completed" | "Cancelled";
  createdAt: string;
  pickupDate?: string; // Optional pickup/delivery date
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case "New Order":
      return "bg-yellow-100 text-yellow-800 ";
    case "Pending":
      return "bg-purple-100 text-purple-800";
    case "On Process":
      return "bg-orange-100 text-orange-800";
    case "Completed":
      return "bg-green-100 text-green-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "";
  }
};

export const navigationBarLinks = [
  {
    imgURLActive: "/assets/dashboard-active.svg",
    imgURL: "/assets/dashboard.svg",
    route: "/",
    label: "Dashboard",
  },
  {
    imgURLActive: "/assets/order-active.svg",
    imgURL: "/assets/order.svg",
    route: "/order",
    label: "Order List",
  },
  {
    imgURLActive: "/assets/product-active.svg",
    imgURL: "/assets/product.svg",
    route: "/product",
    label: "Manage Products",
  },
  {
    imgURLActive: "/assets/ingredients-active.svg",
    imgURL: "/assets/ingredients.svg",
    route: "/ingredients",
    label: "Ingredients",
  },
  {
    imgURLActive: "/assets/ingredientslot-active.svg",
    imgURL: "/assets/ingredientslot.svg",
    route: "/lots",
    label: "Ingredient Lots",
  },
  {
    imgURLActive: "/assets/whatsapp-active.svg",
    imgURL: "/assets/whatsapp.svg",
    route: "/whatsapp-messages",
    label: "WhatsApp Messages",
  },
  {
    imgURLActive: "/assets/bakesheet_active.svg",
    imgURL: "/assets/bakesheet.svg",
    route: "/bake-sheet",
    label: "Bake Sheet",
  },
  {
    imgURLActive: "/assets/expiry_active.svg",
    imgURL: "/assets/expiry.svg",
    route: "/expiry",
    label: "Expiry",
  },
  {
    imgURLActive: "/assets/history-active.svg",
    imgURL: "/assets/history.svg",
    route: "/logs",
    label: "Logs",
  },
];

export const bakeryIngredients = [
  // Flour category
  {
    name: "All-Purpose Flour",
    price: 2.99,
    category: "Flour",
    imgURL: "",
  },
  {
    name: "Whole Wheat Flour",
    price: 3.49,
    category: "Flour",
    imgURL: "",
  },
  {
    name: "Bread Flour",
    price: 4.29,
    category: "Flour",
    imgURL: "",
  },
  // Leavening Agents category
  {
    name: "Baking Powder",
    price: 1.99,
    category: "Leavening Agents",
    imgURL: "",
  },
  {
    name: "Baking Soda",
    price: 0.99,
    category: "Leavening Agents",
    imgURL: "",
  },
  {
    name: "Active Dry Yeast",
    price: 4.99,
    category: "Leavening Agents",
    imgURL: "",
  },
  // Sweeteners category
  {
    name: "Granulated Sugar",
    price: 2.49,
    category: "Sweeteners",
    imgURL: "",
  },
  {
    name: "Brown Sugar",
    price: 2.69,
    category: "Sweeteners",
    imgURL: "",
  },
  {
    name: "Powdered Sugar",
    price: 2.89,
    category: "Sweeteners",
    imgURL: "",
  },
  // Seasonings category
  {
    name: "Salt",
    price: 0.79,
    category: "Seasonings",
    imgURL: "",
  },
  // Dairy category
  {
    name: "Unsalted Butter",
    price: 3.99,
    category: "Dairy",
    imgURL: "",
  },
  {
    name: "Whole Milk",
    price: 2.99,
    category: "Dairy",
    imgURL: "",
  },
  {
    name: "Heavy Cream",
    price: 4.49,
    category: "Dairy",
    imgURL: "",
  },
  {
    name: "Eggs",
    price: 2.99,
    category: "Dairy",
    imgURL: "",
  },
  // Flavorings category
  {
    name: "Vanilla Extract",
    price: 5.99,
    category: "Flavorings",
    imgURL: "",
  },
  {
    name: "Cocoa Powder",
    price: 3.99,
    category: "Flavorings",
    imgURL: "",
  },
  // Add-ins category
  {
    name: "Chocolate Chips",
    price: 2.99,
    category: "Add-ins",
    imgURL: "",
  },
  {
    name: "Raisins",
    price: 2.49,
    category: "Add-ins",
    imgURL: "",
  },
  {
    name: "Almonds",
    price: 5.99,
    category: "Add-ins",
    imgURL: "",
  },
  {
    name: "Walnuts",
    price: 6.49,
    category: "Add-ins",
    imgURL: "",
  },
  // Honey category
  {
    name: "Honey",
    price: 5.99,
    category: "Honey",
    imgURL: "",
  },
  {
    name: "Honeycomb",
    price: 7.99,
    category: "Honey",
    imgURL: "",
  },
  {
    name: "Raw Honey",
    price: 6.49,
    category: "Honey",
    imgURL: "",
  },
  {
    name: "Manuka Honey",
    price: 9.99,
    category: "Honey",
    imgURL: "",
  },
  // Spices category
  {
    name: "Cinnamon",
    price: 1.99,
    category: "Spices",
    imgURL: "",
  },
  {
    name: "Nutmeg",
    price: 2.49,
    category: "Spices",
    imgURL: "",
  },
  {
    name: "Ginger",
    price: 1.99,
    category: "Spices",
    imgURL: "",
  },
  // Nuts category
  {
    name: "Pecans",
    price: 6.99,
    category: "Nuts",
    imgURL: "",
  },
  {
    name: "Cashews",
    price: 5.99,
    category: "Nuts",
    imgURL: "",
  },
  {
    name: "Macadamia Nuts",
    price: 8.99,
    category: "Nuts",
    imgURL: "",
  },
  // Seeds category
  {
    name: "Chia Seeds",
    price: 4.99,
    category: "Seeds",
    imgURL: "",
  },
  {
    name: "Flax Seeds",
    price: 3.99,
    category: "Seeds",
    imgURL: "",
  },
  {
    name: "Pumpkin Seeds",
    price: 5.49,
    category: "Seeds",
    imgURL: "",
  },
  // Dried Fruits category
  {
    name: "Dried Apricots",
    price: 3.99,
    category: "Dried Fruits",
    imgURL: "",
  },
  {
    name: "Dried Cranberries",
    price: 2.99,
    category: "Dried Fruits",
    imgURL: "",
  },
  {
    name: "Dried Figs",
    price: 4.49,
    category: "Dried Fruits",
    imgURL: "",
  },
  // Extracts category
  {
    name: "Almond Extract",
    price: 3.99,
    category: "Extracts",
    imgURL: "",
  },
  {
    name: "Lemon Extract",
    price: 4.49,
    category: "Extracts",
    imgURL: "",
  },
  {
    name: "Peppermint Extract",
    price: 3.99,
    category: "Extracts",
    imgURL: "",
  },
  // Chocolate category
  {
    name: "Dark Chocolate",
    price: 2.99,
    category: "Chocolate",
    imgURL: "",
  },
  {
    name: "Milk Chocolate",
    price: 2.49,
    category: "Chocolate",
    imgURL: "",
  },
  {
    name: "White Chocolate",
    price: 2.99,
    category: "Chocolate",
    imgURL: "",
  },
  // Cocoa category
  {
    name: "Dutch Process Cocoa",
    price: 3.99,
    category: "Cocoa",
    imgURL: "",
  },
  {
    name: "Natural Cocoa",
    price: 3.49,
    category: "Cocoa",
    imgURL: "",
  },
  // Yeast category
  {
    name: "Instant Yeast",
    price: 4.99,
    category: "Yeast",
    imgURL: "",
  },
  {
    name: "Fresh Yeast",
    price: 5.49,
    category: "Yeast",
    imgURL: "",
  },
  // Baking Powder category
  {
    name: "Double-Acting Baking Powder",
    price: 2.99,
    category: "Baking Powder",
    imgURL: "",
  },
  {
    name: "Single-Acting Baking Powder",
    price: 2.49,
    category: "Baking Powder",
    imgURL: "",
  },
  // Baking Soda category
  {
    name: "Arm & Hammer Baking Soda",
    price: 0.99,
    category: "Baking Soda",
    imgURL: "",
  },
  {
    name: "Bob's Red Mill Baking Soda",
    price: 1.49,
    category: "Baking Soda",
    imgURL: "",
  },
  // Salt category
  {
    name: "Kosher Salt",
    price: 1.99,
    category: "Salt",
    imgURL: "",
  },
  {
    name: "Sea Salt",
    price: 2.49,
    category: "Salt",
    imgURL: "",
  },
  {
    name: "Himalayan Pink Salt",
    price: 3.99,
    category: "Salt",
    imgURL: "",
  },
  // Molasses category
  {
    name: "Blackstrap Molasses",
    price: 3.99,
    category: "Molasses",
    imgURL: "",
  },
  {
    name: "Light Molasses",
    price: 2.99,
    category: "Molasses",
    imgURL: "",
  },
  {
    name: "Dark Molasses",
    price: 3.49,
    category: "Molasses",
    imgURL: "",
  },
  // Corn Syrup category
  {
    name: "Light Corn Syrup",
    price: 2.99,
    category: "Corn Syrup",
    imgURL: "",
  },
  {
    name: "Dark Corn Syrup",
    price: 3.49,
    category: "Corn Syrup",
    imgURL: "",
  },
  // Maple Syrup category
  {
    name: "Grade A Maple Syrup",
    price: 6.99,
    category: "Maple Syrup",
    imgURL: "",
  },
  {
    name: "Grade B Maple Syrup",
    price: 5.99,
    category: "Maple Syrup",
    imgURL: "",
  },
  {
    name: "Amber Maple Syrup",
    price: 7.49,
    category: "Maple Syrup",
    imgURL: "",
  },
  // Vanilla category
  {
    name: "Madagascar Vanilla",
    price: 8.99,
    category: "Vanilla",
    imgURL: "",
  },
  {
    name: "Mexican Vanilla",
    price: 7.99,
    category: "Vanilla",
    imgURL: "",
  },
  {
    name: "Tahitian Vanilla",
    price: 9.49,
    category: "Vanilla",
    imgURL: "",
  },
  // Cinnamon category
  {
    name: "Ceylon Cinnamon",
    price: 4.99,
    category: "Cinnamon",
    imgURL: "",
  },
  {
    name: "Cassia Cinnamon",
    price: 3.99,
    category: "Cinnamon",
    imgURL: "",
  },
  {
    name: "Saigon Cinnamon",
    price: 5.49,
    category: "Cinnamon",
    imgURL: "",
  },
  // Nutmeg category
  {
    name: "Whole Nutmeg",
    price: 3.99,
    category: "Nutmeg",
    imgURL: "",
  },
  {
    name: "Ground Nutmeg",
    price: 2.99,
    category: "Nutmeg",
    imgURL: "",
  },
  // Ginger category
  {
    name: "Ground Ginger",
    price: 2.49,
    category: "Ginger",
    imgURL: "",
  },
  {
    name: "Crystallized Ginger",
    price: 3.99,
    category: "Ginger",
    imgURL: "",
  },
  // Cloves category
  {
    name: "Whole Cloves",
    price: 3.49,
    category: "Cloves",
    imgURL: "",
  },
  {
    name: "Ground Cloves",
    price: 2.99,
    category: "Cloves",
    imgURL: "",
  },
  // Allspice category
  {
    name: "Whole Allspice",
    price: 3.99,
    category: "Allspice",
    imgURL: "",
  },
  {
    name: "Ground Allspice",
    price: 2.99,
    category: "Allspice",
    imgURL: "",
  },
  // Cardamom category
  {
    name: "Green Cardamom",
    price: 4.99,
    category: "Cardamom",
    imgURL: "",
  },
  {
    name: "Black Cardamom",
    price: 5.49,
    category: "Cardamom",
    imgURL: "",
  },
  // Anise category
  {
    name: "Star Anise",
    price: 3.99,
    category: "Anise",
    imgURL: "",
  },
  {
    name: "Anise Seeds",
    price: 2.99,
    category: "Anise",
    imgURL: "",
  },
  // Coconut category
  {
    name: "Shredded Coconut",
    price: 2.99,
    category: "Coconut",
    imgURL: "",
  },
  {
    name: "Coconut Flakes",
    price: 3.49,
    category: "Coconut",
    imgURL: "",
  },
  // Oats category
  {
    name: "Rolled Oats",
    price: 2.99,
    category: "Oats",
    imgURL: "",
  },
  {
    name: "Steel-Cut Oats",
    price: 3.49,
    category: "Oats",
    imgURL: "",
  },
  // Cornmeal category
  {
    name: "Yellow Cornmeal",
    price: 2.99,
    category: "Cornmeal",
    imgURL: "",
  },
  {
    name: "White Cornmeal",
    price: 3.49,
    category: "Cornmeal",
    imgURL: "",
  },
  // Rice Flour category
  {
    name: "White Rice Flour",
    price: 3.99,
    category: "Rice Flour",
    imgURL: "",
  },
  {
    name: "Brown Rice Flour",
    price: 4.49,
    category: "Rice Flour",
    imgURL: "",
  },
  // Almond Flour category
  {
    name: "Blanched Almond Flour",
    price: 5.99,
    category: "Almond Flour",
    imgURL: "",
  },
  {
    name: "Unblanched Almond Flour",
    price: 6.49,
    category: "Almond Flour",
    imgURL: "",
  },
  // Coconut Flour category
  {
    name: "Organic Coconut Flour",
    price: 4.99,
    category: "Coconut Flour",
    imgURL: "",
  },
  {
    name: "Non-Organic Coconut Flour",
    price: 3.99,
    category: "Coconut Flour",
    imgURL: "",
  },
];

export const bakeryCategories = [
  {
    name: "Flours",
    imgURL: "",
  },
  {
    name: "Sugars",
    imgURL: "",
  },
  {
    name: "Leavening Agents",
    imgURL: "",
  },
  {
    name: "Fats",
    imgURL: "",
  },
  {
    name: "Liquids",
    imgURL: "",
  },
  {
    name: "Flavorings",
    imgURL: "",
  },
  {
    name: "Add-ins",
    imgURL: "",
  },
  {
    name: "Dairy",
    imgURL: "",
  },
  {
    name: "Spices",
    imgURL: "",
  },
  {
    name: "Nuts",
    imgURL: "",
  },
  {
    name: "Seeds",
    imgURL: "",
  },
  {
    name: "Dried Fruits",
    imgURL: "",
  },
  {
    name: "Extracts",
    imgURL: "",
  },
  {
    name: "Chocolate",
    imgURL: "",
  },
  {
    name: "Cocoa",
    imgURL: "",
  },
  {
    name: "Yeast",
    imgURL: "",
  },
  {
    name: "Baking Powder",
    imgURL: "",
  },
  {
    name: "Baking Soda",
    imgURL: "",
  },
  {
    name: "Salt",
    imgURL: "",
  },
  {
    name: "Honey",
    imgURL: "",
  },
  {
    name: "Molasses",
    imgURL: "",
  },
  {
    name: "Corn Syrup",
    imgURL: "",
  },
  {
    name: "Maple Syrup",
    imgURL: "",
  },
  {
    name: "Vanilla",
    imgURL: "",
  },
  {
    name: "Cinnamon",
    imgURL: "",
  },
  {
    name: "Nutmeg",
    imgURL: "",
  },
  {
    name: "Ginger",
    imgURL: "",
  },
  {
    name: "Cloves",
    imgURL: "",
  },
  {
    name: "Allspice",
    imgURL: "",
  },
  {
    name: "Cardamom",
    imgURL: "",
  },
  {
    name: "Anise",
    imgURL: "",
  },
  {
    name: "Coconut",
    imgURL: "",
  },
  {
    name: "Oats",
    imgURL: "",
  },
  {
    name: "Cornmeal",
    imgURL: "",
  },
  {
    name: "Rice Flour",
    imgURL: "",
  },
  {
    name: "Almond Flour",
    imgURL: "",
  },
  {
    name: "Coconut Flour",
    imgURL: "",
  },
];

export const orderStatusList = [
  "All",
  "New Order",
  "Pending",
  "On Process",
  "Completed",
  "Cancelled",
];

export const ingredientUnits = [
  "kg",
  "g",
  "L",
  "ml",
  "pcs",
  "cups",
  "tbsp",
  "tsp",
];

export const dataChart = [
  {
    name: "Jan",
    revenue: 12000,
    order: 275, // 125 + 150
    customer: 125,
  },
  {
    name: "Feb",
    revenue: 13000,
    order: 255, // 135 + 120
    customer: 135,
  },
  {
    name: "Mar",
    revenue: 12500,
    order: 310, // 130 + 180
    customer: 130,
  },
  {
    name: "Apr",
    revenue: 14000,
    order: 255, // 145 + 110
    customer: 145,
  },
  {
    name: "May",
    revenue: 13500,
    order: 310, // 140 + 170
    customer: 140,
  },
  {
    name: "Jun",
    revenue: 15000,
    order: 285, // 155 + 130
    customer: 155,
  },
  {
    name: "Jul",
    revenue: 14500,
    order: 310, // 150 + 160
    customer: 150,
  },
  {
    name: "Aug",
    revenue: 16000,
    order: 305, // 165 + 140
    customer: 165,
  },
  {
    name: "Sep",
    revenue: 15500,
    order: 350, // 160 + 190
    customer: 160,
  },
  {
    name: "Oct",
    revenue: 17000,
    order: 275, // 175 + 100
    customer: 175,
  },
  {
    name: "Nov",
    revenue: 16500,
    order: 370, // 170 + 200
    customer: 170,
  },
  {
    name: "Dec",
    revenue: 18000,
    order: 315, // 185 + 130
    customer: 185,
  },
];

export type OrderStatusDashboard = "Paid" | "Pending" | "Unpaid";

export interface OrderTableData {
  id: string;
  customer: string;
  product: string;
  amount: string;
  vendor: string;
  status: OrderStatusDashboard;
  rating: string;
}

export const ordersTableData: OrderTableData[] = [
  {
    id: "#VZ2112",
    customer: "Alex Smith",
    product: "Clothes",
    amount: "$109.00",
    vendor: "Zoetic Fashion",
    status: "Paid",
    rating: "5.0 (61 votes)",
  },
  {
    id: "#VZ2111",
    customer: "Jansh Brown",
    product: "Kitchen Storage",
    amount: "$149.00",
    vendor: "Micro Design",
    status: "Pending",
    rating: "4.5 (61 votes)",
  },
  {
    id: "#VZ2109",
    customer: "Ayaan Bowen",
    product: "Bike Accessories",
    amount: "$215.00",
    vendor: "Nesta Technologies",
    status: "Paid",
    rating: "4.9 (89 votes)",
  },
  {
    id: "#VZ2108",
    customer: "Prezy Mark",
    product: "Furniture",
    amount: "$199.00",
    vendor: "Syntyce Solutions",
    status: "Unpaid",
    rating: "4.3 (47 votes)",
  },
  {
    id: "#VZ2107",
    customer: "Vihan Hudda",
    product: "Bags and Wallets",
    amount: "$330.00",
    vendor: "iTest Factory",
    status: "Paid",
    rating: "4.7 (61 votes)",
  },
  {
    id: "#VZ2106",
    customer: "Liam Johnson",
    product: "Electronics",
    amount: "$450.00",
    vendor: "Tech World",
    status: "Pending",
    rating: "4.8 (72 votes)",
  },
  {
    id: "#VZ2105",
    customer: "Emma Wilson",
    product: "Books",
    amount: "$75.00",
    vendor: "Book Haven",
    status: "Paid",
    rating: "4.9 (54 votes)",
  },
  {
    id: "#VZ2104",
    customer: "Olivia Brown",
    product: "Toys",
    amount: "$120.00",
    vendor: "Toy Kingdom",
    status: "Unpaid",
    rating: "4.6 (38 votes)",
  },
  {
    id: "#VZ2103",
    customer: "Noah Davis",
    product: "Sports Equipment",
    amount: "$300.00",
    vendor: "Sporty Goods",
    status: "Paid",
    rating: "4.7 (45 votes)",
  },
  {
    id: "#VZ2102",
    customer: "Ava Martinez",
    product: "Beauty Products",
    amount: "$95.00",
    vendor: "Beauty Bliss",
    status: "Pending",
    rating: "4.5 (50 votes)",
  },
  {
    id: "#VZ2101",
    customer: "Sophia Garcia",
    product: "Home Decor",
    amount: "$180.00",
    vendor: "Decor Delight",
    status: "Unpaid",
    rating: "4.4 (40 votes)",
  },
  {
    id: "#VZ2100",
    customer: "Mason Rodriguez",
    product: "Gardening Tools",
    amount: "$220.00",
    vendor: "Garden Pro",
    status: "Paid",
    rating: "4.8 (60 votes)",
  },
];
