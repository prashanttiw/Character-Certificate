require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const readline = require("readline");
const Admin = require("../admin/models/Admin.model");
const ActivityLog = require("../models/ActivityLog");

const SALT_ROUNDS = 12;
const CLI_ACTOR_ID = "cli-script";
const CLI_USER_AGENT = "manageAdmin-cli";
const CLI_IP_ADDRESS = "127.0.0.1";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_STRENGTH_REGEX =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

let isDatabaseConnected = false;
let isDryRun = false;

class CliAbortError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "CliAbortError";
    this.exitCode = options.exitCode || 1;
  }
}

const print = (prefix, message) => {
  console.log(`[${prefix}] ${message}`);
};

const abortCli = (prefix, message, options = {}) => {
  print(prefix, message);
  throw new CliAbortError(message, options);
};

const parseArgs = (argv) => {
  const [command, ...rawArgs] = argv;
  const flags = {};

  for (let index = 0; index < rawArgs.length; index += 1) {
    const currentArg = rawArgs[index];

    if (!currentArg.startsWith("--")) {
      continue;
    }

    const key = currentArg.slice(2);
    const nextArg = rawArgs[index + 1];

    if (!nextArg || nextArg.startsWith("--")) {
      flags[key] = true;
      continue;
    }

    flags[key] = nextArg;
    index += 1;
  }

  return { command, flags };
};

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const ensureCliSecret = () => {
  const cliSecret = String(process.env.ADMIN_CLI_SECRET || "").trim();

  if (!cliSecret) {
    abortCli("ERROR", "ADMIN_CLI_SECRET is missing or empty. Aborting.");
  }
};

const connectToMongo = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;

  if (!mongoUri) {
    abortCli("ERROR", "MONGO_URI is missing. Aborting.");
  }

  await mongoose.connect(mongoUri);
  isDatabaseConnected = true;
};

const createCliLogDocument = ({
  action,
  targetAdmin = null,
  command,
  status = "success",
  extraMetadata = {},
}) => {
  const executedAt = new Date();
  const resourceId = targetAdmin?._id ? String(targetAdmin._id) : null;
  const targetEmail = targetAdmin?.email ? normalizeEmail(targetAdmin.email) : null;

  return {
    actorType: "cli",
    actorId: CLI_ACTOR_ID,
    actorLabel: CLI_USER_AGENT,
    action,
    entityType: "admin",
    entityId: resourceId,
    resourceType: "admin",
    resourceId,
    status,
    details: {
      metadata: {
        targetEmail,
        command,
        executedAt: executedAt.toISOString(),
        ...extraMetadata,
      },
    },
    metadata: {
      targetEmail,
      command,
      executedAt: executedAt.toISOString(),
      ...extraMetadata,
    },
    request: {
      method: "CLI",
      path: `manageAdmin ${command}`,
      ipAddress: CLI_IP_ADDRESS,
      userAgent: CLI_USER_AGENT,
    },
    ipAddress: CLI_IP_ADDRESS,
    userAgent: CLI_USER_AGENT,
    createdAt: executedAt,
  };
};

const writeActivityLog = async ({
  action,
  targetAdmin = null,
  command,
  status = "success",
  extraMetadata = {},
}) => {
  const payload = createCliLogDocument({
    action,
    targetAdmin,
    command,
    status,
    extraMetadata,
  });

  if (isDryRun) {
    print(
      "DRY RUN",
      `Would write ActivityLog entry for action "${action}" targeting "${payload.metadata.targetEmail || "n/a"}".`
    );
    return;
  }

  await ActivityLog.collection.insertOne(payload);
};

const askQuestion = (query, { hidden = false } = {}) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    if (hidden) {
      rl.stdoutMuted = true;
      rl._writeToOutput = function writeToOutput(outputText) {
        if (rl.stdoutMuted) {
          rl.output.write("*");
          return;
        }

        rl.output.write(outputText);
      };
    }

    rl.question(query, (answer) => {
      rl.close();
      if (hidden) {
        process.stdout.write("\n");
      }
      resolve(answer);
    });
  });

const promptForPassword = async (label) => {
  const password = await askQuestion(`${label}: `, { hidden: true });
  return password;
};

