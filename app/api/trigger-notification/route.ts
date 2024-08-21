import { NextResponse } from "next/server";
import webPush from "web-push";
import { createClient } from "@/utils/supabase/server";

const publicVapidKey =
  "BE3zcqJpGQ6kQsw1QYDmVfCeRR6pyN0r-KcBGzi_IcnWZbsKHFz3Qc3o935-054Apet84BDsUcjZVeFtBbq83uc";
const privateVapidKey = "owFAJbl2kb3e0HjjhBdJ7NVolKcjxfSykw9mvqhXRig";
const email = "yo@ralphstodomingo.com"; // replace with your email

webPush.setVapidDetails(`mailto:${email}`, publicVapidKey, privateVapidKey);

export async function POST(request: Request) {
  const supabase = createClient();

  try {
    const { message } = await request.json();

    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (error) throw error;

    const sendNotifications = subscriptions.map((subscription) =>
      webPush.sendNotification(subscription, JSON.stringify(message))
    );

    await Promise.all(sendNotifications);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
