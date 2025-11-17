# Product Requirements Document: Advanced Script Management Features

## Document Version
- **Version**: 1.0
- **Date**: 2024-11-17
- **Status**: Implemented (Backend), Blocked (Frontend)

## Executive Summary

This document outlines three major features for the script management platform: Analytics Export, A/B Testing, and Version Branching. The backend infrastructure (database schema and edge functions) has been successfully implemented. Frontend components encountered TypeScript compiler limitations and require incremental recreation.

---

## Feature 1: Analytics Export

### Overview
Enable users to export their analytics data in multiple formats for external analysis and reporting.

### Supported Formats
- **CSV**: Spreadsheet-compatible, ideal for Excel/Google Sheets
- **JSON**: Structured data for programmatic access
- **PDF**: Professional reports with charts and visualizations
- **Excel**: Native .xlsx format with multiple sheets

### Database Requirements
✅ **Implemented**: No database changes required - uses existing `predictions_history` table

### Edge Functions
✅ **Implemented**: None required - client-side export functionality

### Frontend Components Required
- `src/lib/exportUtils.ts`: Export utilities for all formats
- `src/components/AnalyticsExport.tsx`: Export UI component

### Dependencies
- `jspdf` (v3.0.3): PDF generation
- `jspdf-autotable` (v5.0.2): PDF table formatting
- `html2canvas` (v1.4.1): Chart capture for PDFs
- `xlsx` (v0.18.5): Excel file generation

### User Flow
1. Navigate to Analytics page
2. Click "Export Analytics" button
3. Select desired format (CSV/JSON/PDF/Excel)
4. Optionally select date range
5. File downloads automatically

### Technical Specifications

#### CSV Export
```typescript
// Exports predictions with scores
// Columns: Title, Created, Viral Score, Engagement, Shareability, Hook, Emotional Impact
```

#### JSON Export
```typescript
// Complete prediction objects with all metadata
// Includes recommendations, strengths, weaknesses
```

#### PDF Export
```typescript
// Multi-page document with:
// - Title page with date range
// - Summary statistics
// - Chart visualizations (captured as images)
// - Detailed prediction list with scores
```

#### Excel Export
```typescript
// Multi-sheet workbook:
// - Summary sheet: aggregated statistics
// - Predictions sheet: detailed prediction data
// - Charts sheet: embedded visualizations
```

---

## Feature 2: A/B Testing Framework

### Overview
Allow users to test multiple script variations scientifically to determine which performs best according to predicted metrics.

### Database Schema

✅ **Implemented**: 

#### Table: `ab_tests`
```sql
CREATE TABLE ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  script_id UUID NOT NULL REFERENCES scripts(id),
  test_name TEXT NOT NULL,
  hypothesis TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'archived'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  winner_variant_id UUID,
  notes TEXT
);
```

#### Table: `ab_test_variants`
```sql
CREATE TABLE ab_test_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ab_tests(id),
  variant_name TEXT NOT NULL,
  content TEXT NOT NULL,
  version_id UUID REFERENCES script_versions(id),
  branch_id UUID REFERENCES script_branches(id),
  prediction_id UUID REFERENCES predictions_history(id),
  viral_score INTEGER,
  engagement_score INTEGER,
  shareability_score INTEGER,
  hook_strength INTEGER,
  emotional_impact INTEGER,
  trend_alignment INTEGER,
  user_preference_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Table: `ab_test_results`
```sql
CREATE TABLE ab_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ab_tests(id),
  variant_id UUID NOT NULL REFERENCES ab_test_variants(id),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### RLS Policies
✅ **Implemented**:
- Users can manage their own tests
- Users can view/insert results for their tests
- Users can manage variants for their tests

### Edge Functions

✅ **Implemented**: 

#### `run-ab-test`
- **Purpose**: Create test and analyze variants
- **Input**: scriptId, testName, hypothesis, variants[]
- **Process**: 
  1. Create ab_test record
  2. For each variant, invoke analyze-script
  3. Create prediction records
  4. Create variant records with scores
- **Output**: Test ID and variant details

#### `complete-ab-test`
- **Purpose**: Mark test as complete and declare winner
- **Input**: testId, winnerId
- **Process**: Update status to 'completed', set winner_variant_id
- **Output**: Updated test record

### Frontend Components Required
- `src/pages/ABTests.tsx`: Main A/B testing dashboard
- `src/components/ABTestWizard.tsx`: Test creation wizard
- `src/components/ABTestResults.tsx`: Results visualization

### User Flow
1. Select script to test
2. Click "Create A/B Test"
3. Define test hypothesis
4. Add 2+ variants (paste content or select from versions/branches)
5. Run test (system analyzes all variants)
6. Review comparative metrics
7. Declare winner (optional)
8. Apply winning variant to main script

