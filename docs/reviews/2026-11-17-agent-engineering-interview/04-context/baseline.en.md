# Context Engineering: Memory, Hybrid Retrieval, and GraphRAG

How to structure and compress context, govern memory, combine retrieval methods, and diagnose a RAG failure one stage at a time. Includes 12 interview questions.

## 1. What context does an agent need?

During a task, an agent may encounter system rules, user goals, conversation history, task state, tool results, enterprise knowledge, external pages, and long-term user preferences. Putting all of it in the system prompt increases token cost and makes important information harder to find amid redundant or conflicting material. Context engineering decides what each step needs and keeps that information accurate, complete, trustworthy, and traceable.

## 2. Six layers of context

1. Stable system rules such as role boundaries, safety rules, output contracts, and decision rules.
2. The current user goal, with the task, explicit constraints, and expected result.
3. Structured task state, with the plan, completed and pending work, approvals, and budget.
4. Evidence retrieved on demand from enterprise documents, code, knowledge bases, and external sources.
5. Tool contracts and receipts, covering available tools, parameter schemas, results, and errors.
6. Conversation summaries that retain recent context, decisions, constraints, and progress.

Keep stable rules in the system prompt. Load changing project information when the task needs it.

## 3. Compressing a long conversation

A sliding window retains recent messages verbatim, including references and tool results, but can discard older facts or constraints. A summary preserves continuity across a longer task while introducing risks of omission and factual drift. Combine recent verbatim messages, a structured summary, and retrievable originals.

The summary should record the goal, confirmed facts, user constraints, completed and pending work, errors, artifact references, source coverage, creation time, and version. Preserve approvals, prohibited actions, external receipts, and current tool contracts during compression. Store large tool outputs in full and pass just the summary, key statistics, and reference.

## 4. Task memory, user preferences, and enterprise facts

- **Task memory** holds execution state, tool results, and recent conversation. A task database, session database, and Redis window can share this job.
- **User preferences** record explicit choices such as language, stack, and working practices.
- **Enterprise facts** cover products, business rules, and documents. Store them in the business database or knowledge base.

If the user explicitly reverses a preference expressed three months ago, follow the current request. Long-term records need provenance, confidence, owner, creation time, expiration, and a way to delete them. Evaluate a model's proposed memory before making it permanent.

## 5. Why RAG still matters with long context

Full-document loading still runs into window limits, token costs, latency, diluted attention, access control, and version management. RAG provides reusable retrieval, authorization filtering, provenance, and knowledge updates. Use `grep` or direct file reads for exact code symbols. Use RAG for recurring queries across a large enterprise corpus. The two can work together.

## 6. An end-to-end RAG pipeline

1. Ingest files and perform safety checks.
2. Parse formats, run OCR or ASR, and recover layout.
3. Clean and structure documents.
4. Split documents into chunks.
5. Store metadata, access controls, versions, and provenance.
6. Build lexical and vector indexes.
7. Interpret and rewrite queries.
8. Run hybrid recall, RRF fusion, and reranking.
9. Select context and generate an answer.
10. Verify citations, handle abstention, and evaluate results.

An embedding or reranking model cannot reliably recover a missing PDF table header or a misparsed heading hierarchy. Evaluate document quality, chunking, metadata, and access control alongside the retrieval models.

## 7. Chunking by document structure

A fixed character count can split headings, paragraphs, lists, code, tables, and related sections. Prefer those structural boundaries and carry the parent heading, document version, and permissions into each chunk. Preserve table headers, rows, columns, units, and merged-cell relationships. For documents without headings, use paragraphs, blank lines, length, and topic changes to find candidate boundaries. Retrieving small chunks and returning their parent can balance precise recall with context. Evaluate chunk size on real examples.

## 8. BM25, vector retrieval, RRF, and reranking

BM25 works well for error codes, function names, model numbers, clause numbers, and proper nouns. Its matches are interpretable, but synonyms can slip through. Vector retrieval uses embeddings to find semantic similarity between queries and documents. It suits natural language, can miss exact identifiers, and depends on the embedding model and domain.

Use RRF to combine the rankings after both methods retrieve candidates. For retrievers that return document `d`, sum `RRF(d) = Σ 1 / (k + rank_i(d))`. Here `rank_i(d)` is its one-based rank in that result list and `k` is a smoothing constant. The raw scores never need to be compared. Rerank only the top N candidates to bound the cost of finer relevance scoring. [Elasticsearch RRF documentation](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion)

## 9. When GraphRAG earns its cost

A question about which product line a device belongs to, what faults it has, and which maintenance procedures apply may require several relationship hops. A knowledge graph stores entities, relationships, and properties explicitly, surfacing connections a similarity search may miss.

The draft illustrates this with the Veloxis Agent design. Neo4j stores model-extracted entities and relationships that have gone through governance checks. At query time, the agent resolves entities, follows multiple hops, and combines the graph paths with text evidence. Extracted relationships still need links to original documents. Start with lower-cost hybrid retrieval for simple facts and use graph retrieval when the relationships justify the work. [Microsoft GraphRAG](https://microsoft.github.io/graphrag/)

## 10. Diagnosing an irrelevant RAG answer

1. Does the source contain the right answer?
2. Did parsing preserve it?
3. Did BM25 or vector search find the right chunk?
4. Did it survive RRF fusion?
5. Where did the reranker place it?
6. Did the evidence make the final context?
7. Did the model use it correctly?
8. Do the citations actually support the answer?

Record candidates and metrics at each stage. Find where the evidence disappeared before changing the prompt.

## 11. Evaluating recall, ranking, and answers

Recall@K measures how much labeled evidence appears in the top K. MRR and nDCG measure how well the ranking surfaces the right evidence. At the answer level, assess factual accuracy, completeness, citation support, appropriate abstention, and business task completion. Separate unsupported facts, mismatched citations, stale versions treated as current, faulty deductions, and invented tool results. With insufficient evidence, abstain or ask for more information.

## 12. Interview questions

1. Why does context engineering matter for agents?
2. How do you structure context?
3. What trade-offs distinguish windows and summaries?
4. How do you prevent memory contamination?
5. Why use RAG with long context?
6. How do you chunk a document?
7. How do BM25 and vector search work together?
8. How does RRF fuse rankings?
9. What does a reranker solve?
10. When is GraphRAG useful?
11. How do you locate a RAG hallucination?
12. How do you evaluate recall, ranking, and answers?

What the agent can base a decision on depends on receiving relevant, reliable, traceable evidence at the right time.
