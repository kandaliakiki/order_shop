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
import CategorySelectItems from "./CategorySelectItems";
import { setCategoryId } from "./CategoryContext";

const formSchema = z.object({
  name: z.string().min(3).max(30),
  price: z.coerce.number(),
  category: z.string().min(3).max(30),
  imageUrl: z.string().url().min(1),
});

const ProductForm = ({
  setIsOpen,
  productId,
}: {
  setIsOpen: (isOpen: boolean) => void;
  productId?: string;
}) => {
  const [loading, setLoading] = useState(false); // Add loading state
  const [product, setProduct] = useState<Product | null>(null); // State for product
  const { fetchProducts, fetchProductById, fetchProductsByCategoryId } =
    useProducts(); // Get the fetch function from context

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || "",
      price: product?.price || 0,
      category: product?.category.name || "",
      imageUrl: product?.imageUrl || "",
    },
  });

  useEffect(() => {
    const fetchProduct = async () => {
      if (productId) {
        const fetchedProduct = await fetchProductById(productId); // Call fetchProductById
        setProduct(fetchedProduct); // Set the product state
        if (fetchedProduct) {
          form.reset({
            // Reset form with fetched product data
            name: fetchedProduct.name,
            price: fetchedProduct.price,
            category: fetchedProduct.category.name,
            imageUrl: fetchedProduct.imageUrl,
          });
        }
      }
    };
    fetchProduct();
  }, [productId]); // Dependency on productId

  const createProduct = async (productData: z.infer<typeof formSchema>) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT; // Your backend URL

    try {
      const response = await fetch(`${backendUrl}/api/createProduct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData), // Send the product data
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      window.dispatchEvent(new Event("addedProduct"));
      setCategoryId(productData.category);
      console.log("Product created:", data);
      // Handle success (e.g., show a success message, redirect, etc.)
    } catch (error) {
      console.error("Failed to create product:", error);
      // Handle error (e.g., show an error message)
    }
  };

  const updateProduct = async (
    productData: z.infer<typeof formSchema>,
    productId: string
  ) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT; // Your backend URL

    try {
      const response = await fetch(
        `${backendUrl}/api/updateProduct/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData), // Send the product data
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Product updated:", data);
      // Handle success (e.g., show a success message, redirect, etc.)
    } catch (error) {
      console.error("Failed to update product:", error);
      // Handle error (e.g., show an error message)
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true); // Set loading to true

    if (!productId) {
      await createProduct(values);
    } else {
      await updateProduct(values, productId);
    }

    const selectedCategory = localStorage.getItem("selectedCategory");

    if (selectedCategory === null || selectedCategory === "") {
      await fetchProducts();
    } else {
      await fetchProductsByCategoryId(selectedCategory);
    }

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
                  placeholder="Enter product name"
                  {...field}
                  className="no-focus"
                />
              </FormControl>
              <FormDescription>This is the product name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter product price"
                  {...field}
                  className="no-focus"
                />
              </FormControl>
              <FormDescription>This is the product price.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange}>
                  <SelectTrigger className="w-[280px] no-focus ">
                    <SelectValue placeholder="Select a Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select Category</SelectLabel>
                      <CategorySelectItems {...field} />
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>This is the product name.</FormDescription>
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
                    alt="product photo"
                    width={100}
                    height={100}
                    priority
                    className="rounded-full object-cover aspect-square"
                  ></Image>
                ) : (
                  <Image
                    src="/assets/profile.svg"
                    alt="product photo"
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

export default ProductForm;
