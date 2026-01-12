import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, ReactNode } from "react";
import IngredientForm from "./IngredientForm";

interface IngredientAddModalButtonProps {
  children: ReactNode;
  ingredientId?: string;
}

const IngredientAddModalButton = ({
  children,
  ingredientId,
}: IngredientAddModalButtonProps) => {
  let [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {ingredientId ? "Edit Ingredient" : "Add New Ingredient"}
            </DialogTitle>
            <DialogDescription>
              {ingredientId
                ? "Update the ingredient details."
                : "Please provide the necessary details to add a new ingredient."}
            </DialogDescription>
          </DialogHeader>
          <IngredientForm setIsOpen={setIsOpen} ingredientId={ingredientId} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IngredientAddModalButton;

