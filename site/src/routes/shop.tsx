import { createFileRoute } from "@tanstack/react-router";
import ShopPage from "@/app/pages/ShopPage";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop Office Shirts & Jerseys — ShapeWearFit" },
      { name: "description", content: "Browse long-sleeve office shirts and club & country jerseys. Choose your size and pay securely online. Accra, Ghana." },
      { property: "og:title", content: "Shop Office Shirts & Jerseys — ShapeWearFit" },
      { property: "og:description", content: "Browse long-sleeve office shirts and club & country jerseys. Choose your size and pay securely online. Accra, Ghana." },
    ],
  }),
  component: ShopPage,
});
