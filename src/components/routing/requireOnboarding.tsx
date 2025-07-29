import type { JSX } from "react";
import { Navigate } from "react-router-dom";

export function RequireOnboarding({ onboardingComplete, children }: { onboardingComplete: boolean, children: JSX.Element }) {
  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}