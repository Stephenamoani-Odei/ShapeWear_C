import { createFileRoute } from "@tanstack/react-router";
import CheckoutPage from "@/app/pages/CheckoutPage";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — ShapeWearFit" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});
