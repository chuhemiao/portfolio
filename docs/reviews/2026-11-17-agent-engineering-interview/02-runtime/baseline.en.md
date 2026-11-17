# Agent Runtime: From ReAct to LangGraph

Prepare for runtime interviews with the agent loop, durable approvals, idempotency, cancellation, and replay.

## 1. Advance a task with an agent loop

Given a request to fix a login bug and run tests, a coding agent might inspect the project, search code, analyze and plan, edit files, run tests, verify results, revise, and deliver. A single model call cannot cover the full process. The loop incorporates each new result and advances toward a defined completion condition.

## 2. ReAct and Plan-and-Execute

ReAct (Reasoning and Acting) alternates observation, reasoning, and action, then uses tool results to update the observation. It fits exploratory work and readily changes direction, though it can use more calls, repeat tools, or settle on a local optimum. [ReAct paper](https://arxiv.org/abs/2210.03629)

Plan-and-Execute proposes a reviewable plan first. For the login task, inspect the project, locate the login module, diagnose the problem, edit files, run tests, and verify the result. It fits tasks with clear dependencies that need progress tracking or approvals. Replan when the initial assumptions fail. An overall plan can contain bounded ReAct within each step.

## 3. Eight steps and a completion condition

1. Read current task state.
2. Assemble context within budget.
3. Ask the model for a structured decision.
4. Validate the decision and tool permissions.
5. Execute the tool or wait for approval.
6. Persist its observation.
7. Check the completion condition.
8. If incomplete, continue or replan.

Use observable state. When the model says it fixed a bug, check that files changed, tests actually ran and passed, and the modification reached the user’s project.

## 4. Five ways to detect and stop stalled loops

1. **Budgets.** Cap rounds, tokens, cost, duration, and calls per tool.
2. **Duplicate detection.** Fingerprint `tool_name + canonical_args + relevant_state`. A repeated fingerprint with no new observation or state change suggests a loop.
3. **Progress checks.** Look for evidence, a diff, test results, or state changes. Without progress, reassess, replan, degrade, or hand off to a person.
4. **Error classification.** Handle invalid arguments, denied access, and transient network errors separately.
5. **Safe termination.** Give budget exhaustion, cancellation, denial of approval, and unrecoverable errors explicit terminal states.

## 5. LangGraph State, Node, Edge, and Checkpointer

- **State** holds messages, plans, tool results, approvals, errors, and budgets for a run.
- **Node** performs a testable transformation, such as context assembly, a model call, tool preparation or execution, or result verification.
- **Edge** routes between nodes. Conditional edges can continue, wait for approval, branch to failure, or end.
- **Checkpointer** stores the graph’s position and state needed to resume after a restart or human interruption. [LangGraph persistence](https://docs.langchain.com/oss/python/langgraph/persistence)

## 6. Checkpoints, the business database, and the execution journal

Graph state says where execution reached. PostgreSQL stores tasks, approvals, tool calls, and business events. An executor or external tool journal records actual file operations, command execution, and side-effect receipts.

A local command can modify files before a network failure loses its response. The checkpoint may show an unfinished node, and the business row may only say the call started, while the journal records the actual result. Reconcile execution state before resuming. A blind rerun can repeat side effects.

## 7. Persist human approval as business state

An in-process promise cannot survive a restart. A durable approval flow can use these steps.

1. The agent proposes a high-risk operation.
2. Save the action type, target, arguments, diff, evidence, and policy version.
3. Set the task to `waiting_approval`.
4. Release the worker’s execution resources.
5. The user approves, rejects, or revises the proposal.
6. Persist the approval event.
7. A worker claims the task again.
8. Revalidate authorization, file versions, the argument hash, and the policy version before executing.

Approval covers the particular proposal. Changes to the file or proposal version require fresh approval. When a LangGraph interrupt resumes, its containing node restarts from the beginning, so side effects before it need protection. [LangGraph interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts)

## 8. Idempotency, retries, and exactly-once execution

If a payment succeeds but its response times out, the result is unknown, and an immediate retry can double-charge. Request idempotency deduplicates submissions, node idempotency prevents duplicate node results, and side-effect idempotency prevents duplicate business operations.

Use stable `request_id`, `run_id`, `step_id`, and `command_id` values. When a receipt is missing, query external state or the journal. If the operation still cannot be reconciled, enter `outcome_unknown`. Across models, databases, file systems, and services, combine at-least-once scheduling, business idempotency, receipts, and reconciliation for unknown outcomes.

## 9. Cancellation and replay

Cancellation follows `running` → `cancelling` → stop creating steps → request cancellation of in-flight work → reconcile side effects → `cancelled`. Existing effects need separate handling. Use `outcome_unknown` if they cannot be verified.

Replay uses recorded tool arguments and results and re-executes model or policy nodes. This isolates changes in the model, prompt, tool schema, retrieval results, or policy. Calling live tools again can repeat charges, submissions, or file overwrites.

## 10. Interview questions

1. When should you use ReAct or Plan-and-Execute?
2. How do you prevent an agent loop from stalling?
3. What do State, Node, Edge, and Checkpointer do?
4. Why does a checkpoint fail to replace the business database?
5. How does a run recover after a restart?
6. How do you persist HITL approval?
7. What if execution succeeds but the receipt is lost?
8. Why avoid promising global exactly-once execution?
9. How do you reconcile side effects after cancellation?
10. Why does replay freeze tool results?

Describe the state of each run, its execution boundaries, failure semantics, and recovery path.
