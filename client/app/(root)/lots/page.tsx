"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useIngredients, IngredientLot, Ingredient } from "@/components/ingredient_component/IngredientContext";
import { IngredientProvider } from "@/components/ingredient_component/IngredientContext";
import MobileHeader from "@/components/layout_components/MobileHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, addDays } from "date-fns";
import { Package, AlertTriangle, CheckCircle, XCircle, Plus, Trash2, ArrowUpDown, AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { MoonLoader } from "react-spinners";
import { toast } from "sonner";

const IngredientLotsPageContent = () => {
  const { ingredients, fetchIngredients, fetchIngredientLots } = useIngredients();
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>("");
  const [lots, setLots] = useState<IngredientLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [allLots, setAllLots] = useState<IngredientLot[]>([]);
  const [showAll, setShowAll] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "used">("active");
  const [isAddLotOpen, setIsAddLotOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "expiry" | "purchase" | "lotId">("expiry");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedLots, setSelectedLots] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [lotToDelete, setLotToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Add Lot form state
  const [lotForm, setLotForm] = useState({
    ingredientId: "",
    quantity: "",
    expiryDate: "",
    purchaseDate: format(new Date(), "yyyy-MM-dd"),
    supplier: "",
    cost: "",
  });

  useEffect(() => {
    fetchIngredients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!showAll || ingredients.length === 0) {
      setAllLots([]);
      return;
    }

    const loadAllLots = async () => {
      setLoading(true);
      try {
        const allLotsData: IngredientLot[] = [];
        // Check activeTab to determine if we need empty lots
        const includeEmpty = activeTab === "used";
        
        for (const ingredient of ingredients) {
          const ingredientLots = await fetchIngredientLots(ingredient._id, includeEmpty);
          const lotsWithIngredient = ingredientLots.map((lot) => ({
            ...lot,
            ingredient: {
              _id: ingredient._id,
              name: ingredient.name,
              unit: ingredient.unit,
            },
          }));
          allLotsData.push(...lotsWithIngredient);
        }
        setAllLots(allLotsData);
      } catch (error) {
        console.error("Failed to load lots:", error);
        setAllLots([]);
      } finally {
        setLoading(false);
      }
    };

    loadAllLots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAll, ingredients.length, activeTab]);

  useEffect(() => {
    if (!selectedIngredientId || showAll) {
      setLots([]);
      return;
    }

    setLoading(true);
    // Check activeTab to determine if we need empty lots
    const includeEmpty = activeTab === "used";
    
    fetchIngredientLots(selectedIngredientId, includeEmpty)
      .then((data) => {
        setLots(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch lots:", error);
        setLots([]);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIngredientId, showAll, activeTab]);

  // Auto-fill expiry date when ingredient is selected
  useEffect(() => {
    if (lotForm.ingredientId && !lotForm.expiryDate) {
      const ingredient = ingredients.find((ing) => ing._id === lotForm.ingredientId);
      if (ingredient?.defaultExpiryDays) {
        const expiryDate = addDays(new Date(), ingredient.defaultExpiryDays);
        setLotForm((prev) => ({
          ...prev,
          expiryDate: format(expiryDate, "yyyy-MM-dd"),
        }));
      }
    }
  }, [lotForm.ingredientId, ingredients]);

  // Filter lots by active/used tab
  const filteredLots = useMemo(() => {
    const lotsToFilter = showAll ? allLots : lots;
    if (activeTab === "active") {
      return lotsToFilter.filter((lot) => lot.currentStock > 0);
    } else {
      return lotsToFilter.filter((lot) => lot.currentStock === 0);
    }
  }, [allLots, lots, showAll, activeTab]);

  // Sort lots
  const sortedLots = useMemo(() => {
    return [...filteredLots].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = (a.ingredient?.name || "").localeCompare(b.ingredient?.name || "");
          break;
        case "expiry":
          comparison = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
          break;
        case "purchase":
          const aDate = a.purchaseDate ? new Date(a.purchaseDate).getTime() : 0;
          const bDate = b.purchaseDate ? new Date(b.purchaseDate).getTime() : 0;
          comparison = aDate - bDate;
          break;
        case "lotId":
          comparison = a.lotId.localeCompare(b.lotId);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredLots, sortBy, sortOrder]);

  const handleAddLot = async () => {
    if (!lotForm.ingredientId || !lotForm.quantity) {
      toast.error("Please fill in ingredient and quantity");
      return;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
      const response = await fetch(`${backendUrl}/api/lots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredient: lotForm.ingredientId,
          quantity: parseFloat(lotForm.quantity),
          expiryDate: lotForm.expiryDate || undefined,
          purchaseDate: lotForm.purchaseDate || new Date(),
          supplier: lotForm.supplier || undefined,
          cost: lotForm.cost ? parseFloat(lotForm.cost) : undefined,
          currentStock: parseFloat(lotForm.quantity),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create lot");
      }

      toast.success("Lot created successfully");

      // Reset form and refresh
      setLotForm({
        ingredientId: "",
        quantity: "",
        expiryDate: "",
        purchaseDate: format(new Date(), "yyyy-MM-dd"),
        supplier: "",
        cost: "",
      });
      setIsAddLotOpen(false);

      // Refresh lots
      if (showAll) {
        const allLotsData: IngredientLot[] = [];
        for (const ingredient of ingredients) {
          const ingredientLots = await fetchIngredientLots(ingredient._id);
          const lotsWithIngredient = ingredientLots.map((lot) => ({
            ...lot,
            ingredient: {
              _id: ingredient._id,
              name: ingredient.name,
              unit: ingredient.unit,
            },
          }));
          allLotsData.push(...lotsWithIngredient);
        }
        setAllLots(allLotsData);
      } else if (selectedIngredientId) {
        const data = await fetchIngredientLots(selectedIngredientId);
        setLots(data);
      }
    } catch (error) {
      console.error("Failed to create lot:", error);
      toast.error("Failed to create lot");
    }
  };

  const refreshLots = async () => {
    if (showAll) {
      const allLotsData: IngredientLot[] = [];
      for (const ingredient of ingredients) {
        const ingredientLots = await fetchIngredientLots(ingredient._id);
        const lotsWithIngredient = ingredientLots.map((lot) => ({
          ...lot,
          ingredient: {
            _id: ingredient._id,
            name: ingredient.name,
            unit: ingredient.unit,
          },
        }));
        allLotsData.push(...lotsWithIngredient);
      }
      setAllLots(allLotsData);
    } else if (selectedIngredientId) {
      const data = await fetchIngredientLots(selectedIngredientId);
      setLots(data);
    }
  };

  const handleDeleteLot = async (lotId: string) => {
    setLotToDelete(lotId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteLot = async () => {
    if (!lotToDelete) return;

    setDeleteLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
      const response = await fetch(`${backendUrl}/api/lots/${lotToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete lot");
      }

      await refreshLots();
      await fetchIngredients();
      setIsDeleteModalOpen(false);
      setLotToDelete(null);
    } catch (error) {
      console.error("Failed to delete lot:", error);
      toast.error("Failed to delete lot");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLots.length === 0) return;
    setIsBulkDeleteModalOpen(true);
  };

  const confirmBulkDelete = async () => {
    setDeleteLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
      
      // Delete all selected lots
      await Promise.all(
        selectedLots.map((lotId) =>
          fetch(`${backendUrl}/api/lots/${lotId}`, {
            method: "DELETE",
          })
        )
      );

      await refreshLots();
      await fetchIngredients();
      setSelectedLots([]);
      setIsBulkDeleteModalOpen(false);
    } catch (error) {
      console.error("Failed to delete lots:", error);
      toast.error("Failed to delete some lots");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSelectLot = (lotId: string) => {
    if (selectedLots.includes(lotId)) {
      setSelectedLots(selectedLots.filter((id) => id !== lotId));
    } else {
      setSelectedLots([...selectedLots, lotId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedLots.length === sortedLots.length) {
      setSelectedLots([]);
    } else {
      setSelectedLots(sortedLots.map((lot) => lot._id));
    }
  };

  const getExpiryBadge = (lot: IngredientLot) => {
    if (lot.isExpired) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Expired
        </Badge>
      );
    }
    if (lot.isExpiringSoon) {
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-600 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Expiring Soon
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-green-500 text-green-600 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Good
      </Badge>
    );
  };

  return (
    <div className="p-3 md:p-5 md:px-4">
      <MobileHeader title="Ingredient Lots" />
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
          <h1 className="text-xl md:text-2xl font-bold dark:text-white">Ingredient Lots</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Tabs */}
            <div className="flex gap-1 md:gap-2 border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("active")}
                className={`flex-1 sm:flex-none px-3 md:px-4 py-2 text-xs md:text-sm ${
                  activeTab === "active"
                    ? "bg-sky-950 dark:bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                Active Lots
              </button>
              <button
                onClick={() => setActiveTab("used")}
                className={`flex-1 sm:flex-none px-3 md:px-4 py-2 text-xs md:text-sm ${
                  activeTab === "used"
                    ? "bg-sky-950 dark:bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                Used Lots
              </button>
            </div>
            <Button
              onClick={() => setIsAddLotOpen(true)}
              className="bg-sky-950 hover:bg-sky-900 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs md:text-sm w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Lot
            </Button>
            {selectedLots.length > 0 && (
              <Button
                onClick={handleBulkDelete}
                variant="destructive"
                className="flex items-center gap-2 text-xs md:text-sm w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedLots.length})
              </Button>
            )}
            <button
              onClick={() => {
                setShowAll(true);
                setSelectedIngredientId("");
              }}
              className={`px-3 md:px-4 py-2 rounded-md text-xs md:text-sm w-full sm:w-auto ${
                showAll
                  ? "bg-sky-950 dark:bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              All Lots
            </button>
            <select
              value={selectedIngredientId}
              onChange={(e) => {
                setSelectedIngredientId(e.target.value);
                setShowAll(false);
              }}
              className="px-3 md:px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs md:text-sm w-full sm:w-auto"
            >
              <option value="">Filter by Ingredient</option>
              {ingredients.map((ingredient) => (
                <option key={ingredient._id} value={ingredient._id}>
                  {ingredient.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sorting Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expiry">Expiry Date</SelectItem>
              <SelectItem value="name">Ingredient Name</SelectItem>
              <SelectItem value="purchase">Purchase Date</SelectItem>
              <SelectItem value="lotId">Lot ID</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="w-full sm:w-auto"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {sortOrder === "asc" ? "Ascending" : "Descending"}
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8 dark:text-gray-300">Loading lots...</div>
        ) : sortedLots.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {activeTab === "active" ? "No active lots found." : "No used lots found."}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-x-auto border border-gray-200 dark:border-gray-800">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedLots.length === sortedLots.length && sortedLots.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="min-w-[100px]">Ingredient</TableHead>
                  <TableHead className="whitespace-nowrap">Lot ID</TableHead>
                  <TableHead className="whitespace-nowrap">Stock</TableHead>
                  <TableHead className="whitespace-nowrap">Expiry</TableHead>
                  <TableHead className="whitespace-nowrap">Days Left</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLots.map((lot) => (
                  <TableRow key={lot._id}>
                    <TableCell className="py-2">
                      <Checkbox
                        checked={selectedLots.includes(lot._id)}
                        onCheckedChange={() => handleSelectLot(lot._id)}
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="line-clamp-2 max-w-[100px] font-medium">{lot.ingredient?.name || "N/A"}</div>
                    </TableCell>
                    <TableCell className="py-2 font-mono text-xs whitespace-nowrap">
                      {lot.lotId}
                    </TableCell>
                    <TableCell className="py-2 whitespace-nowrap text-sm">
                      {lot.currentStock} {lot.unit}
                    </TableCell>
                    <TableCell className="py-2 whitespace-nowrap text-sm">
                      {format(new Date(lot.expiryDate), "MMM dd")}
                      {lot.expirySource === "default" && (
                        <Badge variant="outline" className="text-xs ml-1 border-yellow-500 text-yellow-600 dark:text-yellow-400">
                          <AlertCircle className="h-2 w-2 mr-1" />
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-2 whitespace-nowrap">
                      <span
                        className={
                          lot.daysUntilExpiry < 0
                            ? "text-red-600 dark:text-red-400 font-medium text-sm"
                            : lot.daysUntilExpiry <= 3
                            ? "text-orange-600 dark:text-orange-400 font-medium text-sm"
                            : "text-gray-600 dark:text-gray-400 text-sm"
                        }
                      >
                        {lot.daysUntilExpiry < 0
                          ? `${Math.abs(lot.daysUntilExpiry)}d ago`
                          : `${lot.daysUntilExpiry}d`}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 whitespace-nowrap">
                      {getExpiryBadge(lot)}
                    </TableCell>
                    <TableCell className="py-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteLot(lot._id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add Lot Modal */}
      <Dialog open={isAddLotOpen} onOpenChange={setIsAddLotOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Lot</DialogTitle>
            <DialogDescription>
              Create a new ingredient lot. Expiry date will be auto-filled from ingredient's default expiry if available.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ingredient">Ingredient *</Label>
              <Select
                value={lotForm.ingredientId}
                onValueChange={(value) => setLotForm((prev) => ({ ...prev, ingredientId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ingredient" />
                </SelectTrigger>
                <SelectContent>
                  {ingredients.map((ingredient) => (
                    <SelectItem key={ingredient._id} value={ingredient._id}>
                      {ingredient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={lotForm.quantity}
                onChange={(e) => setLotForm((prev) => ({ ...prev, quantity: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={lotForm.expiryDate}
                onChange={(e) => setLotForm((prev) => ({ ...prev, expiryDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={lotForm.purchaseDate}
                onChange={(e) => setLotForm((prev) => ({ ...prev, purchaseDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                placeholder="Enter supplier name"
                value={lotForm.supplier}
                onChange={(e) => setLotForm((prev) => ({ ...prev, supplier: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                placeholder="Enter cost"
                value={lotForm.cost}
                onChange={(e) => setLotForm((prev) => ({ ...prev, cost: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddLotOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLot} className="bg-sky-950 hover:bg-sky-900 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
              Add Lot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Single Lot Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this lot? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              variant="destructive"
              onClick={confirmDeleteLot}
              disabled={deleteLoading}
            >
              {deleteLoading ? <MoonLoader size={20} color="#fff" /> : "Yes, Delete"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setLotToDelete(null);
              }}
            >
              No, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Modal */}
      <Dialog open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong className="text-black dark:text-white">{selectedLots.length}</strong>{" "}
              selected lots? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              variant="destructive"
              onClick={confirmBulkDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? <MoonLoader size={20} color="#fff" /> : "Yes, Delete"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsBulkDeleteModalOpen(false)}
            >
              No, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const IngredientLotsPage = () => {
  return (
    <IngredientProvider>
      <IngredientLotsPageContent />
    </IngredientProvider>
  );
};

export default IngredientLotsPage;
