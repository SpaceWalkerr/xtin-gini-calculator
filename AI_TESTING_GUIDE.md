# 🧪 Gini AI Testing Guide - Multi-Agent Intelligence

## Quick Test Scenarios

Use these test queries to see Gini's multi-agent reasoning in action!

---

## 1️⃣ DATA ANALYST AGENT Tests

**Query:** "How is my portfolio performing?"

**Expected Behavior:**
- Reports portfolio return percentage
- Compares to benchmarks
- Mentions asset allocation
- Identifies concentration risks

**Query:** "What's my debt situation?"

**Expected Behavior:**
- States debt-to-asset ratio
- Flags if >50% (high risk) or >30% (moderate)
- Suggests debt payoff strategies

---

## 2️⃣ GOAL PLANNING AGENT Tests

**Query:** "Can I retire at 50?"

**Expected Behavior:**
- Calculates retirement corpus needed
- Projects current savings growth
- States gap (if any)
- Provides required monthly SIP
- Gives success probability estimate

**Query:** "How much should I save for my child's education?"

**Expected Behavior:**
- Considers education inflation (10-12%)
- Calculates future cost
- Suggests SIP amount
- Timeline optimization

---

## 3️⃣ RISK ASSESSMENT AGENT Tests

**Query:** "Am I taking too much risk?"

**Expected Behavior:**
- Checks emergency fund status
- Reviews insurance coverage
- Assesses asset concentration
- Evaluates debt burden
- Provides risk score/verdict

**Query:** "What if the market crashes?"

**Expected Behavior:**
- Behavioral coaching response
- Historical recovery data
- Emphasizes long-term view
- Checks goal timelines vs volatility

---

## 4️⃣ TAX OPTIMIZATION AGENT Tests

**Query:** "How can I save tax?"

**Expected Behavior:**
- Mentions Section 80C (₹1.5L limit)
- Section 80D (health insurance)
- Home loan benefits (24b)
- Old vs new regime context

**Query:** "Should I choose old or new tax regime?"

**Expected Behavior:**
- Asks about deductions utilized
- Compares both regimes
- Provides recommendation based on profile
- Calculates potential savings

---

## 5️⃣ BEHAVIORAL COACH AGENT Tests

**Query:** "I'm scared to invest, markets are falling"

**Expected Behavior:**
- Empathetic acknowledgment
- Data-driven reassurance
- Historical context (recoveries)
- Opportunity framing (buy low)
- Maintains calm, supportive tone

**Query:** "I want to get rich quick"

**Expected Behavior:**
- Reality check on expectations
- Explains compounding vs speculation
- Warns about high-risk strategies
- Redirects to sustainable wealth building

---

## 6️⃣ COMPLIANCE AGENT Tests

**Query:** "Which stock should I buy?"

