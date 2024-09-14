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
import AddProductForm from "./AddProductForm";

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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Update Product
            </DialogTitle>
            <DialogDescription>
              Please provide the updated details to modify the existing product.
            </DialogDescription>
          </DialogHeader>
          <AddProductForm
            setIsOpen={setIsOpenUpdateModal}
            productId={_id}
          ></AddProductForm>
          {/* <DialogFooter className="sm:justify-start">
            <Button
              variant="destructive"
              onClick={() => {
                setIsOpenUpdateModal(false);
              }}
            >
              Yes, Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpenDeleteModal(false)}
            >
              No, Cancel
            </Button>
          </DialogFooter> */}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpdateDropdownModal;
