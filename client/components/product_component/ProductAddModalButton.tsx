"use client";

import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useState } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import AddProductForm from "./AddProductForm";

const ProductAddModalButton = () => {
  let [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="rounded-lg aspect-[3/4] outline-dashed outline-teal-600 outline-4  flex flex-col items-center justify-center cursor-pointer"
      >
        <Image
          alt="add new product button"
          src="/assets/add-product.svg"
          height={48}
          width={48}
        ></Image>
        <p className="text-xl">Add New Product</p>
      </div>
      <Dialog
        open={isOpen}
        onClose={() => {}}
        transition
        className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-4 transition duration-300 ease-out data-[closed]:opacity-0"
      >
        <DialogPanel className="relative max-w-lg space-y-4 bg-white p-12 rounded-lg">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 z-10 w-fit p-2 bg-primary-blue-100 rounded-full"
          >
            <Image
              src="/assets/close.svg"
              alt="close"
              width={20}
              height={20}
              className="object-contain"
            ></Image>
          </button>
          <DialogTitle className="font-bold">Add Product</DialogTitle>
          <Description>
            Please provide the necessary details to add a new product.
          </Description>

          <AddProductForm setIsOpen={setIsOpen}></AddProductForm>
        </DialogPanel>
      </Dialog>
    </>
  );
};

export default ProductAddModalButton;
