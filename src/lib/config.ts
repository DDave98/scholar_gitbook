function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const contentRepo = {
  get owner() {
    return requireEnv("CONTENT_REPO_OWNER");
  },
  get name() {
    return requireEnv("CONTENT_REPO_NAME");
  },
  get defaultBranch() {
    return process.env.CONTENT_REPO_BRANCH || "main";
  },
};
