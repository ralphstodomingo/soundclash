import { SoundclashEvent } from "@/app/types";
import { createClient } from "@/utils/supabase/client";
import ClientActiveGame from "./ClientActiveGame";
import { notFound } from "next/navigation";
import Head from "next/head";

export const revalidate = 60; // Revalidate the page every 60 seconds

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(
      `
      description, 
      subtitle, 
      games(
        id, 
        game_image, 
        dj_1_id(id, name, main_image), 
        dj_2_id(id, name, main_image)
      )
    `
    )
    .eq("id", params.id)
    .single<SoundclashEvent>();

  if (eventError || !event) {
    console.error("Error fetching event:", eventError);
    return notFound(); // Show 404 page if data is not found
  }

  return (
    <>
      <Head>
        <meta
          httpEquiv="Cache-Control"
          content="no-cache, no-store, must-revalidate"
        />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </Head>
      <ClientActiveGame eventId={params.id} event={event} />;
    </>
  );
}
