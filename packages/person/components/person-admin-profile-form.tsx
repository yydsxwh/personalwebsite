"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  DEFAULT_PERSON_PROFILE,
  PERSON_ABOUT_MAX,
  PERSON_HEADLINE_MAX,
  PERSON_NAME_MAX,
  type PersonExtraContact,
  type PersonProfilePayload,
} from "@andyyyds/person/lib/person-site";
import {
  fetchPersonAdminProfile,
  savePersonAdminProfile,
} from "@andyyyds/person/lib/person-site-client";
import { PersonImageField } from "@andyyyds/person/components/person-image-field";

type PersonProfileTextKey = {
  [K in keyof PersonProfilePayload]: PersonProfilePayload[K] extends string ? K : never;
}[keyof PersonProfilePayload];

const CONTACT_FIELDS: { key: PersonProfileTextKey; label: string; saveLabel: string }[] = [
  { key: "email", label: "邮箱", saveLabel: "保存邮箱" },
  { key: "phone", label: "电话", saveLabel: "保存电话" },
  { key: "wechat", label: "微信", saveLabel: "保存微信" },
  { key: "qq", label: "QQ", saveLabel: "保存 QQ" },
  { key: "location", label: "地点", saveLabel: "保存地点" },
  { key: "github", label: "GitHub", saveLabel: "保存 GitHub" },
  { key: "linkedin", label: "LinkedIn", saveLabel: "保存 LinkedIn" },
  { key: "zhihu", label: "知乎", saveLabel: "保存知乎" },
  { key: "weibo", label: "微博", saveLabel: "保存微博" },
];

function FieldSaveRow({
  label,
  hint,
  saving,
  saved,
  onSave,
  saveLabel = "保存",
  children,
}: {
  label: string;
  hint?: string;
  saving?: boolean;
  saved?: boolean;
  onSave: () => void;
  saveLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="block text-xs text-[var(--muted)]">
      {label}
      {hint ? <span className="ml-2 text-[11px] opacity-70">{hint}</span> : null}
      <div className="mt-1 flex items-start gap-2">
        <div className="min-w-0 flex-1">{children}</div>
        <button
          type="button"
          className="btn btn-secondary min-h-11 shrink-0 px-3 text-sm"
          disabled={saving}
          onClick={onSave}
        >
          {saving ? "保存中" : saveLabel}
        </button>
        <span
          className={`min-h-11 shrink-0 self-start pt-3 text-xs ${
            saved ? "text-[var(--brand-strong)]" : "invisible"
          }`}
        >
          已保存
        </span>
      </div>
    </div>
  );
}

