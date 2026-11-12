# 标签页多账号

只有 `MULTI_ACCOUNT_TABS=1` 才按标签页解析登录。缺省仍使用原来的 `yyds_session`。增量 SQL 在 `prisma/migrations-manual/20261012-tab-accounts.sql`，只建新表。