const promptForConfirmation = async (expectedEmail) =>
  askQuestion("Type the admin email to confirm: ");

const validateEmailOrExit = (email) => {
  if (!EMAIL_REGEX.test(email)) {
    abortCli("ERROR", `Invalid email format: ${email}`);
  }
};

const validateRoleOrExit = (role) => {
  if (!["admin", "superadmin"].includes(role)) {
    abortCli("ERROR", `Invalid role "${role}". Use "admin" or "superadmin".`);
  }
};

const validatePasswordStrengthOrExit = (password) => {
  if (!PASSWORD_STRENGTH_REGEX.test(password)) {
    abortCli(
      "ERROR",
      "Password must be at least 12 characters and include an uppercase letter, a number, and a special character."
    );
  }
};

const getAdminByEmail = async (email) =>
  Admin.collection.findOne({ email: normalizeEmail(email) });

const countActiveSuperadmins = async () =>
  Admin.collection.countDocuments({
    role: "superadmin",
    isActive: true,
  });

const ensureAdminExists = async (email, command) => {
  const admin = await getAdminByEmail(email);

  if (!admin) {
    abortCli("ERROR", `No admin found for email ${normalizeEmail(email)}.`);
  }

  return admin;
};

const ensureNotLastActiveSuperadmin = async (targetAdmin, command) => {
  if (!(targetAdmin.role === "superadmin" && targetAdmin.isActive)) {
    return;
  }

  const activeSuperadminCount = await countActiveSuperadmins();

  if (activeSuperadminCount <= 1) {
    const message =
      "Cannot delete/deactivate the only active superadmin. Create another superadmin first.";

    await writeActivityLog({
      action: "blocked_operation",
      targetAdmin,
      command,
      status: "failure",
      extraMetadata: {
        reason: "last_active_superadmin",
      },
    });

    abortCli("BLOCKED", message);
  }
};

const confirmByEmailOrAbort = async (targetAdmin, command) => {
  if (isDryRun) {
    print(
      "DRY RUN",
      `Would prompt for interactive confirmation of ${normalizeEmail(targetAdmin.email)}.`
    );
    return;
  }

  const typedEmail = await promptForConfirmation(targetAdmin.email);

  if (typedEmail !== targetAdmin.email) {
    await writeActivityLog({
      action: "failed_confirmation",
      targetAdmin,
      command,
      status: "failure",
      extraMetadata: {
        typedEmail,
      },
    });

    abortCli("ERROR", "Confirmation email did not match. Aborting.");
  }
};

const printUsage = () => {
  print(
    "INFO",
    "Usage: node scripts/manageAdmin.js <list|create|deactivate|promote|delete|reset-password> [--flags]"
  );
};

const printAdminTable = (admins) => {
  const headers = ["email", "role", "isActive", "createdAt"];
  const rows = admins.map((admin) => [
    admin.email || "",
    admin.role || "",
    String(Boolean(admin.isActive)),
    admin.createdAt ? new Date(admin.createdAt).toISOString() : "",
  ]);

  const widths = headers.map((header, columnIndex) =>
    Math.max(
      header.length,
      ...rows.map((row) => String(row[columnIndex]).length)
    )
  );

  const formatRow = (row) =>
    row.map((cell, index) => String(cell).padEnd(widths[index])).join(" | ");

  console.log(formatRow(headers));
  console.log(widths.map((width) => "-".repeat(width)).join("-+-"));
  rows.forEach((row) => console.log(formatRow(row)));
};

const runList = async () => {
  if (isDryRun) {
    print("DRY RUN", "Would query all admins and print email | role | isActive | createdAt.");
    return;
  }

  const admins = await Admin.collection
    .find({}, { projection: { email: 1, role: 1, isActive: 1, createdAt: 1 } })
    .sort({ createdAt: 1 })
    .toArray();

  if (admins.length === 0) {
    print("INFO", "No admins found.");
    return;
  }

  print("INFO", "Listing admins:");
  printAdminTable(admins);
};

