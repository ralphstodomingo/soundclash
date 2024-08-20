import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { endpoint, keys } = await request.json();

    // Validate the request payload
    if (!endpoint || !keys) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert the subscription data into the database
    const { error } = await supabase.from("push_subscriptions").insert([
      {
        endpoint,
        keys,
      },
    ]);

    if (error) {
      console.error("Error saving subscription:", error);
      return NextResponse.json(
        { error: "Failed to save subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Subscription saved successfully" });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
