# Parallel Documentation Rule

## Core Directive

**ALWAYS maintain parallel documentation during development sessions**

This rule ensures that architectural decisions, challenges, and implementation lessons are captured in real-time for future article development and knowledge preservation.

## Required Documentation Actions

### 1. Session Start Protocol

Before beginning any development work:

- [ ] Check `docs/development-journey.md` for previous session context
- [ ] Review any open investigation items in `docs/study-session-investigation.md`
- [ ] Note current focus area in journey documentation

### 2. During Development

For every significant technical decision:

- [ ] Document the decision using the template in `development-journey.md`
- [ ] Capture the problem context and options considered
- [ ] Record the rationale and trade-offs accepted

For every technical challenge encountered:

- [ ] Use the challenge template to document the problem
- [ ] Update investigation items with findings
- [ ] Note any research areas that emerge

For every implementation lesson learned:

- [ ] Record what was tried and what happened
- [ ] Identify the root cause and solution
- [ ] Extract generalizable principles

### 3. Investigation Updates

When completing research or investigation:

- [ ] Update the appropriate section in `study-session-investigation.md`
- [ ] Fill in the "Space for Investigation Results" sections
- [ ] Move items from "Requires Investigation" to "Completed"
- [ ] Update risk assessments based on findings

### 4. Session End Protocol

At the end of each development session:

- [ ] Update the development journey with session summary
- [ ] Note any new questions or challenges that emerged
- [ ] Set context for next session priorities
- [ ] Flag any decisions that need future review

## Documentation Quality Standards

### Decision Documentation Must Include:

- **Context**: What situation required a decision
- **Options**: At least 2-3 alternatives considered
- **Rationale**: Why this option was chosen
- **Trade-offs**: What was sacrificed for this choice
- **Implementation Notes**: How the decision affects code

### Challenge Documentation Must Include:

- **Problem Description**: Clear statement of the issue
- **Root Cause Analysis**: Why this challenge exists
- **Solution Exploration**: Multiple approaches considered
- **Results**: What actually happened when implemented
- **Lessons Learned**: Generalizable insights

### Implementation Lesson Documentation Must Include:

- **What We Tried**: Specific approach taken
- **What Happened**: Actual results vs. expected
- **Root Cause**: Technical or architectural reason
- **Generalization**: Broader principle that applies elsewhere

## Integration with Development Workflow

### Before Making Architectural Changes:

1. Check if similar decisions are documented
2. Review previous lessons learned
3. Document the new decision using templates

### Before Implementing Complex Features:

1. Check investigation documents for relevant research
2. Update risk assessments based on current understanding
3. Note any new investigation needs

### After Completing Features:

1. Document implementation lessons
2. Update success metrics
3. Note any technical debt created

## Article Development Integration

### Continuously Capture:

- **Decision-making processes**: How choices were made
- **Technical challenges**: Problems and solutions
- **Algorithm selections**: Why certain approaches were chosen
- **Implementation patterns**: Reusable architectural solutions

### Regular Review:

- **Weekly**: Review documentation for article themes
- **Monthly**: Identify key technical deep-dive opportunities
- **Per Feature**: Extract code samples and technical insights

## Enforcement Guidelines

### Required vs. Optional Documentation:

**Required** (will block development progress):

- Major architectural decisions
- Significant technical challenges
- Implementation failures and lessons

**Optional** (improve documentation quality):

- Minor bug fixes
- Style adjustments
- Routine maintenance

### Documentation Triggers:

Document when you:

- Choose between multiple technical approaches
- Encounter unexpected behavior or complexity
- Change existing architecture or patterns
- Learn something that would benefit future development
- Make decisions that create technical debt

### Quality Enforcement:

- Documentation must be updated before marking todos complete
- Investigation results must be filled in before implementing solutions
- Decision rationales must be specific, not generic

## Templates Location

- **Decision Template**: `docs/development-journey.md`
- **Challenge Template**: `docs/development-journey.md`
- **Investigation Template**: `docs/study-session-investigation.md`
- **Implementation Lesson Template**: `docs/development-journey.md`

---

**Note**: This rule works in conjunction with progress tracking. Documentation updates should happen during development, not as a separate batch process.
