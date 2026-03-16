import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { z } from "zod";
import { FormTextField } from "../../components/common/FormTextField";
import { useAuth } from "../../hooks/useAuth";

const schema = z
  .object({
    fullName: z.string().min(2),
    email: z.string().email(),
    mobileNumber: z.string().min(7),
    password: z.string().min(8),
    confirmPassword: z.string().min(8)
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match"
  });

type RegisterForm = z.infer<typeof schema>;

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { control, handleSubmit, formState } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      mobileNumber: "",
      password: "",
      confirmPassword: ""
    }
  });

  async function onSubmit(values: RegisterForm) {
    try {
      setError("");
      await register({
        fullName: values.fullName,
        email: values.email,
        mobileNumber: values.mobileNumber,
        password: values.password
      });
      navigate("/");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to register");
    }
  }

  return (
    <Paper sx={{ maxWidth: 560, mx: "auto", p: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h4">Create account</Typography>
        <Typography color="text.secondary">
          Register once so DermEase can keep your order details complete and easy to track.
        </Typography>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <FormTextField control={control} name="fullName" label="Full name" fullWidth />
            <FormTextField control={control} name="email" label="Email" fullWidth />
            <FormTextField control={control} name="mobileNumber" label="Mobile number" fullWidth />
            <FormTextField control={control} name="password" label="Password" type="password" fullWidth />
            <FormTextField
              control={control}
              name="confirmPassword"
              label="Confirm password"
              type="password"
              fullWidth
            />
            <Button type="submit" variant="contained" size="large" disabled={formState.isSubmitting}>
              Create account
            </Button>
          </Stack>
        </form>
        <Typography color="text.secondary">
          Already registered?{" "}
          <Typography component={RouterLink} to="/login" color="primary.main">
            Sign in instead
          </Typography>
        </Typography>
      </Stack>
    </Paper>
  );
}
