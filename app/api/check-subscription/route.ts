import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const { endpoint } = await request.json();

  try {
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("endpoint", endpoint)
      .single();

    if (error) throw error;

    return NextResponse.json({ exists: !!subscriptions }, { status: 200 });
  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
