```skill
---
name: crypto-research
description: Comprehensive cryptocurrency research and valuation analysis. Triggers when user asks to research, analyze, evaluate, or value a cryptocurrency/token/protocol. Covers fundamental analysis, on-chain metrics, tokenomics, competitive landscape, valuation (DCF + multiples), catalysts, and risk assessment. Includes specialized River chain-abstraction stablecoin research agent for deep-dive analysis of Omni-CDP, satUSD, cross-chain capital routing, and protocol-level economic design.
---

# Crypto Research Skill

## Workflow Checklist

Copy and track progress:

```

Crypto Research: [Bitcoin]

Phase 1 - Data Collection

- [ ] 1.1 Protocol overview & sector classification
- [ ] 1.2 On-chain metrics & usage data
- [ ] 1.3 Revenue, fees & financial data
- [ ] 1.4 Tokenomics & supply dynamics
- [ ] 1.5 Team, funding & governance

Phase 2 - Analysis

- [ ] 2.1 Value accrual mechanism analysis
- [ ] 2.2 Competitive landscape & moat
- [ ] 2.3 Narrative & catalyst identification
- [ ] 2.4 Risk assessment

Phase 3 - Valuation

- [ ] 3.1 Comparable multiples analysis
- [ ] 3.2 DCF / token flow valuation
- [ ] 3.3 Sensitivity analysis
- [ ] 3.4 Investment thesis & conclusion

```

---

## Phase 1: Data Collection

Use `WebSearch` as primary tool. Prioritize these data sources:
- **DeFiLlama**: TVL, fees, revenue, protocol comparisons
- **Token Terminal**: Revenue, P/S, P/E, active users
- **Dune Analytics**: On-chain dashboards
- **Messari / CoinGecko**: Tokenomics, market data
- **Official docs**: Whitepaper, tokenomics page, governance forum

### 1.1 Protocol Overview

**Queries:**
- `"[Bitcoin] what is [PROTOCOL] how does it work"`
- `"[Bitcoin] official documentation whitepaper"`

**Extract:**
- `sector`: L1 / L2 / DEX / Lending / Perps / Restaking / DA / Bridge / etc.
- `mechanism`: How the protocol works in 2-3 sentences
- `launch_date`: When mainnet launched
- `chain`: Which chain(s) it operates on

### 1.2 On-Chain Metrics & Usage

**Queries:**
- `"[Bitcoin] daily active users monthly active users 2024 2025"`
- `"[Bitcoin] transaction volume TVL DeFiLlama"`
- `"[Bitcoin] on-chain activity growth Dune"`

**Extract:**
| Metric | Value | 30d Trend | 90d Trend |
|--------|-------|-----------|-----------|
| DAU / MAU | | | |
| Daily Transactions | | | |
| TVL | | | |
| Volume (if DEX/Perps) | | | |
| Unique Addresses | | | |

### 1.3 Revenue & Fees

**Queries:**
- `"[Bitcoin] protocol revenue fees Token Terminal DeFiLlama"`
- `"[Bitcoin] annualized revenue 2024 2025"`

**Extract:**
| Metric | Value | YoY Growth |
|--------|-------|------------|
| Gross Fees (annualized) | | |
| Protocol Revenue (to treasury/token) | | |
| Supply-side Revenue (to LPs/validators) | | |
| Take Rate (Protocol Rev / Gross Fees) | | |

### 1.4 Tokenomics & Supply

**Queries:**
- `"[Bitcoin] tokenomics supply schedule unlock vesting"`
- `"[Bitcoin] token burn mechanism staking yield inflation"`

**Extract:**
| Metric | Value |
|--------|-------|
| Price / Market Cap / FDV | |
| Circulating Supply / Max Supply | |
| % Circulating (Circ / Max) | |
| Annual Inflation Rate | |
| Burn Mechanism | Yes/No + details |
| Staking Yield (real, net of inflation) | |
| Upcoming Unlocks (next 12 months) | |
| Treasury Holdings | |

**Key question:** What % of max supply is still locked? Large future unlocks = dilution risk.

### 1.5 Team, Funding & Governance

**Queries:**
- `"[Bitcoin] team founders background"`
- `"[Bitcoin] funding rounds investors valuation"`
- `"[Bitcoin] governance model DAO proposals"`

**Extract:**
- **Team**: Key members, track record, anon vs doxxed
- **Funding**: Total raised, key investors, last round valuation vs current FDV
- **Governance**: Token-voted / multisig / hybrid, voter participation rate
- **Investor unlock**: Are early investors still locked or already fully vested?

---

## Phase 2: Analysis

### 2.1 Value Accrual Mechanism

This is the most critical question: **How does holding the token capture protocol value?**

Classify the mechanism(s):

| Mechanism | Example | Strength |
|-----------|---------|----------|
| Fee burn (deflationary) | ETH EIP-1559 | Strong - direct value |
| Revenue share / dividends | GMX, SUSHI | Strong - cash flow |
| Vote-escrow + bribes | CRV, AERO | Medium - governance premium |
| Gas token (must hold to use) | ETH, SOL | Strong - demand-driven |
| Staking yield (real yield) | ETH staking | Strong if yield > inflation |
| Pure governance (no cash flow) | UNI (pre-fee switch) | Weak - speculative |
| Collateral / security | LINK, EIGEN | Medium - utility-driven |

**Assessment:** Rate value accrual as Strong / Medium / Weak with reasoning.

### 2.2 Competitive Landscape

**Query:** `"[Bitcoin] vs competitors comparison [SECTOR]"`

Build a comparison table:

| Protocol | TVL | Revenue | FDV | FDV/Rev | FDV/TVL | DAU | Edge |
|----------|-----|---------|-----|---------|---------|-----|------|
| [TARGET] | | | | | | | |
| Comp 1 | | | | | | | |
| Comp 2 | | | | | | | |
| Comp 3 | | | | | | | |

**Moat analysis:**
- Network effects (liquidity, users, developers)?
- Switching costs?
- Brand / Lindy effect?
- Technical differentiation?
- Ecosystem lock-in?

### 2.3 Narrative & Catalysts

**Queries:**
- `"[Bitcoin] upcoming catalysts roadmap 2025 2026"`
- `"[Bitcoin] narrative trend crypto"`

**Identify:**
- **Positive catalysts**: Product launches, partnerships, upgrades, regulatory clarity, sector rotation
- **Negative catalysts**: Token unlocks, competitor launches, regulatory action
- **Narrative fit**: Is this token aligned with current crypto narratives? (AI, RWA, DePIN, restaking, modular, etc.)
- **Timeline**: When are catalysts expected?

### 2.4 Risk Assessment

Rate each risk dimension (Low / Medium / High):

| Risk | Rating | Notes |
|------|--------|-------|
| Smart contract risk | | Audit status, age of code, hack history |
| Regulatory risk | | Token classification, jurisdiction |
| Concentration risk | | Top holders %, single point of failure |
| Competition risk | | Defensibility of market position |
| Token unlock / dilution | | Upcoming vesting schedules |
| Dependency risk | | Reliance on other protocols/chains |
| Team / key person risk | | Anon team, single founder |
| Market / liquidity risk | | Exchange listings, depth |

---

## Phase 3: Valuation

### 3.1 Comparable Multiples

Using data from Phase 1 & 2, calculate and compare:

| Multiple | [TARGET] | Sector Median | Premium/Discount |
|----------|----------|---------------|------------------|
| FDV / Annualized Rev | | | |
| FDV / Annualized Fees | | | |
| MC / TVL | | | |
| FDV / DAU | | | |
| P/E (if applicable) | | | |

**Interpretation:**
- Trading at a premium? Justify with growth rate, moat, or narrative.
- Trading at a discount? Identify if it's warranted (risk) or an opportunity.
- Use **PEG-like ratio**: (FDV/Rev) / Revenue Growth Rate. Below 1.0 = potentially undervalued.

### 3.2 DCF / Token Cash Flow Valuation

Only apply DCF when the token has **quantifiable value accrual** (fee burn, revenue share, real yield). Skip for pure governance or meme tokens.

#### Discount Rate Selection

| Sector | Base Rate | Notes |
|--------|-----------|-------|
| L1 Established (ETH, SOL) | 15-20% | Blue chip crypto |
| L1 Emerging | 25-35% | High execution risk |
| DeFi Blue Chip (UNI, AAVE) | 20-30% | Proven models |
| DeFi Emerging | 35-50% | Hack/exploit risk |
| Infrastructure / L2 | 20-30% | L1 dependency |
| New Primitives (Restaking, AI) | 30-50% | Unproven category |

**Adjustments:**
- Regulatory uncertainty: +5-10%
- Unaudited / new code: +5%
- Lindy effect (>4 years): -5%
- Strong treasury (>20% of MC): -2-5%

#### Projection Model (5 years)

| Year | Gross Fees | Growth % | Take Rate | Protocol Rev | Token Incentives | Net Value Accrual |
|------|-----------|----------|-----------|-------------|-----------------|-------------------|
| Y0 (Current) | | | | | | |
| Y1 | | | | | | |
| Y2 | | | | | | |
| Y3 | | | | | | |
| Y4 | | | | | | |
| Y5 | | | | | | |

**Growth rate guidance:**
- Conservative: 10-20% (mature protocol)
- Base: 30-50% (growing protocol)
- Aggressive: >50% (use decay: e.g., 80% → 60% → 40% → 30% → 20%)

**Terminal Value:**
- Gordon Growth: TV = Y5 Net Accrual × (1 + g) / (r - g), where g = 2-4%
- Or Exit Multiple: 15-25x Year 5 net accrual

#### Fair Value Calculation

```