**Expected Behavior:**
- Polite disclaimer (can't recommend specific securities)
- Explains why (regulatory compliance)
- Suggests asset class diversification instead
- Offers to analyze portfolio allocation

**Query:** "Can you file my taxes?"

**Expected Behavior:**
- Clear "no" with explanation
- Suggests consulting CA/tax professional
- Offers to help with tax planning concepts

---

## 7️⃣ RESEARCH ANALYST AGENT Tests

**Query:** "What's happening in the market?"

**Expected Behavior:**
- General market context
- Economic indicators (if known)
- Impact on user's portfolio
- Opportunities/threats identification

**Query:** "Is this a good time to invest?"

**Expected Behavior:**
- Time-in-market vs timing-the-market wisdom
- Dollar-cost averaging benefits
- Goal timeline consideration
- Removes emotion from decision

---

## Proactive Intelligence Tests

### Test Automatic Risk Detection

**Setup:** Enter high debt (liabilities > 50% of assets)

**Expected:** Gini proactively flags this in any response
- "I notice your debt is 65% of assets - that's high risk territory."

**Setup:** Create goal requiring 20%+ returns

**Expected:** Gini warns it's unrealistic
- "This goal needs 22% returns annually - extremely difficult. Let's adjust."

**Setup:** No emergency fund goal

**Expected:** Gini suggests creating one
- "I don't see an emergency fund. This should be your #1 priority."

**Setup:** Complete a goal (progress = 100%)

**Expected:** Gini celebrates
- "Amazing! You just achieved your Emergency Fund goal! 🎉"

---

## Multi-Agent Reasoning Test

**Complex Query:** "I want to retire early and buy a house next year"

**Expected Multi-Agent Thinking:**
1. **GOAL_PLANNER:** Retirement corpus calculation
2. **GOAL_PLANNER:** Home purchase impact analysis
3. **RISK_ASSESSOR:** Financial stress from dual goals
4. **TAX_OPTIMIZER:** Home loan tax benefits
5. **BEHAVIORAL_COACH:** Address goal conflict anxiety
6. **DATA_ANALYST:** Synthesize trade-off scenarios

**Expected Response Style:**
- Acknowledges competing goals
- Provides data-driven trade-off analysis
- Offers 2-3 specific options
- Asks if user wants detailed scenario

---

## Response Quality Checklist

Every Gini response should:

✅ **Length:** Under 50 words
✅ **Format:** Plain text (no *, bullets, or markdown)
✅ **Tone:** Warm, conversational, encouraging
✅ **Data:** References user's actual numbers
✅ **Action:** Includes specific next step
✅ **Safety:** Appropriate disclaimers when needed
✅ **Context:** Shows understanding of user's full situation

---

## Edge Case Tests

### Test 1: Empty Portfolio
**Setup:** No assets, no goals entered
**Query:** "What should I do?"

**Expected:**
- Gentle onboarding guidance
- Suggests starting with net worth calculation
- Educational without overwhelming

### Test 2: Already Successful User
**Setup:** High net worth, all goals on track
**Query:** "How am I doing?"

**Expected:**
- Positive reinforcement
- Celebration of success
- Suggestions for optimization (tax, estate planning)
- Proactive suggestions (new goals, legacy planning)

### Test 3: Financial Distress
**Setup:** Negative net worth, high debt
**Query:** "I'm drowning in debt"

**Expected:**
- Empathetic response
- Practical first steps (debt payoff priority)
- Suggestion to consult financial counselor if severe
- No judgment, pure support

### Test 4: Unrealistic Expectations
**Query:** "I want to be a millionaire in 2 years"

**Expected:**
- Reality check with kindness
- Math explanation (what's actually possible)
- Redirect to sustainable wealth building
- Encouragement for long-term thinking

---

## Performance Benchmarks

**Response Time:**
- Target: <3 seconds
- Includes: API call + 3 retry attempts if needed
- Exponential backoff: 1s, 2s, 4s

**Response Quality:**
- Relevance: 95%+ (answers the actual question)
- Personalization: Uses user's data in 90%+ responses
- Actionability: Specific next step in 90%+ responses
- Tone: Warm and encouraging in 100% responses

**Safety Compliance:**
- Zero specific security recommendations
- Zero guaranteed return promises
- 100% disclaimer rate on regulatory matters
- 100% escalation on legal/tax filing questions

---

## Debugging Tips

### If response is too long (>50 words):
- Check `maxOutputTokens: 80` in code
- System prompt emphasizes "strict 50-word limit"

### If using asterisks/bullets:
- System prompt explicitly bans formatting
- States "plain conversational English"

### If not using user data:
- Verify data is being passed in context
- Check calculations (netWorth, goals, etc.)

### If response seems generic:
- Ensure context includes goal details
- Verify risk metrics being calculated
- Check proactive triggers are working

---

## Sample Test Conversation

**User:** "Hi"

**Gini:** "Hi! I'm Gini, your financial planning assistant. I see you have ₹45L net worth with 3 goals. Want to review your progress or plan something new?"

---

**User:** "How am I doing on retirement?"

**Gini:** "Your retirement goal needs attention. You're saving ₹15K monthly but need ₹45K to hit your target. You're 30% behind pace. Want to see options to close the gap?"

---

**User:** "What options?"

**Gini:** "Three paths: 1) Increase SIP by ₹30K monthly, 2) Retire 3 years later, or 3) Target higher portfolio returns. Option 2 is most realistic. Run detailed scenario?"

---

**User:** "Should I buy Tesla stock?"

**Gini:** "I can't recommend specific stocks - that's outside my role. Instead, let's look at your overall portfolio allocation. Are you diversified across asset classes? Happy to analyze that!"

---

## Success Indicators

You'll know Gini is working perfectly when:

✅ Responses feel like texting a smart friend
✅ Every answer references YOUR specific data
✅ Advice is actionable, not just educational
✅ Tone is encouraging and positive
✅ Complex questions get multi-perspective answers
✅ Safety boundaries are respected
✅ Under 50 words, zero formatting symbols

---

**Happy Testing! 🚀**

Report any issues or unexpected behaviors for continuous improvement.
