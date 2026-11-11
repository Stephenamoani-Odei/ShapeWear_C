import { createFileRoute } from "@tanstack/react-router";
import ContactPage from "@/app/pages/ContactPage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact ShapeWearFit — WhatsApp 0596121149" },
      { name: "description", content: "Questions about sizes, orders or delivery? Contact ShapeWearFit, an online clothing store in Accra, Ghana." },
      { property: "og:title", content: "Contact ShapeWearFit — WhatsApp 0596121149" },
      { property: "og:description", content: "Questions about sizes, orders or delivery? Contact ShapeWearFit, an online clothing store in Accra, Ghana." },
    ],
  }),
  component: ContactPage,
});
