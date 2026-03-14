# Admin Operations Guide

This folder contains the backend admin slice for:

- admin authentication
- admin audit log APIs
- admin-only middleware
- operational CLI usage for admin account management

## Security Note

Documenting these commands is safe because this file does **not** store:

- `ADMIN_CLI_SECRET`
- admin passwords
- JWT secrets
- real production emails

The CLI itself is still protected by:

- required `ADMIN_CLI_SECRET`
- interactive confirmation for sensitive commands
- hidden password prompts
- last active superadmin protection
- audit logging of CLI operations

What should **never** be written here:

- real secret values from `.env`
- copied production passwords
- one-time credentials

## Admin CLI Commands

Run all commands from the `backend` directory.

```powershell
cd backend
```

List admins:

```powershell
npm run admin:list
```

Create a new superadmin:

```powershell
npm run admin:create -- --email newadmin@example.com --role superadmin
```

Deactivate an old admin:

```powershell
npm run admin:deactivate -- --email oldadmin@example.com
```

Promote an admin to superadmin:

```powershell
npm run admin:promote -- --email reviewer@example.com --role superadmin
```

Hard delete an admin:

```powershell
npm run admin:delete -- --email oldadmin@example.com --force
```

Reset an admin password:

```powershell
npm run admin:reset-password -- --email admin@example.com
```

Dry-run examples:

```powershell
npm run admin:list -- --dry-run
npm run admin:delete -- --email oldadmin@example.com --force --dry-run
```

## Recommended Safe Workflow

Use this order when replacing a superadmin:

1. Create the new superadmin.
2. Verify the new admin can log in.
3. Deactivate the old superadmin.
4. Only use hard delete later if you truly need it.

Recommended commands:

```powershell
npm run admin:create -- --email newadmin@example.com --role superadmin
npm run admin:deactivate -- --email oldadmin@example.com
```

## Future Additions

This file can also be used later for:

- admin dashboard setup steps
- admin API usage notes
- audit log monitoring workflow
- incident recovery steps
- secure admin rotation procedure