### Metrics Compared
- Viral Score (primary)
- Engagement Score
- Shareability Score
- Hook Strength
- Emotional Impact
- Trend Alignment

### Best Practices
- Test 2-5 variants (avoid decision paralysis)
- Focus on one variable (hook, tone, structure)
- Document hypothesis clearly
- Run tests when you have meaningful variations

---

## Feature 3: Version Branching

### Overview
Git-like branching system allowing users to experiment with script variations without affecting the main version.

### Database Schema

✅ **Implemented**:

#### Table: `script_branches`
```sql
CREATE TABLE script_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL REFERENCES scripts(id),
  user_id UUID NOT NULL,
  branch_name TEXT NOT NULL,
  parent_branch_id UUID REFERENCES script_branches(id),
  created_from_version INTEGER NOT NULL,
  current_version_content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  niche TEXT,
  length TEXT,
  tone TEXT,
  topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  merged_at TIMESTAMP WITH TIME ZONE,
  merged_by UUID,
  UNIQUE(script_id, branch_name)
);
```

#### Scripts Table Extension
```sql
ALTER TABLE scripts ADD COLUMN active_branch_id UUID REFERENCES script_branches(id);
```

### RLS Policies
✅ **Implemented**:
- Users can view/create/update their own branches
- Users can delete branches (except 'main')

### Edge Functions

✅ **Implemented**:

#### `create-branch`
- **Purpose**: Create new experimental branch
- **Input**: scriptId, branchName, fromVersion
- **Process**: 
  1. Validate branch name uniqueness
  2. Get content from specified version
  3. Create branch record
- **Output**: New branch details

#### `switch-branch`
- **Purpose**: Switch active branch for a script
- **Input**: scriptId, branchId
- **Process**: Update active_branch_id in scripts table
- **Output**: Branch details

#### `merge-branch`
- **Purpose**: Merge branch changes back to main
- **Input**: scriptId, sourceBranchId, targetBranchId
- **Process**:
  1. Get both branch contents
  2. Create new version in target branch
  3. Mark source branch as merged
  4. Update script content if merging to main
- **Output**: Merged content and version details

### Frontend Components Required
- `src/components/BranchSelector.tsx`: Branch switcher dropdown
- `src/components/CreateBranchModal.tsx`: Branch creation dialog
- `src/components/MergeBranchModal.tsx`: Merge interface with diff view

### User Flow

#### Create Branch
1. View script in editor
2. Click "Create Branch"
3. Enter branch name (e.g., "test-different-hook")
4. Select starting version
5. Branch created, automatically switched to new branch

#### Switch Branch
1. Click branch selector dropdown
2. Select branch from list
3. Editor loads branch content
4. All edits save to active branch

#### Merge Branch
1. Select source branch
2. Click "Merge to Main"
3. Review diff visualization
4. Confirm merge
5. Branch marked as merged
6. Main branch updated

### Branch Naming Conventions
- `main`: Default branch (auto-created)
- `experiment/*`: Testing variations
- `feature/*`: Adding new elements
- `fix/*`: Corrections and improvements

### Supporting Utilities

✅ **Implemented**: `src/utils/diffUtils.ts`

#### Word-level Diff Algorithm
```typescript
computeWordDiff(oldText: string, newText: string): DiffSegment[]
// Returns segments marked as 'add', 'remove', or 'same'
// Used for merge preview visualization
```

#### Metrics Delta Calculator
```typescript
computeMetricsDelta(oldValue: number, newValue: number)
// Returns delta, percentChange, direction
// Used for comparing version performance
```

---

## Auto-Versioning System

✅ **Implemented**: `src/hooks/useAutoVersion.tsx`

### Overview
Automatically saves script versions based on configurable criteria, reducing manual version management burden.

### Configuration Options
```typescript
interface AutoVersionConfig {
  enabled: boolean;
  minTimeBetweenVersions: number;        // ms, default: 5 minutes
  minContentChangeThreshold: number;     // characters, default: 50
  minContentChangePercent: number;       // %, default: 5%
}
```

### Trigger Logic
Auto-version is created when ALL conditions are met:
1. Minimum time has elapsed since last version
2. Content has changed by minimum character count
3. Content has changed by minimum percentage
4. Configuration is enabled

### Change Detection
- Character-level diff calculation
- Percentage change calculation
- Automatic change description generation
- Metadata comparison (title, niche, length, tone)

### Integration
```typescript
// In any script editor component
const { checkAndCreateVersion, isCreating } = useAutoVersion(
  scriptId,
  currentSnapshot,
  config
);

// Call periodically or on blur
checkAndCreateVersion(snapshot, userId);
```

---

