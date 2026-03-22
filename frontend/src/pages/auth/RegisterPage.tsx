import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { z } from "zod";
import { FormTextField } from "../../components/common/FormTextField";
import { useAuth } from "../../hooks/useAuth";
import {
  fullNameMessage,
  fullNameRegex,
  strongPasswordMessage,
  strongPasswordRegex
} from "../../lib/validation";

const schema = z
  .object({
    fullName: z.string().trim().min(2).regex(fullNameRegex, fullNameMessage),
    email: z.string().email(),
    mobileNumber: z.string().min(7),
    password: z.string().regex(strongPasswordRegex, strongPasswordMessage),
    confirmPassword: z.string().min(8),
    acceptedDataPrivacy: z
      .boolean()
      .refine((value) => value, "You must agree to the data privacy notice before signing up.")
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
      confirmPassword: "",
      acceptedDataPrivacy: false
    }
  });

  async function onSubmit(values: RegisterForm) {
    try {
      setError("");
      await register({
        fullName: values.fullName,
        email: values.email,
        mobileNumber: values.mobileNumber,
        password: values.password,
        acceptedDataPrivacy: values.acceptedDataPrivacy
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
          Register once so DermEase can keep your order details complete, protected, and easy to track.
        </Typography>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <FormTextField control={control} name="fullName" label="Full name" fullWidth />
            <FormTextField control={control} name="email" label="Email" fullWidth />
            <FormTextField control={control} name="mobileNumber" label="Mobile number" fullWidth />
            <FormTextField
              control={control}
              name="password"
              label="Password"
              type="password"
              fullWidth
              helperText="Use at least 8 characters with uppercase, lowercase, number, and special character."
            />
            <FormTextField
              control={control}
              name="confirmPassword"
              label="Confirm password"
              type="password"
              fullWidth
            />
            <Controller
              control={control}
              name="acceptedDataPrivacy"
              render={({ field, fieldState }) => (
                <FormControl error={Boolean(fieldState.error)}>
                  <FormControlLabel
                    control={<Checkbox checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
                    label="I agree to the data privacy notice and consent to the secure processing of my account and order details."
                  />
                  <FormHelperText>{fieldState.error?.message}</FormHelperText>
                </FormControl>
              )}
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
