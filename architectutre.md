High-Level Architecture: Confluence → RAG QA Chatbot
User Question
     ↓
Frontend Chat UI
     ↓
Backend API (Python / Node)
     ↓
Retriever (Vector DB Search)
     ↑
Embeddings of Confluence Pages
     ↑
Ingestion Pipeline (Confluence → Chunking → Embeddings)
     ↓
LLM (Answer Generation with Context)
     ↓
Response + Source Citation

STEP 1: Confluence Data Ingestion
✅ What You Can Use from Confluence
You can safely use non-sensitive project documentation, for example:
•	Test Plans
•	Test Strategy documents
•	RTM (Requirement Traceability Matrix)
•	User Stories (functional, not confidential customer data)
•	Regression scope documents
•	Defect RCA (without PII)
•	Release notes
•	FAQ / Known Issues pages
👉 Avoid: credentials, customer data, production logs with PII
How to Extract Pages
Use Confluence REST API
You will pull:
•	Page Title
•	Page Content (HTML or storage format)
•	Labels (optional, good for filtering like UAT, Payments, Regression)
•	Last updated date (useful for freshness)
Flow:
1.	Authenticate using API token
2.	Fetch pages from selected Spaces (example: QA, TEST, BANKING_UAT)
3.	Store raw content locally as JSON
STEP 2: Preprocessing & Chunking
LLMs cannot take full pages, so you split them.
What You Do:
•	Remove HTML tags
•	Clean headers, tables into readable text
•	Split into chunks of ~300–500 words
•	Add metadata:

{
  "page_title": "Payments UAT Test Plan",
  "section": "Negative Scenarios",
  "source_url": "confluence link",
  "last_updated": "2025-01-10"
}
This metadata is VERY important for QA traceability.
🔹 STEP 3: Create Embeddings
Now convert each chunk into a vector.
You can use:
•	OpenAI Embeddings API
•	Or open-source models (like Instructor / BGE)
Each chunk → embedding → stored in vector DB.
________________________________________
🔹 STEP 4: Vector Database (Retriever Layer)
Good options:
•	FAISS (local, simple)
•	Chroma
•	MongoDB Atlas Vector Search (great if you already know MongoDB)
Stored record:
{
  embedding: [vector numbers],
  text_chunk: "...steps to validate failed payment...",
  metadata: {
     page_title: "...",
     source_url: "...",
     labels: ["Payments", "UAT"]
  }
}
STEP 5: Retrieval Flow (When User Asks a Question)
User asks:
“What are the negative test scenarios for payment timeout?”
System does:
1.	Convert question → embedding
2.	Search vector DB → top 3–5 relevant chunks
3.	Pass to LLM like this:
Prompt to LLM
Answer the question ONLY using the context below.
If the answer is not present, say you don’t know.

Context:
[Chunk 1 from Confluence]
[Chunk 2 from Confluence]
[Chunk 3 from Confluence]

Question: What are the negative test scenarios for payment timeout?
STEP 6: LLM Answer Generation
LLM (OpenAI / Azure OpenAI) generates:
✔ Answer based on Confluence
✔ Not hallucinating from internet
✔ Grounded in QA documentation
STEP 7: Add Source Citation (Very Important for QA)
Return response like:
Answer:
“The negative scenarios include session timeout during OTP, network failure before confirmation, and delayed callback from payment gateway.”
Sources:
•	Payments_UAT_TestPlan → Negative Scenarios Section
•	Defect_RCA_PaymentTimeout_v2
This builds trust + auditability.
STEP 8: Evaluation Layer (Your QA Superpower)
You don’t just build — you test the AI.
You measure:
Metric	What It Checks
Faithfulness	Is answer supported by retrieved text?
Context Relevance	Did retriever fetch correct chunks?
Answer Relevance	Did LLM actually answer the question?
Hallucination Rate	% answers not backed by source
You can use DeepEval here.

