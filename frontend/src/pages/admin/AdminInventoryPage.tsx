import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { adminApi } from "../../api/endpoints";
import { queryClient } from "../../lib/queryClient";
import { FormTextField } from "../../components/common/FormTextField";
import { LoadingState } from "../../components/common/LoadingState";

const schema = z.object({
  productId: z.string().min(1),
  adjustment: z.coerce.number().int().refine((value) => value !== 0),
  remarks: z.string().min(4)
});

type InventoryForm = z.infer<typeof schema>;

export function AdminInventoryPage() {
  const inventoryQuery = useQuery({
    queryKey: ["admin", "inventory"],
    queryFn: adminApi.inventory
  });

  const { control, handleSubmit, reset, formState } = useForm<InventoryForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      productId: "",
      adjustment: 0,
      remarks: ""
    }
  });

  const mutation = useMutation({
    mutationFn: adminApi.adjustStock,
    onSuccess: () => {
      reset({
        productId: "",
        adjustment: 0,
        remarks: ""
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Inventory visibility</Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Manual stock adjustment
        </Typography>
        <form
          onSubmit={handleSubmit(async (values) => {
            await mutation.mutateAsync(values);
          })}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormTextField control={control} name="productId" label="Product" select fullWidth>
                {inventoryQuery.data?.map((product) => (
                  <MenuItem key={product._id} value={product._id}>
                    {product.name}
                  </MenuItem>
                ))}
              </FormTextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormTextField control={control} name="adjustment" label="Adjustment" type="number" fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <FormTextField control={control} name="remarks" label="Remarks" fullWidth />
            </Grid>
          </Grid>
          <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={formState.isSubmitting}>
            Apply adjustment
          </Button>
        </form>
      </Paper>

      {inventoryQuery.isLoading ? <LoadingState message="Loading inventory..." /> : null}
      {inventoryQuery.isError ? <Alert severity="error">Unable to load inventory status.</Alert> : null}

      <Grid container spacing={2}>
        {inventoryQuery.data?.map((product) => (
          <Grid key={product._id} size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography variant="h6">{product.name}</Typography>
                <Typography color="text.secondary">{product.category}</Typography>
                <Typography>
                  Stock: {product.stockQuantity} • Low-stock threshold: {product.lowStockThreshold}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
