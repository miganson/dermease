import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Grid,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { orderApi } from "../../api/endpoints";
import { FormTextField } from "../../components/common/FormTextField";
import { LoadingState } from "../../components/common/LoadingState";
import { StatusChip } from "../../components/common/StatusChip";
import { useAuth } from "../../hooks/useAuth";
import { formatCurrency } from "../../lib/format";
import { fullNameMessage, fullNameRegex } from "../../lib/validation";

const profileSchema = z.object({
  fullName: z.string().trim().min(2).regex(fullNameRegex, fullNameMessage),
  mobileNumber: z.string().min(7)
});

type ProfileForm = z.infer<typeof profileSchema>;

export function AccountPage() {
  const { user, updateProfile } = useAuth();
  const ordersQuery = useQuery({
    queryKey: ["orders", "mine", "account"],
    queryFn: orderApi.mine
  });

  const { control, handleSubmit, reset, formState } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName ?? "",
      mobileNumber: user?.mobileNumber ?? ""
    }
  });

  useEffect(() => {
    reset({
      fullName: user?.fullName ?? "",
      mobileNumber: user?.mobileNumber ?? ""
    });
  }, [reset, user]);

  const profileMutation = useMutation({
    mutationFn: updateProfile
  });

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h4">My account</Typography>
          <Typography color="text.secondary">
            {user?.email} | {user?.role === "admin" ? "Admin" : "Customer"}
          </Typography>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Edit profile
        </Typography>
        {profileMutation.isSuccess ? <Alert severity="success">Profile updated successfully.</Alert> : null}
        {profileMutation.isError ? (
          <Alert severity="error">
            {profileMutation.error instanceof Error
              ? profileMutation.error.message
              : "Unable to update profile"}
          </Alert>
        ) : null}
        <form
          onSubmit={handleSubmit(async (values) => {
            await profileMutation.mutateAsync(values);
          })}
        >
          <Stack spacing={2}>
            <FormTextField control={control} name="fullName" label="Full name" fullWidth />
            <FormTextField control={control} name="mobileNumber" label="Mobile number" fullWidth />
            <Button type="submit" variant="contained" disabled={formState.isSubmitting || profileMutation.isPending}>
              Save changes
            </Button>
          </Stack>
        </form>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Recent orders
        </Typography>
        {ordersQuery.isLoading ? <LoadingState message="Loading your orders..." /> : null}
        {ordersQuery.isError ? <Alert severity="error">Unable to load your order history.</Alert> : null}
        <Grid container spacing={2}>
          {ordersQuery.data?.slice(0, 3).map((order) => (
            <Grid key={order._id} size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle1">{order._id}</Typography>
                  <StatusChip status={order.status} />
                  <Typography color="text.secondary">{formatCurrency(order.total)}</Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Stack>
  );
}

