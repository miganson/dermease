import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";

const adminNav = [
  { label: "Dashboard", to: "/admin", icon: <DashboardOutlinedIcon /> },
  { label: "Products", to: "/admin/products", icon: <StorefrontOutlinedIcon /> },
  { label: "Inventory", to: "/admin/inventory", icon: <Inventory2OutlinedIcon /> },
  { label: "Orders", to: "/admin/orders", icon: <ReceiptLongOutlinedIcon /> },
  { label: "Reports", to: "/admin/reports", icon: <InsightsOutlinedIcon /> }
];

export function AdminLayout() {
  const location = useLocation();

  return (
    <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>
      <Paper sx={{ width: { xs: "100%", lg: 280 }, p: 2, alignSelf: "flex-start" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Admin Console
        </Typography>
        <List>
          {adminNav.map((item) => (
            <ListItemButton
              key={item.to}
              component={RouterLink}
              to={item.to}
              selected={location.pathname === item.to}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Paper>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </Box>
    </Stack>
  );
}
