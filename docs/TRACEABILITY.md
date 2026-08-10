# Traceability Matrix

Lightweight mapping from requirements to design decisions, implementation tasks, source code, and tests.

## Legend
- **Req**: Requirement number from `.kiro/specs/petops-ai-platform/requirements.md`
- **Priority**: MUST / SHOULD / COULD
- **ADR**: Architecture Decision Record in `docs/decisions/`
- **Tasks**: Implementation task IDs from `tasks.md`
- **Properties**: Correctness property numbers from `design.md`
- **Source**: Implementation file paths (TBD during implementation)
- **Tests**: Test file paths (TBD during implementation)
- **Status**: Not Started | In Progress | Done | Verified

## Matrix

| Req | Title | Priority | ADRs | Tasks | Properties | Status |
|-----|-------|----------|------|-------|------------|--------|
| R1 | Customer Request Intake | MUST | — | 5.1, 14.3 | P1 | Not Started |
| R2 | AI-Powered Extraction | MUST | ADR-004, ADR-007 | 4.1, 9.1 | P2 | Not Started |
| R3 | Deterministic Validation | MUST | ADR-007 | 5.3, 10.1 | P3, P4, P5, P6 | Not Started |
| R4 | Attention Flag Detection | MUST | ADR-007 | 6.1, 6.2 | P7, P8 | Not Started |
| R5 | Explainability | MUST | ADR-007 | 6.2, 15.2 | P8 | Not Started |
| R6 | Care Plan Generation | MUST | ADR-007 | 7.1 | P9, P10, P11 | Not Started |
| R7 | Human-in-the-Loop Review | MUST | ADR-006 | 15.1-15.3 | — | Not Started |
| R8 | Operational Record Storage | MUST | ADR-003 | 11.1 | P12, P13 | Not Started |
| R9 | Responsive Web UI | MUST | ADR-002 | 14.1-14.5, 16.3 | — | Not Started |
| R10 | Serverless AWS Architecture | MUST | ADR-001 | 2.1-2.8 | — | Not Started |
| R11 | Infrastructure as Code | MUST | ADR-005 | 2.1-2.8 | — | Not Started |
| R12 | Demo-Ready Judge Experience | MUST | ADR-006 | 14.2, 14.3, 17.1 | — | Not Started |
| R13 | Security & Cost Protection | MUST | ADR-007 | 5.1, 14.5-14.6, 2.4 | P14, P15 | Not Started |
| R14 | Graceful Failure Handling | MUST | ADR-004 | 9.1, 16.2 | P16 | Not Started |
| R15 | AI Uncertainty Indicators | SHOULD | ADR-004 | 15.1, 7.1 | P17 | Not Started |
| R16 | Care Plan History | SHOULD | ADR-003 | 16.1 | — | Not Started |
| R17 | Observability | SHOULD | ADR-001 | 2.7 | P16 | Not Started |
| R18 | Multi-Pet Extraction | COULD | — | (post-MVP) | — | Deferred |

## Notes
- Matrix updated as implementation progresses
- Source/test paths filled in during implementation
- "Verified" = tests pass AND acceptance criteria confirmed against live system
- Properties (P1-P17) are defined in design.md and tested via fast-check
