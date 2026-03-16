import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { FormTextField } from "../../components/common/FormTextField";
import { useAuth } from "../../hooks/useAuth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

type LoginForm = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const { control, handleSubmit, formState } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: LoginForm) {
    try {
      setError("");
      await login(values);
      navigate(location.state?.redirectTo ?? "/");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to sign in");
    }
  }

  return (
    <Paper sx={{ maxWidth: 520, mx: "auto", p: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h4">Sign in</Typography>
        <Typography color="text.secondary">
          Access your account to place orders, track status, and manage DermEase operations.
        </Typography>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <FormTextField control={control} name="email" label="Email" fullWidth />
            <FormTextField control={control} name="password" label="Password" type="password" fullWidth />
            <Button type="submit" variant="contained" size="large" disabled={formState.isSubmitting}>
              Sign in
            </Button>
          </Stack>
        </form>
        <Typography color="text.secondary">
          Need an account?{" "}
          <Typography component={RouterLink} to="/register" color="primary.main">
            Register here
          </Typography>
        </Typography>
      </Stack>
    </Paper>
  );
}

