import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

export async function POST(req: Request) {
  const prisma = new PrismaClient();
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = await headers(); 
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with an ID of ${id} and type of ${eventType}`)

  // --- SAVE THE USER TO NEON DATABASE ---
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const email = email_addresses[0]?.email_address;
    const name = `${first_name || ''} ${last_name || ''}`.trim();

    try {
      await prisma.user.create({
        data: {
          clerkId: id, 
          email: email,
          name: name,
        }
      });
      console.log("User successfully saved to Prisma DB!");
    } catch (error) {
      console.error("Error saving user to DB:", error);
      return new Response('Error saving user', { status: 500 });
    }
  }

  // --- HANDLE USER UPDATES ---
  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    
    const email = email_addresses[0]?.email_address;
    const name = `${first_name || ''} ${last_name || ''}`.trim();

    try {
      await prisma.user.update({
        where: { clerkId: id }, 
        data: {
          email: email,
          name: name,
        }
      });
      console.log("User successfully updated in Prisma DB!");
    } catch (error) {
      console.error("Error updating user in DB:", error);
    }
  }

  // --- HANDLE USER DELETIONS ---
  if (eventType === 'user.deleted') {
    try {
      await prisma.user.delete({
        where: { clerkId: id } 
      });
      console.log("User successfully deleted from Prisma DB!");
    } catch (error) {
      console.error("Error deleting user in DB:", error);
    }
  }

  return new Response('', { status: 200 })
}