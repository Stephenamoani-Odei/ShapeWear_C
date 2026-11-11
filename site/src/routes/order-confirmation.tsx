import { createFileRoute } from "@tanstack/react-router";
import OrderConfirmationPage from "@/app/pages/OrderConfirmationPage";

export const Route = createFileRoute("/order-confirmation")({
  // Paystack returns the customer here with ?reference=…&trxref=…
  validateSearch: (search: Record<string, unknown>): { reference?: string } => {
    const ref = typeof search["reference"] === "string" ? search["reference"] : typeof search["trxref"] === "string" ? search["trxref"] : undefined;
    return ref ? { reference: ref } : {};
  },
  head: () => ({
    meta: [
      { title: "Order confirmation — ShapeWearFit" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderConfirmationRoute,
});

function OrderConfirmationRoute() {
  const { reference } = Route.useSearch();
  return <OrderConfirmationPage reference={reference} />;
}
