export async function GET() {
  return Response.json({ status: "manual_mode", actual_enabled: false });
}
