import { FittingRoom } from "@/components/fitting-room";

/**
 * The household comes from the URL (?as=okafors) and is read on the server, so
 * the first paint is the real first step, not a loading fallback.
 */
export default async function Page({ searchParams }: PageProps<"/">) {
  const { as } = await searchParams;
  return <FittingRoom personaId={typeof as === "string" ? as : "maya"} />;
}
