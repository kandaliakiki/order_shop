import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import ProductForm from "./ProductForm";

const UpdateDropdownModal = ({
  _id,
  isOpenUpdateModal,
  setIsOpenUpdateModal,
}: {
  _id: string;
  isOpenUpdateModal: boolean;
  setIsOpenUpdateModal: (isOpen: boolean) => void;
}) => {
  return (
    <>
      <Dialog open={isOpenUpdateModal} onOpenChange={setIsOpenUpdateModal}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Update Product
            </DialogTitle>
            <DialogDescription>
              Please provide the updated details to modify the existing product.
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            setIsOpen={setIsOpenUpdateModal}
            productId={_id}
          ></ProductForm>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpdateDropdownModal;
