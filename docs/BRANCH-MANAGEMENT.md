# Branch Management Feature

## Overview

The Branch Management feature allows users to create and manage multiple versions of their scripts using a Git-like branching system. This enables safe experimentation with script variations without affecting the main version.

## Features

### 1. Branch Creation
- Create new branches from any version of a script
- Name branches to indicate their purpose (e.g., `test-different-hook`, `experiment-tone`)
- Branches start with content from a selected base version
- Main branch is auto-created for each script

### 2. Branch Switching
- Seamlessly switch between branches
- Each branch maintains its own content independently
- Active branch is visually indicated with a badge
- Branch changes are persisted across sessions

### 3. Branch Merging
- Merge experimental branches back to main
- Simple last-write-wins strategy (no conflict resolution needed)
- Merged branches are marked for historical tracking
- Merge operations include confirmation step

## User Interface

### MyScripts Page Integration

The BranchSelector appears on each script card in the MyScripts page:

```
┌─────────────────────────────────────┐
│ Script Title                        │
│ Badges: niche, length, tone         │
│                                      │
│ Actions:                             │
│ [📁 main ▼] [👁️ View] [⬇️ Export]  │
│ [📜 History] [💾 Save] [🗑️ Delete]  │
└─────────────────────────────────────┘
```

### Branch Dropdown Menu

When clicking the branch selector:

```
┌─────────────────────────┐
│ 📁 main         ✓       │
│ 📁 test-variant         │
│ 📁 experiment-tone      │
│ ─────────────────────   │
│ ➕ Create New Branch    │
│ 🔀 Merge to Main        │
└─────────────────────────┘
```

## How to Use

### Creating a Branch

1. Navigate to **MyScripts** page
2. Find the script you want to branch
3. Click the branch selector button (shows current branch, e.g., "main")
4. Select **Create New Branch**
5. Enter a branch name
6. Select the starting version (defaults to current)
7. Click **Create**

The editor automatically switches to the new branch.

### Switching Branches

1. Click the branch selector button on a script card
2. Select the desired branch from the dropdown
3. Script content updates to the selected branch
4. Toast notification confirms the switch

### Merging Branches

1. Switch to the branch you want to merge (must be non-main)
2. Click the branch selector
3. Select **Merge to Main**
4. Review the merge preview (shows changes)
5. Confirm the merge
6. Main branch is updated with the merged content

### Best Practices

**Branch Naming Conventions:**
- `main` - Default production branch
- `experiment/*` - Testing variations
- `feature/*` - Adding new elements
- `fix/*` - Corrections and improvements

**When to Use Branches:**
- Testing different hooks or openings
- Experimenting with tone changes
- A/B testing script variations
- Developing series episode variations

**Tips:**
- Keep branch names descriptive and short
- Merge successful experiments back to main
- Delete or archive branches that didn't work out
- Use version history alongside branches for fine-grained control

## Technical Details

### Database Schema

**script_branches table:**
```sql
- id: UUID
- script_id: UUID (foreign key)
- user_id: UUID
- branch_name: TEXT (unique per script)
- parent_branch_id: UUID (nullable)
- created_from_version: INTEGER
- current_version_content: TEXT
- is_active: BOOLEAN
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
- merged_at: TIMESTAMPTZ (nullable)
- merged_by: UUID (nullable)
```

**scripts table extension:**
```sql
- active_branch_id: UUID (nullable, foreign key to script_branches)
```

### Edge Functions

1. **create-branch**
   - Creates new branch record
   - Copies content from specified version
   - Returns branch details

2. **switch-branch**
   - Updates script's active_branch_id
   - Returns updated branch info

3. **merge-branch**
   - Performs merge operation
   - Updates target branch content
   - Marks source branch as merged

### Security

- **Row Level Security (RLS)**: All branch operations respect user ownership
- **RLS Policies**:
  - Users can only view/create/update their own branches
  - Main branch cannot be deleted
  - Branch operations require authentication
- **Input Validation**: Branch names sanitized to prevent XSS
- **Authorization**: Edge functions validate user ownership

## API Reference

### React Component

```typescript
import { BranchSelector } from '@/components/branching/BranchSelector';

<BranchSelector
  scriptId={script.id}
  currentBranchId={script.active_branch_id}
  onBranchChange={(branchId) => handleBranchChange(scriptId, branchId)}
/>
```

### Supabase Edge Functions

```typescript
// Create Branch
const { data, error } = await supabase.functions.invoke('create-branch', {
  body: {
    scriptId: 'uuid',
    branchName: 'experiment-tone',
    fromVersion: 1
  }
});

// Switch Branch
const { data, error } = await supabase.functions.invoke('switch-branch', {
  body: {
    scriptId: 'uuid',
    branchId: 'uuid'
  }
});

// Merge Branch
const { data, error } = await supabase.functions.invoke('merge-branch', {
  body: {
    scriptId: 'uuid',
    sourceBranchId: 'uuid',
    targetBranchId: 'uuid'
  }
});
```

## Testing

### E2E Tests

Run branch management E2E tests:

```bash
npx playwright test e2e/branch-management.spec.ts
```

Tests cover:
- Branch creation workflow
- Branch switching
- Branch merging
- Error handling
- Accessibility
- Keyboard navigation

### Manual Testing

1. **Create a script** if you don't have one
2. **Navigate to MyScripts**
3. **Click branch selector** (should show "main")
4. **Create branch** named "test-1"
5. **Verify switch** - button should now show "test-1"
6. **Create another branch** named "test-2"
7. **Switch between branches** and verify toast notifications
8. **Merge test-1 to main**
9. **Verify merge** - main should have test-1's content

## Troubleshooting

### Branch Selector Not Appearing
- Ensure you're logged in
- Verify scripts are loading (check network tab)
- Check browser console for errors
- Verify Supabase connection

### Cannot Create Branch
- Check branch name uniqueness (no duplicates per script)
- Verify user has permission to modify script
- Check Supabase edge function logs

### Branch Switch Not Updating Content
- Verify edge function `switch-branch` is deployed
- Check RLS policies on `script_branches` table
- Ensure `active_branch_id` field exists on scripts table

### Merge Conflicts
- This version uses simple last-write-wins strategy
- No conflict resolution UI (coming in future version)
- If unexpected results, use version history to restore

## Future Enhancements

- [ ] Visual diff viewer for branch comparisons
- [ ] Merge conflict resolution UI
- [ ] Branch permissions (read-only branches)
- [ ] Branch templates
- [ ] Bulk branch operations
- [ ] Branch history timeline view
- [ ] Integration with A/B testing feature
- [ ] Branch performance metrics

## Related Documentation

- [PRD-Advanced-Features.md](./PRD-Advanced-Features.md) - Full feature specification
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [Version History](./version-history.md) - Related versioning feature

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review existing GitHub Issues
3. Create a new issue with details about your problem

## License

Part of the TikTok Story AI platform. See main project LICENSE.
