import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import {
  Box,
  Chip,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { productApi } from "../../api/endpoints";
import { LoadingState } from "../../components/common/LoadingState";
import { EmptyState } from "../../components/common/EmptyState";
import { ProductCard } from "../../components/shop/ProductCard";
import { productCategories } from "../../lib/constants";

export function HomePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const productsQuery = useQuery({
    queryKey: ["products", search, category],
    queryFn: () => productApi.list(search, category)
  });

  return (
    <Stack spacing={4}>
      <Paper
        sx={{
          p: { xs: 3, md: 5 },
          background:
            "linear-gradient(135deg, rgba(255, 243, 235, 1) 0%, rgba(248, 235, 224, 1) 55%, rgba(231, 243, 232, 1) 100%)"
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={2}>
              <Chip
                icon={<SpaOutlinedIcon />}
                label="Security-integrated skincare commerce"
                color="secondary"
                sx={{ alignSelf: "flex-start" }}
              />
              <Typography variant="h2">Skincare shopping with cleaner product flow and stronger admin control.</Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 680 }}>
                DermEase Online centralizes browsing, ordering, payment tracking, and stock visibility for a
                local skincare retailer that outgrew chat-based selling.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Chip icon={<VerifiedUserOutlinedIcon />} label="Protected accounts and role-based admin access" />
                <Chip label="Low-stock visibility" />
                <Chip label="Mock gateway-ready checkout" />
              </Stack>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3, backgroundColor: "rgba(255,255,255,0.7)" }}>
              <Stack spacing={2}>
                <Typography variant="h5">Shop the catalog</Typography>
                <TextField
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search cleansers, moisturizers, serums..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon />
                      </InputAdornment>
                    )
                  }}
                  fullWidth
                />
                <TextField
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  select
                  fullWidth
                  label="Category"
                >
                  <MenuItem value="">All categories</MenuItem>
                  {productCategories.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <Box>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Featured skincare
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Browse available products, compare categories, and add items without needing manual chat follow-up.
        </Typography>

        {productsQuery.isLoading ? <LoadingState message="Loading products..." /> : null}
        {productsQuery.isError ? (
          <EmptyState
            title="Products are unavailable right now"
            description="Make sure the backend API is running and the school database contains seeded products."
          />
        ) : null}
        {!productsQuery.isLoading && !productsQuery.isError && productsQuery.data?.length === 0 ? (
          <EmptyState
            title="No products matched your filters"
            description="Try a different keyword or remove the category filter."
          />
        ) : null}

        <Grid container spacing={3}>
          {productsQuery.data?.map((product) => (
            <Grid key={product._id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Stack>
  );
}