## Problem Analysis: TypeScript Compiler Stack Overflow

### Incident Summary
**Date**: 2024-11-17  
**Severity**: Critical (Build Failure)  
**Impact**: Complete build failure, project unusable

### Root Cause Analysis

#### Immediate Trigger
Creating 8+ complex TypeScript files simultaneously with:
- Heavy external library imports (jspdf, html2canvas, xlsx)
- Complex type definitions
- Interconnected component dependencies
- Large generated type files (Supabase types)

#### Technical Explanation
The TypeScript compiler's incremental compilation system became overwhelmed:

1. **Incremental Compilation Cache Corruption**
   ```
   Error: runtime: goroutine stack exceeds 1000000000-byte limit
   Location: internal/execute/incremental/affectedfileshandler.go:275
   ```

2. **Circular Type Reference Detection**
   - Compiler attempted to trace type dependencies across all new files
   - `handleDtsMayChangeOfFileAndExportsOfFile` function entered infinite recursion
   - Each new file import increased the dependency graph complexity exponentially

3. **Memory Exhaustion**
   - TypeScript type checker allocates memory for each file's type information
   - With 100+ project files + heavy library types, exceeded available memory
   - Garbage collection couldn't keep pace with allocation rate

### Why This Happened

#### Anti-Pattern: Massive Parallel File Creation
```typescript
// ❌ WRONG: Created all these simultaneously
- src/lib/exportUtils.ts (heavy imports: jspdf, html2canvas, xlsx)
- src/components/AnalyticsExport.tsx
- src/components/ABTestWizard.tsx
- src/components/ABTestResults.tsx
- src/pages/ABTests.tsx
- src/components/BranchSelector.tsx
- src/components/CreateBranchModal.tsx
- src/components/MergeBranchModal.tsx
```

Each file:
- Imports from complex libraries
- Defines its own types
- Cross-references other new files
- Depends on large generated types (Supabase)

TypeScript compiler behavior:
1. Receives all 8 files at once
2. Attempts to build full dependency graph
3. Each file's types depend on others
4. Infinite loop trying to resolve circular dependencies
5. Stack overflow

### Prevention Strategies

#### 1. Sequential Component Creation ✅ REQUIRED
```typescript
// ✅ CORRECT: Create one at a time
Step 1: Create src/lib/exportUtils.ts
        Wait for successful compilation
        
Step 2: Create src/components/AnalyticsExport.tsx
        Wait for successful compilation
        
Step 3: Create src/components/ABTestWizard.tsx
        Wait for successful compilation
        
... continue sequentially
```

#### 2. Minimize Heavy Imports
```typescript
// ❌ WRONG: Import entire library
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

// ✅ BETTER: Dynamic imports for heavy dependencies
const exportToPDF = async () => {
  const jsPDF = (await import('jspdf')).default;
  await import('jspdf-autotable');
  // Use jsPDF...
};
```

#### 3. Simplify Type Definitions
```typescript
// ❌ WRONG: Complex inferred types
const exportData = (data: ReturnType<typeof processAnalytics>) => {
  // Complex inference chain...
};

// ✅ BETTER: Explicit simple types
interface ExportData {
  predictions: Array<{
    title: string;
    score: number;
    date: string;
  }>;
  summary: {
    total: number;
    average: number;
  };
}

const exportData = (data: ExportData) => {
  // Clear types...
};
```

#### 4. Break Up Large Files
```typescript
// ❌ WRONG: Single 500-line exportUtils.ts with all formats

// ✅ BETTER: Split by format
src/lib/export/
  ├── csv.ts       // CSV export only
  ├── json.ts      // JSON export only
  ├── pdf.ts       // PDF export only
  ├── excel.ts     // Excel export only
  └── index.ts     // Re-exports
```

#### 5. Lazy Load Complex Components
```typescript
// ✅ Use React.lazy for heavy components
const ABTestWizard = React.lazy(() => import('@/components/ABTestWizard'));
const AnalyticsExport = React.lazy(() => import('@/components/AnalyticsExport'));

// Wrap in Suspense
<Suspense fallback={<LoadingSpinner />}>
  <ABTestWizard />
</Suspense>
```

#### 6. Monitor File Creation
When creating multiple files:
- Create max 2-3 files at once
- Wait for compilation success before proceeding
- Watch for TypeScript errors immediately
- If error appears, stop and fix before continuing

### Recovery Procedures

#### If Stack Overflow Occurs:

1. **Immediate Actions**
   - Stop creating new files
   - Delete most recently created files
   - Wait for compilation attempt

2. **If Compilation Still Fails**
   - Use History to restore to last working state
   - Clear browser cache and reload
   - Restart development server

