export async function sha256Hex(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function passwordMatches(
  inputPassword: string,
  options: {
    legacy?: string | null;
    hash?: string | null;
  },
): Promise<boolean> {
  const candidate = inputPassword.trim();
  const legacy = (options.legacy ?? "").trim();
  const hash = (options.hash ?? "").trim();

  if (legacy) {
    return legacy === candidate;
  }

  if (!hash) {
    return false;
  }

  // Support legacy deployments where password_hash still contains raw text.
  if (hash === candidate) {
    return true;
  }

  // Support SHA-256 hex encoded hash values stored in password_hash.
  const candidateDigest = await sha256Hex(candidate);
  return hash.toLowerCase() === candidateDigest.toLowerCase();
}