const runCreate = async (flags) => {
  const email = normalizeEmail(flags.email);
  const role = String(flags.role || "").trim();

  if (!email || !role) {
    abortCli("ERROR", "create requires --email and --role.");
  }

  validateEmailOrExit(email);
  validateRoleOrExit(role);

  const existingAdmin = await getAdminByEmail(email);
  if (existingAdmin) {
    abortCli("ERROR", `Admin with email ${email} already exists.`);
  }

  if (isDryRun) {
    print("DRY RUN", `Would create admin ${email} with role ${role}.`);
    print("DRY RUN", "Would write ActivityLog entry for action \"admin_created\".");
    return;
  }

  const password = await promptForPassword("Enter password");
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const timestamp = new Date();

  const newAdminDocument = {
    name: email.split("@")[0],
    email,
    password: hashedPassword,
    passwordHash: hashedPassword,
    role,
    isActive: true,
    tokenVersion: 0,
    lastLoginAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const insertResult = await Admin.collection.insertOne(newAdminDocument);
  const createdAdmin = {
    ...newAdminDocument,
    _id: insertResult.insertedId,
  };

  await writeActivityLog({
    action: "admin_created",
    targetAdmin: createdAdmin,
    command: "create",
    extraMetadata: {
      role,
    },
  });

  print("SUCCESS", `Created admin ${email} with role ${role}.`);
};

const runDeactivate = async (flags) => {
  const email = normalizeEmail(flags.email);

  if (!email) {
    abortCli("ERROR", "deactivate requires --email.");
  }

  validateEmailOrExit(email);

  const targetAdmin = await ensureAdminExists(email, "deactivate");
  await ensureNotLastActiveSuperadmin(targetAdmin, "deactivate");

  await writeActivityLog({
    action: "admin_deactivate_initiated",
    targetAdmin,
    command: "deactivate",
  });

  await confirmByEmailOrAbort(targetAdmin, "deactivate");

  if (isDryRun) {
    print(
      "DRY RUN",
      `Would set isActive=false and increment tokenVersion for ${email}.`
    );
    print(
      "DRY RUN",
      "Would write ActivityLog entry for action \"admin_deactivate_completed\"."
    );
    return;
  }

  await Admin.collection.updateOne(
    { _id: targetAdmin._id },
    {
      $set: {
        isActive: false,
        updatedAt: new Date(),
      },
      $inc: {
        tokenVersion: 1,
      },
    }
  );

  await writeActivityLog({
    action: "admin_deactivate_completed",
    targetAdmin,
    command: "deactivate",
  });

  print("SUCCESS", `Deactivated admin ${email}.`);
};

const runPromote = async (flags) => {
  const email = normalizeEmail(flags.email);
  const role = String(flags.role || "").trim();

  if (!email || !role) {
    abortCli("ERROR", "promote requires --email and --role.");
  }

  validateEmailOrExit(email);
  validateRoleOrExit(role);

  const targetAdmin = await ensureAdminExists(email, "promote");

  await writeActivityLog({
    action: "admin_promote_initiated",
    targetAdmin,
    command: "promote",
    extraMetadata: {
      nextRole: role,
      previousRole: targetAdmin.role,
    },
  });

  await confirmByEmailOrAbort(targetAdmin, "promote");

  if (isDryRun) {
    print(
      "DRY RUN",
      `Would update role for ${email} from ${targetAdmin.role} to ${role}.`
    );
    print(
      "DRY RUN",
      "Would write ActivityLog entry for action \"admin_promote_completed\"."
    );
    return;
  }

  await Admin.collection.updateOne(
    { _id: targetAdmin._id },
    {
      $set: {
        role,
        updatedAt: new Date(),
      },
    }
  );

  await writeActivityLog({
    action: "admin_promote_completed",
    targetAdmin,
    command: "promote",
    extraMetadata: {
      nextRole: role,
      previousRole: targetAdmin.role,
    },
  });

  print("SUCCESS", `Updated ${email} to role ${role}.`);
};

const runDelete = async (flags) => {
  const email = normalizeEmail(flags.email);
  const hasForce = Boolean(flags.force);

  if (!email) {
    abortCli("ERROR", "delete requires --email.");
  }

  if (!hasForce) {
    abortCli(
      "WARNING",
      "Hard delete is not the default workflow. Recommended path: create a new superadmin, verify login, deactivate the old one, then delete with --force only if truly needed."
    );
  }

  validateEmailOrExit(email);

  const targetAdmin = await ensureAdminExists(email, "delete");
  await ensureNotLastActiveSuperadmin(targetAdmin, "delete");

  print(
    "WARNING",
    "Delete permanently removes the admin account. Deactivate is safer unless hard deletion is truly required."
  );

  await writeActivityLog({
    action: "admin_delete_initiated",
    targetAdmin,
    command: "delete",
  });

  await confirmByEmailOrAbort(targetAdmin, "delete");

  if (isDryRun) {
    print("DRY RUN", `Would hard delete admin ${email}.`);
    print(
      "DRY RUN",
      "Would write ActivityLog entry for action \"admin_delete_completed\"."
    );
    return;
  }

  await Admin.collection.deleteOne({ _id: targetAdmin._id });

  await writeActivityLog({
    action: "admin_delete_completed",
    targetAdmin,
    command: "delete",
  });

  print("SUCCESS", `Deleted admin ${email}.`);
};

const runResetPassword = async (flags) => {
  const email = normalizeEmail(flags.email);

  if (!email) {
    abortCli("ERROR", "reset-password requires --email.");
  }

  validateEmailOrExit(email);

  const targetAdmin = await ensureAdminExists(email, "reset-password");

  await writeActivityLog({
    action: "admin_password_reset_initiated",
    targetAdmin,
    command: "reset-password",
  });

  await confirmByEmailOrAbort(targetAdmin, "reset-password");

  if (isDryRun) {
    print(
      "DRY RUN",
      `Would prompt for a new password, hash it, update ${email}, and increment tokenVersion.`
    );
    print(
      "DRY RUN",
      "Would write ActivityLog entry for action \"admin_password_reset\"."
    );
    return;
  }

  const password = await promptForPassword("Enter new password");
  const confirmPassword = await promptForPassword("Confirm new password");

  if (password !== confirmPassword) {
    await writeActivityLog({
      action: "admin_password_reset_failed",
      targetAdmin,
      command: "reset-password",
      status: "failure",
      extraMetadata: {
        reason: "password_confirmation_mismatch",
      },
    });

    abortCli("ERROR", "Passwords do not match. Aborting.");
  }

  validatePasswordStrengthOrExit(password);

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  await Admin.collection.updateOne(
    { _id: targetAdmin._id },
    {
      $set: {
        password: hashedPassword,
        passwordHash: hashedPassword,
        updatedAt: new Date(),
      },
      $inc: {
        tokenVersion: 1,
      },
    }
  );

  await writeActivityLog({
    action: "admin_password_reset",
    targetAdmin,
    command: "reset-password",
  });

  print("SUCCESS", `Password reset completed for ${email}.`);
};

const main = async () => {
  const { command, flags } = parseArgs(process.argv.slice(2));
  isDryRun = Boolean(flags["dry-run"]);

  ensureCliSecret();

  if (!command) {
    printUsage();
    throw new CliAbortError("Command is required.");
  }

  await connectToMongo();

  switch (command) {
    case "list":
      await runList();
      break;
    case "create":
      await runCreate(flags);
      break;
    case "deactivate":
      await runDeactivate(flags);
      break;
    case "promote":
      await runPromote(flags);
      break;
    case "delete":
      await runDelete(flags);
      break;
    case "reset-password":
      await runResetPassword(flags);
      break;
    default:
      print("ERROR", `Unknown command "${command}".`);
      printUsage();
      throw new CliAbortError(`Unknown command "${command}".`);
  }
};

main()
  .catch(async (error) => {
    if (!(error instanceof CliAbortError)) {
      print("ERROR", error.message);
    }

    if (isDatabaseConnected && !(error instanceof CliAbortError)) {
      try {
        await writeActivityLog({
          action: "admin_cli_error",
          targetAdmin: null,
          command: "unknown",
          status: "failure",
          extraMetadata: {
            error: error.message,
          },
        });
      } catch (logError) {
        print("ERROR", `Failed to write admin_cli_error log: ${logError.message}`);
      }
    }

    process.exitCode = error instanceof CliAbortError ? error.exitCode : 1;
  })
  .finally(async () => {
    if (isDatabaseConnected) {
      await mongoose.disconnect();
      isDatabaseConnected = false;
    }
  });
