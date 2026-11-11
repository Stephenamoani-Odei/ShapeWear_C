import { createFileRoute } from "@tanstack/react-router";
import HomePage from "@/app/pages/HomePage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShapeWearFit — Office Shirts & Jerseys | Accra, Ghana" },
      { name: "description", content: "Online clothing store in Accra, Ghana. Shop office-standard long-sleeve shirts and club & country jerseys. Pay securely with Paystack." },
      { property: "og:title", content: "ShapeWearFit — Office Shirts & Jerseys | Accra, Ghana" },
      { property: "og:type", content: "website" },
      { property: "og:description", content: "Online clothing store in Accra, Ghana. Shop office-standard long-sleeve shirts and club & country jerseys. Pay securely with Paystack." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});
