// The source archive does not include the compatible Google OAuth implementation.
export function GET() {
  return Response.json({ configured: false, message: "Google sign-in is not configured. Please use email and password." });
}
