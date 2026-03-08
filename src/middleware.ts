import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/lti(.*)",
]);

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return;

  const { userId, sessionClaims } = await auth.protect();

  if (isApiRoute(request)) return;

  const onboarded = (sessionClaims?.metadata as Record<string, unknown>)?.onboarded === true;

  if (isOnboardingRoute(request)) {
    if (onboarded) {
      const role = (sessionClaims?.metadata as Record<string, unknown>)?.role;
      const dashUrl = role === "instructor" ? "/dashboard/instructor" : "/dashboard/student";
      return NextResponse.redirect(new URL(dashUrl, request.url));
    }
    return;
  }

  if (!onboarded) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
