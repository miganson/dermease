import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Divider,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { z } from "zod";
import { authApi } from "../../api/endpoints";
import { FormTextField } from "../../components/common/FormTextField";
import { formatDate } from "../../lib/format";
import { strongPasswordMessage, strongPasswordRegex } from "../../lib/validation";

const requestSchema = z.object({
  email: z.string().email()
});

const resetSchema = z
  .object({
    email: z.string().email(),
    resetCode: z.string().regex(/^\d{6}$/, "Reset code must be 6 digits."),
    newPassword: z.string().regex(strongPasswordRegex, strongPasswordMessage),
    confirmPassword: z.string().min(8)
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match"
  });

type RequestForm = z.infer<typeof requestSchema>;
type ResetForm = z.infer<typeof resetSchema>;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [requestError, setRequestError] = useState("");
  const [resetError, setResetError] = useState("");
  const [preview, setPreview] = useState<{
    email: string;
    mockResetCode: string | null;
    expiresAt: string | null;
  } | null>(null);

  const requestForm = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      email: ""
    }
  });

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
      resetCode: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const requestMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (data) => {
      setPreview(data);
      resetForm.setValue("email", data.email, { shouldValidate: true });
      if (data.mockResetCode) {
        resetForm.setValue("resetCode", data.mockResetCode, { shouldValidate: true });
      }
    }
  });

  const resetMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      navigate("/login");
    }
  });

  async function submitRequest(values: RequestForm) {
    try {
      setRequestError("");
      await requestMutation.mutateAsync(values);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Unable to generate reset code");
    }
  }

  async function submitReset(values: ResetForm) {
    try {
      setResetError("");
      await resetMutation.mutateAsync(values);
    } catch (error) {
      setResetError(error instanceof Error ? error.message : "Unable to reset password");
    }
  }

  return (
    <Paper sx={{ maxWidth: 620, mx: "auto", p: 4 }}>
      <Stack spacing={3}>
        <div>
          <Typography variant="h4">Mock forgot password</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            This demo flow stores a reset request in the database and shows the generated reset code on screen
            instead of sending a real email.
          </Typography>
        </div>

        <form onSubmit={requestForm.handleSubmit(submitRequest)}>
          <Stack spacing={2}>
            {requestError ? <Alert severity="error">{requestError}</Alert> : null}
            {requestMutation.isSuccess ? (
              <Alert severity="success">If the account exists, a mock reset code has been prepared.</Alert>
            ) : null}
            <FormTextField control={requestForm.control} name="email" label="Account email" fullWidth />
            <Button type="submit" variant="contained" disabled={requestForm.formState.isSubmitting}>
              Generate mock reset code
            </Button>
          </Stack>
        </form>

        {preview ? (
          <>
            <Divider />
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Typography variant="h6">Mock reset preview</Typography>
                <Typography color="text.secondary">Email: {preview.email}</Typography>
                <Typography color="text.secondary">
                  Reset code: {preview.mockResetCode ?? "No account found for this email"}
                </Typography>
                <Typography color="text.secondary">
                  Expires: {preview.expiresAt ? formatDate(preview.expiresAt) : "N/A"}
                </Typography>
              </Stack>
            </Paper>
          </>
        ) : null}

        <Divider />

        <form onSubmit={resetForm.handleSubmit(submitReset)}>
          <Stack spacing={2}>
            <Typography variant="h6">Set a new password</Typography>
            {resetError ? <Alert severity="error">{resetError}</Alert> : null}
            <FormTextField control={resetForm.control} name="email" label="Email" fullWidth />
            <FormTextField control={resetForm.control} name="resetCode" label="Reset code" fullWidth />
            <FormTextField
              control={resetForm.control}
              name="newPassword"
              label="New password"
              type="password"
              fullWidth
              helperText="Use at least 8 characters with uppercase, lowercase, number, and special character."
            />
            <FormTextField
              control={resetForm.control}
              name="confirmPassword"
              label="Confirm new password"
              type="password"
              fullWidth
            />
            <Button type="submit" variant="contained" disabled={resetForm.formState.isSubmitting}>
              Reset password
            </Button>
          </Stack>
        </form>

        <Typography color="text.secondary">
          Back to{" "}
          <Typography component={RouterLink} to="/login" color="primary.main">
            sign in
          </Typography>
        </Typography>
      </Stack>
    </Paper>
  );
}
