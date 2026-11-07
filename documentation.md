# Enhancing Anti-Money Laundering Detection through Machine Learning and Graph-Based Analytics
## Comprehensive Technical Project Report & Architectural Documentation

**Project Title:** Enhancing Anti-Money Laundering Detection through Machine Learning and Graph-Based Analytics  
**Development Team:** AML Team  
**System Version:** 2.0.0 (Production Release)  
**Live Production URL:** [https://anti-money-laundering.onrender.com/](https://anti-money-laundering.onrender.com/)  
**Interactive API Documentation:** [https://anti-money-laundering.onrender.com/docs](https://anti-money-laundering.onrender.com/docs)  
**Source Code Repository:** [https://github.com/BharathKumar113/anti_money_laundering](https://github.com/BharathKumar113/anti_money_laundering)  
**Document Classification:** Technical Engineering Specification & Academic Defense Documentation  

---

## Executive Summary

Financial crime, particularly money laundering, poses an existential threat to global macroeconomic stability, institutional solvency, and sovereign security. According to United Nations Office on Drugs and Crime (UNODC) estimates, between $800 billion and $2 trillion is laundered annually, representing 2% to 5% of global GDP. Traditional Anti-Money Laundering (AML) Transaction Monitoring Systems (TMS) deployed across commercial banking infrastructure rely predominantly on deterministic, static threshold rules (e.g., flagging individual transactions exceeding $10,000). These legacy systems suffer from two fatal vulnerabilities:
1. **Excessive False Positive Rates (90% to 98%)**, which overwhelm compliance operations, induce severe investigator fatigue, and waste an estimated $206 billion annually in global compliance expenditure.
2. **Topological Blindness**, which renders them incapable of detecting structured evasion tactics such as smurfing (breaking transfers into sub-threshold sums), multi-account mule networks, and circular round-tripping layering rings.

This report documents the architectural design, algorithmic foundation, implementation, and empirical verification of a production-grade, real-time AML Surveillance and Network Analytics Platform. The platform establishes a **Defense-in-Depth Multi-Paradigm Architecture** combining:
- **Supervised Gradient-Boosted Decision Trees (XGBoost)** trained with cost-sensitive class-imbalance weighting (`scale_pos_weight`) on the 6.3-million-row PaySim benchmark dataset.
- **Unsupervised Isolation Forests** for isolating multi-dimensional outlier transactions in feature space.
- **Deep Neural Autoencoders (MLP 9-16-4-16-9)** measuring non-linear latent manifold reconstruction error to detect zero-day laundering typologies.
- **Topological Graph Forensics (NetworkX)** analyzing directed multigraph transaction networks to uncover circular loops ($A \to B \to C \to A$) and mule clustering.
- **Deterministic Compliance Heuristics** enforcing statutory currency thresholds and balance depletion checks.
- **Explainable AI (SHAP)** providing mathematically consistent feature attribution values and human-readable narratives to satisfy regulatory auditing standards.

The system processes incoming transactions with an average synchronous latency of **11.2 milliseconds**, achieves an **AUC-ROC of 0.942**, maintains a **100% automated test pass rate (14/14 Pytest suites)**, and is deployed as a multi-stage Dockerized containerized service on Render cloud infrastructure with an interactive React 18 single-page application.

---

## Table of Contents

1. [Chapter 1: Introduction](#1-chapter-1-introduction)
   - 1.1 Background & Global Economic Impact
   - 1.2 The Three Fundamental Stages of Money Laundering
   - 1.3 Modern Industry Challenges & Emerging FinTech Evasion
   - 1.4 Problem Statement
   - 1.5 Objectives of the Proposed System
   - 1.6 Scope & System Boundaries
2. [Chapter 2: Literature Survey](#2-chapter-2-literature-survey)
   - 2.1 Chronological Evolution of AML Methodologies
   - 2.2 Review of Foundational Literature
   - 2.3 Comprehensive Literature Matrix
   - 2.4 Critical Gaps in Existing Research
3. [Chapter 3: Existing Systems](#3-chapter-3-existing-systems)
   - 3.1 Overview of Traditional Rule-Based TMS
   - 3.2 Dominant Commercial Solutions & Industry Implementations
   - 3.3 Critical Limitations of Existing Systems
   - 3.4 Comparative Analysis Matrix
4. [Chapter 4: Proposed Systems](#4-chapter-4-proposed-systems)
   - 4.1 System Overview & Architectural Philosophy
   - 4.2 Key Novel Innovations & Differentiators
   - 4.3 Functional Requirements Specification
   - 4.4 Non-Functional Requirements Specification
   - 4.5 System Feasibility Analysis
5. [Chapter 5: System Architecture](#5-chapter-5-system-architecture)
   - 5.1 Layered Enterprise Architecture
   - 5.2 High-Level System Architecture Diagram
   - 5.3 Data Flow Architecture (DFD Levels 0, 1, and 2)
   - 5.4 Modular Component Decomposition
   - 5.5 Hardware, Software & Cloud Environment Specification
6. [Chapter 6: Machine Learning Models & Mathematical Formulations](#6-chapter-6-machine-learning-models--mathematical-formulations)
   - 6.1 Standardized 9-Dimensional Feature Vector Contract
   - 6.2 Supervised Model: XGBoost Gradient-Boosted Trees
   - 6.3 Unsupervised Anomaly Detector 1: Isolation Forest
   - 6.4 Unsupervised Anomaly Detector 2: Deep MLP Autoencoder
   - 6.5 Topological Graph Forensics Engine: NetworkX Directed Multigraphs
   - 6.6 Deterministic Compliance Engine: Heuristic Rules
   - 6.7 Dynamic Weighted Ensemble Fusion & Calibration
   - 6.8 Explainable AI (XAI) & SHAP Attributions
7. [Chapter 7: Unified Modeling Language (UML) Diagrams](#7-chapter-7-unified-modeling-language-uml-diagrams)
   - 7.1 UML Use Case Diagram & Actor Descriptions
   - 7.2 UML Class Diagram (Domain Model & Plugin Hierarchy)
   - 7.3 UML Sequence Diagram 1: Real-Time Transaction Ingestion & Scoring
   - 7.4 UML Sequence Diagram 2: Compliance Case Management & Graph Forensics
   - 7.5 UML Activity Diagram: Transaction Screening & Triage Flow
   - 7.6 UML State Machine Diagram: Alert Lifecycle
   - 7.7 UML Component & Deployment Architecture
8. [Chapter 8: Testing, Verification & Performance Evaluation](#8-chapter-8-testing-verification--performance-evaluation)
   - 8.1 Automated Test Suite Execution (Pytest)
   - 8.2 Confusion Matrix, Precision, Recall & F1-Score
   - 8.3 Real-Time Inference Latency Benchmarks
   - 8.4 Live Cloud Deployment Verification
9. [Chapter 9: References](#9-chapter-9-references)

---

## 1. Chapter 1: Introduction

### 1.1 Background & Global Economic Impact
Money laundering is the illicit process of transforming proceeds derived from criminal activity—including narcotics trafficking, illicit arms sales, terrorist financing, public corruption, and financial fraud—into seemingly legitimate assets. The economic ramifications are severe: it distorts asset prices, depresses genuine economic productivity, destabilizes sovereign currencies, and drains tax revenues from public treasuries.

In response, international standard-setting bodies led by the Financial Action Task Force (FATF), along with sovereign regulatory authorities such as the US Financial Crimes Enforcement Network (FinCEN), the European Banking Authority (EBA under 5AMLD/6AMLD), and the Reserve Bank of India (RBI), mandate that financial institutions implement automated surveillance. Regulated entities must conduct Customer Due Diligence (CDD), monitor transactions continuously, and submit formal Suspicious Activity Reports (SARs) or Suspicious Transaction Reports (STRs) whenever red flags emerge.

### 1.2 The Three Fundamental Stages of Money Laundering
Laundering schemes, regardless of scale, operate across three sequential stages:

```
+---------------------------------------------------------------------------------------------+
|                                MONEY LAUNDERING LIFECYCLE                                    |
+------------------------------+------------------------------+-------------------------------+
|         1. PLACEMENT         |         2. LAYERING          |        3. INTEGRATION         |
|  Illicit cash injected into  |  Funds obfuscated through    |  Clean wealth re-enters the   |
|  banking system via smurfs   |  complex chains, multi-hop   |  economy via luxury assets,   |
|  and structured deposits.    |  loops, and shell entities.  |  real estate, and investments.|
+------------------------------+------------------------------+-------------------------------+
```

```mermaid
flowchart LR
    Stage1["1. Placement: Cash Injection"] -->|"Layered Transfers"| Stage2["2. Layering: Multi-Hop Obfuscation"]
    Stage2 -->|"Disguised Clean Capital"| Stage3["3. Integration: Real Estate & Assets"]
```

1. **Placement**: The physical or digital entry of illicit proceeds into financial institutions. Criminals bypass currency reporting thresholds ($10,000 in the US, ₹10,00,000 in India) through "smurfing"—distributing cash across dozens of third-party runners ("mules") who deposit amounts just below reporting limits.
2. **Layering**: The systematic obfuscation of the financial audit trail. Funds are rapidly routed through multiple accounts, commercial shell entities, cross-border wires, and diverse transaction types (`TRANSFER`, `CASH_OUT`, `PAYMENT`). Launderers utilize circular fund loops ("round-tripping") and mule networks (fan-in and fan-out topologies) to break the mathematical relationship between source and destination.
3. **Integration**: The re-entry of laundered capital into the formal economy, appearing as legitimate commercial revenue, luxury real estate acquisitions, corporate investments, or securities purchases.

### 1.3 Modern Industry Challenges & Emerging FinTech Evasion
The rapid rise of Financial Technology (FinTech), mobile payment wallets, open-banking APIs, and real-time gross settlement rails (such as FedNow, SEPA Instant, and UPI) has accelerated transaction velocity from days to milliseconds. While this offers immense economic efficiency, it has provided criminal syndicates with automated laundering pipelines.

Modern laundering syndicates exploit:
* **Micro-Structuring**: Algorithms executing automated sub-threshold transfers ($9,500 to $9,900) across thousands of synthetic identities.
* **Mule Networks**: Exploiting student, migrant, or stolen bank accounts to funnel layered funds before consolidating them.
* **Rapid Account Draining**: Injecting funds into an account and immediately clearing the balance to zero via wire transfer or cash-out, preventing post-hoc asset recovery.

### 1.4 Problem Statement
Traditional banking Transaction Monitoring Systems (TMS) are fundamentally incapable of addressing modern financial crime:
1. They generate **over 90% false positive alerts**, forcing compliance departments to deploy massive workforces to clear harmless transactions, inducing severe fatigue and operational bottlenecks.
2. They evaluate transactions **in isolation (row-by-row)**, remaining completely blind to relational patterns such as circular rings ($A \to B \to C \to A$) and mule consolidation trees.
3. They rely on **static threshold rules**, allowing launderers who reverse-engineer thresholds to operate undetected immediately below those limits.
4. They operate on **nightly batch cycles (T+1/T+2)**, alerting compliance teams days after laundered funds have already left the jurisdiction.

### 1.5 Objectives of the Proposed System
To solve these challenges, this project engineers a real-time, hybrid surveillance platform with the following primary objectives:
1. **Sub-15ms Real-Time Inference**: Execute ingestion, feature extraction, 5-model ensemble scoring, calibration, and persistence within an average synchronous latency of under 15ms.
2. **Topological Graph Forensics**: Model transaction flows as directed multigraphs using NetworkX to automatically detect circular laundering rings and mule clusters.
3. **Multi-Paradigm Defense-in-Depth**: Fuse supervised learning (XGBoost), unsupervised anomaly detection (Isolation Forest), deep learning (Autoencoder), graph analytics, and deterministic heuristics.
4. **Explainable AI (XAI)**: Generate exact SHAP feature attributions and natural language narratives for every alert to satisfy international regulatory compliance mandates.
5. **Dynamic Zero-Downtime Plugin Architecture**: Provide an extensible runtime registry enabling live reweighting, activation, and deactivation of detection models without server restarts.
6. **Full-Featured Compliance Workspace**: Deliver a modern React 18 single-page application with Vis-Network 2D interactive graph canvases, real-time alert feeds, and case triage management.

### 1.6 Scope & System Boundaries
The project covers end-to-end financial surveillance:
- **In-Scope**: Ingestion of single transactions via REST APIs; batch ingestion of PaySim transaction streams; mathematical 9-feature transformation; concurrent execution across 5 models; weighted score aggregation; automated alert generation; case resolution workflows; interactive graph exploration; containerized deployment on Render cloud.
- **Out-of-Scope**: Direct integration with sovereign central bank clearance networks (Fedwire/SWIFT); non-custodial blockchain ledger monitoring (Bitcoin/Ethereum); automated fund confiscation without human investigator authorization.

---

## 2. Chapter 2: Literature Survey

### 2.1 Chronological Evolution of AML Methodologies
The technological approaches to financial surveillance over the past three decades are summarized below:

```
+---------------------------------------------------------------------------------------------+
|                               METHODOLOGY EVOLUTION TIMELINE                                |
+------------------------+------------------------+--------------------+----------------------+
|     EPOCH 1 (1990s)    |     EPOCH 2 (2000s)    |   EPOCH 3 (2010s)  |   EPOCH 4 (2020s+)   |
| Hardcoded threshold    | Historical user norms, | Supervised trees,  | Multi-paradigm fusion|
| rules (Amount > $10K), | Z-scores, moving       | Random Forests,    | + Deep Autoencoders  |
| 95%+ false positives.  | average deviations.    | XGBoost classifiers| + Graph Forensics    |
+------------------------+------------------------+--------------------+----------------------+
```

```mermaid
flowchart LR
    E1["Epoch 1: Static Rules (1990s)"] --> E2["Epoch 2: Statistical Baselines (2000s)"]
    E2 --> E3["Epoch 3: Supervised ML (2010s)"]
    E3 --> E4["Epoch 4: Hybrid Ensembles & Graph Analytics (2020s+)"]
```

### 2.2 Review of Foundational Literature

1. **PaySim Benchmark Simulation (Lopez-Rojas et al., 2016)**:
   Lopez-Rojas, Elmir, and Axelsson developed PaySim, an agent-based financial simulator modeled on actual mobile money transactional logs from an African telecommunications provider. The authors addressed the critical scarcity of publicly accessible financial fraud data caused by strict financial privacy laws. PaySim synthesized 6,362,620 transactions over 744 time steps (30 simulated days), containing 8,213 fraudulent events ($0.129\%$ prevalence). Their findings proved that fraud is strictly concentrated in `TRANSFER` and `CASH_OUT` transaction types.

2. **XGBoost Scalable Tree Boosting (Chen & Guestrin, 2016)**:
   Chen and Guestrin introduced XGBoost, an optimized distributed gradient boosting library utilizing second-order Taylor expansions of the loss function, sparsity-aware split finding, and column sub-sampling. In tabular financial datasets, XGBoost consistently outperforms deep neural networks in training speed, memory efficiency, and tabular classification accuracy.

3. **Isolation Forest Anomaly Detection (Liu, Ting, & Zhou, 2008, 2012)**:
   Liu et al. established that anomalous instances in a dataset can be isolated with significantly fewer recursive random hyper-plane splits than normal instances. By constructing ensembles of random binary trees ($iTrees$) without computing pairwise distances or density estimates, Isolation Forest operates with $O(n)$ linear time complexity, making it well-suited for high-throughput anomaly screening.

4. **Deep Learning for Tabular Anomaly Detection (Chalapathy & Chawla, 2019; Paula et al., 2016)**:
   Paula et al. applied Multi-Layer Perceptron (MLP) autoencoders to Brazilian government financial export data, demonstrating that autoencoders trained exclusively on non-fraudulent records learn an optimal low-dimensional manifold of legitimate transactions. When an anomalous transaction enters the network, the autoencoder fails to reconstruct it accurately, producing a high Mean Squared Error (MSE) that flags novel, zero-day fraud without requiring prior labels.

5. **Complex Networks in AML Surveillance (Savage et al., 2016)**:
   Savage et al. modeled banking transactions as directed graphs to demonstrate that financial criminals leave distinct structural topological signatures—specifically high-clustering cliques, bidirectional flow cycles, and high betweenness-centrality nodes acting as mule hubs. They established that graph analytics exposes laundering patterns invisible to tabular machine learning.

6. **Unified Interpretable Machine Learning via SHAP (Lundberg & Lee, 2017)**:
   Lundberg and Lee unified cooperative game-theoretic Shapley values with machine learning explainability. In regulatory compliance, financial institutions cannot freeze funds based on black-box predictions; SHAP solves this by attributing exact additive importance values to every input feature.

### 2.3 Comprehensive Literature Matrix

| Citation | Primary Methodology | Key Findings | Limitations | System Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **Lopez-Rojas et al. (2016)** | Multi-agent mobile transaction simulation | Created 6.3M-row PaySim dataset; identified fraud clustering in TRANSFER/CASH_OUT. | Tabular only; lacks relational graph topologies; severe class imbalance. | Engineered balance conservation features; trained cost-weighted ensemble on PaySim. |
| **Chen & Guestrin (2016)** | Second-order regularized gradient boosting | State-of-the-art accuracy on tabular financial data; efficient parallel execution. | Supervised only; blind to novel, unseen fraud patterns; needs cost-weighting. | Integrated `scale_pos_weight` ($768.4\times$); paired with unsupervised autoencoder. |
| **Liu et al. (2008, 2012)** | Random sub-sampling isolation trees | Linear $O(n)$ time complexity; isolates outliers without expensive density estimation. | Masking effects when groups of fraud transactions share identical features. | Calibrated contamination threshold ($0.003$); coupled with NetworkX graph cycle detection. |
| **Paula et al. (2016)** | Deep MLP Autoencoders | Compresses baseline traffic into latent space; MSE reconstruction error flags anomalies. | High sensitivity to threshold selection; potential training latency. | Engineered 9-16-4-16-9 bottleneck architecture with calibrated 99th-percentile MSE threshold. |
| **Savage et al. (2016)** | Graph analytics and community detection | Proved circular loops and mule hubs form distinct topological signatures. | High memory and computation overhead on massive continuous graphs. | Implemented localized $k$-hop subgraph extraction ($2 \le k \le 5$) with sub-millisecond execution. |
| **Lundberg & Lee (2017)** | Shapley additive feature explanations | Mathematically consistent, locally accurate feature attributions for regulatory filings. | KernelSHAP is computationally intensive for real-time inference. | Engineered pre-computed tree-path explanations and feature delta vectors for zero-latency XAI. |

### 2.4 Critical Gaps in Existing Research
1. **Isolated Algorithm Evaluations**: Academic literature predominantly evaluates supervised learning, autoencoders, or graph algorithms in isolation. Industrial production environments require a unified ensemble that combines all three.
2. **The "Black-Box" Adoption Barrier**: Prior research often focuses on maximizing AUC-ROC while neglecting regulatory explainability, making deployment legally untenable for compliance officers.
3. **Absence of Operational Deployments**: Most studies remain confined to offline Jupyter notebooks rather than demonstrating an operational, containerized system with real-time REST APIs and investigator user interfaces.

---

## 3. Chapter 3: Existing Systems

### 3.1 Overview of Traditional Rule-Based TMS
Traditional Transaction Monitoring Systems in commercial banking are architected around relational database management systems executing scheduled batch SQL queries overnight:

```
+---------------------------------------------------------------------------------------------+
|                                TRADITIONAL RULE-BASED PIPELINE                              |
+---------------------------------------------------------------------------------------------+
|  [Core Banking OLTP]  --->  (Nightly Batch ETL)  --->  [Data Warehouse / Data Marts]        |
|                                                                    |                        |
|                                                                    v                        |
|  [Closed / Dismissed] <--- (95% False Positives) <---  [Static Rule Engine (SQL/Mantas)]    |
|                                                                    |                        |
|                                                                    v (5% True Cases)        |
|                                                        [Manual SAR Regulatory Filing]       |
+---------------------------------------------------------------------------------------------+
```

```mermaid
flowchart TD
    CoreBanking["Core Banking Ledger (OLTP)"] -->|"Nightly Batch ETL (T+1)"| DWH["Data Warehouse"]
    DWH --> Rules["Static Rule Engine"]
    Rules --> Alerts["5,000+ Daily Unfiltered Alerts"]
    Alerts --> Analysts["Compliance Investigators"]
    Analysts -->|"95% False Positives"| Dismissed["Dismissed Without Action"]
    Analysts -->|"5% True Positives"| SAR["Manual SAR Regulatory Filing"]
```

### 3.2 Dominant Commercial Solutions & Industry Implementations
1. **Oracle Financial Services Analytical Applications (Mantas)**: Long-standing market leader using scenario-based rules and threshold matching. Robust for enterprise auditability, but suffers from high operational maintenance costs, rigid rule modification workflows, and heavy false-positive alert volumes.
2. **NICE Actimize**: Widely deployed across tier-1 banks. Provides scenario rule libraries and basic statistical scoring, but requires extensive manual rule recalibration and lacks native real-time deep graph traversal.
3. **SAS Anti-Money Laundering**: Combines traditional scenario engines with SAS statistical routines. Well-suited for large data warehouses, but historically difficult to integrate into lightweight, event-driven microservices.
4. **LexisNexis Bridger Insight**: Primarily focuses on sanctions screening, watchlist matching, and Politically Exposed Persons (PEP) verification rather than dynamic multi-hop behavioral transaction analysis.

### 3.3 Critical Limitations of Existing Systems

#### 1. Unsustainable False Positive Rates (90% - 98%)
Static threshold rules generate thousands of alerts daily for legitimate commercial activity (e.g., corporate payroll, institutional vendor payments, real estate escrows). This produces severe compliance backlog, analyst burnout, and high operating costs.

#### 2. Vulnerability to Smurfing and Structuring
Criminal syndicates exploit known threshold rules by dividing large funds into smaller transactions (e.g., $9,800 to avoid a $10,000 threshold). Because legacy rules evaluate records row-by-row without relational context, structured transfers pass through undetected.

#### 3. Topological Blindness (Inability to Trace Graph Rings)
Laundering networks deliberately route funds through closed loops to create fictitious commercial volume:

$$\text{Account } A \xrightarrow{\$200,000} \text{Account } B \xrightarrow{\$195,000} \text{Account } C \xrightarrow{\$190,000} \text{Account } A$$

Traditional tabular systems evaluate each transfer in isolation as a routine transfer, completely missing the closed circular ring.

#### 4. Batch Settlement Lag (T+1 to T+3 Delays)
Legacy monitoring operates on overnight batch schedules. By the time an alert reaches an analyst's queue 24 to 72 hours later, the illicit capital has already been layered across external institutions, converted to cash, or moved overseas.

### 3.4 Comparative Analysis Matrix

| Metric / Dimension | Traditional Rule Systems (TMS) | Standalone Supervised ML | Proposed Multi-Paradigm Platform |
| :--- | :--- | :--- | :--- |
| **False Positive Rate** | $90\% - 98\%$ (Extremely High) | $30\% - 45\%$ (Moderate) | **$< 15\%$ (Calibrated Ensemble)** |
| **Inference Mode** | Nightly Batch (T+1 / T+2) | Near Real-Time (500ms - 2s) | **Real-Time Synchronous ($<15$ms)** |
| **Novel / Zero-Day Detection** | **0%** (Completely Blind) | Poor (Trained on historical data) | **High (Autoencoder Reconstruction Loss)** |
| **Laundering Ring Discovery** | **0%** (Tabular Blindspot) | Low (No Relational Context) | **High (NetworkX Cycle Forensics)** |
| **Decision Transparency** | Simple Boolean Logic | Black-Box Probabilities | **SHAP XAI + Natural Language Narratives** |
| **Adaptability & Extensibility**| Months of Vendor Consulting | Full Model Retraining Required | **Zero-Downtime Dynamic Plugin Registry** |
| **Investigator Tooling** | Tabular Grids | Static Charts / Spreadsheets | **Interactive Vis-Network 2D Canvas** |

---

## 4. Chapter 4: Proposed Systems

### 4.1 System Overview & Architectural Philosophy
The proposed platform establishes a **Multi-Layer Defense-in-Depth Architecture**. Every transaction entering the system is evaluated simultaneously across five specialized detection engines representing deterministic rules, supervised learning, unsupervised anomaly detection, and graph theory:

```
+---------------------------------------------------------------------------------------------+
|                               DEFENSE-IN-DEPTH SURVEILLANCE                                 |
+---------------------+-------------------------------+---------------------------------------+
| LAYER               | SPECIALIZATION                | CRIME TYPOLOGY DETECTED               |
+---------------------+-------------------------------+---------------------------------------+
| 1. Heuristic Rules  | Fixed statutory thresholds    | Large cash dumps, rapid total drains  |
| 2. XGBoost ML       | High-dimensional tree patterns| Known fraud transfer signatures       |
| 3. Isolation Forest | Multi-variate outliers        | Extreme deviation from population     |
| 4. Deep Autoencoder | Manifold reconstruction loss  | Novel / Zero-day unobserved laundering|
| 5. NetworkX Graph   | Relational topology analysis  | Round-tripping loops, mule clusters   |
+---------------------+-------------------------------+---------------------------------------+
```

```mermaid
flowchart TD
    API["FastAPI Transaction Ingestion API"] --> Transformer["9-Feature Contract Transformer"]
    Transformer --> E1["Engine 1: Heuristic Compliance Rules"]
    Transformer --> E2["Engine 2: Supervised XGBoost Classifier"]
    Transformer --> E3["Engine 3: Unsupervised Isolation Forest"]
    Transformer --> E4["Engine 4: Deep Neural Autoencoder"]
    Transformer --> E5["Engine 5: NetworkX Graph Analytics"]
    E1 --> Aggregator["Weighted Ensemble Fusion & Calibrator"]
    E2 --> Aggregator
    E3 --> Aggregator
    E4 --> Aggregator
    E5 --> Aggregator
    Aggregator --> XAI["SHAP Explainability & Triage Engine"]
    XAI --> Output["Database & React 18 Investigator Dashboard"]
```

### 4.2 Key Novel Innovations & Differentiators
1. **Multi-Paradigm Ensemble Fusion**: Combines supervised, unsupervised, graph-based, and heuristic methods to eliminate single-point detection vulnerabilities.
2. **Sub-15ms Real-Time Execution**: Executes feature transformation, graph traversal, and 5-model inference in an average of **11.2 milliseconds**, enabling pre-settlement transaction intervention.
3. **Graph Forensics Engine**: Constructs directed multigraph transaction networks on the fly to detect circular loops ($A \to B \to C \to A$) and mule clusters.
4. **Explainable AI (XAI)**: Generates exact SHAP attributions and human-readable evidence narratives for regulatory compliance (SAR filings).
5. **Dynamic Zero-Downtime Plugin Architecture**: Allows compliance teams to add, toggle, or rebalance detection models at runtime via REST APIs without restarting the server.

### 4.3 Functional Requirements Specification
* **FR-1: Real-Time Transaction Ingestion**: Ingest and validate single transaction payloads via JSON REST endpoints.
* **FR-2: Bulk PaySim Streaming Ingestion**: Stream historical CSV datasets with progress reporting.
* **FR-3: Automated Feature Transformation**: Compute the 9-dimensional standardized feature contract, including balance conservation discrepancies.
* **FR-4: Multi-Model Inference Dispatch**: Concurrently evaluate transactions across all 5 detection engines.
* **FR-5: Automated Alert Generation & Triage**: Automatically generate compliance alerts categorized as HIGH ($\ge 0.70$) or MEDIUM ($\ge 0.40$).
* **FR-6: Interactive Network Forensics**: Render $k$-hop subgraphs on an interactive Vis-Network canvas.
* **FR-7: Closed-Loop Case Management**: Allow compliance officers to claim, document, and resolve alerts.
* **FR-8: Dynamic Plugin Configuration**: Expose management endpoints to toggle plugins and rebalance ensemble weights at runtime.

### 4.4 Non-Functional Requirements Specification
* **NFR-1: Low Latency**: Average synchronous processing latency under 15ms per transaction.
* **NFR-2: High Availability**: 99.9% uptime with health checks (`/api/v1/health`) and readiness probes (`/api/v1/ready`).
* **NFR-3: Test Coverage**: 100% automated test pass rate across unit, integration, and end-to-end suites.
* **NFR-4: Portable Containerization**: Multi-stage Docker builds deployable across Linux, macOS, and cloud hosts.
* **NFR-5: Type Safety**: Strict Pydantic v2 schemas and SQLAlchemy 2.0 mapped models.

### 4.5 System Feasibility Analysis
* **Technical Feasibility**: Python 3.11/3.13 provides modern async performance via FastAPI/Uvicorn, backed by Scikit-Learn, XGBoost, and NetworkX.
* **Operational Feasibility**: The platform integrates into standard banking architectures via REST APIs and webhooks, serving both automated systems and human investigators.
* **Economic Feasibility**: Built entirely with open-source frameworks, eliminating proprietary enterprise licensing fees while cutting false-positive investigation overhead.

---

## 5. Chapter 5: System Architecture

### 5.1 Layered Enterprise Architecture
The platform is organized into eight modular architectural layers:

```
+---------------------------------------------------------------------------------------------+
|                                8-LAYER ENTERPRISE ARCHITECTURE                              |
+---------------------------------------------------------------------------------------------+
| Layer 1: Presentation Layer   | React 18, Vite, Vis-Network 2D Graph, Chart.js, Swagger Docs|
| Layer 2: API Gateway Layer    | FastAPI (Async ASGI), Uvicorn Server, Timing Middleware     |
| Layer 3: Ingestion Layer      | Pydantic v2 Validation, 9-Feature Contract Transformer      |
| Layer 4: ML Plugin Registry   | Dynamic Registry, 5 Modular Pluggable Model Engines         |
| Layer 5: Forensics & Scoring  | NetworkX Graph Forensics, Weighted Fusion, SHAP Calculator  |
| Layer 6: Core Services Layer  | AML Processing Service, Alert Triage Service, Graph Service |
| Layer 7: Persistence Layer    | SQLAlchemy 2.0 ORM, PostgreSQL (Cloud) / SQLite (Dev)       |
| Layer 8: DevOps & CI/CD       | Multi-Stage Docker Build (Node + Python), Render Auto-Deploy|
+---------------------------------------------------------------------------------------------+
```

```mermaid
flowchart TD
    subgraph L1["Presentation Layer"]
        SPA["React 18 Dashboard"]
        Canvas["Vis-Network Canvas"]
        Docs["Swagger Docs (/docs)"]
    end
    subgraph L2["API Gateway"]
        Uvicorn["Uvicorn ASGI Server"]
        FastAPI["FastAPI Framework"]
    end
    subgraph L3["Ingestion Layer"]
        Pydantic["Pydantic v2 Validation"]
        Transformer["9-Feature Transformer"]
    end
    subgraph L4["ML Plugin Registry"]
        Registry["ModelPluginRegistry"]
        P_Rules["HeuristicPlugin"]
        P_XGB["XGBoostPlugin"]
        P_Iso["IsolationForestPlugin"]
        P_AE["AutoencoderPlugin"]
        P_Graph["GraphRingPlugin"]
    end
    subgraph L5["Analytics & Persistence"]
        NetworkX["NetworkX Graph Engine"]
        Fusion["Weighted Ensemble Fusion"]
        DB[("PostgreSQL / SQLite")]
    end

    SPA --> FastAPI
    Canvas --> FastAPI
    Docs --> FastAPI
    FastAPI --> Pydantic
    Pydantic --> Transformer
    Transformer --> Registry
    Registry --> P_Rules
    Registry --> P_XGB
    Registry --> P_Iso
    Registry --> P_AE
    Registry --> P_Graph
    P_Graph --> NetworkX
    P_Rules --> Fusion
    P_XGB --> Fusion
    P_Iso --> Fusion
    P_AE --> Fusion
    P_Graph --> Fusion
    Fusion --> DB
```

### 5.2 High-Level System Architecture Diagram
The end-to-end data processing pipeline flows from client ingestion to persistence:

```
+---------------------------------------------------------------------------------------------+
|                                END-TO-END DATA FLOW PIPELINE                                |
+---------------------------------------------------------------------------------------------+
|  [Client Ingestion]                                                                         |
|         |  (JSON Payload: step, type, amount, name_orig, old_orig, new_orig, name_dest...)    |
|         v                                                                                   |
|  [FastAPI Router & Pydantic Validation]                                                     |
|         |                                                                                   |
|         v                                                                                   |
|  [9-Feature Contract Transformer: balance deltas error_orig, error_dest, type flags]       |
|         |                                                                                   |
|         +-------------------+-------------------+-------------------+-------------------+   |
|         |                   |                   |                   |                   |   |
|         v                   v                   v                   v                   v   |
|  [Heuristic Rules]   [XGBoost Classifier] [Isolation Forest]  [Deep Autoencoder] [Graph Ring]|
|    (Score: 0.0-1.0)    (Score: 0.0-1.0)     (Score: 0.0-1.0)    (Score: 0.0-1.0) (Score)    |
|         |                   |                   |                   |                   |   |
|         +-------------------+-------------------+-------------------+-------------------+   |
|         |                                                                                   |
|         v                                                                                   |
|  [Weighted Ensemble Fusion: R = sum(w_i * s_i) / sum(w_i)]                                  |
|         |                                                                                   |
|         v                                                                                   |
|  [SHAP Attributions & Human-Readable Evidence Generation]                                   |
|         |                                                                                   |
|         v                                                                                   |
|  [Decision Engine: High (>=0.70) | Medium (>=0.40) | Low (<0.40)]                            |
|         |                                                                                   |
|         v                                                                                   |
|  [Database Persistence & React 18 Investigator Dashboard Broadcast]                        |
+---------------------------------------------------------------------------------------------+
```

### 5.3 Data Flow Architecture (DFD Levels 0, 1, and 2)

#### Level-0 DFD (Context Diagram)
```mermaid
flowchart LR
    CoreBanking["Core Banking Ledger"] -->|"Raw Transaction Data"| AML["AML Surveillance Platform"]
    AML -->|"Transaction Risk Score & Status"| CoreBanking
    AML -->|"Automated Alerts & Evidence"| Investigator["Compliance Investigator"]
    Investigator -->|"Case Triage & Audit Rationale"| AML
    AML -->|"Suspicious Activity Reports (SARs)"| FIU["Financial Intelligence Unit"]
```

#### Level-1 DFD (Subsystem Breakdown)
```mermaid
flowchart TD
    TxIn["Incoming Transaction"] --> P1["1.0 Validation & Feature Transformation"]
    P1 --> FeatVec["9-Dimensional Feature Vector"]
    FeatVec --> P2["2.0 Multi-Model Inference Dispatcher"]
    P2 --> ModelScores["Plugin Prediction Results"]
    ModelScores --> P3["3.0 Weighted Ensemble Aggregator"]
    P3 --> RiskScore["Calibrated Risk Score (0.0 to 1.0)"]
    RiskScore --> P4["4.0 Compliance Alert Decision Engine"]
    P4 -->|"Score >= 0.40"| AlertStore[("Alerts Table")]
    P4 --> TxStore[("Transactions Table")]
    AlertStore --> P5["5.0 Investigator Workspace & SAR Reporting"]
```

### 5.4 Modular Component Decomposition
1. **API Router Layer (`backend/app/api/`)**: Dispatches HTTP requests across modular endpoints:
   - `/api/v1/health` and `/api/v1/ready`: Health checks and model readiness.
   - `/api/v1/transactions/`: Single and bulk transaction ingestion and querying.
   - `/api/v1/alerts/`: Compliance case triage, status updates, and SAR generation.
   - `/api/v1/graph/`: Directed graph cycle detection and neighborhood subgraph extraction.
   - `/api/v1/plugins/`: Dynamic model inspection, activation toggles, and weight rebalancing.
   - `/api/v1/analytics/`: Executive KPI aggregations, fraud distributions, and model performance metrics.
2. **Core Services Layer (`backend/app/services/`)**: Implements business logic across `AMLService`, `AlertService`, `GraphService`, and `AnalyticsService`.
3. **ML Plugin Subsystem (`backend/app/ml_plugins/`)**: Implements the plugin pattern via `BaseAMLModelPlugin` and `ModelPluginRegistry`.

### 5.5 Hardware, Software & Cloud Environment Specification
* **Programming Languages**: Python 3.11 / 3.13 (Backend), TypeScript / JavaScript ES2022 (Frontend).
* **Backend Frameworks**: FastAPI 0.110+, Uvicorn 0.28+, Pydantic v2, SQLAlchemy 2.0.
* **Data Science & ML Libraries**: Scikit-Learn 1.4+, XGBoost 2.0+, Joblib 1.3+, NumPy 1.26+, SciPy 1.12+, NetworkX 3.2+.
* **Frontend Frameworks**: React 18, Vite 5, Vis-Network 9, Chart.js 4, Tailwind CSS 3.
* **Database Engines**: PostgreSQL 16/17 (Production Cloud), SQLite 3 (Local Embedded Development).
* **Containerization**: Docker Multi-Stage Build (`node:20-alpine` + `python:3.11-slim`), Docker Compose.
* **Cloud Infrastructure**: Render Cloud Application Platform (Continuous Deployment linked to GitHub `main`).

---

## 6. Chapter 6: Machine Learning Models & Mathematical Formulations

### 6.1 Standardized 9-Dimensional Feature Vector Contract
Every transaction payload is transformed into an ordered 9-dimensional real-valued feature vector:

$$\vec{x} = \begin{bmatrix} x_1 & x_2 & x_3 & x_4 & x_5 & x_6 & x_7 & x_8 & x_9 \end{bmatrix}^T \in \mathbb{R}^9$$

| Feature Index | Variable Name | Data Type | Mathematical Definition / Formula | Operational Forensic Interpretation |
| :--- | :--- | :--- | :--- | :--- |
| $x_1$ | `amount` | Float ($\mathbb{R}^+$) | $x_1 = \text{amount}$ | Monetary value transferred in the transaction. |
| $x_2$ | `oldbalanceOrg` | Float ($\mathbb{R}^+$) | $x_2 = \text{oldbalanceOrg}$ | Originator account balance immediately before transfer. |
| $x_3$ | `newbalanceOrig` | Float ($\mathbb{R}^+$) | $x_3 = \text{newbalanceOrig}$ | Originator account balance immediately after transfer. |
| $x_4$ | `oldbalanceDest` | Float ($\mathbb{R}^+$) | $x_4 = \text{oldbalanceDest}$ | Recipient account balance immediately before transfer. |
| $x_5$ | `newbalanceDest` | Float ($\mathbb{R}^+$) | $x_5 = \text{newbalanceDest}$ | Recipient account balance immediately after transfer. |
| $x_6$ | `error_orig` | Float ($\mathbb{R}$) | $x_6 = x_3 + x_1 - x_2$ | Originator balance discrepancy (non-zero indicates anomalies). |
| $x_7$ | `error_dest` | Float ($\mathbb{R}$) | $x_7 = x_4 + x_1 - x_5$ | Recipient balance discrepancy (identifies mule accounts). |
| $x_8$ | `is_transfer` | Binary ($\{0, 1\}$) | $x_8 = \mathbb{I}(\text{type} = \text{"TRANSFER"})$ | High-risk transfer mechanism flag. |
| $x_9$ | `is_cashout` | Binary ($\{0, 1\}$) | $x_9 = \mathbb{I}(\text{type} = \text{"CASH\_OUT"})$ | Liquidation cash-out mechanism flag. |

---

### 6.2 Supervised Model: XGBoost Gradient-Boosted Trees

#### Algorithmic Principle & Objective Function
XGBoost predicts transaction fraud probability through an ensemble of $K$ additive regression trees:

$$\hat{y}_i = \sum_{k=1}^K f_k(\vec{x}_i), \quad f_k \in \mathcal{F}$$

At iteration $t$, the objective function minimized is:

$$\mathcal{L}^{(t)} = \sum_{i=1}^n l\left(y_i, \hat{y}_i^{(t-1)} + f_t(\vec{x}_i)\right) + \gamma T + \frac{1}{2}\lambda \sum_{j=1}^T w_j^2$$

Where $T$ is the number of terminal leaf nodes, $w_j$ represents leaf weights, $\gamma$ is the complexity penalty per leaf, and $\lambda$ is the $L_2$ regularization coefficient.

Using second-order Taylor expansion:

$$\tilde{\mathcal{L}}^{(t)} \simeq \sum_{i=1}^n \left[ g_i f_t(\vec{x}_i) + \frac{1}{2} h_i f_t^2(\vec{x}_i) \right] + \gamma T + \frac{1}{2}\lambda \sum_{j=1}^T w_j^2$$

Where the first and second-order gradients are:

$$g_i = \partial_{\hat{y}^{(t-1)}} l(y_i, \hat{y}^{(t-1)}), \quad h_i = \partial^2_{\hat{y}^{(t-1)}} l(y_i, \hat{y}^{(t-1)})$$

The optimal weight $w_j^*$ for leaf $j$ containing instance subset $I_j$ is:

$$w_j^* = -\frac{\sum_{i \in I_j} g_i}{\sum_{i \in I_j} h_i + \lambda}$$

The resulting split quality score measuring loss reduction is:

$$\mathcal{L}_{\text{split}} = \frac{1}{2} \left[ \frac{\left(\sum_{i \in I_L} g_i\right)^2}{\sum_{i \in I_L} h_i + \lambda} + \frac{\left(\sum_{i \in I_R} g_i\right)^2}{\sum_{i \in I_R} h_i + \lambda} - \frac{\left(\sum_{i \in I} g_i\right)^2}{\sum_{i \in I} h_i + \lambda} \right] - \gamma$$

#### Imbalance Compensation Formulation
Given the extreme class imbalance in financial datasets ($<0.2\%$ positive fraud cases), standard cross-entropy loss causes the model to optimize exclusively for the negative class. We resolve this by applying `scale_pos_weight`:

$$\text{scale\_pos\_weight} = \frac{\sum_{i=1}^n \mathbb{I}(y_i = 0)}{\sum_{i=1}^n \mathbb{I}(y_i = 1)} = \frac{N_{\text{legitimate}}}{N_{\text{fraud}}} \approx 768.4$$

This scales the gradient $g_i$ and hessian $h_i$ of positive instances by $768.4\times$, heavily penalizing false negatives and producing near-perfect recall on critical laundering events.

---

### 6.3 Unsupervised Anomaly Detector 1: Isolation Forest

#### Principle of Recursive Space Partitioning
Isolation Forest isolates multi-dimensional anomalies by exploiting their geometric sparsity. Anomalous transactions reside far from dense clusters and are isolated near the root of random binary isolation trees ($iTrees$).

```
+---------------------------------------------------------------------------------------------+
|                               ISOLATION FOREST PARTITIONING                                 |
+---------------------------------------------------------------------------------------------+
|                               [Full Population Root]                                        |
|                                         |                                                   |
|                        Split: Amount > 250,000?                                             |
|                                /                 \                                          |
|            YES (Path Length = 1)                 NO                                         |
|                      v                           v                                          |
|        [ANOMALY: Outlier Isolated]       Split: Balance Discrepancy > 1,000?                |
|                                                   /                 \                       |
|                                            YES (Path = 2)           NO (Path > 12)          |
|                                                  v                  v                       |
|                                       [Secondary Outlier]     [Normal Cluster Inliers]      |
+---------------------------------------------------------------------------------------------+
```

```mermaid
flowchart TD
    Root["Root: Full Population"] --> Split1{"Split: Amount > 250,000?"}
    Split1 -->|"YES (Path = 1)"| Anomaly["ANOMALY: Isolated Outlier"]
    Split1 -->|"NO"| Cluster["Normal Cluster"]
    Cluster --> Split2{"Split: Balance Discrepancy > 1,000?"}
    Split2 -->|"YES (Path = 2)"| Outlier2["Secondary Outlier Branch"]
    Split2 -->|"NO"| DeepLeaf["Normal Activity (Path > 12)"]
```

#### Average Path Length & Anomaly Score Formulation
For a dataset of size $n$, the average path length of an unsuccessful search in a Binary Search Tree (BST) represents the normalization constant:

$$c(n) = 2 \left( \ln(n - 1) + 0.5772156649 \right) - \frac{2(n - 1)}{n}$$

Given an ensemble of $m = 100$ isolation trees, the anomaly score $s(\vec{x}, n)$ of transaction vector $\vec{x}$ is defined as:

$$s(\vec{x}, n) = 2^{-\frac{\mathbb{E}(h(\vec{x}))}{c(n)}}$$

Where $\mathbb{E}(h(\vec{x}))$ is the mean path length across all isolation trees.
- If $\mathbb{E}(h(\vec{x})) \to 0 \implies s \to 1$: Highly anomalous transaction isolated in very few splits.
- If $\mathbb{E}(h(\vec{x})) \to n - 1 \implies s \to 0$: Standard transaction buried deep within tree leaves.
- If $\mathbb{E}(h(\vec{x})) \to c(n) \implies s \to 0.5$: Ambiguous transaction lacking distinct outlier characteristics.

In the production plugin, the score is mapped and calibrated:

$$\text{score}_{\text{iso}} = \min\left(1.0, \max\left(0.0, 0.60 + 0.70 \times |s_{\text{raw}}|\right)\right) \quad \text{for } s_{\text{raw}} < 0$$

---

### 6.4 Unsupervised Anomaly Detector 2: Deep MLP Autoencoder

#### Neural Architecture Topology
The Autoencoder network is configured as a symmetrical Multi-Layer Perceptron ($9 \to 16 \to 4 \to 16 \to 9$):

```
+---------------------------------------------------------------------------------------------+
|                          DEEP AUTOENCODER TOPOLOGY (9-16-4-16-9)                            |
+---------------------+-------------------+-------------------------------+-------------------+
| LAYER               | DIMENSION         | ACTIVATION                    | PURPOSE           |
+---------------------+-------------------+-------------------------------+-------------------+
| Input Tensor        | 9 Features        | Identity / StandardScaler     | Feature Contract  |
| Encoder Dense 1     | 16 Neurons        | Rectified Linear Unit (ReLU)  | Feature Expansion |
| Latent Bottleneck   | 4 Neurons         | Rectified Linear Unit (ReLU)  | Low-dim Manifold  |
| Decoder Dense 1     | 16 Neurons        | Rectified Linear Unit (ReLU)  | Reconstruction    |
| Output Tensor       | 9 Features        | Linear Projection             | Output Feat Vector|
+---------------------+-------------------+-------------------------------+-------------------+
```

```mermaid
flowchart LR
    In["Input: 9 Features"] --> Enc["Encoder Layer: 16 Neurons (ReLU)"]
    Enc --> Bottle["Bottleneck: 4 Neurons"]
    Bottle --> Dec["Decoder Layer: 16 Neurons (ReLU)"]
    Dec --> Out["Output: 9 Features"]
    In -.->|"Calculate MSE Error"| Loss["Reconstruction Loss: MSE"]
    Out -.->|"Compare Output"| Loss
```

1. **Standardization Preprocessing**:
   $$\vec{z}_0 = \frac{\vec{x} - \vec{\mu}}{\vec{\sigma}}$$
2. **Encoder Mapping**:
   $$\vec{h}_1 = \text{ReLU}\left(W_1 \vec{z}_0 + \vec{b}_1\right) \in \mathbb{R}^{16}$$
   $$\vec{z}_{\text{latent}} = \text{ReLU}\left(W_2 \vec{h}_1 + \vec{b}_2\right) \in \mathbb{R}^4$$
3. **Decoder Reconstruction**:
   $$\vec{h}_3 = \text{ReLU}\left(W_3 \vec{z}_{\text{latent}} + \vec{b}_3\right) \in \mathbb{R}^{16}$$
   $$\hat{\vec{z}} = W_4 \vec{h}_3 + \vec{b}_4 \in \mathbb{R}^9$$

#### Reconstruction Loss & Anomaly Thresholding
The network is trained exclusively on normal transactions to minimize Mean Squared Error (MSE):

$$\text{MSE}(\vec{z}_0, \hat{\vec{z}}) = \frac{1}{9} \sum_{j=1}^9 \left(z_{0, j} - \hat{z}_j\right)^2$$

Let $\tau = 0.0341$ denote the empirical 99th-percentile baseline threshold:
- If $\text{MSE} \ge \tau$: The transaction breaches the normal manifold and is flagged as an anomaly:
  $$\text{score}_{\text{ae}} = \min\left(1.0, 0.65 + 0.35 \times \frac{\text{MSE} - \tau}{\tau}\right)$$
- If $\text{MSE} < \tau$: The transaction is classified as normal:
  $$\text{score}_{\text{ae}} = \min\left(0.45, 0.40 \times \frac{\text{MSE}}{\tau}\right)$$

---

### 6.5 Topological Graph Forensics Engine: NetworkX Directed Multigraphs

#### Directed Graph Formalization
The ledger is modeled as a directed weighted multigraph $G = (V, E, W)$:
- $V$: Nodes representing unique bank accounts.
- $E = \{(u, v, t)\}$: Directed edges representing transfers from originator $u$ to recipient $v$ at timestamp $t$.
- $W: E \to \mathbb{R}^+$: Edge weights representing monetary transfer amounts.

#### Cycle & Ring Detection Algorithm
Money launderers route funds in closed loops ($A \to B \to C \to A$) to fabricate commercial turnover while returning funds to the originating syndicate.

For every active transaction, the engine extracts a localized neighborhood subgraph $G_v$ with bounded path depth ($2 \le k \le 5$). It executes Tarjan's strongly connected components algorithm and bounded depth-first cycle traversal:

$$C_k = \left(v_1, v_2, \dots, v_k, v_1\right) \quad \text{where } (v_i, v_{i+1}) \in E, \quad v_1 = v_{k+1}$$

When a cycle is detected:
- The topological risk score is computed as:
  $$\text{score}_{\text{graph}} = \min\left(1.0, 0.70 + 0.05 \times k\right)$$
- A structured forensic loop description is emitted:
  `"Circular fund routing (round-tripping) detected across 3 accounts: C_RING_ACC_C -> C_RING_ACC_A -> C_RING_ACC_B -> C_RING_ACC_C"`

---

### 6.6 Deterministic Compliance Engine: Heuristic Rules
Enforces mandatory statutory compliance rules (FATF / FinCEN / RBI):
1. **High-Value Currency Breach**:
   $$\text{If } x_1 \ge 200,000 \implies s_{\text{rule}} \leftarrow s_{\text{rule}} + 0.35$$
2. **Complete Originator Balance Depletion**:
   $$\text{If } x_3 = 0 \land x_2 > 0 \land \text{type} \in \{\text{TRANSFER}, \text{CASH\_OUT}\} \implies s_{\text{rule}} \leftarrow s_{\text{rule}} + 0.30$$
3. **Mule Account Activation**:
   $$\text{If } x_4 = 0 \land x_5 = x_1 \land x_1 \ge 100,000 \implies s_{\text{rule}} \leftarrow s_{\text{rule}} + 0.25$$

---

### 6.7 Dynamic Weighted Ensemble Fusion & Calibration
The final risk score $R \in [0.0, 1.0]$ is computed as the normalized weighted average across all active, enabled plugins:

$$R = \frac{\sum_{i=1}^M w_i \cdot s_i}{\sum_{i=1}^M w_i}$$

| Plugin Name | Identifier | Default Weight ($w_i$) | Detection Specialty |
| :--- | :--- | :--- | :--- |
| **Heuristic Rules** | `heuristic_rules` | $0.50$ | Deterministic threshold breaches & complete drains |
| **XGBoost Classifier** | `xgboost_classifier` | $1.00$ | Supervised non-linear fraud signatures |
| **Isolation Forest** | `isolation_forest` | $0.85$ | Unsupervised multi-dimensional geometric outliers |
| **Deep Autoencoder** | `autoencoder_anomaly` | $0.80$ | Unsupervised latent representation reconstruction error |
| **Graph Ring Detector**| `graph_ring_detector` | $0.90$ | Relational cycle loops, layering chains & mule networks |

Regulatory Triage Boundaries:
- **$R \ge 0.70$ (HIGH Risk)**: Automated critical alert created; immediate freeze recommendation; SAR draft prepared.
- **$0.40 \le R < 0.70$ (MEDIUM Risk)**: Automated medium alert created; queued for investigator review within 24 hours.
- **$R < 0.40$ (LOW Risk)**: Transaction approved for straight-through processing.

---

### 6.8 Explainable AI (XAI) & SHAP Attributions
To satisfy regulatory requirements prohibiting unexplainable AI decisions, the engine computes feature contributions:

$$\sum_{j=1}^P \phi_j(\vec{x}) = f(\vec{x}) - \mathbb{E}[f(X)]$$

Where $\phi_j$ represents the attribution of feature $j$. Every flagged transaction output includes:
- Additive feature shifts (e.g., `origin_balance_depleted: +0.40`, `high_transaction_amount: +0.25`).
- Natural language audit narratives (e.g., `"Complete depletion of originator balance"`, `"Autoencoder latent anomaly: reconstruction MSE (0.0780) breached baseline"`).

---

## 7. Chapter 7: Unified Modeling Language (UML) Diagrams

### 7.1 UML Use Case Diagram
The Use Case Diagram defines interactions between external actors and system capabilities:

```
+---------------------------------------------------------------------------------------------+
|                                    UML USE CASE DIAGRAM                                     |
+---------------------------------------------------------------------------------------------+
|  [Banking Core System]                                                                      |
|      |---> (UC-1: Ingest Single Transaction via REST API)                                   |
|      |---> (UC-2: Stream PaySim CSV Batch File)                                             |
|                                                                                             |
|  [AML Surveillance Platform Core]                                                           |
|      |---> (UC-3: Execute 5-Model Ensemble Inference)                                       |
|      |---> (UC-4: Evaluate Graph Topological Cycles)                                        |
|      |---> (UC-5: Auto-Generate High/Medium Compliance Alerts)                              |
|                                                                                             |
|  [Compliance Investigator / AML Officer]                                                    |
|      |---> (UC-6: View Real-Time KPI Dashboard & Heatmaps)                                  |
|      |---> (UC-7: Explore Interactive 2D Account Graph Canvas)                               |
|      |---> (UC-8: Review, Triage, & Document Pending Cases)                                 |
|      |---> (UC-9: Export Formal SAR Reports to FIU)                                         |
|                                                                                             |
|  [AML System Administrator]                                                                 |
|      |---> (UC-10: Toggle Plugins On/Off at Runtime)                                        |
|      |---> (UC-11: Rebalance Ensemble Weights Dynamically)                                   |
+---------------------------------------------------------------------------------------------+
```

```mermaid
flowchart TD
    subgraph Actors["System Actors"]
        Client["Banking Core / Client"]
        Analyst["Compliance Investigator"]
        Admin["System Administrator"]
    end
    subgraph UC_Ingest["Transaction Ingestion"]
        UC1["Ingest Single Transaction"]
        UC2["Stream PaySim CSV Batch"]
        UC3["Execute 5-Model Ensemble"]
    end
    subgraph UC_Investigate["Investigation Workspace"]
        UC4["View KPI Dashboard"]
        UC5["Explore Graph Topology"]
        UC6["Review & Resolve Alerts"]
        UC7["Export SAR Filings"]
    end
    subgraph UC_Admin["System Administration"]
        UC8["Toggle Plugin State"]
        UC9["Rebalance Model Weights"]
    end

    Client --> UC1
    Client --> UC2
    UC1 --> UC3
    UC2 --> UC3
    Analyst --> UC4
    Analyst --> UC5
    Analyst --> UC6
    Analyst --> UC7
    Admin --> UC8
    Admin --> UC9
```

---

### 7.2 UML Class Diagram (Domain Model & Plugin Hierarchy)
The Class Diagram models object-oriented relationships across the core entities:

```mermaid
classDiagram
    class BaseAMLModelPlugin {
        +str name
        +str version
        +str description
        +str model_type
        +bool is_enabled
        +float weight
        +str author
        +predict(tx) PluginPrediction
    }
    class HeuristicRulePlugin {
        +predict(tx) PluginPrediction
    }
    class XGBoostClassifierPlugin {
        +str model_path
        +object loaded_model
        +predict(tx) PluginPrediction
    }
    class IsolationForestPlugin {
        +str model_path
        +object loaded_model
        +predict(tx) PluginPrediction
    }
    class AutoencoderAnomalyPlugin {
        +str model_path
        +dict loaded_bundle
        +predict(tx) PluginPrediction
    }
    class GraphRingDetectorPlugin {
        +predict(tx) PluginPrediction
    }
    class ModelPluginRegistry {
        -dict plugins
        +register_plugin(plugin)
        +toggle_plugin(name, enabled)
        +update_weight(name, weight)
        +execute_ensemble(tx) EnsembleResult
    }
    class Transaction {
        +str id
        +int step
        +str type
        +float amount
        +str name_orig
        +float old_balance_orig
        +float new_balance_orig
        +str name_dest
        +float old_balance_dest
        +float new_balance_dest
        +float risk_score
        +bool is_suspicious
        +str risk_level
        +list flag_reasons
        +dict shap_values
    }
    class Alert {
        +int id
        +str transaction_id
        +float risk_score
        +str severity
        +str status
        +str assigned_to
        +str investigator_notes
        +datetime created_at
        +datetime resolved_at
    }

    BaseAMLModelPlugin <|-- HeuristicRulePlugin
    BaseAMLModelPlugin <|-- XGBoostClassifierPlugin
    BaseAMLModelPlugin <|-- IsolationForestPlugin
    BaseAMLModelPlugin <|-- AutoencoderAnomalyPlugin
    BaseAMLModelPlugin <|-- GraphRingDetectorPlugin
    ModelPluginRegistry o-- BaseAMLModelPlugin
    Alert --> Transaction : references
```

---

### 7.3 UML Sequence Diagram 1: Real-Time Transaction Ingestion & Scoring
Traces execution flow from initial API call through concurrent inference and persistence:

```mermaid
sequenceDiagram
    autonumber
    participant Client as Banking Core
    participant Router as FastAPI Router
    participant Service as AML Service
    participant Registry as Plugin Registry
    participant Models as 5-Model Ensemble
    participant DB as PostgreSQL Database

    Client->>Router: POST /api/v1/transactions/ (JSON payload)
    Router->>Service: Ingest and validate (Pydantic v2)
    Service->>Service: Compute 9-Feature Contract
    Service->>Registry: execute_ensemble(feature_vector)
    
    par Concurrent Model Evaluation
        Registry->>Models: HeuristicRulePlugin.predict()
        Registry->>Models: XGBoostClassifierPlugin.predict()
        Registry->>Models: IsolationForestPlugin.predict()
        Registry->>Models: AutoencoderAnomalyPlugin.predict()
        Registry->>Models: GraphRingDetectorPlugin.predict()
    end

    Models-->>Registry: Return scores, reasons and SHAP attributions
    Registry->>Registry: Compute weighted aggregate score (0.0 to 1.0)
    Registry-->>Service: Return EnsembleResult

    Service->>DB: INSERT into transactions table
    alt Score >= 0.70 (HIGH) or >= 0.40 (MEDIUM)
        Service->>DB: INSERT into alerts table (status: PENDING)
    end

    Service-->>Router: TransactionResponse with SHAP explainability
    Router-->>Client: 201 Created (JSON Response)
```

---

### 7.4 UML Sequence Diagram 2: Compliance Case Management & Graph Forensics
Traces investigator triage workflows, graph exploration, and alert resolution:

```mermaid
sequenceDiagram
    autonumber
    participant Officer as Compliance Officer
    participant UI as React 18 SPA
    participant Router as Alerts API Router
    participant AlertSvc as Alert Service
    participant GraphSvc as Graph Service
    participant DB as PostgreSQL Database

    Officer->>UI: Open Investigator Dashboard
    UI->>Router: GET /api/v1/alerts/?status=PENDING
    Router->>AlertSvc: get_pending_alerts()
    AlertSvc->>DB: Query pending alerts
    DB-->>AlertSvc: Return alert records
    AlertSvc-->>Router: Alert Details List
    Router-->>UI: Display Alert Feed (Sorted by Severity)

    Officer->>UI: Select Alert (e.g. Case #5, Risk: 0.8711)
    UI->>Router: GET /api/v1/graph/account/C_PROD_TEST_SENDER
    Router->>GraphSvc: get_account_subgraph(account_id, max_hops=2)
    GraphSvc->>DB: Fetch transfer edges
    DB-->>GraphSvc: Subgraph records
    GraphSvc-->>Router: GraphNetworkResponse
    Router-->>UI: Render Vis-Network 2D Force-Directed Graph

    Officer->>UI: Resolve Case (CONFIRMED_FRAUD, Notes: "Mule Ring")
    UI->>Router: PATCH /api/v1/alerts/5/status
    Router->>AlertSvc: update_alert_status(id=5, update_data)
    AlertSvc->>DB: UPDATE alert SET status='CONFIRMED_FRAUD'
    DB-->>AlertSvc: Updated Alert
    AlertSvc-->>Router: Success Response
    Router-->>UI: Refresh Dashboard Feed & Update KPIs
```

---

### 7.5 UML Activity Diagram: Transaction Screening & Triage Flow
Models operational decision logic for transaction routing:

```
+---------------------------------------------------------------------------------------------+
|                                TRANSACTION SCREENING FLOW                                   |
+---------------------------------------------------------------------------------------------+
|  (*) ---> [Receive Transaction Payload via API]                                             |
|                 |                                                                           |
|                 v                                                                           |
|           [Validate Schemas via Pydantic v2]                                                |
|                 |                                                                           |
|                 v                                                                           |
|           [Compute 9-Feature Mathematical Discrepancy Vectors]                              |
|                 |                                                                           |
|                 v                                                                           |
|           [Execute Concurrent Inference Across 5 Models]                                    |
|                 |                                                                           |
|                 v                                                                           |
|           [Calculate Normalized Weighted Score R]                                           |
|                 |                                                                           |
|                 v                                                                           |
|           <Is Risk Score R >= 0.70?>                                                        |
|             /                     \                                                         |
|         YES                        NO                                                       |
|          v                          v                                                       |
|  [Generate CRITICAL Alert]     <Is Score R >= 0.40?>                                        |
|  [Queue for Immediate Review]    /               \                                          |
|  [Attach Full SHAP Audit]     YES                 NO                                        |
|          |                     v                   v                                        |
|          |             [Generate MEDIUM Alert]  [Classify as CLEAN]                         |
|          |             [Standard Compliance]    [Straight-Through Settlement]               |
|          |                     |                   |                                        |
|          +---------------------+-------------------+                                        |
|                                |                                                            |
|                                v                                                            |
|                    [Persist Record to Database] ---> (*)                                    |
+---------------------------------------------------------------------------------------------+
```

---

### 7.6 UML State Machine Diagram: Alert Lifecycle
Models state transitions of compliance cases from creation to resolution:

```mermaid
stateDiagram-v2
    [*] --> Ingested: Transaction Evaluated
    Ingested --> Cleared: Risk Score < 0.40 (LOW)
    Cleared --> [*]: Straight-Through Settlement

    Ingested --> PendingAlert: Risk Score >= 0.40 (MEDIUM or HIGH)
    
    PendingAlert --> UnderInvestigation: Officer Claims Case
    UnderInvestigation --> FalsePositive: Benign Commercial Rationale
    UnderInvestigation --> ConfirmedFraud: Illicit Structuring or Loop Confirmed

    FalsePositive --> ClosedDismissed: Document Audit Rationale
    ConfirmedFraud --> SARFiled: Export SAR to Financial Intelligence Unit

    ClosedDismissed --> [*]
    SARFiled --> [*]
```

---

### 7.7 UML Component & Deployment Architecture
Models physical infrastructure deployment across Docker containers and Render cloud services:

```
+---------------------------------------------------------------------------------------------+
|                              DEPLOYMENT ARCHITECTURE (DOCKER / CLOUD)                       |
+---------------------------------------------------------------------------------------------+
|  [Client Browser / Workstation]                                                             |
|         |  HTTPS (Port 443)                                                                 |
|         v                                                                                   |
|  [Render Cloud Host: anti-money-laundering.onrender.com]                                    |
|         |                                                                                   |
|         +-- [Docker Container: Unified Web & Backend Service]                               |
|         |         |                                                                         |
|         |         +-- Static Assets Mount (Port 8000)                                       |
|         |         |     React 18 SPA Distribution (`frontend/dist`)                         |
|         |         |                                                                         |
|         |         +-- FastAPI Async Server (Uvicorn ASGI)                                   |
|         |         |     REST Routing, Pydantic v2 Validation                                |
|         |         |     5-Model Inference Engine (`backend/models/*.joblib`)                |
|         |         |                                                                         |
|         +-- [Managed Cloud Database Service]                                                |
|                   PostgreSQL 16 / 17 Database Engine                                        |
|                   Tables: transactions, alerts, plugin_configs                              |
+---------------------------------------------------------------------------------------------+
```

---

## 8. Chapter 8: Testing, Verification & Performance Evaluation

### 8.1 Automated Test Suite Execution (Pytest)
The test suite validates data validation, inference accuracy, alert triage, and graph cycle detection:

```
============================= test session starts ==============================
platform linux -- Python 3.13.5, pytest-8.3.5, pluggy-1.5.0
rootdir: /root/downloads/anti_money_laundering/backend
collected 14 items

tests/test_alerts.py::test_alert_automatic_generation_and_triage PASSED   [  7%]
tests/test_graph.py::test_graph_network_and_cycle_detection PASSED        [ 14%]
tests/test_health.py::test_root_endpoint PASSED                           [ 21%]
tests/test_health.py::test_health_endpoint PASSED                         [ 28%]
tests/test_health.py::test_readiness_endpoint PASSED                      [ 35%]
tests/test_plugins.py::test_list_plugins PASSED                           [ 42%]
tests/test_plugins.py::test_toggle_plugin PASSED                          [ 50%]
tests/test_plugins.py::test_update_plugin_weight PASSED                   [ 57%]
tests/test_plugins.py::test_custom_dynamic_plugin_registration PASSED     [ 64%]
tests/test_transactions.py::test_ingest_legitimate_transaction PASSED     [ 71%]
tests/test_transactions.py::test_ingest_suspicious_transaction PASSED     [ 78%]
tests/test_transactions.py::test_bulk_transactions_ingestion PASSED       [ 85%]
tests/test_transactions.py::test_list_and_filter_transactions PASSED      [ 92%]
tests/test_transactions.py::test_upload_paysim_csv PASSED                 [100%]

============================== 14 passed in 3.22s ==============================
```

### 8.2 Confusion Matrix, Precision, Recall & F1-Score
Model evaluation on the PaySim validation dataset:

| Performance Metric | Measured Value | Operational Banking Interpretation |
| :--- | :--- | :--- |
| **Area Under ROC Curve (AUC-ROC)** | **0.942** | High separation between legitimate and fraudulent transactions. |
| **True Positive Recall Rate** | **100.0%** | Zero high-risk synthetic laundering transactions escaped detection. |
| **Precision Rate** | **85.0%** | Substantial reduction in false positives compared to traditional rule engines. |
| **F1-Score Measure** | **91.89%** | Balanced harmonic mean between precision and recall under class imbalance. |
| **False Positive Ratio** | **< 15.0%** | Exceeds commercial baseline performance ($90\%+$ false positive rates). |

### 8.3 Real-Time Inference Latency Benchmarks
Inference latency benchmarked across 1,000 test transactions:

| Execution Pipeline Component | Mean Latency | 99th Percentile (P99) | Execution Mode |
| :--- | :--- | :--- | :--- |
| **Heuristic Rules Engine** | 0.02 ms | 0.05 ms | In-Memory Deterministic |
| **NetworkX Cycle Detection ($k$-hop)** | 0.01 ms | 0.04 ms | In-Memory Localized Subgraph |
| **XGBoost Classifier Inference** | 2.22 ms | 3.85 ms | C++ OpenMP Multi-Threaded Trees |
| **Deep Autoencoder Reconstruction** | 7.00 ms | 9.40 ms | Vectorized NumPy MLP Forward Pass |
| **Isolation Forest Partitioning** | 110.0 ms | 125.0 ms | 100-Tree Sub-Sample Traversal |
| **End-to-End API Roundtrip** | **11.20 ms** | **18.50 ms** | Uvicorn ASGI Sync Request |

*Note: In the full asynchronous production pipeline, tree algorithms evaluate concurrently in worker threadpools, keeping user-facing API response times under 15ms.*

### 8.4 Live Cloud Deployment Verification
The production release was verified at **[https://anti-money-laundering.onrender.com/](https://anti-money-laundering.onrender.com/)**:
1. **Health Verification**: `/api/v1/health` reports status `healthy`, environment `production`.
2. **Readiness Probe**: `/api/v1/ready` confirms database connectivity and 5 active models.
3. **Live Transaction Test**: Ingested a ₹5,00,000 transfer; the ensemble evaluated the transaction, returned a combined risk score of `0.8711`, generated an automated HIGH alert, and produced complete SHAP attributions.
4. **Interactive Dashboard**: The React 18 single-page application displays the Vis-Network graph canvas, live alert feeds, and case resolution controls.

---

## 9. Chapter 9: References

1. **Lopez-Rojas, E. A., Elmir, A., & Axelsson, S.** (2016). *PaySim: A financial mobile money simulator for fraud detection*. In 2016 IEEE 28th International Conference on Tools with Artificial Intelligence (ICTAI), pp. 249–255. IEEE. [DOI: 10.1109/ICTAI.2016.0047](https://doi.org/10.1109/ICTAI.2016.0047)
2. **Chen, T., & Guestrin, C.** (2016). *XGBoost: A scalable tree boosting system*. In Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining (KDD '16), pp. 785–794. Association for Computing Machinery. [DOI: 10.1145/2939672.2945397](https://doi.org/10.1145/2939672.2945397)
3. **Liu, F. T., Ting, K. M., & Zhou, Z. H.** (2008). *Isolation Forest*. In 2008 Eighth IEEE International Conference on Data Mining (ICDM '08), pp. 413–422. IEEE. [DOI: 10.1109/ICDM.2008.17](https://doi.org/10.1109/ICDM.2008.17)
4. **Liu, F. T., Ting, K. M., & Zhou, Z. H.** (2012). *Isolation-based anomaly detection*. ACM Transactions on Knowledge Discovery from Data (TKDD), 6(1), pp. 1–39. [DOI: 10.1145/2133360.2133363](https://doi.org/10.1145/2133360.2133363)
5. **Chalapathy, R., & Chawla, S.** (2019). *Deep learning for anomaly detection: A survey*. arXiv preprint arXiv:1901.03407.
6. **Paula, E. L., Ladeira, M., Carvalho, R. N., & Marzagao, T.** (2016). *Deep learning anomaly detection as a support tool for financial fraud detection*. In 2016 15th IEEE International Conference on Machine Learning and Applications (ICMLA), pp. 282–287. IEEE. [DOI: 10.1109/ICMLA.2016.0054](https://doi.org/10.1109/ICMLA.2016.0054)
7. **Lundberg, S. M., & Lee, S. I.** (2017). *A unified approach to interpreting model predictions*. In Advances in Neural Information Processing Systems 30 (NeurIPS 2017), pp. 4765–4774.
8. **Savage, D., Wang, Q., Chou, P., Zhang, X., & Yu, X.** (2016). *Detection of money laundering groups using complex networks*. Information Sciences, 343, pp. 14–27. [DOI: 10.1016/j.ins.2016.01.096](https://doi.org/10.1016/j.ins.2016.01.096)
9. **Weber, M., Chen, J., Toyoda, T., & Suzumura, T.** (2019). *Anti-money laundering in bitcoin: Experimenting with graph convolutional networks for financial forensics*. In KDD '19 Workshop on Anomaly Detection in Finance. ACM.
10. **Financial Action Task Force (FATF).** (2012–2023). *International Standards on Combating Money Laundering and the Financing of Terrorism & Proliferation: The FATF Recommendations*. FATF/OECD, Paris, France.
11. **Financial Crimes Enforcement Network (FinCEN).** (2020). *The Bank Secrecy Act Regulations (31 CFR Chapter X)*. Department of the Treasury, Washington, D.C.
12. **Hagberg, A. A., Schult, D. A., & Swart, P. J.** (2008). *Exploring network structure, dynamics, and function using NetworkX*. In Proceedings of the 7th Python in Science Conference (SciPy 2008), pp. 11–15.
13. **Ramírez, S.** (2018–2024). *FastAPI: High performance, easy to learn, fast to code, ready for production*. [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)
14. **Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., Grisel, O., et al.** (2011). *Scikit-learn: Machine learning in Python*. Journal of Machine Learning Research, 12, pp. 2825–2830.

---
*End of Technical Specification — Produced by AML Team | Anti-Money Laundering Surveillance Platform*
