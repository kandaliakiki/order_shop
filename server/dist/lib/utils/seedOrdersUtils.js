"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedOrders = void 0;
const mongoose_1 = require("../mongoose");
const order_model_1 = __importDefault(require("../models/order.model"));
// Item data from JSON
const itemData = [
    { name: "Sweet Cake", price: 4 },
    { name: "Chocolate Chip Cookie", price: 3 },
    { name: "Cheesecake", price: 8 },
    { name: "Chiffon", price: 10 },
    { name: "Wheat Flour", price: 2 },
    { name: "White Bread", price: 4 },
    { name: "Dry Bread", price: 4 },
];
// Function to calculate subtotal, tax, and total
const calculateOrderValues = (items) => {
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = subtotal * 0.1; // Assuming a 10% tax rate
    const total = subtotal + tax;
    return { subtotal, tax, total };
};
// Function to generate random items with random quantities
const generateRandomItems = () => {
    const items = [];
    const numberOfItems = Math.floor(Math.random() * itemData.length) + 1; // Random 1 to all items
    for (let i = 0; i < numberOfItems; i++) {
        const randomItem = itemData[Math.floor(Math.random() * itemData.length)];
        const randomQuantity = Math.floor(Math.random() * 5) + 1; // Random quantity between 1 and 5
        items.push(Object.assign(Object.assign({}, randomItem), { quantity: randomQuantity }));
    }
    return items;
};
// Function to generate a random 10-digit phone number
const generateRandomPhoneNumber = () => {
    return `08${Math.floor(100000000 + Math.random() * 900000000)}`; // Ensures a 10-digit number
};
// Function to generate a random date within a specific month
const generateRandomDateInMonth = (year, month) => {
    const startDate = new Date(year, month - 1, 1); // Month is 0-based in JavaScript
    const endDate = new Date(year, month, 0); // Last day of the month
    const randomDate = new Date(startDate.getTime() +
        Math.random() * (endDate.getTime() - startDate.getTime()));
    return randomDate;
};
// Function to seed initial orders
const seedOrders = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
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
        "Adam Sandler",
        "Brad Pitt",
        "Cate Blanchett",
        "Daniel Radcliffe",
        "Emma Watson",
        "Felicity Jones",
        "Gary Oldman",
        "Helen Mirren",
        "Idris Elba",
        "Jennifer Lawrence",
        "Keanu Reeves",
        "Lupita Nyong'o",
        "Michael Fassbender",
        "Natalie Dormer",
        "Orlando Bloom",
        "Patrick Stewart",
        "Quincy Jones",
        "Robert Downey Jr",
        "Sandra Bullock",
        "Timothée Chalamet",
        "Uma Thurman",
        "Viggo Mortensen",
        "Winona Ryder",
        "Xavier Dolan",
        "Yvonne Strahovski",
        "Zendaya",
        "Andrew Garfield",
        "Benedict Cumberbatch",
        "Charlize Theron",
        "Denzel Washington",
        "Emily Blunt",
        "Florence Pugh",
        "Gal Gadot",
        "Henry Cavill",
        "Iris Apatow",
        "Joaquin Phoenix",
        "Kristen Stewart",
        "Liam Hemsworth",
        "Margot Robbie",
        "Noah Centineo",
        "Pedro Pascal",
        "Rachel Brosnahan",
        "Sebastian Stan",
        "Tom Holland",
        "Uma Thurman",
        "Viola Davis",
        "Willem Dafoe",
        "Xochitl Gomez",
        "Yahya Abdul-Mateen II",
        "Zoe Kravitz",
        "Ana de Armas",
        "Billie Eilish",
        "Chris Evans",
        "Dwayne Johnson",
        "Elizabeth Olsen",
        "Finn Wolfhard",
        "Greta Gerwig",
        "Hailee Steinfeld",
        "Idris Elba",
        "Jake Gyllenhaal",
        "Katherine Langford",
        "Lucas Hedges",
        "Millie Bobby Brown",
        "Nicholas Hoult",
        "Olivia Cooke",
        "Paul Mescal",
        "Rami Malek",
        "Sydney Sweeney",
        "Timothée Chalamet",
        "Uma Thurman",
        "Viola Davis",
        "Willem Dafoe",
        "Xochitl Gomez",
        "Yahya Abdul-Mateen II",
    ];
    const ordersData = [];
    const months = [6, 7, 8, 9, 10, 11, 12]; // June to December 2025
    const ordersPerMonth = 20;
    for (const month of months) {
        for (let i = 0; i < ordersPerMonth; i++) {
            const items = generateRandomItems();
            const { subtotal, tax, total } = calculateOrderValues(items);
            const customerIndex = ((month - 6) * ordersPerMonth + i) % customerNames.length;
            const customerName = customerNames[customerIndex];
            const phoneNumber = generateRandomPhoneNumber();
            const createdAt = generateRandomDateInMonth(2025, month);
            ordersData.push({
                customerName,
                phoneNumber,
                items,
                subtotal,
                tax,
                total,
                status: "New Order",
                createdAt,
            });
        }
    }
    for (const orderData of ordersData) {
        const order = new order_model_1.default(orderData);
        yield order.save();
    }
    console.log("All orders have been added successfully.");
});
exports.seedOrders = seedOrders;