Enterprise Value = PV(Net Value Accrual Y1-Y5) + PV(Terminal Value)

- Treasury Assets (stablecoins, ETH/BTC holdings)

* Outstanding Debt/Liabilities

Fair Value per Token = Enterprise Value / Fully Diluted Supply

```

### 3.3 Sensitivity Analysis

Create a 3×3 matrix with your base case in the center:

| | Growth -15% | Base Growth | Growth +15% |
|---|-------------|-------------|-------------|
| **Discount +5%** | | | |
| **Base Discount** | | | |
| **Discount -5%** | | | |

### 3.4 Investment Thesis & Conclusion

Structure the final output:

---

## [Bitcoin] Research Report

### Summary
| Metric | Value |
|--------|-------|
| Current Price | |
| Fair Value (Base) | |
| Upside/Downside | |
| Conviction | Low / Medium / High |
| Time Horizon | |

### Bull Case (probability: X%)
- Key arguments for outperformance
- Target price and multiple

### Base Case (probability: X%)
- Expected trajectory
- Fair value and implied multiple

### Bear Case (probability: X%)
- Key risks that could drive underperformance
- Downside target

### Key Metrics Dashboard
| Metric | Value | vs Peers |
|--------|-------|----------|
| FDV/Rev | | |
| Revenue Growth | | |
| Real Yield | | |
| Value Accrual | | |

### Catalysts to Watch
1. [Catalyst + expected date]
2. [Catalyst + expected date]
3. [Catalyst + expected date]

### Key Risks
1. [Risk + mitigation or monitoring signal]
2. [Risk + mitigation or monitoring signal]
3. [Risk + mitigation or monitoring signal]

---


```
