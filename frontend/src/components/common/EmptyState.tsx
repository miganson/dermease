import { Button, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  return (
    <Paper sx={{ p: 4 }}>
      <Stack spacing={1.5} alignItems="flex-start">
        <Typography variant="h5">{title}</Typography>
        <Typography color="text.secondary">{description}</Typography>
        {actionLabel && actionTo ? (
          <Button component={RouterLink} to={actionTo} variant="contained">
            {actionLabel}
          </Button>
        ) : null}
      </Stack>
    </Paper>
  );
}

