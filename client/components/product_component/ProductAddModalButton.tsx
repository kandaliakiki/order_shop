import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, ReactNode } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import ProductForm from "./ProductForm";

interface ProductAddModalButtonProps {
  children: ReactNode;
}

const ProductAddModalButton = ({ children }: ProductAddModalButtonProps) => {
  let [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Please provide the necessary details to add a new product.
            </DialogDescription>
          </DialogHeader>
          <ProductForm setIsOpen={setIsOpen}></ProductForm>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductAddModalButton;
