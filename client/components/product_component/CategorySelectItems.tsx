import React, { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Category, useCategories } from "./CategoryContext";

const CategorySelectItems = ({ ...props }) => {
  const { categories, fetchCategories } = useCategories();
  useEffect(() => {
    fetchCategories();
  }, []);
  return (
    <>
      {categories.map(
        (
          category: Category // Specify type for category
        ) => (
          <SelectItem {...props} value={category._id} key={category._id}>
            {category.name}
          </SelectItem>
        )
      )}
    </>
  );
};

export default CategorySelectItems;
