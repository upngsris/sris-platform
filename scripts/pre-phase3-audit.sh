#!/usr/bin/env bash

set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$ROOT_DIR/apps/web"

ERRORS=0
WARNINGS=0

print_header() {
  echo
  echo "============================================================"
  echo "$1"
  echo "============================================================"
}

pass() {
  echo "✓ $1"
}

warn() {
  echo "⚠ $1"
  WARNINGS=$((WARNINGS + 1))
}

fail() {
  echo "✗ $1"
  ERRORS=$((ERRORS + 1))
}

search_code() {
  local pattern="$1"

  grep -RIn \
    --exclude-dir=node_modules \
    --exclude-dir=.next \
    --exclude-dir=.turbo \
    --exclude-dir=dist \
    --exclude-dir=build \
    --exclude='*.map' \
    "$pattern" \
    "$WEB_DIR" 2>/dev/null || true
}

check_absent() {
  local label="$1"
  local pattern="$2"

  local result
  result="$(search_code "$pattern")"

  if [[ -z "$result" ]]; then
    pass "$label"
  else
    fail "$label"
    echo "$result"
  fi
}

check_warning_absent() {
  local label="$1"
  local pattern="$2"

  local result
  result="$(search_code "$pattern")"

  if [[ -z "$result" ]]; then
    pass "$label"
  else
    warn "$label"
    echo "$result"
  fi
}

print_header "SRIS PRE-PHASE-3 ARCHITECTURE AUDIT"

echo "Repository:"
echo "$ROOT_DIR"

print_header "1. LEGACY TYPES AND QUERIES"

check_absent \
  "No HomeIntroData references remain" \
  "HomeIntroData"

check_absent \
  "No HOME_INTRO_QUERY references remain" \
  "HOME_INTRO_QUERY"

print_header "2. TYPESCRIPT SAFETY"

check_absent \
  "No explicit ': any' annotations in apps/web" \
  ": any"

check_absent \
  "No explicit 'as any' casts in apps/web" \
  "as any"

print_header "3. DEBUGGING ARTIFACTS"

check_warning_absent \
  "No console.log statements remain" \
  "console\.log"

check_warning_absent \
  "No debugger statements remain" \
  "debugger"

print_header "4. SANITY IMAGE ARCHITECTURE"

URL_FOR_USAGE="$(search_code "urlFor(")"

if [[ -z "$URL_FOR_USAGE" ]]; then
  warn "No urlFor() usage found. Verify sanity-image.tsx still uses the helper."
else
  NON_CANONICAL_URL_FOR="$(
    echo "$URL_FOR_USAGE" |
      grep -v "/components/sanity/sanity-image.tsx:" |
      grep -v "/sanity/lib/image.ts:" || true
  )"

  if [[ -z "$NON_CANONICAL_URL_FOR" ]]; then
    pass "Sanity URL generation is centralized"
  else
    fail "urlFor() is still used outside the reusable Sanity image layer"
    echo "$NON_CANONICAL_URL_FOR"
  fi
fi

print_header "5. PROTOTYPE FALLBACK CONTENT"

check_absent \
  "No fallbackLearning dataset remains" \
  "fallbackLearning"

check_absent \
  "No fallbackEvents dataset remains" \
  "fallbackEvents"

check_absent \
  "No fallbackProjects dataset remains" \
  "fallbackProjects"

check_warning_absent \
  "No visible 'Student Name' prototype label remains" \
  "Student Name"

check_warning_absent \
  "No temporary '- TEST' homepage content remains in source" \
  "\- TEST"

print_header "6. ROUTE ARCHITECTURE"

if [[ -f "$WEB_DIR/lib/routes.ts" ]]; then
  pass "Canonical routes.ts exists"
else
  fail "apps/web/lib/routes.ts is missing"
fi

check_absent \
  "No hardcoded research detail template strings outside routes.ts" \
  'explore/research/${'

check_absent \
  "No hardcoded event detail template strings outside routes.ts" \
  'community/events/${'

check_absent \
  "No hardcoded showcase detail template strings outside routes.ts" \
  'community/showcase/${'

check_absent \
  "No hardcoded project-opportunity detail template strings outside routes.ts" \
  'projects-to-join/${'

print_header "7. COMPONENT BOUNDARIES"

if [[ -f "$WEB_DIR/components/sanity/sanity-image.tsx" ]]; then
  pass "Reusable SanityImage component exists"
else
  fail "Reusable SanityImage component is missing"
fi

if [[ -f "$WEB_DIR/sanity/lib/image.ts" ]]; then
  pass "Sanity image URL helper exists"
else
  fail "Sanity image URL helper is missing"
fi

if [[ -f "$WEB_DIR/sanity/lib/types.ts" ]]; then
  pass "Sanity frontend types file exists"
else
  fail "Sanity frontend types file is missing"
fi

if [[ -f "$WEB_DIR/sanity/lib/queries.ts" ]]; then
  pass "Sanity queries file exists"
else
  fail "Sanity queries file is missing"
fi

print_header "8. COMMON TODO MARKERS"

check_warning_absent \
  "No TODO markers remain in web application" \
  "TODO"

check_warning_absent \
  "No FIXME markers remain in web application" \
  "FIXME"

print_header "AUDIT SUMMARY"

echo "Errors:   $ERRORS"
echo "Warnings: $WARNINGS"

if [[ "$ERRORS" -gt 0 ]]; then
  echo
  echo "RESULT: FAILED"
  echo "Resolve architecture errors before Phase 3."
  exit 1
fi

if [[ "$WARNINGS" -gt 0 ]]; then
  echo
  echo "RESULT: PASSED WITH WARNINGS"
  echo "Review warnings before Phase 3."
  exit 0
fi

echo
echo "RESULT: PASSED"
echo "SRIS web architecture is ready for lint and production build."
exit 0