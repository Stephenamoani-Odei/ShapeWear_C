import { createFileRoute } from "@tanstack/react-router";
import AboutPage from "@/app/pages/AboutPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About ShapeWearFit — Online Clothing Store, Accra" },
      { name: "description", content: "ShapeWearFit is an online clothing store in Accra, Ghana selling office-standard long-sleeve shirts and jerseys." },
      { property: "og:title", content: "About ShapeWearFit — Online Clothing Store, Accra" },
      { property: "og:description", content: "ShapeWearFit is an online clothing store in Accra, Ghana selling office-standard long-sleeve shirts and jerseys." },
    ],
  }),
  component: AboutPage,
});
