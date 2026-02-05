# Vercel Immediate Build Failure - Troubleshooting Guide

## Current Configuration

**vercel.json:**
```json
{
  "framework": "nextjs",
  "rootDirectory": "website"
}
```

**Dashboard Settings (verify these match):**
- Root Directory: `website`
- Framework Preset: `Next.js` (or "Other" for auto-detect)
- Build Command: (empty - auto-detect)
- Output Directory: (empty - auto-detect)
- Install Command: (empty - auto-detect)

## Critical Checks

### ✅ Verified:
1. `website/package.json` exists ✓
2. `website/next.config.ts` exists ✓
3. `website/app/` directory exists ✓
4. Next.js is in dependencies (`"next": "^16.0.8"`) ✓

### ⚠️ Potential Issues:

1. **Dashboard vs vercel.json Conflict**
   - If dashboard has `rootDirectory: "website"` AND vercel.json has it, ensure they match exactly
   - Try: Remove rootDirectory from dashboard, keep only in vercel.json (or vice versa)

2. **Framework Detection**
   - Dashboard Framework Preset should be "Next.js" OR "Other" (not conflicting)
   - If set to "Other", Vercel should auto-detect from package.json

3. **Package Manager Detection**
   - Both `package-lock.json` AND `pnpm-lock.yaml` exist - this might confuse Vercel
   - Solution: Delete one (preferably keep `package-lock.json` since npm is more standard)

4. **Git Repository Structure**
   - Ensure `website/` directory is committed to git
   - Ensure `vercel.json` is in the repo root (not in website/)

## Recommended Fix Steps

### Step 1: Clean up lock files
```bash
cd website
rm pnpm-lock.yaml  # Keep only package-lock.json
```

### Step 2: Verify dashboard settings
In Vercel Dashboard → Project Settings → General:
- Root Directory: `website`
- Framework Preset: `Next.js` (explicit, not "Other")
- All build commands: Leave empty (auto-detect)

### Step 3: Ensure vercel.json matches
Current vercel.json should be:
```json
{
  "framework": "nextjs",
  "rootDirectory": "website"
}
```

### Step 4: Check build logs
Click on the failed deployment → "View Build Logs" to see the exact error message

## Alternative: Remove vercel.json entirely
If still failing, try:
1. Delete `vercel.json`
2. Configure everything in Vercel Dashboard:
   - Root Directory: `website`
   - Framework Preset: `Next.js`
   - Build Command: (empty)
   - Output Directory: (empty)

## Most Likely Issue
The immediate failure suggests Vercel can't find or validate the Next.js project. This is usually because:
- Framework detection fails
- Package manager confusion (pnpm vs npm)
- Dashboard settings conflict with vercel.json

**Next Action:** Check the actual error message in Vercel build logs by clicking on the failed deployment.
