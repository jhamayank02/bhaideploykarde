import path from "path";
import fs from "fs/promises";

export type Framework = "REACT_JS" | "VUE_JS" | "ANGULAR_JS";
export type InputType = "PATH" | "COMMAND" | "FRAMEWORK_COMMAND";

const BASE_WORKSPACE_DIR = path.resolve(process.cwd(), "workspaces")

const FRAMEWORK_WHITELIST: Record<Framework, string[]> = {
    REACT_JS: [
        "npm install",
        "yarn install",
        "pnpm install",
        "npm run build",
        "yarn build",
        "pnpm build",
    ],
    ANGULAR_JS: [
        "npm install",
        "yarn install",
        "pnpm install",
        "ng build",
        "npm run build",
        "yarn build",
        "pnpm build",
    ],
    VUE_JS: [
        "npm install",
        "yarn install",
        "pnpm install",
        "npm run build",
        "yarn build",
        "pnpm build",
        "vue-cli-service build",
    ]
};

const GENERIC_DANGEROUS_PATTERNS = [
    "rm -rf",
    "mkfs",
    ":(){",      // fork bomb
    "shutdown",
    "reboot",
    "curl ",
    "wget ",
    "| sh",
    "> /dev",
    "sudo",
    "&&",
    ";",
    "`",         // command substitution
    "$(",        // command substitution
    "chmod 777",
    "chown ",
];

export async function isMalicious(
    input: string,
    type: InputType,
    opts?: { framework?: Framework; baseWorkspace?: string }
): Promise<{ malicious: true; reason: string } | { malicious: false; info?: any }> {
    if (!input || typeof input !== "string") {
        return { malicious: true, reason: "empty or non-string input" };
    }

    // quick reject null-bytes or non-printables
    if (input.includes("\0")) {
        return { malicious: true, reason: "null byte detected" };
    }

    const trimmed = input.trim();

    // === PATH VALIDATION ===
    if (type === "PATH") {
        const baseDir = path.resolve(opts?.baseWorkspace ?? BASE_WORKSPACE_DIR);
        // disallow absolute path (require relative under baseDir)
        if (path.isAbsolute(trimmed)) {
            return { malicious: true, reason: "absolute paths not allowed" };
        }
        // disallow parent traversal
        const normalized = path.normalize(trimmed);
        if (normalized.split(path.sep).includes("..")) {
            return { malicious: true, reason: "parent traversal not allowed" };
        }

        // resolve candidate under baseDir
        const candidate = path.resolve(baseDir, normalized);

        try {
            // ensure candidate exists
            const realBase = await fs.realpath(baseDir).catch(() => null);
            if (!realBase) return { malicious: true, reason: "base workspace does not exist" };

            const realCandidate = await fs.realpath(candidate).catch(() => null);
            if (!realCandidate) return { malicious: true, reason: "path does not exist" };

            // ensure candidate is inside baseDir (prevent symlink escape)
            if (!(realCandidate === realBase || realCandidate.startsWith(realBase + path.sep))) {
                return { malicious: true, reason: "path escapes allowed workspace" };
            }

            const st = await fs.stat(realCandidate);
            if (!st.isDirectory()) {
                return { malicious: true, reason: "path exists but is not a directory" };
            }

            return { malicious: false, info: { fullPath: realCandidate } };
        } catch (err: any) {
            return { malicious: true, reason: `fs error: ${err?.message ?? String(err)}` };
        }
    }

    // === COMMAND VALIDATION ===
    // Generic dangerous patterns check (quick)
    const lower = trimmed.toLowerCase();
    for (const p of GENERIC_DANGEROUS_PATTERNS) {
        if (lower.includes(p)) {
            return { malicious: true, reason: `disallowed pattern detected: ${p}` };
        }
    }

    // If it's a framework-command check, require framework and do whitelist exact-match
    if (type === "FRAMEWORK_COMMAND") {
        const fw = opts?.framework;
        if (!fw || !["react", "angular", "vue"].includes(fw)) {
            return { malicious: true, reason: "framework not specified or unsupported for frameworkCommand" };
        }
        const normalized = trimmed.replace(/\s+/g, " ");
        const allowed = FRAMEWORK_WHITELIST[fw];
        // accept exact allowed commands or accepted package manager alternatives with same verb
        if (allowed.includes(normalized)) {
            return { malicious: false, info: { command: normalized } };
        }
        return { malicious: true, reason: `command not allowed for ${fw}: "${normalized}"` };
    }

    // For generic command type: be conservative — allow simple npm/yarn/pnpm install & build forms
    if (type === "COMMAND") {
        const normalized = trimmed.replace(/\s+/g, " ");
        const simpleAllowed = [
            "npm install",
            "yarn install",
            "pnpm install",
            "npm run build",
            "yarn build",
            "pnpm build",
            "ng build",
            "vue-cli-service build"
        ];
        if (simpleAllowed.includes(normalized)) {
            return { malicious: false, info: { command: normalized } };
        }
        // if command contains spaces or unusual tokens but not matched, reject
        return { malicious: true, reason: `command not in allowed list: "${normalized}"` };
    }

    // fallback: be safe
    return { malicious: true, reason: "unknown validation branch" };
}
