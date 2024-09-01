export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  name: string;
  phone: string;
  status: "New Order" | "On Process" | "Complete" | "Cancelled";
  time: string;
  items: OrderItem[];
}

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

export const orderStatusList = ["All", "New Order", "On Process", "Completed"];

export const ordersList: Order[] = [
  // New Orders
  {
    name: "David Moore",
    phone: "+19876543210",
    status: "New Order",
    time: "11:00 AM, 08 Feb, 2024",
    items: [
      { name: "Spaghetti Bolognese", quantity: 1, price: 12 },
      { name: "Garlic Bread", quantity: 1, price: 3.5 },
      { name: "Caesar Salad", quantity: 2, price: 3.5 },
    ],
  },
  {
    name: "Michael Scott",
    phone: "+19876543214",
    status: "New Order",
    time: "03:00 PM, 08 Feb, 2024",
    items: [
      { name: "Pepperoni Pizza", quantity: 1, price: 11 },
      { name: "Mozzarella Sticks", quantity: 1, price: 5 },
      { name: "Garden Salad", quantity: 1, price: 4.5 },
    ],
  },
  {
    name: "Angela Martin",
    phone: "+19876543218",
    status: "New Order",
    time: "07:00 PM, 08 Feb, 2024",
    items: [
      { name: "Hawaiian Pizza", quantity: 1, price: 13 },
      { name: "Stuffed Mushrooms", quantity: 1, price: 5 },
      { name: "Caesar Salad", quantity: 1, price: 3.5 },
    ],
  },
  {
    name: "Oscar Martinez",
    phone: "+19876543222",
    status: "New Order",
    time: "11:00 PM, 08 Feb, 2024",
    items: [
      { name: "BBQ Chicken Pizza", quantity: 1, price: 13 },
      { name: "Cheesy Bread", quantity: 1, price: 4 },
      { name: "Greek Salad", quantity: 1, price: 5 },
    ],
  },
  {
    name: "Toby Flenderson",
    phone: "+19876543226",
    status: "New Order",
    time: "03:00 AM, 09 Feb, 2024",
    items: [
      { name: "Meat Lovers Pizza", quantity: 1, price: 14 },
      { name: "Buffalo Wings", quantity: 1, price: 6 },
      { name: "Coleslaw", quantity: 1, price: 3 },
    ],
  },
  // On Process
  {
    name: "Esther Howard",
    phone: "+19876543211",
    status: "On Process",
    time: "12:00 PM, 08 Feb, 2024",
    items: [
      { name: "Margherita Pizza", quantity: 1, price: 10 },
      { name: "Bruschetta", quantity: 1, price: 4.5 },
      { name: "Greek Salad", quantity: 1, price: 5 },
    ],
  },
  {
    name: "Pam Beesly",
    phone: "+19876543215",
    status: "On Process",
    time: "04:00 PM, 08 Feb, 2024",
    items: [
      { name: "BBQ Chicken Pizza", quantity: 1, price: 13 },
      { name: "Cheesy Bread", quantity: 1, price: 4 },
      { name: "Caprese Salad", quantity: 1, price: 5.5 },
    ],
  },
  {
    name: "Kevin Malone",
    phone: "+19876543219",
    status: "On Process",
    time: "08:00 PM, 08 Feb, 2024",
    items: [
      { name: "Four Cheese Pizza", quantity: 1, price: 12 },
      { name: "Garlic Breadsticks", quantity: 1, price: 3 },
      { name: "Greek Salad", quantity: 1, price: 5 },
    ],
  },
  {
    name: "Meredith Palmer",
    phone: "+19876543223",
    status: "On Process",
    time: "12:00 AM, 09 Feb, 2024",
    items: [
      { name: "Pepperoni Pizza", quantity: 1, price: 11 },
      { name: "Mozzarella Sticks", quantity: 1, price: 5 },
      { name: "Garden Salad", quantity: 1, price: 4.5 },
    ],
  },
  {
    name: "Creed Bratton",
    phone: "+19876543227",
    status: "On Process",
    time: "04:00 AM, 09 Feb, 2024",
    items: [
      { name: "Veggie Pizza", quantity: 1, price: 12 },
      { name: "Onion Rings", quantity: 1, price: 4 },
      { name: "Potato Salad", quantity: 1, price: 3.5 },
    ],
  },
  // Completed Orders
  {
    name: "Jacob Jones",
    phone: "+19876543212",
    status: "Complete",
    time: "01:00 PM, 08 Feb, 2024",
    items: [
      { name: "Lasagna", quantity: 1, price: 15 },
      { name: "Garlic Knots", quantity: 1, price: 3 },
      { name: "House Salad", quantity: 1, price: 4 },
    ],
  },
  {
    name: "Jim Halpert",
    phone: "+19876543216",
    status: "Complete",
    time: "05:00 PM, 08 Feb, 2024",
    items: [
      { name: "Meat Lovers Pizza", quantity: 1, price: 14 },
      { name: "Buffalo Wings", quantity: 1, price: 6 },
      { name: "Coleslaw", quantity: 1, price: 3 },
    ],
  },
  {
    name: "Stanley Hudson",
    phone: "+19876543220",
    status: "Complete",
    time: "09:00 PM, 08 Feb, 2024",
    items: [
      { name: "Buffalo Chicken Pizza", quantity: 1, price: 14 },
      { name: "Fried Calamari", quantity: 1, price: 7 },
      { name: "House Salad", quantity: 1, price: 4 },
    ],
  },
  {
    name: "Ryan Howard",
    phone: "+19876543224",
    status: "Complete",
    time: "01:00 AM, 09 Feb, 2024",
    items: [
      { name: "Lasagna", quantity: 1, price: 15 },
      { name: "Garlic Knots", quantity: 1, price: 3 },
      { name: "House Salad", quantity: 1, price: 4 },
    ],
  },
  {
    name: "Darryl Philbin",
    phone: "+19876543228",
    status: "Complete",
    time: "05:00 AM, 09 Feb, 2024",
    items: [
      { name: "Hawaiian Pizza", quantity: 1, price: 13 },
      { name: "Stuffed Mushrooms", quantity: 1, price: 5 },
      { name: "Caesar Salad", quantity: 1, price: 3.5 },
    ],
  },
  // Cancelled Orders
  {
    name: "Courtney Henry",
    phone: "+19876543213",
    status: "Cancelled",
    time: "02:00 PM, 08 Feb, 2024",
    items: [
      { name: "Chicken Alfredo", quantity: 1, price: 14 },
      { name: "Breadsticks", quantity: 1, price: 2.5 },
      { name: "Caesar Salad", quantity: 1, price: 3.5 },
    ],
  },
  {
    name: "Dwight Schrute",
    phone: "+19876543217",
    status: "Cancelled",
    time: "06:00 PM, 08 Feb, 2024",
    items: [
      { name: "Veggie Pizza", quantity: 1, price: 12 },
      { name: "Onion Rings", quantity: 1, price: 4 },
      { name: "Potato Salad", quantity: 1, price: 3.5 },
    ],
  },
  {
    name: "Phyllis Vance",
    phone: "+19876543221",
    status: "Cancelled",
    time: "10:00 PM, 08 Feb, 2024",
    items: [
      { name: "Margherita Pizza", quantity: 1, price: 10 },
      { name: "Bruschetta", quantity: 1, price: 4.5 },
      { name: "Caprese Salad", quantity: 1, price: 5.5 },
    ],
  },
  {
    name: "Kelly Kapoor",
    phone: "+19876543225",
    status: "Cancelled",
    time: "02:00 AM, 09 Feb, 2024",
    items: [
      { name: "Chicken Alfredo", quantity: 1, price: 14 },
      { name: "Breadsticks", quantity: 1, price: 2.5 },
      { name: "Caesar Salad", quantity: 1, price: 3.5 },
    ],
  },
  {
    name: "Jan Levinson",
    phone: "+19876543229",
    status: "Cancelled",
    time: "06:00 AM, 09 Feb, 2024",
    items: [
      { name: "Four Cheese Pizza", quantity: 1, price: 12 },
      { name: "Garlic Breadsticks", quantity: 1, price: 3 },
      { name: "Greek Salad", quantity: 1, price: 5 },
    ],
  },
];
