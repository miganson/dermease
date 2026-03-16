import { Box, CircularProgress, Stack, Typography } from "@mui/material";

export function LoadingState({ message = "Loading DermEase..." }: { message?: string }) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={2}
      sx={{ minHeight: 240, py: 6 }}
    >
      <CircularProgress color="secondary" />
      <Typography color="text.secondary">{message}</Typography>
    </Stack>
  );
}

export function InlineLoader() {
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", py: 1 }}>
      <CircularProgress size={20} />
    </Box>
  );
}

