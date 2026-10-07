# Master Backend Engineering & AI Allocation System Interview Guide
### Complete Architectural Blueprint, AI Mechanics, Deep Dives & 400 Backend Interview Questions

---

## 📑 Comprehensive Table of Contents
1. [Project Architectural Blueprint & Workflow Deep Dive](#1-project-architectural-blueprint--workflow-deep-dive)
2. [File-by-File Technical Directory & Module Functionality](#2-file-by-file-technical-directory--module-functionality)
3. [AI & NLP Engine Deep Dive: Matching Algorithms & Resume Parsing](#3-ai--nlp-engine-deep-dive-matching-algorithms--resume-parsing)
4. [Authentication, Authorization, Tokens & Security Engineering](#4-authentication-authorization-tokens--security-engineering)
5. [REST APIs, Protocol Standards & HTTP Deep Dive](#5-rest-apis-protocol-standards--http-deep-dive)
6. [Database Engineering: MongoDB, Relational SQL & Aggregations](#6-database-engineering-mongodb-relational-sql--aggregations)
7. [Node.js Internals, libuv & Express.js Architecture](#7-nodejs-internals-libuv--expressjs-architecture)
8. [Caching, Message Queues & Distributed Systems Engineering](#8-caching-message-queues--distributed-systems-engineering)
9. [Core JavaScript & V8 Engine Foundations](#9-core-javascript--v8-engine-foundations)
10. [The 400 Core Backend Interview Questions & Answers Knowledge Base](#10-the-400-core-backend-interview-questions--answers-knowledge-base)
    - [Section A: Node.js Internals & Asynchronous Runtime (Q1 – Q50)](#section-a-nodejs-internals--asynchronous-runtime)
    - [Section B: Express.js, Middleware & API Server Architecture (Q51 – Q100)](#section-b-expressjs-middleware--api-server-architecture)
    - [Section C: Authentication, JWT, OAuth 2.0 & Web Security (Q101 – Q160)](#section-c-authentication-jwt-oauth-20--web-security)
    - [Section D: REST, HTTP Protocol & Communication Patterns (Q161 – Q210)](#section-d-rest-http-protocol--communication-patterns)
    - [Section E: MongoDB, Mongoose & NoSQL Database Design (Q211 – Q260)](#section-e-mongodb-mongoose--nosql-database-design)
    - [Section F: Relational Databases, SQL, ACID & Transactions (Q261 – Q300)](#section-f-relational-databases-sql-acid--transactions)
    - [Section G: Caching, Redis, Queues & Distributed Patterns (Q301 – Q350)](#section-g-caching-redis-queues--distributed-patterns)
    - [Section H: AI Algorithms, NLP Parsing & System Design (Q351 – Q400)](#section-h-ai-algorithms-nlp-parsing--system-design)

---

# 1. Project Architectural Blueprint & Workflow Deep Dive

### 1.1 Problem Statement & Solution Overview
In academic and institutional environments, the allocation of research internships and capstone projects is historically plagued by:
- **Opaque Selection**: Lack of objective scoring criteria.
- **Skill-Task Mismatches**: Students assigned to projects outside their competencies.
- **Manual Overhead**: Faculty sorting through hundreds of unformatted email resumes.
- **Allocation Race Conditions**: Duplicate student allocations across concurrent openings.

**The Solution:**
A multi-tier MERN system that introduces:
1. **Automated Resume Parsing**: Converts raw PDF resumes into structured skill taxonomy tokens.
2. **Multi-Factor AI Matching Engine**: Evaluates candidate skill intersection, department alignment, and domain preferences to compute a 0–100% suitability match.
3. **Role-Based Access Control (RBAC)**: Strictly segments access for Students (`@cuchd.in`), Faculty (`@cumail.in`), and Administrators.
4. **Automated Broadcast Dispatch**: Notifies all registered students via responsive HTML emails upon new vacancy creation.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|  React 18 + Vite SPA | Tailwind CSS | Chart.js | Axios (Bearer Interceptors)     |
+------------------------------------------+----------------------------------------+
                                           |
                                           | HTTPS / JSON (Bearer JWT)
                                           v
+-----------------------------------------------------------------------------------+
|                              EXPRESS APPLICATION                                  |
|  CORS Middleware -> Body Parser -> Static Uploads -> Central Error Handler       |
+------------------------------------------+----------------------------------------+
                                           |
            +------------------------------+------------------------------+
            |                              |                              |
            v                              v                              v
+-----------------------+      +-----------------------+      +-----------------------+
|    AUTH & SECURITY    |      |  AI MATCHING ENGINE   |      |  EMAIL & BROADCAST    |
| - JWT Sign & Verify   |      | - Jaccard/Cosine Math |      | - Batch Notification  |
| - RoleGuard Factory   |      | - PDF NLP Extraction  |      | - HTML Template Build |
| - Bcrypt Password Hash|      | - Ranked Explanations |      | - Status Triggers     |
+-----------------------+      +-----------------------+      +-----------------------+
            |                              |                              |
            +------------------------------+------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                                MONGOOSE ORM LAYER                                 |
|  User | StudentProfile | FacultyProfile | Opportunity | Application | Allocation  |
|  (Compound Unique Indexes | Pre-save Hooks | Aggregation Pipelines)               |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                               MONGODB DATABASE                                    |
|  Document Storage | BSON Serialization | Replica Set High Availability            |
+-----------------------------------------------------------------------------------+
```

---

# 2. File-by-File Technical Directory & Module Functionality

### 2.1 Backend Directory (`server/`)

| File | Technical Responsibility | Critical Implementation Details |
|---|---|---|
| `server.js` | Server Bootstrapper & HTTP Listener | Connects MongoDB, binds global CORS middleware, mounts sub-routers (`/api/*`), exposes static `/uploads`, and attaches `errorHandler`. |
| `config/db.js` | Database Connection Manager | Wraps `mongoose.connect()` with `serverSelectionTimeoutMS: 5000` and environment fallback handling. |
| `models/User.js` | Base Identity & Cryptographic Model | Stores `name`, `email` (unique index), `password` (bcrypt hashed), `role` (`student`, `faculty`, `admin`). Implements `pre('save')` salt hashing and `matchPassword()` method. |
| `models/StudentProfile.js` | Student Profile Document | Foreign reference to `User`. Stores `department`, `year`, `skills` array, `resumeUrl`, `resumeParsedSkills` array, and `preferences` array. |
| `models/FacultyProfile.js` | Faculty Profile Document | Foreign reference to `User`. Stores `department` and `designation`. |
| `models/Opportunity.js` | Vacancy Document | Stores `title`, `type` (`internship`/`project`), `description`, `requiredSkills` array, `capacity`, `department`, `postedBy` (ref User), and `status` (`open`/`closed`). |
| `models/Application.js` | Association Document | Stores `student` (ref User), `opportunity` (ref Opportunity), `status` state machine, and calculated `matchScore`. Enforces **Compound Unique Index** `{ student: 1, opportunity: 1 }`. |
| `models/Allocation.js` | Allocation Ledger | Stores finalized project allocation with `hoursCompleted` tracking for AICTE compliance. |
| `models/Notification.js` | Alert Notification Model | Stores recipient `user`, `message`, `type`, `read` boolean, and timestamps. |
| `middleware/auth.js` | JWT Authentication Guard | Parses `Authorization: Bearer <token>`, calls `jwt.verify()`, decodes `{ id, role }` onto `req.user`. Returns `401` on token failure or expiration. |
| `middleware/roleCheck.js` | RBAC Higher-Order Function | Closure: `roleCheck(...allowedRoles)`. Validates `req.user.role` against authorized roles; halts with `403 Forbidden` if unauthorized. |
| `middleware/upload.js` | Multipart Form Data Parser | Configures Multer storage disk engine, unique timestamp naming, 5MB file cap, and `.pdf` mime-type filter. |
| `middleware/errorHandler.js` | Central Exception Handler | Intercepts Express errors, converts Mongoose `CastError` (404), Duplicate Key `11000` (400), ValidationErrors (400), and Multer errors into structured JSON. |
| `controllers/authController.js` | Authentication Handlers | Implements `register` (with institutional domain checks `@cuchd.in`/`@cumail.in`), `login` (bcrypt verification + JWT issuance), and `getMe`. |
| `controllers/studentController.js` | Student Profile & Upload Controller | Handles profile updates and PDF resume upload triggering instant text parsing. |
| `controllers/opportunityController.js`| Vacancy CRUD & Broadcast Handler | Handles vacancy creation, updates, deletions, and triggers asynchronous student email broadcast alerts. |
| `controllers/applicationController.js`| Application State Machine | Handles application submission with on-the-fly match scoring, status transitions (`under_review` -> `allocated`), and allocation creation. |
| `controllers/matchController.js` | Recommendation Handler | Fetches student profile, calls `matchingEngine.rankOpportunities()`, and returns sorted opportunities with match explanations. |
| `controllers/adminController.js` | Aggregation & Governance | Executes Mongoose Aggregation pipelines for system-wide statistics, department distributions, and user role updates. |
| `services/resumeParser.js` | NLP Resume Parsing Service | Uses `pdf-parse` to convert binary PDF stream to plain text; uses regex boundary matching against taxonomy of 50+ technical keywords. |
| `services/matchingEngine.js` | Mathematical Matching Algorithm | Calculates 0–100% suitability score using weighted composite scoring: Skill Match (65 pts) + Department Alignment (20 pts) + Domain Preferences (15 pts). |
| `services/emailService.js` | Institutional Broadcast Dispatcher | Generates responsive HTML email alerts and dispatches opportunity announcements to student inboxes. |
| `utils/generateToken.js` | Cryptographic Token Generator | Signs JWT payloads with secret key and expiration parameters. |
| `utils/validators.js` | Input & Domain Validation | Validates email syntax, required keys, and enforces `@cuchd.in` for students and `@cumail.in` for faculty. |
| `tests/regression.test.js` | Automated API Test Suite | Boots in-memory MongoDB server and executes 45+ integration test cases testing all endpoints, role guards, and matching logic. |

---

# 3. AI & NLP Engine Deep Dive: Matching Algorithms & Resume Parsing

### 3.1 Mathematical Formulation of the Matching Engine
The matching engine (`services/matchingEngine.js`) scores compatibility between a student $S$ and an opportunity $O$ on a scale of $0 \le \text{Score}(S, O) \le 100$.

$$\text{Score}(S, O) = W_{\text{skill}} \cdot \mathcal{S}_{\text{skill}} + W_{\text{dept}} \cdot \mathcal{S}_{\text{dept}} + W_{\text{pref}} \cdot \mathcal{S}_{\text{pref}}$$

Where the component weights are:
- $W_{\text{skill}} = 65$ (Technical competency alignment)
- $W_{\text{dept}} = 20$ (Academic department alignment)
- $W_{\text{pref}} = 15$ (Career domain interest alignment)

#### 1. Skill Match Component ($\mathcal{S}_{\text{skill}}$)
Let $\mathcal{K}_{\text{declared}}$ be self-declared skills and $\mathcal{K}_{\text{parsed}}$ be AI-extracted resume skills.
The student's consolidated skill set is:
$$\mathcal{U}_S = \mathcal{K}_{\text{declared}} \cup \mathcal{K}_{\text{parsed}}$$
Let $\mathcal{R}_O$ be the opportunity's required skill set. The normalized skill score is:
$$\mathcal{S}_{\text{skill}} = \begin{cases} \frac{|\mathcal{U}_S \cap \mathcal{R}_O|}{|\mathcal{R}_O|}, & \text{if } |\mathcal{R}_O| > 0 \\ 1.0, & \text{if } |\mathcal{R}_O| = 0 \end{cases}$$

#### 2. Department Alignment ($\mathcal{S}_{\text{dept}}$)
$$\mathcal{S}_{\text{dept}} = \begin{cases} 1.0, & \text{if } \text{Dept}_S = \text{Dept}_O \text{ or } \text{Dept}_O \in \{\text{'All'}, \text{'Any'}\} \\ 0.5, & \text{if } \text{Dept}_O = \text{null} \\ 0.0, & \text{otherwise} \end{cases}$$

#### 3. Domain Preference Alignment ($\mathcal{S}_{\text{pref}}$)
Let $\mathcal{P}_S$ be student preference keywords and $\mathcal{T}_O$ be the tokenized opportunity text (title + description + type):
$$\mathcal{S}_{\text{pref}} = \begin{cases} 1.0, & \text{if } \exists p \in \mathcal{P}_S \text{ such that } p \subseteq \mathcal{T}_O \\ 0.33, & \text{if } \mathcal{P}_S = \emptyset \\ 0.0, & \text{otherwise} \end{cases}$$

### 3.2 Automated PDF Resume Parsing & NLP Extraction Pipeline
1. **Binary Stream Extraction**: `multer` receives the PDF upload and saves to disk; `pdf-parse` extracts raw UTF-8 text strings from PDF document streams.
2. **Text Normalization**: Text is converted to lowercase, whitespace is collapsed, and special delimiter characters are standardized.
3. **Regex Boundary Skill Matching**:
   To prevent substring collisions (e.g., preventing "c" from matching "computer" or "java" matching "javascript"), we construct boundary regexes:
   ```javascript
   const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
   const regex = new RegExp(`(^|[^a-zA-Z0-9_#+])${escaped}([^a-zA-Z0-9_#+]|$)`, 'i');
   ```
4. **Canonicalization**: Aliases are mapped to canonical names (`React.js` -> `React`, `Express.js` -> `Express`, `Amazon Web Services` -> `AWS`).
5. **Deduplication**: Extracted terms are stored in a `Set` and persisted in `StudentProfile.resumeParsedSkills`.

---

# 4. Authentication, Authorization, Tokens & Security Engineering

### 4.1 Authentication vs. Authorization Matrix

| Dimension | Authentication (AuthN) | Authorization (AuthZ) |
|---|---|---|
| **Core Question** | *"Who are you?"* | *"What resources can you access?"* |
| **Verification Mechanism**| Passwords, Biometrics, OTP, Public Keys | User roles, Permissions, Claims, Scopes |
| **Execution Point** | At entry point (`POST /api/auth/login`) | On every protected route (`roleCheck.js`) |
| **HTTP Status Failure** | `401 Unauthorized` | `403 Forbidden` |

### 4.2 JSON Web Token (JWT) Cryptographic Anatomy
A JWT consists of three base64url-encoded strings joined by periods (`.`):

```
+-----------------------------------------------------------------------------------+
| 1. HEADER                                                                         |
| {"alg": "HS256", "typ": "JWT"}                                                    |
+-----------------------------------------------------------------------------------+
                                         |
                                         v  Base64URL encoded
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
                                         .
+-----------------------------------------------------------------------------------+
| 2. PAYLOAD (Claims)                                                               |
| {"id": "64fa1b2c", "role": "student", "iat": 1690000000, "exp": 1690604800}       |
+-----------------------------------------------------------------------------------+
                                         |
                                         v  Base64URL encoded
eyJpZCI6IjY0ZmExYjJjIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE2OTAwMDAwMDB9
                                         .
+-----------------------------------------------------------------------------------+
| 3. SIGNATURE                                                                      |
| HMAC-SHA256(Base64(Header) + "." + Base64(Payload), SECRET_KEY)                   |
+-----------------------------------------------------------------------------------+
                                         |
                                         v  Cryptographic Signature
4Xb8xG7Q9f3...
```

- **Signature Integrity**: If an attacker tampers with the payload (e.g. changing `"role": "student"` to `"role": "admin"`), the signature verification using `JWT_SECRET` fails cryptographically.

### 4.3 Web Security Threat Modeling & Mitigations

```
+-------------------+--------------------------------------------+----------------------------------------------------+
| Threat            | Attack Vector                              | Project Mitigation Strategy                        |
+-------------------+--------------------------------------------+----------------------------------------------------+
| NoSQL Injection   | Malicious query operators in inputs        | Mongoose schema casting; sanitization of payloads  |
| XSS               | Malicious script injection into DOM        | React JSX auto-escaping; no dangerouslySetInnerHTML|
| CSRF              | Cross-origin forge submission              | Bearer token in Authorization header (no cookies)  |
| Password Leak     | Database breach exposes plaintext passwords| Bcrypt adaptive salt hashing (10 work factor rounds)|
| Brute Force       | Dictionary attack on auth endpoints        | Centralized validation + rate limiting feasibility  |
| Broken Object Auth| Student A deleting Student B's application | Controller ownership verification: req.user.id     |
+-------------------+--------------------------------------------+----------------------------------------------------+
```

---

# 5. REST APIs, Protocol Standards & HTTP Deep Dive

### 5.1 HTTP Methods, Safety, and Idempotency

| HTTP Method | CRUD Action | Safe? | Idempotent? | RFC Specification Use |
|---|---|---|---|---|
| **GET** | Read | **Yes** | **Yes** | Retrieve resource without state mutation |
| **POST** | Create / Action | **No** | **No** | Submit payload to create entity or run process |
| **PUT** | Replace / Upsert | **No** | **Yes** | Replace entire resource state at target URI |
| **PATCH** | Partial Update | **No** | **No** | Apply partial delta modifications |
| **DELETE** | Remove | **No** | **Yes** | Delete resource at target URI |
| **OPTIONS** | Metadata / CORS | **Yes** | **Yes** | Query preflight server capabilities |

### 5.2 HTTP Status Code Matrix

```
+-----------------------------------------------------------------------------------+
| 2xx SUCCESS                                                                       |
| 200 OK           -> Standard success response for GET, PUT, PATCH                 |
| 201 Created      -> Resource successfully created via POST                        |
| 204 No Content   -> Successful deletion; no body returned                         |
+-----------------------------------------------------------------------------------+
| 4xx CLIENT ERRORS                                                                 |
| 400 Bad Request  -> Malformed JSON, missing fields, or domain validation failure |
| 401 Unauthorized -> Missing, expired, or cryptographically invalid JWT token      |
| 403 Forbidden    -> Authenticated identity lacks role permission (RBAC)           |
| 404 Not Found    -> Target resource ID does not exist in database                 |
| 409 Conflict     -> Duplicate resource creation (unique index violation)          |
| 422 Unprocessable-> Semantic validation failure on syntactically valid JSON       |
| 429 Too Many Req -> Rate limit threshold exceeded                                 |
+-----------------------------------------------------------------------------------+
| 5xx SERVER ERRORS                                                                 |
| 500 Internal Err -> Uncaught exception / runtime failure                          |
| 502 Bad Gateway  -> Reverse proxy unable to reach Node upstream process           |
| 503 Unavailable  -> Server down for maintenance or DB connection failure          |
+-----------------------------------------------------------------------------------+
```

---

# 6. Database Engineering: MongoDB, Relational SQL & Aggregations

### 6.1 Relational (SQL) vs. Non-Relational (MongoDB)

```
+-----------------------------+-----------------------------------+-----------------------------------+
| Parameter                   | Relational Databases (Postgres)   | Document Databases (MongoDB)      |
+-----------------------------+-----------------------------------+-----------------------------------+
| Data Structure              | Rigid Tables, Rows, Columns       | Flexible BSON / JSON Documents    |
| Schema Evolution            | Explicit ALTER TABLE migrations   | Schema-less / Mongoose validation |
| Multi-Record Relationships  | Foreign Keys + JOIN queries       | Document Embedding / References   |
| Horizontal Scaling          | Complex sharding; read replicas   | Native automated cluster sharding |
| Complex Nested Data         | Requires junction / bridge tables | Direct arrays & nested sub-docs   |
+-----------------------------+-----------------------------------+-----------------------------------+
```

### 6.2 Mongoose Aggregation Pipeline Execution
MongoDB Aggregation processes documents in a multi-stage assembly line:

```
[ Collection: Opportunities ]
            │
            ▼ Stage 1: $match (Filter open postings)
            │
            ▼ Stage 2: $unwind (Deconstruct requiredSkills array)
            │
            ▼ Stage 3: $group (Group by skill name and $sum: 1)
            │
            ▼ Stage 4: $sort (Sort count descending)
            │
            ▼ Stage 5: $limit (Take top 10 in-demand skills)
            │
   [ Analytics Result Array ]
```

---

# 7. Node.js Internals, libuv & Express.js Architecture

### 7.1 The Node.js Event Loop Architecture
Node.js runs single-threaded JavaScript execution via V8 while offloading non-blocking I/O operations to **libuv**'s C++ thread pool.

```
   ┌───────────────────────────┐
┌─>│          timers           │  setTimeout(), setInterval()
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  I/O callbacks deferred from previous loop
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  Internal libuv operations
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  Retrieve I/O events, execute I/O callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  setImmediate() callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │  socket.on('close'), handle cleanup
   └───────────────────────────┘
```
- **Microtask Queue Priority**: `process.nextTick()` and resolved `Promise` callbacks execute immediately after the current operation finishes, before moving to the next event loop phase.

---

# 8. Caching, Message Queues & Distributed Systems Engineering

```
+------------------------+--------------------------------------------------------------------------+
| Concept                | Architectural Explanation                                                |
+------------------------+--------------------------------------------------------------------------+
| Cache-Aside (Lazy load)| Application checks Redis first; on miss, fetches DB and caches key.       |
| Write-Through          | Application writes to cache and database synchronously.                  |
| Cache Stampede         | Massive concurrent requests on expired key overwhelm DB; solved via locks|
| Message Broker (Queue) | Asynchronous producer-consumer queue (BullMQ/RabbitMQ) for email dispatch|
| Idempotency Key        | Unique client UUID attached to POST requests to prevent double processing|
| CAP Theorem            | Consistency, Availability, Partition Tolerance: distributed systems pick 2|
+------------------------+--------------------------------------------------------------------------+
```

---

# 9. Core JavaScript & V8 Engine Foundations

- **Closures**: Function bundled with references to its lexical environment. Used in `roleCheck(...roles)`.
- **Event Loop Concurrency**: Single thread processes call stack; asynchronous tasks offloaded to web/system APIs; microtasks execute before macrotasks.
- **Hoisting & TDZ**: Function declarations are hoisted with definition; `let`/`const` are hoisted into Temporal Dead Zone until line of initialization.

---

# 10. The 400 Core Backend Interview Questions & Answers Knowledge Base

---

## Section A: Node.js Internals & Asynchronous Runtime

#### 1. What is Node.js and how does its single-threaded runtime handle high concurrency?
Node.js is an open-source, cross-platform JavaScript runtime built on Chrome's V8 engine and libuv. It uses an asynchronous, non-blocking I/O event-driven architecture. While JavaScript runs on a single thread (the Event Loop), long-running operations (file system I/O, DNS lookups, cryptographic hashing) are offloaded to libuv's background C++ thread pool. When the worker thread finishes, it queues the callback into the event loop.

#### 2. What is libuv and what role does it play in Node.js?
libuv is a multi-platform C library that provides Node.js with its Event Loop, asynchronous I/O capabilities, file system operations, child processes, and a default thread pool of 4 worker threads.

#### 3. What are the six phases of the Node.js Event Loop in order?
1. `timers` (executes `setTimeout`, `setInterval`)
2. `pending callbacks` (executes I/O callbacks deferred to the next iteration)
3. `idle, prepare` (internal use)
4. `poll` (retrieves new I/O events and executes their callbacks)
5. `check` (executes `setImmediate` callbacks)
6. `close callbacks` (e.g. `socket.on('close')`)

#### 4. What is the difference between `process.nextTick()` and `setImmediate()`?
- `process.nextTick()` is not part of the event loop phases; it executes immediately after the current operation completes, before the event loop advances to any other phase.
- `setImmediate()` executes in the `check` phase of the event loop.

#### 5. How does the Microtask Queue differ from the Macrotask Queue in Node.js?
Microtasks (`process.nextTick()`, `Promise.then()`, `queueMicrotask()`) take priority over Macrotasks (`setTimeout`, `setInterval`, `setImmediate`, I/O). The engine drains the entire microtask queue between each phase and between individual tasks in the event loop.

#### 6. What is the default size of the libuv thread pool and how can you increase it?
Default size is 4. It can be modified by setting the environment variable `UV_THREADPOOL_SIZE=X` (up to 128) before the Node process boots.

#### 7. Which operations in Node.js utilize the libuv thread pool?
- File system operations (`fs.*`)
- Cryptographic operations (`crypto.pbkdf2`, `crypto.scrypt`, `bcrypt`)
- DNS lookups (`dns.lookup`)
- Zlib compression (`zlib.*`)
*(Network I/O operations like HTTP requests and TCP sockets use OS-level asynchronous primitives such as epoll/kqueue/IOCP instead of the thread pool).*

#### 8. What is the difference between synchronous and asynchronous file system methods in Node.js?
Synchronous methods (e.g. `fs.readFileSync`) block the entire Node.js main thread until the file is read, freezing all incoming network requests. Asynchronous methods (`fs.readFile` or `fs.promises.readFile`) offload the read to the libuv thread pool and trigger a non-blocking callback upon completion.

#### 9. What is a Stream in Node.js and what are the four stream types?
A Stream is an abstract interface for working with streaming data sequentially in chunks rather than buffering entire payloads in memory.
1. `Readable` (e.g., `fs.createReadStream`, `req`)
2. `Writable` (e.g., `fs.createWriteStream`, `res`)
3. `Duplex` (e.g., `net.Socket`)
4. `Transform` (e.g., `zlib.createGzip`)

#### 10. What is Backpressure in Node.js Streams?
Backpressure occurs when data is read from a source faster than the destination can write it. If unhandled, it leads to memory exhaustion. `readable.pipe(writable)` automatically handles backpressure by pausing the readable stream when `writable.write()` returns `false` until the `drain` event fires.

#### 11. What is a Buffer in Node.js?
A Buffer is a global class representing a fixed-size chunk of raw binary memory allocated outside the V8 JavaScript heap via libuv.

#### 12. What is the difference between `Buffer.alloc()` and `Buffer.allocUnsafe()`?
- `Buffer.alloc(size)`: Allocates zero-filled, sanitized memory.
- `Buffer.allocUnsafe(size)`: Allocates memory without zeroing, which is faster but may contain legacy sensitive memory data.

#### 13. What is the Node.js Cluster Module?
The Cluster module enables creating child processes (`forks`) that share the same server port. It allows Node.js to utilize multi-core CPUs by running one worker process per CPU core, routing traffic via round-robin.

#### 14. What is the difference between `child_process.fork()` and `child_process.spawn()`?
- `spawn()`: Launches a new process with a command (e.g., running shell scripts), streaming output via pipes.
- `fork()`: A special case of `spawn()` that specifically creates a new Node.js V8 instance with a built-in IPC (Inter-Process Communication) channel for messaging.

#### 15. What are Worker Threads in Node.js (`worker_threads`)?
Worker threads allow running multiple JavaScript execution threads in parallel sharing memory via `ArrayBuffer` instances, designed for CPU-intensive JavaScript tasks (like complex matching calculations) without spawning separate OS processes.

#### 16. What is an EventEmitter in Node.js?
`EventEmitter` is a core class that facilitates communication between objects in Node.js. Objects emit named events that cause registered listener functions to execute synchronously.

#### 17. How do you handle unhandled Promise rejections and uncaught exceptions in Node.js?
```javascript
process.on('uncaughtException', (err) => {
  console.error('Fatal Uncaught Exception:', err);
  process.exit(1); // Exit process and let supervisor restart
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
});
```

#### 18. What causes Memory Leaks in Node.js applications?
- Global variables holding onto large data structures.
- Unremoved event listeners (`EventEmitter` max listener warnings).
- Closures capturing references to large outer scopes.
- Unbounded in-memory caching objects without TTL/eviction policies.

#### 19. How does Garbage Collection work in V8?
V8 uses a generational garbage collection strategy:
- **Young Generation (Scavenge Algorithm)**: Fast collection for short-lived objects.
- **Old Generation (Mark-Sweep & Mark-Compact)**: Collects long-lived objects that survived multiple young-generation cycles.

#### 20. What is the difference between CommonJS and ES Modules (ESM)?
- **CommonJS (`require`/`module.exports`)**: Synchronous loading, dynamic imports allowed anywhere, standard in traditional Node.js.
- **ES Modules (`import`/`export`)**: Asynchronous/static loading, analyzed at compile time, tree-shakeable, standard in modern JavaScript.

#### 21. How do you profile CPU usage and memory in a Node.js process?
Using the built-in inspector: `node --inspect server.js` and connecting Chrome DevTools to take Heap Snapshots, CPU profiles, or using clinic.js (`clinic doctor -- node server.js`).

#### 22. What is REPL in Node.js?
Read-Eval-Print Loop: an interactive shell environment for executing JavaScript statements directly.

#### 23. What is the purpose of `package-lock.json`?
It locks the exact dependency tree and version hashes (integrity checks) across installations to prevent discrepancies between development and production environments.

#### 24. What is `npm dedupe`?
A command that flattens duplicate packages in `node_modules` by moving shared versions to the root level.

#### 25. How do you implement Graceful Shutdown in Node.js?
Intercept OS termination signals (`SIGTERM`, `SIGINT`), stop accepting new HTTP connections, wait for active requests to finish, close database connections, and exit:
```javascript
process.on('SIGTERM', () => {
  server.close(() => {
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});
```

#### 26. What is the purpose of `NODE_ENV`?
An environment variable used by frameworks (Express, Mongoose) to enable performance optimizations in `production` (caching view templates, suppressing verbose stack traces) versus `development`.

#### 27. Why should you avoid storing state in Node.js application memory?
Because Node.js processes are stateless and horizontally scaled across multiple instances or containers. In-memory state is lost on process restart and cannot be shared across cluster workers.

#### 28. What is the difference between `setImmediate()` and `setTimeout(fn, 0)`?
`setTimeout(fn, 0)` checks timer expiration and executes in the timers phase (with an actual minimum timer delay of ~1ms in V8). `setImmediate()` executes immediately in the check phase of the current loop iteration.

#### 29. What is Event Loop Starvation?
When a synchronous, long-running CPU task (e.g. infinite loop, large cryptographic computation, blocking regex) runs on the main thread, preventing the Event Loop from processing any queued I/O or network requests.

#### 30. How does Node.js handle DNS lookups differently for `dns.lookup` vs `dns.resolve`?
- `dns.lookup`: Uses the synchronous `getaddrinfo(3)` system call in libuv's thread pool.
- `dns.resolve`: Performs network DNS queries directly using non-blocking network sockets.

#### 31. What is the purpose of the `crypto` module in Node.js?
Provides cryptographic functionality including hashes (SHA256), HMACs, ciphers/deciphers (AES), and public/private key cryptography (RSA).

#### 32. What is the difference between `fs.stat()` and `fs.lstat()`?
`fs.stat()` follows symbolic links to return stats of the target file, whereas `fs.lstat()` returns stats on the symbolic link itself.

#### 33. What is `util.promisify()`?
A utility that converts traditional error-first callback functions `(err, data) => {}` into functions returning native ES6 Promises.

#### 34. What is the `vm` module in Node.js?
Allows compiling and running JavaScript code within isolated V8 virtual machine contexts.

#### 35. What is the purpose of `process.cwd()` vs `__dirname`?
- `process.cwd()`: Returns the directory from which the Node process was launched in the terminal.
- `__dirname`: Returns the absolute directory path of the source code file currently being executed.

#### 36. How do you prevent prototype pollution in Node.js?
- Use `Object.create(null)` for map lookups.
- Validate and sanitize input objects using libraries like Joi/Zod.
- Freeze prototypes using `Object.freeze(Object.prototype)`.

#### 37. What is the difference between `net` and `http` modules in Node.js?
- `net`: Provides raw TCP/IPC stream communication (Layer 4).
- `http`: Builds on top of `net` to handle HTTP protocol parsing, headers, and request/response life cycles (Layer 7).

#### 38. What is the maximum buffer size in Node.js?
On 64-bit systems, `buffer.constants.MAX_LENGTH` is approximately 4GB ($2^{32}-1$ bytes).

#### 39. What is `console.time()` and `console.timeEnd()`?
Utility functions for benchmarking execution duration of code blocks in milliseconds directly in stdout.

#### 40. How does `require()` resolve module paths?
1. Core built-in modules (`fs`, `http`, `path`).
2. If starts with `./`, `../`, or `/`: resolves file by appending `.js`, `.json`, `.node`.
3. If bare specifier: scans `node_modules` in current directory and ascends parent tree to root.

#### 41. What is module caching in CommonJS?
Modules are cached in `require.cache` after the first time they are loaded. Subsequent `require()` calls return the exact cached exported object instance without re-executing the module file.

#### 42. How do you delete a module from `require.cache`?
`delete require.cache[require.resolve('./myModule')]`.

#### 43. What is the purpose of the `os` module in Node.js?
Provides operating system utilities such as `os.cpus()`, `os.totalmem()`, `os.freemem()`, `os.networkInterfaces()`.

#### 44. What is a Memory Leak Heap Dump?
A snapshot of V8 heap memory allocating objects, retained sizes, and prototype references saved to `.heapsnapshot` files for inspection.

#### 45. What is the difference between `process.exit(0)` and `process.exit(1)`?
- `0`: Process terminated successfully with no errors.
- `1`: Process terminated due to an uncaught failure or error.

#### 46. What are Domain Objects in Node.js and why are they deprecated?
Domains were an early attempt to route unhandled asynchronous errors into a single handler. They were deprecated due to unfixable edge cases and replaced by `async/await` and centralized Promise error handling.

#### 47. What is `StringDecoder` in Node.js?
A module that decodes Buffer objects into strings while preserving multi-byte UTF-8 character boundaries across chunked streams.

#### 48. What is the purpose of `path.join()` vs `path.resolve()`?
- `path.join()`: Concatenates path segments using platform-specific separator (`/` or `\`) and normalizes the resulting path.
- `path.resolve()`: Resolves a sequence of paths into an absolute path, treating segments starting with `/` as root.

#### 49. How do you prevent Node.js servers from crashing on uncaught errors?
Wrap asynchronous route handlers in centralized `try/catch` or use `express-async-errors` middleware, and pipe errors to the Express global error handler `(err, req, res, next)`.

#### 50. What is the role of the V8 JIT (Just-In-Time) compiler?
V8 compiles JavaScript directly to native machine code at runtime without using an interpreter. It uses **Ignition** (interpreter) and **TurboFan** (optimizing compiler) to optimize hot functions based on profiling type feedback.

---

## Section B: Express.js, Middleware & API Server Architecture

#### 51. What is Express.js?
Express is a fast, unopinionated, minimalist web framework for Node.js that provides a robust set of features for routing, middleware management, and HTTP utility handling.

#### 52. What is an Express Middleware?
A middleware is a function with access to the Request object (`req`), Response object (`res`), and the next middleware function in the application’s request-response cycle (`next`).

#### 53. What are the 5 types of middleware in Express?
1. Application-level middleware (`app.use()`)
2. Router-level middleware (`router.use()`)
3. Error-handling middleware (`(err, req, res, next)`)
4. Built-in middleware (`express.json()`, `express.static()`)
5. Third-party middleware (`cors`, `helmet`, `multer`, `morgan`)

#### 54. Why does Express Error-Handling middleware require exactly 4 parameters?
Express inspects the function's `length` property (`fn.length === 4`). If a function defines `(err, req, res, next)`, Express recognizes it as an error-handling middleware and routes errors passed to `next(err)` directly to it.

#### 55. What happens if you forget to call `next()` or send a response in an Express middleware?
The request hangs indefinitely until the client or gateway times out (e.g. 504 Gateway Timeout).

#### 56. What is `app.use(express.json())` and how does it work?
It is a built-in body-parsing middleware based on `body-parser`. It intercepts incoming requests with `Content-Type: application/json`, streams the raw binary chunks into memory, parses the JSON string, and attaches the resulting object to `req.body`.

#### 57. What is `app.use(express.urlencoded({ extended: true }))`?
Parses URL-encoded form payloads (from HTML `<form>` submissions). `extended: true` uses the `qs` library (allowing rich objects and arrays to be encoded), whereas `extended: false` uses the built-in `querystring` library.

#### 58. How do you serve static files in Express?
`app.use('/uploads', express.static(path.join(__dirname, 'uploads')))` maps the public URL `/uploads/*` to the physical directory on disk.

#### 59. How does Express route matching work?
Routes are evaluated in the exact order they are defined in code. If a generic route like `/:id` is placed before `/mine`, requests to `/mine` will incorrectly match `/:id` with `req.params.id = 'mine'`.

#### 60. What is `express.Router`?
An isolated instance of middleware and routes that behaves like a "mini-application", enabling modular, organized route architectures.

#### 61. What is CORS and how does the `cors` package work?
Cross-Origin Resource Sharing is a browser security standard. The `cors()` middleware automatically appends appropriate HTTP headers (`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`) and responds to HTTP `OPTIONS` preflight requests.

#### 62. What is an HTTP Preflight request?
An HTTP `OPTIONS` request sent automatically by browsers prior to "non-simple" requests (requests with custom headers like `Authorization` or methods like `PUT`/`DELETE`) to check if the server permits the cross-origin operation.

#### 63. What is Multer and how does it handle multipart form data?
Multer is an Express middleware for handling `multipart/form-data` (primarily file uploads). It streams binary file chunks, validates file types/sizes, and writes files to disk storage or memory buffers.

#### 64. What is `helmet` and what security headers does it set?
Helmet is a middleware package that sets HTTP response security headers:
- `Content-Security-Policy` (CSP)
- `X-Frame-Options` (prevents clickjacking)
- `Strict-Transport-Security` (HSTS)
- `X-Content-Type-Options: nosniff` (prevents MIME-sniffing)

#### 65. What is `morgan`?
An HTTP request logging middleware that logs request method, URL, status code, response time, and remote IP address to standard output.

#### 66. How do you implement Rate Limiting in Express?
Using `express-rate-limit`:
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);
```

#### 67. What is the difference between `req.params`, `req.query`, and `req.body`?
- `req.params`: Named route path parameters (e.g. `/opportunities/:id` -> `req.params.id`).
- `req.query`: URL query string parameters (e.g. `/opportunities?type=internship` -> `req.query.type`).
- `req.body`: Parsed payload submitted in the HTTP request body.

#### 68. What is `res.send()` vs `res.json()` vs `res.end()`?
- `res.json()`: Formats payload as JSON, sets `Content-Type: application/json`.
- `res.send()`: Automatically infers content type (string -> `text/html`, object -> `application/json`).
- `res.end()`: Closes the HTTP response stream immediately without sending a payload body.

#### 69. How do you handle file downloads in Express?
`res.download(filePath, [filename], [callback])` sets `Content-Disposition: attachment` to trigger browser download dialogs.

#### 70. What is the purpose of `express-async-errors`?
In Express 4.x, asynchronous errors thrown inside `async` handlers do not automatically propagate to error middleware unless wrapped in `try/catch` with `next(err)`. `express-async-errors` monkey-patches route handlers to pass rejections to `next()` automatically.

#### 71. How do you structure an enterprise Express application?
- `config/` (DB, environment variables)
- `controllers/` (Business logic execution)
- `models/` (Database schemas)
- `routes/` (URL definitions and middleware attachment)
- `middleware/` (Auth, validation, error handlers)
- `services/` (External integrations, matching algorithms, emailers)
- `utils/` (Helper functions)

#### 72. How do you implement API Versioning in Express?
Prefix route modules:
```javascript
app.use('/api/v1/opportunities', v1OpportunityRoutes);
app.use('/api/v2/opportunities', v2OpportunityRoutes);
```

#### 73. What is `res.locals`?
An object scoped to the lifetime of the current request used to pass data between middleware functions without polluting `req`.

#### 74. How does `compression` middleware improve API throughput?
Gzip or Brotli compresses response bodies before transmission over network sockets, significantly reducing JSON payload byte transfer sizes.

#### 75. How do you validate request schemas in Express?
Using libraries like Zod, Joi, or `express-validator`:
```javascript
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ errors: result.error });
  next();
};
```

---

## Section C: Authentication, JWT, OAuth 2.0 & Web Security

#### 101. What is the difference between State-ful (Session) and Stateless (JWT) Authentication?
- **Session Auth (Stateful)**: Server creates a session record in DB/Redis and sends a `session_id` cookie. On every request, the server performs a database lookup to retrieve user session data.
- **JWT Auth (Stateless)**: Server signs a token containing user data and sends it to the client. The client stores and sends the token; the server validates the token cryptographically without DB lookups.

#### 102. What are the three components of a JSON Web Token?
`Header` (algorithm & token type), `Payload` (claims/data), and `Signature` (cryptographic hash).

#### 103. Can someone read the data inside a JWT payload without knowing the secret key?
**Yes.** The payload is only base64url-encoded, not encrypted. Anyone can decode it at `jwt.io`. Therefore, sensitive data (passwords, social security numbers) must never be placed in a JWT payload.

#### 104. How does a server verify that a JWT has not been tampered with?
The server recomputes the signature using its private `JWT_SECRET` and the received header and payload:
$$\text{Expected Signature} = \text{HMAC-SHA256}(\text{Base64}(H) + "." + \text{Base64}(P), \text{secret})$$
If the expected signature matches the received signature, the token is authentic.

#### 105. Where should JWTs be stored on the client side for maximum security?
In an **`httpOnly, Secure, SameSite=Strict` cookie**. This prevents JavaScript access, completely mitigating Cross-Site Scripting (XSS) token theft. Storing in `localStorage` leaves tokens vulnerable to XSS attacks.

#### 106. What is a Refresh Token Rotation strategy?
Every time a refresh token is used to issue a new access token, the refresh token is invalidated and a new refresh token is issued. If an invalidated refresh token is ever reused, the system detects a token breach and revokes all refresh tokens for that user session.

#### 107. How do you revoke a stateless JWT before its natural expiration?
1. **Token Blacklist**: Store revoked token IDs (`jti`) in Redis with a TTL equal to the remaining token lifetime.
2. **Token Versioning**: Store a `tokenVersion` integer on the `User` document. Increment `tokenVersion` on logout or password change; reject any JWT whose payload version does not match the database version.

#### 108. What is OAuth 2.0?
An authorization framework that enables third-party applications to obtain limited access to a HTTP service on behalf of a resource owner without sharing the user's password.

#### 109. What is the OAuth 2.0 Authorization Code Flow with PKCE?
Proof Key for Code Exchange (PKCE) is the standard flow for Single Page Applications (SPAs) and mobile apps:
1. Client generates a random `code_verifier` and computes its cryptographic hash `code_challenge`.
2. Client redirects user to Auth Server with `code_challenge`.
3. User logs in; Auth Server returns an `authorization_code`.
4. Client exchanges `authorization_code` and the original `code_verifier` for an access token.
5. Auth Server hashes the `code_verifier` and verifies it matches `code_challenge`, preventing interception attacks.

#### 110. What is OpenID Connect (OIDC)?
An identity layer built on top of OAuth 2.0. While OAuth 2.0 provides an `access_token` for authorization, OIDC returns an `id_token` (JWT) containing verified user identity claims.

#### 111. What is Role-Based Access Control (RBAC)?
A security model where permissions are assigned to specific roles (e.g. `student`, `faculty`, `admin`), and users are assigned roles. Access control is enforced by checking if the user's assigned role matches the route requirements.

#### 112. What is Attribute-Based Access Control (ABAC)?
An authorization model that evaluates attributes of the user, the resource, the action, and the environment (e.g., "Allow faculty to edit opportunity IF department == 'CS' AND time < 5 PM").

#### 113. How does Bcrypt hashing work?
Bcrypt is a key-derivation function based on the Blowfish cipher. It incorporates a random per-password salt and an adaptive work factor (salt rounds). Each increment of the work factor doubles the computation time required to hash passwords, rendering brute-force attacks computationally infeasible.

#### 114. What is a Rainbow Table Attack and how does Salting prevent it?
A rainbow table is a precomputed lookup table of common password hashes. Salting appends a cryptographically random byte string to the password before hashing, ensuring that identical passwords produce completely different hash values, rendering precomputed tables useless.

#### 115. What is Cross-Site Request Forgery (CSRF) and how is it mitigated?
CSRF occurs when a malicious site tricks a user's browser into executing an unauthorized command on a trusted web application where the user is currently authenticated via ambient cookies.
*Mitigations*:
- Use `SameSite=Strict` on cookies.
- Use CSRF anti-forgery tokens (Synchronizer Token Pattern).
- Use `Authorization: Bearer` headers instead of cookies.

#### 116. What is Cross-Site Scripting (XSS) and what are its three types?
XSS occurs when malicious JavaScript is injected into trusted web applications.
1. **Stored XSS**: Malicious script saved in database and served to all users.
2. **Reflected XSS**: Script injected into request query parameters and reflected back in response.
3. **DOM-based XSS**: Vulnerability in client-side script modifying the DOM unsafely.

#### 117. What is Content Security Policy (CSP)?
An HTTP response header (`Content-Security-Policy`) that restricts the resources (scripts, images, stylesheets) that the browser is allowed to load for a given page, neutralizing XSS attacks.

#### 118. What is SQL / NoSQL Injection?
When untrusted user input is concatenated directly into a database query string, altering the query structure. Mitigated by using parameterized queries (SQL) or Mongoose schema data typing (NoSQL).

#### 119. What is a Timing Attack in password verification?
When an attacker measures the time it takes for a system to reject a password comparison to deduce correct character prefixes. Mitigated by using constant-time comparison functions (`crypto.timingSafeEqual`).

#### 120. What is Server-Side Request Forgery (SSRF)?
When an attacker forces a backend server to make unauthorized HTTP requests to internal network services (e.g. AWS metadata endpoint `http://169.254.169.254/`).

---

## Section D: REST, HTTP Protocol & Communication Patterns

#### 161. What are the 6 architectural constraints of REST?
1. Client-Server architecture
2. Statelessness
3. Cacheability
4. Uniform Interface
5. Layered System
6. Code on Demand (optional)

#### 162. What is HATEOAS in REST?
Hypermedia As The Engine Of Application State: REST responses include hypermedia links pointing to related actions the client can perform next (e.g. `_links: { self: {...}, withdraw: {...} }`).

#### 163. What is the difference between URI, URL, and URN?
- **URI (Uniform Resource Identifier)**: Generic identifier for a resource.
- **URL (Uniform Resource Locator)**: URI that specifies *how* to locate the resource (includes protocol, host, path: `https://example.com/api`).
- **URN (Uniform Resource Name)**: Identifies a resource by name in a namespace without specifying location (e.g. `urn:isbn:0451450523`).

#### 164. What is the difference between Offset Pagination and Cursor Pagination?
- **Offset Pagination (`LIMIT 10 OFFSET 20`)**: Simple, but slow for deep pages ($O(N)$ scan) and prone to duplicate/missing items if records are inserted concurrently.
- **Cursor Pagination (`WHERE id > last_seen_id LIMIT 10`)**: High performance ($O(1)$ index lookup), stable during concurrent insertions, ideal for infinite scrolling.

#### 165. When should you use WebSockets instead of HTTP?
For real-time, bidirectional, low-latency communication (e.g. live chat, collaborative editing, high-frequency stock tickers). HTTP is request-response; WebSockets maintain a persistent full-duplex TCP connection.

#### 166. What are Server-Sent Events (SSE)?
A unidirectional communication standard where the client opens a persistent HTTP connection (`Content-Type: text/event-stream`), and the server pushes events to the client. Simpler than WebSockets for server-to-client notifications.

#### 167. What is the difference between Long Polling and WebSockets?
- **Long Polling**: Client sends HTTP request; server holds connection open until new data is available, responds, closes connection, and client immediately sends a new request.
- **WebSockets**: Single TCP handshake upgraded via HTTP `Upgrade: websocket` header, keeping a persistent bidirectional channel open.

#### 168. What is GraphQL and how does it solve Over-fetching and Under-fetching?
GraphQL is a query language for APIs. Clients declare the exact fields they need in a single request, eliminating **over-fetching** (receiving unnecessary fields) and **under-fetching** (requiring multiple round-trips to different endpoints).

#### 169. What is gRPC?
A high-performance, open-source universal RPC framework developed by Google. It uses **HTTP/2** transport and **Protocol Buffers (Protobuf)** binary serialization, providing higher throughput and lower latency than JSON REST APIs.

#### 170. What is HTTP/2 and how does it improve on HTTP/1.1?
- **Multiplexing**: Multiple requests/responses interleaved over a single TCP connection.
- **Header Compression (HPACK)**: Drastically reduces header overhead.
- **Server Push**: Server can send assets to client cache proactively.
- **Binary Protocol**: Faster parsing than text-based HTTP/1.1.

---

## Section E: MongoDB, Mongoose & NoSQL Database Design

#### 211. What is BSON in MongoDB?
BSON (Binary JSON) is a binary-encoded serialization format used by MongoDB to store documents and perform remote procedure calls. It extends JSON with additional data types like `ObjectId`, `Date`, `BinData`, and `Long`.

#### 212. What is an `ObjectId` in MongoDB composed of?
A 12-byte identifier composed of:
- 4-byte timestamp (seconds since Unix epoch)
- 5-byte random value (unique to machine and process)
- 3-byte incrementing counter

#### 213. What are Mongoose Virtuals?
Document properties that can be retrieved and set but are not persisted to the MongoDB database (e.g. computing `fullName` from `firstName` and `lastName`).

#### 214. What are Mongoose Middleware / Hooks?
Functions passed control during the execution of asynchronous Mongoose operations.
- `pre`: Runs before an event (e.g. `pre('save')` to hash passwords).
- `post`: Runs after an event (e.g. `post('save')` to trigger email alerts).

#### 215. What is a Compound Index in MongoDB?
An index that holds references to multiple fields within a collection (e.g., `index({ department: 1, year: -1 })`). The order of fields matters (Index Prefix rule).

#### 216. What is the Index Prefix rule in MongoDB?
A compound index on `{ a: 1, b: 1, c: 1 }` can support queries on `{ a }`, `{ a, b }`, and `{ a, b, c }`, but **cannot** support queries on `{ b }` or `{ b, c }` without `a`.

#### 217. What is a Multikey Index in MongoDB?
An index automatically created when indexing a field that holds an array value (e.g. indexing `skills: [String]`). MongoDB creates separate index entries for every item in the array.

#### 218. What is a TTL (Time-To-Live) Index in MongoDB?
A single-field index on a Date field with `expireAfterSeconds` that causes MongoDB to automatically delete documents after the specified duration (ideal for sessions or verification OTPs).

#### 219. What is a Covered Query in MongoDB?
A query where all fields requested in the query criteria and projection are part of an index. MongoDB fulfills the query directly from the index RAM without inspecting any documents on disk ($O(\log N)$ lookup with zero document read latency).

#### 220. What is `explain("executionStats")` in MongoDB?
A command that details query execution plans, showing whether a query used an `IXSCAN` (Index Scan) or a `COLLSCAN` (Collection Scan / Table Scan), total documents examined, and execution time in milliseconds.

#### 221. What is the difference between Embedding and Referencing in MongoDB schema design?
- **Embedding (Denormalization)**: Storing related data within a single document. Best for $1:1$ or $1:\text{few}$ relationships, data accessed together, and when atomicity within a single document is required.
- **Referencing (Normalization)**: Storing `ObjectId` pointers to documents in other collections. Best for $1:\text{many}$ or $\text{many}:\text{many}$ relationships and large sub-documents exceeding the 16MB document cap.

#### 222. What is the maximum document size in MongoDB?
16 Megabytes (BSON limit). For larger files (e.g. high-resolution videos, large PDFs), MongoDB provides **GridFS**.

#### 223. What is MongoDB GridFS?
A specification for storing and retrieving files that exceed the 16MB BSON limit by dividing files into discrete 255KB chunks stored in two collections: `fs.files` (metadata) and `fs.chunks` (binary chunks).

#### 224. How does MongoDB achieve High Availability?
Through **Replica Sets**: A cluster of MongoDB servers consisting of one **Primary** node (handles all writes) and multiple **Secondary** nodes (replicate primary's `oplog` asynchronously). If the Primary fails, secondaries elect a new Primary via consensus election within seconds.

#### 225. What is the Write Concern in MongoDB (`w: 1`, `w: "majority"`)?
Specifies the level of acknowledgment requested from MongoDB for write operations:
- `w: 1`: Acknowledged once written to Primary memory/journal.
- `w: "majority"`: Acknowledged only after written to the majority of replica set members (guarantees durability against failover).

---

## Section F: Relational Databases, SQL, ACID & Transactions

#### 261. What does ACID stand for in Database Transactions?
- **Atomicity**: All operations in a transaction succeed or all roll back (all-or-nothing).
- **Consistency**: Database transitions from one valid state to another, upholding all constraints.
- **Isolation**: Concurrent transactions execute without interfering with one another.
- **Durability**: Committed transactions are permanently recorded in non-volatile storage.

#### 262. What are the 4 ANSI SQL Transaction Isolation Levels?
1. **Read Uncommitted** (lowest; allows Dirty Reads)
2. **Read Committed** (prevents Dirty Reads; allows Non-Repeatable Reads)
3. **Repeatable Read** (prevents Non-Repeatable Reads; allows Phantom Reads)
4. **Serializable** (highest; strict serial execution)

#### 263. What is a Dirty Read, Non-Repeatable Read, and Phantom Read?
- **Dirty Read**: Transaction reads uncommitted data modified by another concurrent transaction that later rolls back.
- **Non-Repeatable Read**: Transaction re-reads the same row and discovers values were modified by another committed transaction.
- **Phantom Read**: Transaction re-executes a range query and discovers new rows inserted by another committed transaction.

#### 264. What are Database Normalization Forms (1NF, 2NF, 3NF, BCNF)?
- **1NF**: Atomic values per cell; no repeating groups; primary key defined.
- **2NF**: In 1NF and no partial dependencies (every non-key attribute fully functionally dependent on the whole candidate key).
- **3NF**: In 2NF and no transitive dependencies (non-key attributes do not depend on other non-key attributes).
- **BCNF**: Strict 3NF where every determinant is a candidate key.

#### 265. What is the N+1 Query Problem and how do you solve it?
Occurs when an application executes 1 query to fetch $N$ parent records, and then executes $N$ additional queries to fetch associated children.
*Solution*: Use eager loading / JOIN queries (SQL) or `$lookup` / `.populate()` with batching (Mongoose).

#### 266. What is Optimistic Locking vs Pessimistic Locking?
- **Optimistic Locking**: Assumes conflicts are rare. Records include a `version` number. On update: `WHERE id = :id AND version = :currentVersion`. If 0 rows updated, conflict detected and rolled back.
- **Pessimistic Locking**: Locks the record immediately (`SELECT ... FOR UPDATE`), blocking all concurrent access until transaction completes.

#### 267. What is a Database Deadlock?
When two or more transactions hold locks on separate resources and each waits for the other to release its lock, creating a circular blocking dependency. Resolved by database deadlock detection engines rolling back one transaction.

#### 268. What is the difference between Clustered and Non-Clustered Indexes?
- **Clustered Index**: Determines the physical storage order of rows on disk (only 1 per table, usually Primary Key).
- **Non-Clustered Index**: A separate B-Tree structure storing indexed columns and pointers to physical data rows.

#### 269. What is Database Connection Pooling?
Maintaining a cache of active database connections that are reused across incoming HTTP requests, avoiding the expensive TCP handshake and authentication overhead of opening a new database socket per request.

#### 270. What is WAL (Write-Ahead Logging)?
A technique where database modifications are written to an append-only log on disk before being applied to in-memory tables, guaranteeing durability during sudden power loss or crashes.

---

## Section G: Caching, Redis, Queues & Distributed Patterns

#### 301. What is Redis and what are its primary data structures?
Redis (Remote Dictionary Server) is an in-memory, key-value data structure store used as a database, cache, and message broker.
*Data Structures*: Strings, Hashes, Lists, Sets, Sorted Sets (ZSet), Bitmaps, HyperLogLogs, Geospatial indexes, Streams.

#### 302. What are the common Caching Strategies?
- **Cache-Aside (Lazy Loading)**: Application queries Redis; if cache miss, queries DB, writes to Redis, and returns.
- **Write-Through**: Application writes data to cache and database synchronously.
- **Write-Back (Write-Behind)**: Application writes to cache immediately; cache asynchronously flushes writes to DB in batches.

#### 303. What is Cache Invalidation, and what did Phil Karlton say?
*"There are only two hard things in Computer Science: cache invalidation and naming things."*
Cache invalidation is the process of purging stale cached data when underlying source data changes.

#### 304. What is Cache Stampede (Thundering Herd)?
When a popular cached key expires, thousands of concurrent requests miss the cache simultaneously and hit the database at once, causing database CPU spikes.
*Mitigations*: Distributed locking (Redlock), probabilistic early expiration (XFetch algorithm), background pre-warming.

#### 305. What is Cache Penetration vs Cache Breakdown?
- **Cache Penetration**: Requests query keys that do not exist in cache OR database (e.g. malicious random IDs). *Fix*: Cache null values with short TTL or use Bloom Filters.
- **Cache Breakdown**: A single hot key expires, causing massive concurrent requests to hit the DB. *Fix*: Mutex locks around DB fetch.

#### 306. What is the CAP Theorem?
In a distributed data store, it is impossible to simultaneously guarantee all three:
- **Consistency**: Every read receives the most recent write or an error.
- **Availability**: Every non-failing node returns a non-error response.
- **Partition Tolerance**: System continues to operate despite network drops between nodes.
*(Distributed systems must pick CP or AP during a network partition).*

#### 307. What is Eventual Consistency (BASE)?
Basically Available, Soft state, Eventual consistency. The system guarantees that, in the absence of new updates, all replicas will eventually converge to the same value over time.

#### 308. What is the difference between RabbitMQ and Apache Kafka?
- **RabbitMQ**: Traditional Message Broker using smart broker / dumb consumer architecture. Supports complex AMQP routing (exchanges, topics, queues), acknowledges message consumption, and deletes messages upon acknowledgment.
- **Kafka**: Distributed append-only Commit Log using dumb broker / smart consumer architecture. Messages are retained on disk for a retention period; consumers track their own offsets, allowing massive streaming throughput (millions of msgs/sec).

#### 309. What is a Distributed Lock (Redlock)?
An algorithm for acquiring mutual exclusion locks across independent Redis instances using atomic `SET key uuid NX PX timeout` commands, ensuring only one worker executes a critical section across a distributed cluster.

#### 310. What are Rate Limiting Algorithms?
1. **Token Bucket**: Tokens added to bucket at fixed rate; requests consume tokens. Allows bursts.
2. **Leaky Bucket**: Requests enter queue and leak at constant smooth rate. Smooths bursts.
3. **Sliding Window Log**: Stores request timestamps in Redis Sorted Set; removes timestamps older than window. High precision.
4. **Sliding Window Counter**: Hybrid memory-efficient sliding counter approximating sliding window.

---

## Section H: AI Algorithms, NLP Parsing & System Design

#### 351. What is the Jaccard Similarity Index?
A metric used to gauge the similarity and diversity of sample sets:
$$J(A, B) = \frac{|A \cap B|}{|A \cup B|}$$
In our matching engine, we use set intersection ratios to compare student skill vectors against opportunity required skill sets.

#### 352. What is Cosine Similarity?
A metric that measures the cosine of the angle between two multi-dimensional vectors in an inner product space:
$$\text{Cosine Similarity} = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$
Used in vector search engines to compare LLM embeddings of student resumes against project descriptions.

#### 353. What is TF-IDF (Term Frequency - Inverse Document Frequency)?
A numerical statistic reflecting how important a word is to a document in a collection.
- $\text{TF}$: Frequency of term in document.
- $\text{IDF} = \log\left(\frac{N}{\text{DF}}\right)$: Penalizes ubiquitous stop words (e.g. "the", "and").

#### 354. How does Vector Search work with LLM Embeddings?
Text is passed to an embedding model (e.g. `text-embedding-3-small` or `all-MiniLM-L6-v2`) which outputs a high-dimensional vector (e.g. 1536 floats). A vector database (Pinecone, Qdrant, pgvector) uses approximate nearest neighbor (ANN) algorithms (like HNSW - Hierarchical Navigable Small World) to retrieve semantically related documents within milliseconds.

#### 355. How do you design an AI-powered system that explains its decisions?
By decomposing the scoring pipeline into transparent, deterministic sub-components (Skill overlap percentage, Department matching, Preference keyword hits) and generating structured text explanations alongside numerical scores (Explainable AI / XAI).

#### 356. How do you scale a system handling 100,000 concurrent students applying during campus placement?
1. **Frontend**: Serve static assets via Cloudflare CDN.
2. **Application Layer**: Horizontally scale Node.js container instances behind an AWS Application Load Balancer (ALB).
3. **Database**: Implement MongoDB Replica Sets with sharding on `department` or `studentId`; offload read queries to secondary nodes.
4. **Caching**: Cache `/api/opportunities` and analytics queries in Redis with 60s TTL.
5. **Asynchronous Queues**: Push resume parsing and email dispatch jobs to BullMQ workers, preventing the main API thread from experiencing event loop lag.
6. **Rate Limiting**: Apply sliding-window rate limiting on login and submission routes.

#### 357. What is Database Sharding?
Partitioning a large database horizontally across multiple physical server nodes based on a **Shard Key**, distributing storage and I/O load across a cluster.

#### 358. What is the Circuit Breaker pattern in microservices?
A design pattern used to detect failures and encapsulate the logic of preventing a failure from constantly recurring (States: `Closed` -> `Open` -> `Half-Open`). If an external service (e.g. Email SMTP server) fails repeatedly, the circuit trips `Open`, immediately returning fallbacks without wasting resources.

#### 359. What is CQRS (Command Query Responsibility Segregation)?
An architectural pattern that separates read and update operations for a data store, optimizing read models (queries) independently from write models (commands).

#### 360. What is the Twelve-Factor App methodology?
A methodology for building scalable, cloud-native web applications:
1. Codebase (one repo, multiple deploys)
2. Dependencies (explicitly declared)
3. Config (stored in environment)
4. Backing services (treated as attached resources)
5. Build, release, run
6. Processes (stateless and share-nothing)
7. Port binding (export services via port)
8. Concurrency (scale out via process model)
9. Disposability (fast startup and graceful shutdown)
10. Dev/prod parity
11. Logs (treated as event streams)
12. Admin processes (run as one-off tasks)

---
*End of Master Interview & Engineering Document.*
