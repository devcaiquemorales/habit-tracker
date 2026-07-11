# MIGRATION-RUNBOOK.md — Schema v2 (clean slate)

**Versão:** 2026-07-09
**Projeto:** wlryrbdcmtsykgswwhjp
**Estratégia:** Destrutiva — dropa todos os dados do app e recria o schema v2 do zero. Mantém `auth.users` (login). O script é re-executável.

**AVISO 1:** Todos os dados de hábitos/logs/perfil serão **apagados**. Autorizado — não há backup.
**AVISO 2:** Este runbook usa o **Supabase Dashboard SQL Editor**. Não há supabase CLI nem service-role key no repositório.

---

## 1. Aplicar a migração

1. Acesse [https://supabase.com/dashboard/project/wlryrbdcmtsykgswwhjp](https://supabase.com/dashboard/project/wlryrbdcmtsykgswwhjp)
2. **SQL Editor** → nova query.
3. Abra `supabase/migrations/20260709000000_schema_v2.sql` no repositório, copie **todo** o conteúdo, cole no editor.
4. **Run**.

**Esperado:** sucesso sem erros. O script é `begin/commit` — qualquer falha faz rollback e nada é alterado. Como usa `drop ... if exists`, pode ser rodado de novo sem problema.

> Se quiser zerar até o login (conta nova): Dashboard → **Authentication** → Users → delete o usuário. O trigger `on_auth_user_created` recria o profile quando você se cadastrar de novo.

---

## 2. Verificação

No **SQL Editor**:

```sql
-- Tabelas v2 existem e estão vazias (exceto profiles, com 1 linha por usuário existente)
select
  (select count(*) from profiles)                as profiles,
  (select count(*) from habits)                  as habits,
  (select count(*) from habit_logs)              as habit_logs,
  (select count(*) from push_subscriptions)      as push_subs,
  (select count(*) from notification_preferences) as prefs;

-- Enums criados
select typname from pg_type
where typname in ('schedule_type', 'color_variant') order by typname;

-- Profile do usuário com timezone
select id, timezone, locale from profiles;
```

**Esperado:** `profiles` = nº de usuários em `auth.users` (timezone `America/Sao_Paulo`, locale `pt`); demais contagens = 0; 2 enums listados.

---

## 3. Regenerar TypeScript types (confirmação de paridade)

`database.types.ts` foi escrito à mão pro schema v2. Regenerar confirma que bate com o banco real.

```bash
bunx supabase login          # primeira vez apenas
bun supabase:types
```

**Esperado:** nenhuma mudança em `src/infrastructure/supabase/database.types.ts` (ou só cosmética). Diff grande = revisar a migração.

Depois disso o app já roda contra o banco novo (`bun dev`).

---

## 4. Push notifications

### 4a. Secrets (Dashboard → Edge Functions → Secrets → New secret)

| Nome | Valor |
|------|-------|
| `VAPID_PUBLIC_KEY`  | valor de `NEXT_PUBLIC_VAPID_PUBLIC_KEY` em `.env.local` |
| `VAPID_PRIVATE_KEY` | valor de `VAPID_PRIVATE_KEY` em `.env.local` |
| `VAPID_SUBJECT`     | `mailto:developer.caiquemorales@gmail.com` |

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` já são injetados automaticamente nas Edge Functions.

### 4b. Deploy da função

```bash
bunx supabase functions deploy send-reminders --project-ref wlryrbdcmtsykgswwhjp
```

### 4c. Habilitar extensões (Dashboard → Database → Extensions)

Instale `pg_cron` e `pg_net`.

### 4d. Service-role key no Vault (SQL Editor)

```sql
-- <REAL-SERVICE-ROLE-KEY> = Dashboard → Settings → API Keys → service_role
select vault.create_secret('<REAL-SERVICE-ROLE-KEY>', 'service_role_key');
```

Cole a chave real **apenas** no SQL Editor, nunca em arquivo versionado.

### 4e. Agendar cron a cada 15 min (SQL Editor)

```sql
select cron.schedule(
  'send-reminders-every-15min',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://wlryrbdcmtsykgswwhjp.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
```

### 4f. Verificar cron

```sql
select jobid, jobname, schedule from cron.job;
```

**Esperado:** linha `send-reminders-every-15min`, schedule `*/15 * * * *`.

---

## 5. Testar notificação ponta-a-ponta

1. `bun dev` (ou app publicado). No **celular**: se iOS, instale como PWA (Compartilhar → Adicionar à Tela de Início; iOS ≥16.4).
2. `/settings` → ativar **Lembretes** → aceitar permissão do navegador.
3. Adicionar um horário ~2 slots à frente (ex.: agora 14:07 → adicione 14:30).
4. Marcar 1 hábito como feito, deixar ≥1 pendente.
5. No slot, o cron dispara. Chega push: *"1 de 2 hábitos feitos — faltam: X"*. Se tudo feito → nada é enviado (por design).

Teste manual da função (sem esperar o cron):

```bash
curl -X POST 'https://wlryrbdcmtsykgswwhjp.supabase.co/functions/v1/send-reminders' \
  -H "Authorization: Bearer <SERVICE-ROLE-KEY>" \
  -H "Content-Type: application/json" -d '{}'
# → { checked, matched, sent, cleaned }
```

---

## Checklist

- [ ] 1. Migração aplicada (sem erro)
- [ ] 2. Verificação OK (enums, timezone, tabelas vazias)
- [ ] 3. `bun supabase:types` sem diff significativo; `bun dev` roda
- [ ] 4a–4f. Push: secrets, deploy, extensões, vault, cron agendado
- [ ] 5. Notificação recebida no celular
