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
import { Ingredient, useIngredients } from "./IngredientContext";
import { ingredientUnits } from "@/constants";

const formSchema = z.object({
  name: z.string().min(3).max(50),
  unit: z.string().min(1),
  currentStock: z.coerce.number().min(0),
  minimumStock: z.coerce.number().min(0),
  defaultExpiryDays: z.coerce.number().min(1).optional(),
  imageUrl: z.string().optional(),
});

const IngredientForm = ({
  setIsOpen,
  ingredientId,
}: {
  setIsOpen: (isOpen: boolean) => void;
  ingredientId?: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const { fetchIngredients, fetchIngredientById, createIngredient, updateIngredient } =
    useIngredients();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: ingredient?.name || "",
      unit: ingredient?.unit || "",
      currentStock: ingredient?.currentStock || 0,
      minimumStock: ingredient?.minimumStock || 0,
      defaultExpiryDays: ingredient?.defaultExpiryDays || undefined,
      imageUrl: ingredient?.imageUrl || "",
    },
  });

  useEffect(() => {
    const fetchIngredient = async () => {
      if (ingredientId) {
        const fetchedIngredient = await fetchIngredientById(ingredientId);
        setIngredient(fetchedIngredient);
        if (fetchedIngredient) {
          form.reset({
            name: fetchedIngredient.name,
            unit: fetchedIngredient.unit,
            currentStock: fetchedIngredient.currentStock,
            minimumStock: fetchedIngredient.minimumStock,
            defaultExpiryDays: fetchedIngredient.defaultExpiryDays,
            imageUrl: fetchedIngredient.imageUrl,
          });
        }
      }
    };
    fetchIngredient();
  }, [ingredientId]);

  const handleCreateIngredient = async (
    ingredientData: z.infer<typeof formSchema>
  ) => {
    try {
      await createIngredient({
        name: ingredientData.name,
        unit: ingredientData.unit,
        currentStock: ingredientData.currentStock,
        minimumStock: ingredientData.minimumStock,
        defaultExpiryDays: ingredientData.defaultExpiryDays,
        imageUrl: ingredientData.imageUrl || "",
      });
      await fetchIngredients();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create ingredient:", error);
    }
  };

  const handleUpdateIngredient = async (
    ingredientData: z.infer<typeof formSchema>,
    ingredientId: string
  ) => {
    try {
      await updateIngredient(ingredientId, {
        name: ingredientData.name,
        unit: ingredientData.unit,
        currentStock: ingredientData.currentStock,
        minimumStock: ingredientData.minimumStock,
        defaultExpiryDays: ingredientData.defaultExpiryDays,
        imageUrl: ingredientData.imageUrl || "",
      });
      await fetchIngredients();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update ingredient:", error);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    if (!ingredientId) {
      await handleCreateIngredient(values);
    } else {
      await handleUpdateIngredient(values, ingredientId);
    }

    setLoading(false);
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
                  placeholder="Enter ingredient name"
                  {...field}
                  className="no-focus"
                />
              </FormControl>
              <FormDescription>This is the ingredient name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-[280px] no-focus">
                    <SelectValue placeholder="Select a Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select Unit</SelectLabel>
                      {ingredientUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>This is the unit of measurement.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currentStock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Stock</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter current stock"
                  {...field}
                  className="no-focus"
                />
              </FormControl>
              <FormDescription>Current stock quantity.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="minimumStock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Stock</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter minimum stock"
                  {...field}
                  className="no-focus"
                />
              </FormControl>
              <FormDescription>
                Minimum stock level for alerts.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="defaultExpiryDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Expiry (Days)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 30 for eggs, 180 for flour"
                  {...field}
                  value={field.value || ""}
                  className="no-focus"
                />
              </FormControl>
              <FormDescription>
                Default number of days until expiry when adding stock. If not set, AI will predict expiry when creating lots.
              </FormDescription>
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
                    alt="ingredient photo"
                    width={100}
                    height={100}
                    priority
                    className="rounded-full object-cover aspect-square"
                  ></Image>
                ) : (
                  <Image
                    src="/assets/profile.svg"
                    alt="ingredient photo"
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
                  className="account-form_image-input"
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

export default IngredientForm;

