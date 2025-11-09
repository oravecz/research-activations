---
name: Global Error Handling
description: Implement robust error handling with user-friendly messages, fail-fast validation, specific exception types, centralized error boundaries, graceful degradation, retry strategies, and proper resource cleanup. Use this skill when writing try-catch blocks, throwing exceptions, handling errors in API endpoints or controllers, validating user input, implementing error boundaries, managing external service failures, cleaning up resources (file handles, database connections, network sockets), or implementing retry logic. This includes working with exception handling in any language (try/catch/finally, Result types, error returns), error middleware, global error handlers, validation logic, or resource management patterns. Apply when validating input early, failing fast with clear errors, using specific exception types, handling errors at appropriate boundaries, implementing graceful degradation for non-critical failures, adding exponential backoff for transient errors, ensuring resource cleanup in finally blocks, or providing user-friendly error messages without exposing technical details. This skill applies universally across all programming languages and application layers.
---

# Global Error Handling

## When to use this skill

- When writing try-catch blocks or exception handling code
- When throwing or raising exceptions or errors
- When handling errors in API endpoints, controllers, or service layers
- When validating user input or checking preconditions
- When implementing error boundaries or error middleware
- When managing failures from external services or APIs
- When implementing retry logic with exponential backoff
- When cleaning up resources (file handles, database connections, network sockets)
- When using finally blocks or equivalent cleanup mechanisms
- When providing user-friendly error messages to end users
- When using specific exception types instead of generic errors
- When implementing graceful degradation for non-critical failures
- When handling transient vs permanent failures differently
- When centralizing error handling at application boundaries
- When logging errors for debugging without exposing details to users
- When designing fail-fast validation strategies

This skill applies to all code that handles errors or exceptions regardless of language or framework.

This Skill provides Claude Code with specific guidance on how to adhere to coding standards as they relate to how it should handle global error handling.

## Instructions

For details, refer to the information provided in this file:
[global error handling](../../../agent-os/standards/global/error-handling.md)
