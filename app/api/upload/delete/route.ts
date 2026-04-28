import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A valid 'url' string is required." },
        { status: 400 },
      );
    }

    // Extract the object key from the public URL
    const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;
    const key = url.replace(publicBase + "/", "");

    if (!key || key === url) {
      return NextResponse.json(
        { error: "Could not extract a valid key from the URL." },
        { status: 400 },
      );
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });

    await s3.send(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting object from R2:", error);
    return NextResponse.json(
      { error: "Failed to delete the image." },
      { status: 500 },
    );
  }
}
