/**
 * MFA gate for SYSTEM_ADMIN / IC_DIVISION_HEAD must match in middleware and /login/complete.
 * In development, MFA is off unless NEXT_PUBLIC_REQUIRE_MFA_IN_DEV is set (same as middleware).
 */
export function isMfaEnforcedInThisEnvironment(): boolean {
  if (process.env.NODE_ENV === 'development') {
    return (
      process.env.NEXT_PUBLIC_REQUIRE_MFA_IN_DEV === '1' ||
      process.env.NEXT_PUBLIC_REQUIRE_MFA_IN_DEV === 'true'
    );
  }
  return true;
}
