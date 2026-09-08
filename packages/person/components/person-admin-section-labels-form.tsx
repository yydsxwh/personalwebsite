"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DEFAULT_PERSON_PROFILE,
  DEFAULT_SECTION_LABELS,
  PERSON_ADMIN_NAV_KEYS,
  PERSON_ENTRY_KINDS,
  PERSON_HOME_TITLE_KEYS,
  PERSON_LABEL_MAX,
  PERSON_PUBLIC_NAV_KEYS,
  type PersonAdminNavKey,
  type PersonHomeTitleKey,
  type PersonProfilePayload,
  type PersonPublicNavKey,
  type PersonSectionLabels,
} from "@andyyyds/person/lib/person-site";
import {
  fetchPersonAdminProfile,
  savePersonAdminProfile,
} from "@andyyyds/person/lib/person-site-client";

const ADMIN_HINT: Record<PersonAdminNavKey, string> = {
  overview: "后台总览",
  profile: "档案页",
  sections: "本页",
  social: "自媒体同步",
};

const NAV_HINT: Record<PersonPublicNavKey, string> = {
  about: "前台顶栏",
  resume: "前台顶栏",
  intro: "前台顶栏",
  projects: "前台顶栏",
  blog: "前台顶栏",
  portfolio: "前台顶栏",
  honors: "前台顶栏",
  life: "前台顶栏",
  photos: "前台顶栏",
};

const HOME_HINT: Record<PersonHomeTitleKey, string> = {
  aboutMe: "首页区块",
  featured: "首页区块",
  contact: "首页区块",
  social: "首页区块",
  honorsGroup: "成绩 + 荣誉合并标题",
  lifeGroup: "实践 + 活动合并标题",
};

function LabelField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs text-[var(--muted)]">
      {label}
      {hint ? <span className="ml-2 text-[11px] opacity-70">{hint}</span> : null}
      <input
        className="field mt-1 min-h-11 w-full rounded-xl px-3 text-sm text-[var(--ink)]"
        value={value}
        maxLength={PERSON_LABEL_MAX}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function PersonAdminSectionLabelsForm() {
  const router = useRouter();
  const [profile, setProfile] = useState<PersonProfilePayload>(DEFAULT_PERSON_PROFILE);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

  const labels = profile.sectionLabels || DEFAULT_SECTION_LABELS;

  const setLabels = (next: PersonSectionLabels) => {
    setProfile((current) => ({ ...current, sectionLabels: next }));
  };

  const onSave = async () => {
    setError("");
    setStatus("保存中…");
    try {
      const saved = await savePersonAdminProfile(profile);
      setProfile(saved);
      router.refresh();
      setStatus("已保存，侧栏和前台名称会马上更新");
    } catch (err) {
      setStatus("");
      setError(err instanceof Error ? err.message : "保存失败");
    }
  };

  if (loading) return <p className="text-sm text-[var(--muted)]">加载栏目名称…</p>;

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-lg font-semibold">{labels.admin.sections}</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          改这里会同步后台侧栏、前台导航和首页区块标题。空着则回退默认名。
        </p>
      </div>

      <section className="grid gap-3">
        <h3 className="text-sm font-semibold">后台侧栏</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {PERSON_ADMIN_NAV_KEYS.map((key) => (
            <LabelField
              key={key}
              label={DEFAULT_SECTION_LABELS.admin[key]}
              hint={ADMIN_HINT[key]}
              value={labels.admin[key]}
              onChange={(value) =>
                setLabels({ ...labels, admin: { ...labels.admin, [key]: value } })
              }
            />
          ))}
          {PERSON_ENTRY_KINDS.map((kind) => (
            <LabelField
              key={kind}
              label={DEFAULT_SECTION_LABELS.kinds[kind]}
              hint="后台栏目"
              value={labels.kinds[kind]}
              onChange={(value) =>
                setLabels({ ...labels, kinds: { ...labels.kinds, [kind]: value } })
              }
            />
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <h3 className="text-sm font-semibold">前台导航</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {PERSON_PUBLIC_NAV_KEYS.map((key) => (
            <LabelField
              key={key}
              label={DEFAULT_SECTION_LABELS.nav[key]}
              hint={NAV_HINT[key]}
              value={labels.nav[key]}
              onChange={(value) =>
                setLabels({ ...labels, nav: { ...labels.nav, [key]: value } })
              }
            />
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <h3 className="text-sm font-semibold">首页区块</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {PERSON_HOME_TITLE_KEYS.map((key) => (
            <LabelField
              key={key}
              label={DEFAULT_SECTION_LABELS.home[key]}
              hint={HOME_HINT[key]}
              value={labels.home[key]}
              onChange={(value) =>
                setLabels({ ...labels, home: { ...labels.home, [key]: value } })
              }
            />
          ))}
        </div>
      </section>

      {error ? <p className="text-sm text-[var(--fire-strong)]">{error}</p> : null}
      {status ? <p className="text-sm text-[var(--brand-strong)]">{status}</p> : null}
      <button type="button" className="btn btn-primary min-h-11 w-fit px-5" onClick={() => void onSave()}>
        保存栏目名称
      </button>
    </div>
  );
}
