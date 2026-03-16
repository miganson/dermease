import { Paper, Stack, Typography } from "@mui/material";

export function MetricCard({
  label,
  value,
  tone = "primary.main"
}: {
  label: string;
  value: string | number;
  tone?: string;
}) {
  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={1}>
        <Typography color="text.secondary">{label}</Typography>
        <Typography variant="h4" sx={{ color: tone }}>
          {value}
        </Typography>
      </Stack>
    </Paper>
  );
}
