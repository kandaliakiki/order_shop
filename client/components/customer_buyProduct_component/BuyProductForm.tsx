"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useProducts } from "../product_component/ProductContext";

// Mock product data
const availableProducts = [
  { id: "1", name: "Product A" },
  { id: "2", name: "Product B" },
  { id: "3", name: "Product C" },
  { id: "4", name: "Product D" },
];

export default function BuyProductForm() {
  const { products } = useProducts();
  const [formData, setFormData] = useState({
    orderName: "",
    phoneNum: "",
    pickupDate: new Date(),
    selectedProducts: [] as string[],
    notes: "",
  });
  const [currentSelection, setCurrentSelection] = useState<string>("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, pickupDate: date }));
    }
  };

  const handleAddProduct = () => {
    if (
      currentSelection &&
      !formData.selectedProducts.includes(currentSelection)
    ) {
      setFormData((prev) => ({
        ...prev,
        selectedProducts: [...prev.selectedProducts, currentSelection],
      }));
      setCurrentSelection("");
    }
  };

  const handleRemoveProduct = (productToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.filter(
        (product) => product !== productToRemove
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    // Here you would typically send the data to your backend
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Enhanced Product Order Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orderName">Order Name</Label>
            <Input
              id="orderName"
              name="orderName"
              value={formData.orderName}
              onChange={handleInputChange}
              placeholder="Enter order name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNum">Phone Number</Label>
            <Input
              id="phoneNum"
              name="phoneNum"
              value={formData.phoneNum}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <Label>Pickup Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`w-full justify-start text-left font-normal ${
                    !formData.pickupDate && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.pickupDate ? (
                    format(formData.pickupDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.pickupDate}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Product Selection</Label>
            <div className="flex space-x-2">
              <Select
                value={currentSelection}
                onValueChange={setCurrentSelection}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddProduct}>
                Add Product
              </Button>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Selected Products:</h3>
              <ul className="list-disc pl-5">
                {formData.selectedProducts.map((productId) => {
                  const product = products.find((p) => p._id === productId);
                  return (
                    <li
                      key={productId}
                      className="flex justify-between items-center mb-2"
                    >
                      <span>{product?.name}</span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveProduct(productId)}
                      >
                        Remove
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional notes..."
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSubmit}>
          Submit Order
        </Button>
      </CardFooter>
    </Card>
  );
}
