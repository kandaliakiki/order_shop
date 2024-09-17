import { zodResolver } from "@hookform/resolvers/zod";
import React, { ChangeEvent, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import Image from "next/image";
import { isBase64Image } from "@/lib/utils";
import { MoonLoader } from "react-spinners";
import { Product, useProducts } from "./ProductContext";
import { Category, useCategories } from "./CategoryContext";

const formSchema = z.object({
  name: z.string().min(3).max(30),
  imageUrl: z.string().url().min(1),
});

const CategoryForm = ({
  setIsOpen,
  categoryId,
}: {
  setIsOpen: (isOpen: boolean) => void;
  categoryId?: string;
}) => {
  const [loading, setLoading] = useState(false); // Add loading state
  const [category, setCategory] = useState<Category | null>(null); // State for product
  const { fetchCategories, categories } = useCategories(); // Get the fetch function from context

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      imageUrl: category?.imageUrl || "",
    },
  });

  //   useEffect(() => {
  //     const fetchProduct = async () => {
  //       if (categoryId) {
  //         const fetchedProduct = await fetchProductById(categoryId); // Call fetchProductById
  //         setCategory(fetchedProduct); // Set the product state
  //         if (fetchedProduct) {
  //           form.reset({
  //             // Reset form with fetched product data
  //             name: fetchedProduct.name,
  //             price: fetchedProduct.price,
  //             category: fetchedProduct.category,
  //             imageUrl: fetchedProduct.imageUrl,
  //           });
  //         }
  //       }
  //     };
  //     fetchProduct();
  //   }, [categoryId]); // Dependency on categoryId

  const createCategory = async (categoryData: z.infer<typeof formSchema>) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT; // Your backend URL

    try {
      const response = await fetch(`${backendUrl}/api/createCategory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Category created:", data);
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  };

  //   const updateProduct = async (
  //     productData: z.infer<typeof formSchema>,
  //     categoryId: string
  //   ) => {
  //     const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT; // Your backend URL

  //     try {
  //       const response = await fetch(
  //         `${backendUrl}/api/updateProduct/${categoryId}`,
  //         {
  //           method: "PUT",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify(productData), // Send the product data
  //         }
  //       );

  //       if (!response.ok) {
  //         throw new Error("Network response was not ok");
  //       }

  //       const data = await response.json();
  //       console.log("Product updated:", data);
  //       // Handle success (e.g., show a success message, redirect, etc.)
  //     } catch (error) {
  //       console.error("Failed to update product:", error);
  //       // Handle error (e.g., show an error message)
  //     }
  //   };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true); // Set loading to true

    // if (!categoryId) {
    //   await createCategory(values);
    // } else {
    //   await updateProduct(values, categoryId);
    // }
    await createCategory(values);
    await fetchCategories();

    setIsOpen(false);
    setLoading(false); // Reset loading state
  };

  const handleImage = (
    e: ChangeEvent<HTMLInputElement>,
    fieldChange: (value: string) => void
  ) => {
    e.preventDefault();
    const fileReader = new FileReader();

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!file.type.includes("image")) return;

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || "";
        fieldChange(imageDataUrl);
      };

      fileReader.readAsDataURL(file);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter category name"
                  {...field}
                  className="no-focus"
                />
              </FormControl>
              <FormDescription>This is the category name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem className="flex items-center gap-4">
              <FormLabel className="account-form_image-label">
                {field.value ? (
                  <Image
                    src={field.value}
                    alt="category photo"
                    width={100}
                    height={100}
                    priority
                    className="rounded-full object-cover aspect-square"
                  ></Image>
                ) : (
                  <Image
                    src="/assets/profile.svg"
                    alt="category photo"
                    width={24}
                    height={24}
                    className="object-contain"
                  ></Image>
                )}
              </FormLabel>
              <FormControl className="flex-1 text-base-semibold text-gray-400">
                <Input
                  type="file"
                  accept="image/*"
                  placeholder="Upload a photo"
                  className="account-form_image-input "
                  onChange={(e) => {
                    handleImage(e, field.onChange);
                  }}
                />
              </FormControl>
              <FormMessage></FormMessage>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading} className="bg-sky-950 w-20">
          {loading ? <MoonLoader size={20} color="#fff" /> : "Submit"}
        </Button>
      </form>
    </Form>
  );
};

export default CategoryForm;
