import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { productApi } from "../../api/endpoints";
import { FormTextField } from "../../components/common/FormTextField";
import { LoadingState } from "../../components/common/LoadingState";
import { productCategories } from "../../lib/constants";
import { formatCurrency } from "../../lib/format";
import { queryClient } from "../../lib/queryClient";
import type { Product } from "../../types/domain";

const productSchema = z.object({
  name: z.string().min(2),
  category: z.enum([
    "cleanser",
    "toner",
    "moisturizer",
    "serum",
    "sunscreen",
    "acne_care",
    "gift_bundle"
  ]),
  shortDescription: z.string().min(10),
  description: z.string().min(20),
  price: z.coerce.number().nonnegative(),
  stockQuantity: z.coerce.number().int().nonnegative(),
  lowStockThreshold: z.coerce.number().int().nonnegative(),
  imageUrl: z.string().url(),
  tags: z.string().optional()
});

type ProductForm = z.infer<typeof productSchema>;

export function AdminProductsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const productsQuery = useQuery({
    queryKey: ["products", "admin"],
    queryFn: () => productApi.list()
  });

  const { control, handleSubmit, reset, setValue, formState } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "cleanser",
      shortDescription: "",
      description: "",
      price: 0,
      stockQuantity: 0,
      lowStockThreshold: 8,
      imageUrl: "",
      tags: ""
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (values: ProductForm) => {
      const payload = {
        ...values,
        tags: values.tags ? values.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : []
      };

      if (editingProduct) {
        return productApi.update(editingProduct._id, payload);
      }

      return productApi.create(payload);
    },
    onSuccess: () => {
      setDialogOpen(false);
      setEditingProduct(null);
      reset();
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });

  const imageUploadMutation = useMutation({
    mutationFn: productApi.uploadImage,
    onSuccess: (uploaded) => {
      setValue("imageUrl", uploaded.secure_url, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      });
    }
  });

  function openCreate() {
    setEditingProduct(null);
    reset();
    setDialogOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    reset({
      name: product.name,
      category: product.category,
      shortDescription: product.shortDescription,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      imageUrl: product.imageUrl,
      tags: product.tags.join(", ")
    });
    setDialogOpen(true);
  }

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
        <div>
          <Typography variant="h4">Product management</Typography>
          <Typography color="text.secondary">Create and update product records from one admin screen.</Typography>
        </div>
        <Button variant="contained" onClick={openCreate}>
          Add product
        </Button>
      </Stack>

      {productsQuery.isLoading ? <LoadingState message="Loading products..." /> : null}
      {productsQuery.isError ? <Alert severity="error">Unable to load product records.</Alert> : null}

      <Grid container spacing={2}>
        {productsQuery.data?.map((product) => (
          <Grid key={product._id} size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Stack spacing={1.5}>
                <Typography variant="h6">{product.name}</Typography>
                <Typography color="text.secondary">{product.shortDescription}</Typography>
                <Typography>{formatCurrency(product.price)}</Typography>
                <Typography color="text.secondary">
                  Stock: {product.stockQuantity} | Threshold: {product.lowStockThreshold}
                </Typography>
                <Button variant="outlined" onClick={() => openEdit(product)}>
                  Edit product
                </Button>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingProduct ? "Edit product" : "Add product"}</DialogTitle>
        <DialogContent>
          <form
            onSubmit={handleSubmit(async (values) => {
              await saveMutation.mutateAsync(values);
            })}
          >
            <Stack spacing={2} sx={{ pt: 1 }}>
              {saveMutation.isError ? (
                <Alert severity="error">
                  {saveMutation.error instanceof Error ? saveMutation.error.message : "Unable to save product"}
                </Alert>
              ) : null}

              <FormTextField control={control} name="name" label="Product name" fullWidth />

              <FormTextField control={control} name="category" label="Category" select fullWidth>
                {productCategories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </FormTextField>

              <FormTextField control={control} name="shortDescription" label="Short description" fullWidth />

              <FormTextField
                control={control}
                name="description"
                label="Description"
                fullWidth
                multiline
                minRows={4}
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormTextField control={control} name="price" label="Price" type="number" fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormTextField control={control} name="stockQuantity" label="Stock" type="number" fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormTextField
                    control={control}
                    name="lowStockThreshold"
                    label="Low-stock threshold"
                    type="number"
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
                <FormTextField control={control} name="imageUrl" label="Image URL" fullWidth />
                <Button component="label" variant="outlined" sx={{ minWidth: 180 }}>
                  Upload image
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) {
                        return;
                      }

                      await imageUploadMutation.mutateAsync(file);
                      event.target.value = "";
                    }}
                  />
                </Button>
              </Stack>

              {imageUploadMutation.isError ? (
                <Alert severity="error">
                  {imageUploadMutation.error instanceof Error
                    ? imageUploadMutation.error.message
                    : "Unable to upload image"}
                </Alert>
              ) : null}

              {imageUploadMutation.isSuccess ? (
                <Alert severity="success">Image uploaded to Cloudinary and linked to this product.</Alert>
              ) : null}

              <FormTextField control={control} name="tags" label="Tags (comma-separated)" fullWidth />

              <Button
                type="submit"
                variant="contained"
                disabled={formState.isSubmitting || saveMutation.isPending}
              >
                Save product
              </Button>
            </Stack>
          </form>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
