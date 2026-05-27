# ADR 001: Isolamento multi-tenant por organização

## Status

Aceito

## Contexto

A plataforma TripSync atende múltiplas agências (tenants). Reservas, membros e trilhas de auditoria devem permanecer estritamente isolados entre organizações. O portfólio usa SQLite em demo e PostgreSQL em produção.

## Decisão

1. **Chave de tenant**: Toda entidade de negócio (`Booking`, `AuditLog`, `OrganizationMember`) possui `organizationId` obrigatório com FK e `onDelete: Cascade`.
2. **Contexto de sessão**: Após autenticação, o `organizationId` ativo é derivado da membership do usuário (primeira org ou única org no seed). O JWT/session do NextAuth carrega `organizationId` e `role`.
3. **Queries obrigatórias**: Toda operação de leitura/escrita em bookings inclui `where: { organizationId }` obtido do contexto autenticado — nunca de parâmetros do cliente sem validação.
4. **RBAC**: `OWNER` e `OPERATOR` podem criar/alterar reservas; `VIEWER` somente leitura; apenas `OWNER` acessa placeholders de equipe/configurações sensíveis (futuro).
5. **Referências únicas por tenant**: `@@unique([organizationId, reference])` evita colisão de `BK-*` entre tenants.
6. **Auditoria**: Cada mutação relevante grava `AuditLog` com `organizationId` do contexto.

## Consequências

- Impossível listar reservas de outro tenant sem comprometer sessão ou bypass deliberado no código.
- Migração para API externa (`trip-sync-api`) exige repassar `X-Organization-Id` ou token com scope de org — fora do escopo deste ADR.
- Testes de integração devem assertar que IDs de outro tenant retornam 404/not found.

## Alternativas consideradas

- **Row-Level Security (PostgreSQL)**: Rejeitado para demo SQLite; recomendado em produção como camada extra.
- **Schema por tenant**: Rejeitado por complexidade operacional para portfólio.
