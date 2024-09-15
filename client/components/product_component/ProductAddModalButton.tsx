import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import ProductForm from "./ProductForm";

const ProductAddModalButton = () => {
  let [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="rounded-lg aspect-[3/4] outline-dashed outline-teal-600 outline-4  flex flex-col items-center justify-center cursor-pointer">
            <Image
              alt="add new product button"
              src="/assets/add-product.svg"
              height={48}
              width={48}
            ></Image>
            <p className="text-xl">Add New Product</p>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
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
