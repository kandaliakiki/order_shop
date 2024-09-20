import { useProducts } from "./ProductContext";
import { MoonLoader } from "react-spinners"; // Import MoonLoader

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
import { useState } from "react";

const DeleteMultipleModal = ({
  isOpenDeleteModal,
  setIsOpenDeleteModal,
}: {
  isOpenDeleteModal: boolean;
  setIsOpenDeleteModal: (isOpen: boolean) => void;
}) => {
  const { selectedProducts, deleteMultipleProducts, setSelectedProducts } =
    useProducts();
  const [loading, setLoading] = useState(false); // Add loading state

  // New function to handle deletion
  const handleDelete = async () => {
    setLoading(true); // Set loading to true
    await deleteMultipleProducts(selectedProducts);
    window.dispatchEvent(new Event("addedOrDeletedProduct"));
    setSelectedProducts([]);
    setIsOpenDeleteModal(false);
    setLoading(false); // Reset loading state
  };

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
              Are you sure you want to delete{" "}
              <strong className="text-black">{selectedProducts.length}</strong>{" "}
              selected items? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              variant="destructive"
              onClick={handleDelete} // Updated to use new function
              disabled={loading} // Disable button while loading
            >
              {loading ? <MoonLoader size={20} color="#fff" /> : "Yes, Delete"}
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

export default DeleteMultipleModal;
