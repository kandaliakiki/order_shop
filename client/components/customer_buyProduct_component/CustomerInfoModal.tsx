import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { formatPrice } from "@/constants";

// Define the validation schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
});

const CustomerInfoModal = ({
  isOpen,
  setIsOpen,
  cartItems,
  subtotal,
  tax,
  total,
  onSubmit,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  cartItems: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  tax: number;
  total: number;
  onSubmit: (data: { name: string; phoneNumber: string }) => Promise<void>;
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const handleSubmit = async (data: { name: string; phoneNumber: string }) => {
    await onSubmit(data);
    form.reset();
  };

  const orderSummary = () => (
    <div className="my-4">
      <h3 className="font-bold">Order Summary</h3>
      {cartItems.map((item, index) => (
        <div key={index} className="flex justify-between">
          <span>
            {item.name} x {item.quantity}
          </span>
          <span>{formatPrice(item.price * item.quantity)}</span>
        </div>
      ))}
      <div className="flex justify-between mt-5">
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span>Tax</span>
        <span>{formatPrice(tax)}</span>
      </div>
      <div className="flex justify-between font-bold">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter Your Details</DialogTitle>
          <DialogDescription>
            Please enter your name and phone number to complete the order.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your name"
                      {...field}
                      className="w-full no-focus"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter your phone number"
                      {...field}
                      className="w-full no-focus"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {orderSummary()}
            <DialogFooter>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-700 dark:hover:bg-teal-800">
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerInfoModal;
