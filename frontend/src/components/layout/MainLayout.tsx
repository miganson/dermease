import MenuIcon from "@mui/icons-material/Menu";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, Outlet } from "react-router-dom";
import { APP_NAME } from "../../lib/constants";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";

const navItems = [
  { label: "Shop", to: "/" },
  { label: "Orders", to: "/orders" },
  { label: "Account", to: "/account" }
];

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, logout } = useAuth();

  return (
    <Box>
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: "blur(12px)" }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: 1 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
              <Typography
                component={RouterLink}
                to="/"
                variant="h5"
                sx={{ fontFamily: '"Fraunces", Georgia, serif', color: "text.primary" }}
              >
                {APP_NAME}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ display: { xs: "none", md: "flex" } }}>
                {navItems.map((item) => (
                  <Button key={item.to} component={RouterLink} to={item.to} color="inherit">
                    {item.label}
                  </Button>
                ))}
                {user?.role === "admin" ? (
                  <Button component={RouterLink} to="/admin" color="inherit">
                    Admin
                  </Button>
                ) : null}
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton component={RouterLink} to="/cart" color="inherit">
                <Badge badgeContent={itemCount} color="secondary">
                  <ShoppingBagOutlinedIcon />
                </Badge>
              </IconButton>
              {user ? (
                <Button onClick={() => void logout()} color="inherit">
                  Sign out
                </Button>
              ) : (
                <Button component={RouterLink} to="/login" variant="contained">
                  Sign in
                </Button>
              )}
              <IconButton
                color="inherit"
                sx={{ display: { md: "none" } }}
                onClick={() => setMobileOpen(true)}
              >
                <MenuIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 280, p: 2 }}>
          <List>
            {navItems.map((item) => (
              <ListItemButton
                key={item.to}
                component={RouterLink}
                to={item.to}
                onClick={() => setMobileOpen(false)}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
            {user?.role === "admin" ? (
              <ListItemButton component={RouterLink} to="/admin" onClick={() => setMobileOpen(false)}>
                <ListItemText primary="Admin" />
              </ListItemButton>
            ) : null}
          </List>
        </Box>
      </Drawer>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Outlet />
      </Container>

      <Box component="footer" sx={{ py: 6, px: 2 }}>
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary">
            DermEase Online centralizes products, ordering, stock visibility, and payment tracking for a
            local skincare retailer.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

