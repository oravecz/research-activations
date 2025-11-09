# The multi-step implementation/retro cycle

Now that we have a spec and tasks list ready for implementation, we will proceed
with implementation of this spec by following this multi-phase process:

PHASE 1: Read the latest content stored in agent-os/lessons_learned.md
PHASE 2: Delegate to the /implement-tasks command
PHASE 3: Allow the user to review the final verification report
PHASE 4: The user may need to issue additional prompts before they are
satisfied with the implementation
PHASE 5: Analyze the additional prompts the user has provided and keep track
of code that didn't work and the solutions that did work
PHASE 6: After each followup prompt, ask the user if the solution is ready
for a PR
PHASE 7. Append the lessons learned from the user's prompts and the final
solution to create a concise set of rules learned from the implementation
PHASE 8. Once final verification is complete, create a PR

Follow each of these phases and their individual workflows IN SEQUENCE:

## Multi-Phase Process

### PHASE 1: Read the latest content

Read `agent-os/lessons_learned.md` to review any lessons, patterns, or solutions
from previous implementations. Treat these instructions as ABSOLUTE 
requirements.

**If the file exists:** Review its content to understand common pitfalls,
successful patterns, and coding conventions learned from past work.

**If the file does NOT exist:** Note that this is the first implementation using
this workflow, and proceed to PHASE 2.

### PHASE 2: Delegate to the /implement-tasks command

Execute the `/implement-tasks` slash command to begin the implementation cycle.

This command will:

1. Prompt for task group selection (if not already specified)
2. Delegate implementation to specialized implementer subagents
3. Run verification checks
4. Produce a final verification report

Wait for the `/implement-tasks` command to complete before proceeding to PHASE 3.

### PHASE 3: Allow the user to review the final verification report

Output the following message to the user and WAIT for their response:

```
Implementation cycle complete. Please review the final verification report at:
agent-os/specs/[this-spec]/verification/final-verification.md

Respond with:
- "continue" to proceed with creating a PR
- Additional prompts if you need changes or fixes
```

If the user responds "continue", proceed to PHASE 7.

### PHASE 4: Additional prompts

The user may provide additional prompts requesting:

- Bug fixes
- Feature adjustments
- Code refactoring
- Test improvements
- Documentation updates

For each additional prompt:

1. Implement the requested changes following relevant standards
2. Update the appropriate files in the codebase
3. Run relevant verification checks
4. After completing each prompt, proceed to PHASE 5

### PHASE 5: Understand the prompts and reasons behind the change

After implementing changes from each additional prompt, analyze and document:

1. **What didn't work:** Identify the specific issue or gap that prompted the
   change
2. **What did work:** Document the solution that resolved the issue
3. **Why it worked:** Understand the underlying reason the solution was
   effective

Keep an internal log of these findings to inform the lessons learned update in
PHASE 8.

### PHASE 6: Ask the user if the solution is ready for a PR

After each followup prompt and its implementation, output the following message
to the user and WAIT for their response:

```
Changes complete. Is this implementation ready for a PR?

Respond with:
- "yes" to proceed with PR creation
- "no" followed by additional prompts for further changes
```

If the user responds "no", return to PHASE 4 to process additional prompts.

If the user responds "yes", proceed to PHASE 7.

### PHASE 7. Update lessons learned

Analyze PHASE 4 prompts and extract actionable lessons.

Append to `agent-os/lessons_learned.md`:

**Format**:
```markdown                                                                                                                
## [Date] - [Spec Name] (#Issue)                                                                                           
                                                                                                                           
### [Brief Title]                                                                                                          
                                                                                                                           
**Failed**: [What didn't work - 1 line]                                                                                    
                                                                                                                           
**Fixed**:                                                                                                                 
- [Solution as bullets or code]                                                                                            
                                                                                                                           
**Why**: [Why it worked - 1 line]                                                                                          
                                                                                                                           
**Pattern** (optional): [Reusable pattern or checklist]                                                                    
```

Guidelines:
- Keep each lesson to 5-10 lines max
- Use Failed/Fixed/Why structure (not narrative)
- Include code only if it clarifies the solution
- Add Pattern/Checklist sections for reusable workflows
- Focus on lessons that prevent future issues

Example:
### File Organization Standards

**Failed**: Components in wrong directories

**Fixed**:
- Widgets → `src/features/*/widgets/`
- Stories → `src/stories/`

**Why**: CLAUDE.md conventions ensure consistency

Keep entries concise and actionable. Focus on lessons that will improve future
implementations.

### PHASE 8. Create a PR

Delegate to the **git-github-engineer** subagent to create a pull request.

Provide to the subagent:

- The path to this spec: `agent-os/specs/[this-spec]`
- The final verification report:
  `agent-os/specs/[this-spec]/verification/final-verification.md`

Instruct the subagent to:

1. Review all changes in the working directory
2. Create a descriptive commit message summarizing the implementation
3. Commit all changes
4. Push to a feature branch
5. Create a pull request with:
    - Title derived from the spec name
    - Description including links to spec.md and final-verification.md
    - Summary of implemented features
