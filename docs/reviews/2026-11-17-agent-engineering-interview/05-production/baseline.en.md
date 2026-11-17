# Production-Grade Agents: Evaluation, Observability, Cost, and Distributed Systems

From golden sets, traces, and replay to asynchronous queues, SSE, and latency diagnosis. Includes ten interview questions on operating agents in production.

## 1. What does a local demo prove?

One successful local run proves only that the run succeeded. Before launch, ask whether the system can run continuously, handle concurrency, withstand upstream outages and model upgrades, and resume interrupted work without losing consistency. Each run should be executable, recorded, verified, evaluated, diagnosed, and improved. The work spans evaluation, observability, cost, infrastructure, and delivery.

## 2. Evaluate four layers

1. Model output: understanding, reasoning, and structured output quality.
2. Tool calls: selection, arguments, authorization, and error handling.
3. Workflow: completion, pause, failure, and recovery.
4. Business result: whether the task was actually completed.

A coding agent with a polished explanation still fails a repair task if it leaves the code untouched.

## 3. Build a golden set for expected paths and failures

- **Coding agent**: Pin the repository commit and record the original task, edit scope, prohibited actions, tests, grants, and expected result.
- **RAG**: Pin the questions, reference evidence, document versions, access rules, citations, and conditions for abstention.
- **Failures**: Include timeouts, permission denials, empty results, data conflicts, revocation, interruption, prompt injection, and model drift.

A security violation remains a failure even if the average score is high.

## 4. Which questions should a trace answer?

What context was used? What did retrieval return? Why did the model choose this tool? Did the arguments pass validation? Was the action authorized? Did it succeed? How did state change, and how was the outcome verified? A trace should connect the answers.

Record `trace_id`, `user_id`, `tenant_id`, `session_id`, `task_id`, and `run_id`, plus model, prompt, and tool versions, retrieval candidates, token counts, argument summaries, approval events, state transitions, result references, errors, latency, and cost. Redact logs and keep secrets, whole sensitive documents, and internal model reasoning out. Store necessary large artifacts in access-controlled object storage and put references in the trace. [OpenTelemetry traces](https://opentelemetry.io/docs/concepts/signals/traces/)

## 5. Isolate changes with replay

Freeze tool outputs and rerun model or policy nodes to see whether behavior changed because of the model, prompt, retrieval, tool schema, policy, or state. Calling live tools can read changed data and repeat side effects. Use a sandbox and fixed data for full workflow replay.

## 6. Follow the path of a failure

Check the input, retrieval, context, model, tools, state, and presentation in order, with metrics for each stage. If a document is missing, check parsing, chunking, the query, and indexes. If it was retrieved but left out, check context selection and budget. If it was included and the answer is still wrong, inspect model behavior, conflicting facts, and constraints. Add fixed failures to the golden set.

## 7. Measure cost per successful task

Compare ten model calls with one by measuring **what each successful business task actually costs**. Track input and output tokens, calls, cache hits, tool usage, retries, success, human takeover, and total cost. Break it down by task, model, and step.

1. Deduplicate context and replace repeated input with summaries or on-demand loading.
2. Load tool schemas as needed.
3. Route simple work to cheaper models and complex work to stronger ones.
4. Cache embeddings, parsed artifacts, and deterministic computations.
5. Cap steps, output, and retries.
6. Batch work without real-time requirements.

Watch latency and completion alongside cost.

## 8. Give each data store a clear job

- **PostgreSQL**: Authoritative records for users, tenants, sessions, tasks, approvals, tool calls, rules, and audits.
- **Redis**: Transient caches, windows, rate-limit counters, notifications, leases, and deduplication.
- **Elasticsearch**: Inverted indexes, exact terms, and filters.
- **Milvus or pgvector**: Embeddings and retrieval metadata.
- **Object storage such as MinIO**: Raw files, parsed artifacts, large tool outputs, reports, and immutable snapshots.

Keep business facts in the authoritative database and perform final authorization in the business system. Associate records with tenants, users, versions, and tasks.

## 9. Schedule long-running tasks

An agent run can last several minutes or longer. In a typical flow, the API stores the task in PostgreSQL, a queue notifies a worker, and the worker updates state for the client to receive through SSE. The queue handles asynchronous work, load smoothing, scheduling, retries, and multiple workers. A separate state machine owns task state.

With at-least-once delivery, consumers deduplicate by event ID or step ID. A transactional outbox writes the task and pending event in a single transaction. A separate publisher delivers the event. [AWS transactional outbox guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html)

## 10. Resume frontend progress with SSE

SSE can push tokens, tool start and finish events, approvals, progress, and results. Connect each event to a session, run, and event ID, with an increasing sequence number. After a disconnect, resume after the last sequence confirmed by the client. Fetch an authoritative snapshot first if needed, then apply newer events. Tokens can be transient. The server's task state and tool receipts are authoritative. [WHATWG SSE specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)

## 11. Where asyncio fits

Model APIs, databases, HTTP, object storage, queues, and tools often wait for I/O. Calling an `async def` function returns a coroutine. Await it or schedule it as a task to run it. Async I/O provides neither automatic parallelism nor a concurrency limit. Use semaphores and bounded queues as appropriate.

Use async interfaces for async I/O, threads for blocking I/O, and processes or separate services for CPU-heavy work. Set connection, read, and overall timeouts, and release resources on cancellation. Cancelling a local coroutine does not undo external effects. [Python asyncio documentation](https://docs.python.org/3/library/asyncio-task.html)

## 12. Diagnose a jump from five to twenty minutes

Break down API and worker queueing, parsing, retrieval, time to first token, total model time, tools, approval waits, database work, and frontend subscriptions. Compare P50 and P95 with backlog, concurrency, downstream limits, retry amplification, slow SQL, lock contention, token growth, and duplicate calls.

In the DevPilot example described in the source, a command history query under RLS scanned too much data. Constraining it to the tenant and authorized run scope and adjusting indexes brought one query from about **0.6 seconds to about 3 milliseconds** under synthetic load. This is the source's result for one query, not the platform's P95.

## 13. Turn “smarter” into testable requirements

Identify users, tasks, available data and tools, completion criteria, prohibited actions, the cost of mistakes, and latency and cost limits. Use **20–50 representative cases** to agree on required outcomes, acceptable variation, and when to abstain.

Roll out retrieval with citations, then bounded tools, then approval and resumption, and finally evaluate multiple agents or more complex orchestration. Keep adding real failures to the evaluation set.

## 14. Ten production interview questions

1. Who uses the system and what is the workload?
2. Where does task state live?
3. What happens if a tool loses connectivity halfway through?
4. What happens when a user revokes permission?
5. How do you avoid duplicate charges or execution?
6. How do you replay a run?
7. How is the golden set constructed?
8. How do you trace and diagnose a failure?
9. How do you calculate the cost of a successful task?
10. How do you handle behavior drift after a model upgrade?

Explain what happened, why, how to reproduce it, what fixed it, and how to catch it again.

## 15. Describe the system you can build

Agent engineering spans architecture, state, tool governance, authorization and security, context, retrieval, distributed systems, evaluation and observability, and cost and performance. The model proposes an action. The harness verifies authorization and manages execution. Infrastructure makes results durable, recoverable, and verifiable.
