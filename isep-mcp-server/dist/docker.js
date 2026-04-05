import { spawnSync } from "child_process";
import path from "path";
const COMPOSE_FILE = "infrastructure/docker/docker-compose.test.yml";
/**
 * Resolve repo root: ISEP_ROOT env (if set and not a placeholder) or cwd.
 * Cursor may set ISEP_ROOT to ${workspaceFolder}; if that is not expanded, we fall back to cwd.
 */
export function getRepoRoot() {
    const env = process.env.ISEP_ROOT;
    if (env && !env.includes("${") && env.length > 1)
        return path.resolve(env);
    return path.resolve(process.cwd());
}
/**
 * Run a test service via docker compose. Returns { success, stdout, stderr, exitCode }.
 */
export function runDockerCompose(repoRoot, service, profile) {
    const composePath = path.join(repoRoot, COMPOSE_FILE);
    const args = [
        "compose",
        "-f",
        composePath,
        ...(profile ? ["--profile", profile] : []),
        "run",
        "--rm",
        service,
    ];
    const result = spawnSync("docker", args, {
        cwd: repoRoot,
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024,
        stdio: ["ignore", "pipe", "pipe"],
    });
    const stdout = (result.stdout ?? "").trim();
    const stderr = (result.stderr ?? "").trim();
    const exitCode = result.status ?? 1;
    return {
        success: exitCode === 0,
        stdout,
        stderr,
        exitCode,
    };
}