export function PersonAdminProfileForm() {
  const [profile, setProfile] = useState<PersonProfilePayload>(DEFAULT_PERSON_PROFILE);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState("");
  const [savedKey, setSavedKey] = useState("");

  useEffect(() => {
    void fetchPersonAdminProfile()
      .then((next) => {
        setProfile(next);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "加载失败");
        setLoading(false);
      });
  }, []);

  const setField = (key: PersonProfileTextKey, value: string) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const setExtra = (index: number, next: PersonExtraContact) => {
    setProfile((current) => {
      const extraContacts = current.extraContacts.slice();
      extraContacts[index] = next;
      return { ...current, extraContacts };
    });
  };

  const persist = async (
    patch: Partial<PersonProfilePayload>,
    key: string,
    message: string,
  ) => {
    setError("");
    setSavingKey(key);
    setStatus("保存中…");
    try {
      await savePersonAdminProfile(patch);
      setProfile((current) => ({ ...current, ...patch }));
      setSavedKey(key);
      setStatus(message);
    } catch (err) {
      setStatus("");
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSavingKey("");
    }
  };

  const saveText = (key: PersonProfileTextKey, message: string, saveKey = key) =>
    persist({ [key]: profile[key] }, saveKey, message);

  if (loading) return <p className="text-sm text-[var(--muted)]">加载档案…</p>;

  return (
    <div className="grid gap-4">
      <p className="text-sm text-[var(--muted)]">
        每一项单独保存，改完点右边按钮即可。头像和封面选好图片会马上保存，不用再点一次。
      </p>
      <p className="min-h-5 text-sm text-[var(--fire)]">{error || "\u00a0"}</p>
      <p className="min-h-5 text-sm text-[var(--brand-strong)]">{status || "\u00a0"}</p>
      <FieldSaveRow
        label="姓名 / 对外称呼"
        saving={savingKey === "displayName"}
        saved={savedKey === "displayName"}
        saveLabel="保存姓名"
        onSave={() => void saveText("displayName", "姓名已保存")}
      >
        <input
          className="field min-h-11 w-full rounded-xl px-3 text-sm"
          maxLength={PERSON_NAME_MAX}
          value={profile.displayName}
          onChange={(e) => setField("displayName", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void saveText("displayName", "姓名已保存");
            }
          }}
        />
      </FieldSaveRow>
      <FieldSaveRow
        label="个性签名"
        hint="一句话介绍"
        saving={savingKey === "headline"}
        saved={savedKey === "headline"}
        saveLabel="保存签名"
        onSave={() => void saveText("headline", "个性签名已保存")}
      >
        <input
          className="field min-h-11 w-full rounded-xl px-3 text-sm"
          maxLength={PERSON_HEADLINE_MAX}
          value={profile.headline}
          onChange={(e) => setField("headline", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void saveText("headline", "个性签名已保存");
            }
          }}
        />
      </FieldSaveRow>
      <FieldSaveRow
        label="About me"
        saving={savingKey === "about"}
        saved={savedKey === "about"}
        saveLabel="保存介绍"
        onSave={() => void saveText("about", "介绍已保存")}
      >
        <textarea
          className="field min-h-40 w-full rounded-xl px-3 py-3 text-sm"
          maxLength={PERSON_ABOUT_MAX}
          value={profile.about}
          onChange={(e) => setField("about", e.target.value)}
        />
      </FieldSaveRow>
      <div className="grid gap-3 sm:grid-cols-2">
        <PersonImageField
          label="头像"
          value={profile.avatarUrl}
          saveLabel="保存头像"
          saving={savingKey === "avatarUrl"}
          saved={savedKey === "avatarUrl"}
          onChange={(url) => setField("avatarUrl", url)}
          onSave={() => void saveText("avatarUrl", "头像已保存")}
          onUploaded={(url) => persist({ avatarUrl: url }, "avatarUrl", "头像已保存")}
        />
        <PersonImageField
          label="封面"
          value={profile.coverUrl}
          saveLabel="保存封面"
          saving={savingKey === "coverUrl"}
          saved={savedKey === "coverUrl"}
          onChange={(url) => setField("coverUrl", url)}
          onSave={() => void saveText("coverUrl", "封面已保存")}
          onUploaded={(url) => persist({ coverUrl: url }, "coverUrl", "封面已保存")}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {CONTACT_FIELDS.map((field) => (
          <div key={field.key} className="block text-xs text-[var(--muted)]">
            <FieldSaveRow
              label={field.label}
              saving={savingKey === field.key}
              saved={savedKey === field.key}
              saveLabel={field.saveLabel}
              onSave={() => void saveText(field.key, `${field.label}已保存`)}
            >
              <input
                className="field min-h-11 w-full rounded-xl px-3 text-sm"
                value={String(profile[field.key] || "")}
                onChange={(e) => setField(field.key, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void saveText(field.key, `${field.label}已保存`);
                  }
                }}
              />
            </FieldSaveRow>
            {field.key === "github" ? (
              <button
                type="button"
                className="btn btn-secondary mt-2 min-h-11 px-3 text-sm"
                disabled={savingKey === "showGithub"}
                onClick={() => {
                  const next = profile.showGithub === false;
                  void persist(
                    { showGithub: next },
                    "showGithub",
                    next ? "前台已显示 GitHub" : "前台已关闭 GitHub",
                  );
                }}
              >
                {savingKey === "showGithub"
                  ? "保存中"
                  : profile.showGithub === false
                    ? "前台已关闭，点击开启"
                    : "前台显示中，点击关闭"}
              </button>
            ) : null}
          </div>
        ))}
      </div>
      <p className="text-sm text-[var(--muted)]">
        这里就是个人网站，前台不再单独放「网站」按钮。GitHub 可改账号，也可关掉不在前台显示。
        B站 / 抖音 / 小红书 / 视频号主页请到「自媒体同步」填写，避免两处各写一份。
      </p>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-[var(--muted)]">额外联系方式</p>
          <button
            type="button"
            className="btn btn-secondary min-h-11 shrink-0 px-3 text-sm"
            disabled={savingKey === "extraContacts"}
            onClick={() =>
              void persist({ extraContacts: profile.extraContacts }, "extraContacts", "额外联系方式已保存")
            }
          >
            {savingKey === "extraContacts" ? "保存中" : "保存联系方式"}
          </button>
          {savedKey === "extraContacts" ? (
            <span className="text-xs text-[var(--brand-strong)]">已保存</span>
          ) : null}
        </div>
        <div className="mt-2 grid gap-2">
          {profile.extraContacts.map((item, index) => (
            <div key={`${item.label}-${index}`} className="grid gap-2 sm:grid-cols-3">
              <input
                className="field min-h-11 rounded-xl px-3 text-sm"
                placeholder="名称"
                value={item.label}
                onChange={(e) => setExtra(index, { ...item, label: e.target.value })}
              />
              <input
                className="field min-h-11 rounded-xl px-3 text-sm"
                placeholder="内容"
                value={item.value}
                onChange={(e) => setExtra(index, { ...item, value: e.target.value })}
              />
              <input
                className="field min-h-11 rounded-xl px-3 text-sm"
                placeholder="链接（可选）"
                value={item.href}
                onChange={(e) => setExtra(index, { ...item, href: e.target.value })}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-secondary mt-2 min-h-11 px-3 text-sm"
          onClick={() =>
            setProfile((current) => ({
              ...current,
              extraContacts: [...current.extraContacts, { label: "", value: "", href: "" }],
            }))
          }
        >
          加一种联系方式
        </button>
      </div>
    </div>
  );
}
