import { redirect } from "next/navigation";

export default function AdminPage() {
  // Redirect to the products dashboard by default
  redirect("/admin/products");
}
