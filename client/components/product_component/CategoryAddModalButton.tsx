import React, { useState } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProductForm from "./ProductForm";
import CategoryForm from "./CategoryForm";

const CategoryAddModalButton = () => {
  let [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-teal-600 w-3/4 text-base rounded-lg mb-2 hover:bg-teal-700">
          <Image
            src="/assets/add-square.svg"
            alt="add logo"
            width={24}
            height={24}
            className="mr-2"
          ></Image>
          Add New Category{" "}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Please provide the necessary details to add a new category.
          </DialogDescription>
        </DialogHeader>
        <CategoryForm setIsOpen={setIsOpen}></CategoryForm>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryAddModalButton;
