# Agent Tool Engineering: MCP, Permissions, and Multi-Agent Systems

Prepare for interviews on function calling, MCP, skills, tool validation, prompt injection defenses, and agent coordination.

## 1. What the tool layer enables

A model needs a tool layer to query a company database, edit files, submit code, or initiate a payment. The backend handles registration and discovery, selection, argument and permission checks, failures, duplicate calls, prompt injection defenses, and shared tools across agents.

## 2. Function calling, MCP, and skills

- **Function calling** gives the model a structured way to propose a tool and its arguments. The application executes it.
- **MCP (Model Context Protocol)** standardizes how AI applications discover and connect to tools, resources, and prompt templates.
- **Skills** capture reusable goals, steps, knowledge, allowed tools, input and output requirements, and acceptance criteria.

A skill can organize the use of several MCP tools, and function calling can express a specific invocation. The host enforces tool access. [Function calling](https://developers.openai.com/api/docs/guides/function-calling) · [MCP specification](https://modelcontextprotocol.io/specification/2026-07-28) · [Agent Skills specification](https://agentskills.io/specification)

## 3. Load tools on demand

Putting dozens or hundreds of tool descriptions and schemas in context raises token costs, complicates selection, and broadens exposure. Filter by task and user privileges, route through a directory, load only the relevant descriptions and schemas, and recheck authorization and arguments at execution. Frequently used low-risk tools can be registered directly. Discover infrequent ones as needed.

## 4. What belongs in a tool registry

Record `tool_id`, version, description, input and output schemas, read or write level, resource scope, authorization, approval policy, timeout, retry policy, idempotency support, concurrency limits, owner, and health. Pin the version for an invocation so the contract cannot drift mid-run.

MCP can support reuse across agent clients. Internal tools with frequent calls and tightly coupled business permissions can keep a type-safe internal protocol. Both can use the same authorization, audit, and evaluation controls.

## 5. Five validation layers before execution

1. **Protocol.** Check JSON, tool registration, schema, required fields, and types.
2. **Semantics.** Check paths, amounts, dates, enums, and combinations against business rules.
3. **Authorization.** Check the user, tenant, project, role, and authorized resource scope.
4. **Policy.** Check risk, required approvals, call counts, and cumulative limits.
5. **Execution.** Assign a stable call ID and argument fingerprint, enforce timeout, idempotency, and output limits, and audit the isolated execution.

The model proposes the call. The backend decides whether it is authorized.

## 6. Handle failures by type

A tool result can carry `status`, `error_type`, `retryable`, `result_ref`, `partial`, and `external_receipt`.

- **Timeout.** Retry reads under policy. Check external state before repeating a write.
- **Empty result.** Distinguish a legitimate empty answer, access filtering, and an upstream failure.
- **Partial success.** Keep the successful and failed items. Retry or compensate only safe subsets.
- **Invalid data.** Validate schemas, units, ranges, and business invariants.
- **HTTP 500.** Record the upstream error and correlation ID. Retry known recoverable cases and use a circuit breaker or fallback for persistent failure.

Keep retries within the task budget and apply exponential backoff with jitter.

## 7. Defend against prompt injection at the system boundary

An outside document might contain a demand to send local files to an external destination. Treat uploaded files, webpages, retrieved documents, and tool output as untrusted data. A system prompt alone cannot guarantee that the model recognizes the boundary every time.

1. Keep system rules, user requests, outside data, and tool results in separate context sections.
2. Mark external content as untrusted.
3. Expose only the tools required for the task.
4. Authenticate and authorize independently on the tool side.
5. Default to read access and require approval for high-risk writes.
6. Restrict directories, network destinations, and access to sensitive data.
7. Test denials of unauthorized access and data transfer and handling of malicious documents in isolation.

The DevPilot example uses private working copies, authorized directories, IPC allowlists, constrained Docker commands, and approval to write back to source. These controls take effect at execution.

## 8. Approve and audit risky operations

Distinguish reads of files, knowledge bases, and project data from reversible writes to private copies, drafts, and temporary files. A third group carries external or irreversible consequences, including payments, external messages, live orders, and production writes.

Show the actual action, target, key arguments, diff, evidence, potential impact, and expiration when seeking approval. Revalidate before execution and preserve the actual receipt afterward. Messages, payments, or submissions may already be irreversible. Record that outcome accurately.

## 9. When do multiple agents help?

A single agent is usually cheaper and easier to control when tooling and context are simple. Multiple agents can help when roles need different permissions, steps can run in parallel, contexts need isolation, independent verification reduces shared bias, or one agent’s context is overloaded.

- **Planner** interprets requirements and plans.
- **Executor** calls tools and performs the work.
- **Verifier** tests and validates independently.
- **Supervisor** assigns tasks, manages budget, dependencies, and failure policy, and collects results.

## 10. Share facts and control concurrent writes

Share structured task objects with goals, constraints, dependencies, confirmed facts, artifact references, and a global budget. Keep local drafts, transient retrieval results, role-specific execution details, and intermediate state private to the role. Handoffs should include `task_id`, input version, output schema, evidence references, completion status, error type, and remaining risk.

Pin Git commits, document versions, and rule versions as snapshots. Prefer separate worktrees or private copies for parallel changes, then use a shared base for three-way merging, conflict detection, testing, and review. If a shared lock is necessary, use leases and timeouts and have the storage side reject expired writers with a fencing token.

## 11. Interview questions

1. How do function calling and MCP differ?
2. What responsibilities belong to skills and MCP?
3. Why load tools on demand?
4. How would you design a tool registry?
5. What checks does a tool call require?
6. How do you handle a tool timeout?
7. Why do prompt injection defenses need execution-side enforcement?
8. How are high-risk operations approved?
9. When are multiple agents useful?
10. What do the planner, executor, verifier, and supervisor do?
11. How do agents share state?
12. What if multiple agents edit the same file?

Explain what happens under permissions, failures, concurrency, and untrusted inputs.
