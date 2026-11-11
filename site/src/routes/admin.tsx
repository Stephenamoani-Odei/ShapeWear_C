import { createFileRoute } from "@tanstack/react-router";
import AdminPage from "@/app/pages/AdminPage";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — ShapeWearFit" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});
