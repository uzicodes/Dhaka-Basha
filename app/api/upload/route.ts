import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

// Initialize S3Client outside the handler for connection reuse
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
    const { files } = await request.json();

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: "A non-empty 'files' array is required." },
        { status: 400 },
      );
    }

    const results = await Promise.all(
      files.map(async (file: { name: string; type: string }) => {
        // Extract the file extension from the original name
        const extension = file.name.split(".").pop() || "";
        const uniqueKey = `${crypto.randomUUID()}.${extension}`;

        const command = new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: uniqueKey,
          ContentType: file.type,
        });

        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
        const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${uniqueKey}`;

        return { signedUrl, publicUrl };
      }),
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error generating presigned URLs:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URLs." },
      { status: 500 },
    );
  }
}
