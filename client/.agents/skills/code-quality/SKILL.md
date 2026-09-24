---
name: code-quality
description: Frontend coding rules for writing simple, readable, beginner-friendly React and TypeScript. Use when building, modifying, debugging, or refactoring any frontend code (components, hooks, services, forms, API integration, styling). Enforces explicit code over cleverness, over-abstraction, and premature optimization.
---

# Simple Frontend Code Rules

Hard constraints for all frontend code (React, TS, JS, HTML, CSS, Tailwind).

## Core Philosophy

- Simple and explicit over clever or compact
- Optimize for readability, not line count
- Top-to-bottom understandable
- No complexity unless the problem requires it
- Use familiar patterns; follow existing project conventions
- Never use advanced patterns just to look sophisticated

## Readability

- Meaningful names; explicit logic
- Use intermediate variables when they clarify
- Multiple simple statements > one complex expression
- Avoid deep nesting; use early returns
- One clear responsibility per function/component

## Forbidden Patterns

- Nested ternaries
- Complicated ternaries
- Unnecessary one-liners or code golfing
- Long method chains
- Clever JS tricks
- `reduce()` when a loop is clearer
- Unnecessary destructuring / optional chaining / nullish-coalescing
- Deeply nested callbacks
- Excessive prop configuration
- Excessive component splitting

## Ternaries

Simple is fine:
```tsx
const text = loading ? "Loading..." : "Submit";
```

Nested is forbidden — use `if/else`:
```tsx
let text = "Empty";
if (loading) text = "Loading";
else if (error) text = "Error";
else if (data) text = "Success";
```

## Functions

- Simple, focused, one responsibility
- Don't extract for a few lines
- Extract when reused or hard to follow
- Named functions or simple arrows
- No generic utility functions or premature abstractions

## Components

- Keep straightforward; UI logic close to usage
- Extract when genuinely reusable or to simplify a large component
- No wrappers for their own sake
- No "universal" components with heavy config
- Explicit props
- Move complex logic out of JSX

## State

- `useState` for simple local state
- Simplest solution that works
- No Redux/Zustand/Context unless actually needed
- No duplicated state
- Derive values instead of storing them

```tsx
// ✅
const fullName = `${firstName} ${lastName}`;

// ❌
const [fullName, setFullName] = useState("");
useEffect(() => setFullName(`${firstName} ${lastName}`), [firstName, lastName]);
```

## useEffect

- Not for calculations
- Not for event-driven logic (use handlers)
- Only for external sync: API, subscriptions, timers, browser APIs

## useMemo / useCallback

- Not by default
- Only with clear performance reason or existing convention

## JSX

- Focused on UI description
- No complex calculations inline
- No deep conditional nesting
- Use variables for complicated conditions
- Early returns for loading / error / empty

```tsx
if (loading) return <Loading />;
if (error) return <ErrorMessage />;
if (!users.length) return <EmptyState />;
return <UserList users={users} />;
```

## TypeScript

- Types where they improve clarity
- Simple interfaces/types
- No unnecessary generics or conditional types
- No `any` when a real type is possible
- Let TS infer obvious types

## API Calls

- Readable; use project's existing approach
- No new HTTP library if one exists
- Handle loading / success / error clearly
- No hiding behavior behind excessive abstractions

```ts
const response = await fetch("/api/users");
if (!response.ok) throw new Error("Failed to fetch users");
const users = await response.json();
```

## Forms

- Keep small forms simple
- Controlled inputs when appropriate
- Validate important fields clearly
- No form library for small forms unless already in project
- Use project's existing validation library

## Errors

- Handle explicitly; useful user-facing messages
- Log unexpected errors
- No custom error systems for simple apps
- Never silently ignore

## Loading / Empty States

Always consider: loading, error, empty, success. Keep them explicit.

## Naming

Descriptive: `selectedCoach`, `availableSlots`, `bookingId`, `isLoading`, `handleSubmit`.
Avoid: `x`, `data`, `temp`, `fn`.

## Destructuring

Use when it improves readability, not to save characters. Avoid deep nesting.

## Array Methods

`map` / `filter` / `find` when clear. Don't chain many. Break into named steps:

```ts
const activeUsers = users.filter((u) => u.active);
const userNames = activeUsers.map((u) => u.name);
userNames.sort();
```

Prefer `for...of` over `reduce()` when clearer.

## Custom Hooks

Only when reused or meaningfully simplifies a component. Focused, named `useX`.

## Utilities

No utilities for trivial ops. Extract when reused. Clear names, one responsibility.

## Abstraction

Don't create components just because JSX looks similar. Extract when:
- Genuinely reused
- Clear responsibility
- Improves maintainability

## Styling

- Follow existing system
- No new styling library unnecessarily
- Readable class names
- Extract complex conditional class logic into variables

## Project Consistency

Before writing code:
1. Inspect project structure
2. Check how similar features are built
3. Follow naming, API, and state conventions
4. Reuse existing components/utilities
5. Don't introduce new patterns without reason

Consistency > theoretically "better" architecture.

## Dependencies

No new library unless it solves a real problem. Check:
- Does functionality already exist?
- Does the project already have a library for this?
- Can native browser/JS do it?

## Performance

- No premature optimization
- No memoization without reason
- No complex caching without requirement
- No virtualization unless data demands it
- Correct and readable first; optimize only when required

## Security

Never put in frontend code:
- API secrets, DB creds, JWT signing keys, private keys
- Cloudinary API secrets
- Any server-side credential

Frontend validation ≠ backend validation.

## Comments

Explain *why*, not *what*.

```tsx
// ❌ Set loading to true
setLoading(true);

// ✅ Disable the form while the booking request is processing.
setLoading(true);
```

## Code Explanation

When explaining code:
1. Simple idea first
2. Explain the flow
3. Show file structure when useful
4. Important lines
5. Why this approach
6. Small example
7. Avoid advanced jargon

Don't assume advanced knowledge.

## Solution Complexity

Before generating code, ask:

> Can this be simpler while still correct?

If yes, do it. Shorter ≠ better.

Goal: **Simple + Explicit + Readable + Maintainable**
Not: **Short + Clever + Abstract + Complex**

## Final Verification

1. Easy to read?
2. Logic clear top-to-bottom?
3. Unnecessary complexity?
4. Nested ternaries?
5. Unnecessary one-liners?
6. Unnecessary hooks?
7. Unnecessary abstractions?
8. Names clear?
9. Follows project structure?
10. New dependency needed?
11. Loading / error / empty handled?
12. Secrets kept out of frontend?
13. Any part simplifiable?

If any answer indicates unnecessary complexity → simplify before finishing.

## Final Rule

**Write code for humans to understand, not to show how clever you are.**

**Simple → Explicit → Readable → Maintainable**