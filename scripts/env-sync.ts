/**
 * .env と google-credentials.json を AWS SSM Parameter Store で共有する。
 *
 * Usage:
 *   npx tsx scripts/env-sync.ts status   # ローカルと保管先の差分（値は出さない）
 *   npx tsx scripts/env-sync.ts pull     # 保管先 → ローカル
 *   npx tsx scripts/env-sync.ts push     # ローカル → 保管先
 *
 *   --force   pull で既存ファイルを上書きする（既定は退避してから書く）
 *   --yes     push の確認を省く
 *
 * なぜ Parameter Store か:
 *   Secrets Manager は1シークレットあたり月額がかかる。こちらは標準の
 *   SecureString なら無料で、4KB まで入る。.env も認証情報JSONも収まる。
 *   自動ローテーションが必要になったら Secrets Manager に移す。
 *
 * 秘密情報は標準出力に出さない。status は値そのものではなく
 * SHA-256 の先頭8桁だけを比べて一致/相違を示す。
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import path from "node:path";

const PROJECT_ROOT = path.resolve(__dirname, "..");
const PREFIX = "/konbu-suki";

// aws configure でリージョンを入れていない端末でも動くようにする。
// インフラは東京に置いてある。
const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ap-northeast-1";

type Managed = { file: string; parameter: string; label: string };

const MANAGED: Managed[] = [
  { file: ".env", parameter: `${PREFIX}/env`, label: ".env" },
  {
    file: "google-credentials.json",
    parameter: `${PREFIX}/google-credentials`,
    label: "google-credentials.json",
  },
];

const args = process.argv.slice(2);
const command = args.find((a) => !a.startsWith("--")) || "status";
const force = args.includes("--force");
const assumeYes = args.includes("--yes");

function fingerprint(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 8);
}

function aws(cliArgs: string[], input?: string): string {
  try {
    return execFileSync("aws", [...cliArgs, "--region", REGION], {
      encoding: "utf8",
      input,
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (e) {
    const err = e as { stderr?: string; message?: string; code?: string };
    if (err.code === "ENOENT") {
      throw new Error("aws コマンドが無い。AWS CLI を入れる。");
    }
    const message = (err.stderr || err.message || "").toString();
    if (/NoCredentials|Unable to locate credentials|NoRegion/.test(message)) {
      throw new Error(
        "AWS の認証情報が見つからない。この端末で aws configure を済ませるか、" +
          "認証情報が入っている端末で実行する。"
      );
    }
    if (/AccessDenied|not authorized/.test(message)) {
      throw new Error(
        "SSM Parameter Store への権限が足りない。IAM に ssm:GetParameter と " +
          "ssm:PutParameter（対象 " + PREFIX + "/*）を許可する。"
      );
    }
    throw new Error(message.split("\n").filter(Boolean).slice(-2).join(" / "));
  }
}

function readRemote(parameter: string): string | null {
  try {
    const out = aws([
      "ssm",
      "get-parameter",
      "--name",
      parameter,
      "--with-decryption",
      "--query",
      "Parameter.Value",
      "--output",
      "text",
    ]);
    // --output text は末尾に改行を足すので、保存時の内容に戻す
    return out.replace(/\n$/, "");
  } catch (e) {
    if (/ParameterNotFound/.test(String(e))) return null;
    throw e;
  }
}

function readLocal(file: string): string | null {
  const full = path.join(PROJECT_ROOT, file);
  return existsSync(full) ? readFileSync(full, "utf8") : null;
}

function status() {
  console.log(`保管先: SSM Parameter Store ${PREFIX}/*`);
  console.log("=".repeat(62));
  for (const item of MANAGED) {
    const local = readLocal(item.file);
    const remote = readRemote(item.parameter);
    const localMark = local === null ? "なし" : `あり(${fingerprint(local)})`;
    const remoteMark = remote === null ? "なし" : `あり(${fingerprint(remote)})`;
    let verdict: string;
    if (local === null && remote === null) verdict = "どちらにも無い";
    else if (local === null) verdict = "pull で取得できる";
    else if (remote === null) verdict = "push で登録できる";
    else verdict = local === remote ? "一致" : "相違（内容が違う）";
    console.log(`${item.label.padEnd(26)} ローカル:${localMark.padEnd(16)} 保管先:${remoteMark.padEnd(16)} ${verdict}`);
  }
  console.log("\n値そのものは表示しない。括弧内は SHA-256 の先頭8桁。");
}

function pull() {
  for (const item of MANAGED) {
    const remote = readRemote(item.parameter);
    if (remote === null) {
      console.log(`${item.label}: 保管先に無いので飛ばす`);
      continue;
    }
    const full = path.join(PROJECT_ROOT, item.file);
    const local = readLocal(item.file);
    if (local === remote) {
      console.log(`${item.label}: 同じ内容なので触らない`);
      continue;
    }
    if (local !== null && !force) {
      const backup = `${full}.backup-${Date.now()}`;
      copyFileSync(full, backup);
      console.log(`${item.label}: 既存を退避 → ${path.basename(backup)}`);
    }
    writeFileSync(full, remote);
    console.log(`${item.label}: 取得した (${fingerprint(remote)})`);
  }
}

function push() {
  const pending: { item: Managed; local: string; remote: string | null }[] = [];
  for (const item of MANAGED) {
    const local = readLocal(item.file);
    if (local === null) {
      console.log(`${item.label}: ローカルに無いので飛ばす`);
      continue;
    }
    const remote = readRemote(item.parameter);
    if (local === remote) {
      console.log(`${item.label}: 同じ内容なので触らない`);
      continue;
    }
    pending.push({ item, local, remote });
  }

  if (pending.length === 0) {
    console.log("送るものは無い");
    return;
  }

  console.log("\n保管先を上書きする対象:");
  for (const p of pending) {
    const from = p.remote === null ? "（新規）" : fingerprint(p.remote);
    console.log(`  ${p.item.label}: ${from} → ${fingerprint(p.local)}`);
  }

  if (!assumeYes) {
    console.log(
      "\n保管先は他の端末も参照する。意図した内容か確かめてから --yes を付けて実行する。"
    );
    return;
  }

  for (const p of pending) {
    aws(
      [
        "ssm",
        "put-parameter",
        "--name",
        p.item.parameter,
        "--type",
        "SecureString",
        "--overwrite",
        "--value",
        p.local,
      ]
    );
    console.log(`${p.item.label}: 登録した (${fingerprint(p.local)})`);
  }
}

function main() {
  try {
    if (command === "status") status();
    else if (command === "pull") pull();
    else if (command === "push") push();
    else {
      console.error(`不明なコマンド: ${command}（status / pull / push）`);
      process.exit(1);
    }
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}

main();
