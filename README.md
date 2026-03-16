# DermEase Online

DermEase Online is a MERN e-commerce system for a local skincare retailer. This repository contains:

- `frontend`: React + Vite + TypeScript storefront and admin panel
- `backend`: Express + TypeScript + MongoDB API

## Project structure

```text
Design/
|- frontend/
|- backend/
```

## Environment files

Both services include `.env` and `.env.example` with matching keys. Only `.env.example` should be committed when sharing the project publicly.

## MongoDB safety

The backend forces MongoDB access into the `school` database by using:

- `MONGODB_URI`
- `MONGODB_DB_NAME=school`

The database name is passed explicitly to Mongoose so the app does not work against other databases on the cluster.

## Getting started

1. Install dependencies in `frontend` and `backend`.
2. Update both `.env` files with your real values.
3. Start the backend with `npm run dev`.
4. Start the frontend with `npm run dev`.

## Seed data

The backend includes a seed script to create:

- the first admin account from env values
- starter product catalog data