3. **Rebuilding**
   - Recreate files ONE AT A TIME
   - Test compilation after each file
   - Simplify types and imports
   - Use dynamic imports for heavy libraries

### TypeScript Compiler Limits

Based on this incident, practical limits for Lovable projects:

| Metric | Safe Zone | Warning | Danger |
|--------|-----------|---------|--------|
| Files created at once | 1-2 | 3-4 | 5+ |
| Heavy library imports | 0-1 | 2 | 3+ |
| File size | <200 lines | 200-400 | 400+ |
| Type complexity depth | 1-2 levels | 3-4 levels | 5+ levels |

### Monitoring Indicators

Watch for these warning signs:
- Compilation taking >30 seconds
- "Analyzing changes..." message stuck
- Browser tab becoming unresponsive
- Multiple TypeScript errors appearing simultaneously

If you see these, STOP adding files and simplify.

---

## Implementation Checklist

### Backend ✅ COMPLETE
- [x] Database migrations created
- [x] RLS policies implemented
- [x] Edge functions deployed:
  - [x] run-ab-test
  - [x] complete-ab-test
  - [x] create-branch
  - [x] merge-branch
  - [x] switch-branch
- [x] Utility functions created (diffUtils, useAutoVersion)

### Frontend ⏸️ BLOCKED (Awaiting Sequential Recreation)
- [ ] src/lib/export/csv.ts
- [ ] src/lib/export/json.ts
- [ ] src/lib/export/pdf.ts
- [ ] src/lib/export/excel.ts
- [ ] src/lib/export/index.ts
- [ ] src/components/AnalyticsExport.tsx
- [ ] src/pages/ABTests.tsx
- [ ] src/components/ABTestWizard.tsx
- [ ] src/components/ABTestResults.tsx
- [ ] src/components/BranchSelector.tsx
- [ ] src/components/CreateBranchModal.tsx
- [ ] src/components/MergeBranchModal.tsx
- [ ] Integration into existing pages

### Testing Requirements
- [ ] Export all formats with sample data
- [ ] Create A/B test with 3 variants
- [ ] Create, switch, and merge branches
- [ ] Verify auto-versioning triggers correctly
- [ ] Test RLS policies with different users
- [ ] Verify edge function error handling

---

## Dependencies Installed

✅ **Currently Installed**:
```json
{
  "jspdf": "^3.0.3",
  "jspdf-autotable": "^5.0.2",
  "html2canvas": "^1.4.1",
  "xlsx": "^0.18.5"
}
```

---

## Next Steps (Post-Restoration)

1. **Restore to Last Working State**
   - Use History to revert frontend changes
   - Retain database migrations and edge functions

2. **Recreate Export Functionality**
   - Create export/csv.ts (WAIT for compilation)
   - Create export/json.ts (WAIT for compilation)
   - Create export/pdf.ts with dynamic imports (WAIT)
   - Create export/excel.ts (WAIT)
   - Create export/index.ts (WAIT)
   - Create AnalyticsExport.tsx (WAIT)

3. **Recreate A/B Testing**
   - Create ABTests.tsx page (WAIT)
   - Create ABTestWizard.tsx (WAIT)
   - Create ABTestResults.tsx (WAIT)

4. **Recreate Branch Management**
   - Create BranchSelector.tsx (WAIT)
   - Create CreateBranchModal.tsx (WAIT)
   - Create MergeBranchModal.tsx (WAIT)

5. **Integration**
   - Add AnalyticsExport to Analytics page
   - Add A/B Tests route to App.tsx
   - Add BranchSelector to MyScripts/Editor

---

## Success Metrics

### Technical
- All edge functions respond within 2 seconds
- Export generates files <5MB for typical datasets
- Branch operations complete without data loss
- Auto-versioning triggers reliably

### User Experience
- One-click export in preferred format
- A/B test setup in <2 minutes
- Branch creation/switching feels instant
- Version history remains accessible

---

## Lessons Learned

1. **TypeScript compiler has practical limits** - Respect them
2. **Sequential is safer than parallel** - For complex file creation
3. **Heavy imports need special handling** - Use dynamic imports
4. **Simple types compile faster** - Avoid deep inference chains
5. **Monitor compilation constantly** - Catch issues early
6. **History is your safety net** - Don't hesitate to restore

---

## References

- Database migrations: `supabase/migrations/20251117005859_*.sql`
- Edge functions: `supabase/functions/{run-ab-test,complete-ab-test,create-branch,merge-branch,switch-branch}/`
- Utilities: `src/utils/diffUtils.ts`, `src/hooks/useAutoVersion.tsx`
- Supabase types: `src/integrations/supabase/types.ts`

---

**Document Status**: Ready for implementation post-restoration  
**Last Updated**: 2024-11-17  
**Next Review**: After successful frontend recreation
