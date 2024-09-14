import { useProducts } from "./ProductContext";

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

const DeleteDropdownModal = ({
  _id,
  isOpenDeleteModal,
  setIsOpenDeleteModal,
}: {
  _id: string;
  isOpenDeleteModal: boolean;
  setIsOpenDeleteModal: (isOpen: boolean) => void;
}) => {
  const { deleteProduct } = useProducts();
  return (
    <>
      <Dialog open={isOpenDeleteModal} onOpenChange={setIsOpenDeleteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              variant="destructive"
              onClick={() => {
                deleteProduct(_id);
                setIsOpenDeleteModal(false);
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteDropdownModal;
