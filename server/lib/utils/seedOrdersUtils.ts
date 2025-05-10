import { connectToDB } from "../mongoose";
import Order from "../models/order.model";

// Item data from JSON
const itemData = [
  { name: "kue manis", price: 4 },
  { name: "coba delet lagi", price: 3 },
  { name: "cheesecake", price: 8 },
  { name: "chiffon", price: 10 },
  { name: "Tepung terigu", price: 2 },
  { name: "roti c", price: 10 },
  { name: "roti b", price: 4 },
];

// Define the interface for an item
interface Item {
  name: string;
  price: number;
  quantity: number;
}

// Function to calculate subtotal, tax, and total
const calculateOrderValues = (items: Item[]) => {
  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1; // Assuming a 10% tax rate
  const total = subtotal + tax;
  return { subtotal, tax, total };
};

// Function to generate random items with random quantities
const generateRandomItems = (): Item[] => {
  const items: Item[] = [];
  const numberOfItems = Math.floor(Math.random() * itemData.length) + 1; // Random 1 to all items
  for (let i = 0; i < numberOfItems; i++) {
    const randomItem = itemData[Math.floor(Math.random() * itemData.length)];
    const randomQuantity = Math.floor(Math.random() * 5) + 1; // Random quantity between 1 and 5
    items.push({ ...randomItem, quantity: randomQuantity });
  }
  return items;
};

// Function to generate a random 10-digit phone number
const generateRandomPhoneNumber = () => {
  return `08${Math.floor(100000000 + Math.random() * 900000000)}`; // Ensures a 10-digit number
};

// Function to seed initial orders
export const seedOrders = async () => {
  await connectToDB();

  const customerNames = [
    "Alice Johnson",
    "Bob Smith",
    "Charlie Brown",
    "Diana Prince",
    "Ethan Hunt",
    "Fiona Gallagher",
    "George Clooney",
    "Hannah Montana",
    "Ian McKellen",
    "Jessica Alba",
    "Kevin Hart",
    "Liam Neeson",
    "Mila Kunis",
    "Natalie Portman",
    "Oscar Isaac",
    "Penelope Cruz",
    "Quentin Tarantino",
    "Rachel McAdams",
    "Samuel L. Jackson",
    "Tom Hanks",
    "Uma Thurman",
    "Vin Diesel",
    "Will Smith",
    "Xander Cage",
    "Yara Shahidi",
    "Zoe Saldana",
    "Aaron Paul",
    "Brie Larson",
    "Chris Hemsworth",
    "Daisy Ridley",
    "Emma Stone",
    "Freddie Mercury",
    "Gillian Anderson",
    "Hugh Jackman",
    "Isla Fisher",
    "Jack Black",
    "Kate Winslet",
    "Leonardo DiCaprio",
    "Margot Robbie",
    "Nicolas Cage",
    "Olivia Wilde",
    "Paul Rudd",
    "Queen Latifah",
    "Ryan Reynolds",
    "Scarlett Johansson",
    "Tina Fey",
    "Uzo Aduba",
    "Viola Davis",
    "Willem Dafoe",
    "Zach Galifianakis",
  ];

  const ordersData = Array.from({ length: 50 }, (_, index) => {
    const items = generateRandomItems();
    const { subtotal, tax, total } = calculateOrderValues(items);
    const customerName = customerNames[index];
    const phoneNumber = generateRandomPhoneNumber();
    return {
      customerName,
      phoneNumber,
      items,
      subtotal,
      tax,
      total,
      status: "New Order",
    };
  });

  for (const orderData of ordersData) {
    const order = new Order(orderData);
    await order.save();
  }

  console.log("All products have been added successfully.");
};
