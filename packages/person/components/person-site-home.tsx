import Link from "next/link";
import {
  DEFAULT_SECTION_LABELS,
  PERSON_PUBLIC_NAV_KEYS,
  personKindLabel,
  buildPersonContactChips,
  personEntryHref,
  splitPersonAbout,
  type PersonEntryPayload,
  type PersonProfilePayload,
  type PersonPublicNavKey,
} from "@andyyyds/person/lib/person-site";
import {
  PERSON_SOCIAL_PLATFORM_LABEL,
  personSocialHasAccount,
  type PersonSocialAccounts,
} from "@andyyyds/person/lib/person-social";
import { PersonSocialFeed, type PersonSocialAlbumCard, type PersonSocialCard, type PersonSocialPagination } from "@andyyyds/person/components/person-social-feed";
import { PersonEmpty, PersonEntryCard } from "@andyyyds/person/components/person-entry-card";
import { PersonFileGallery } from "@andyyyds/person/components/person-file-gallery";
import { firstPersonVideo, personFilePreviewPath } from "@andyyyds/person/lib/person-files";

type Props = {
  profile: PersonProfilePayload;
  socialAccounts: PersonSocialAccounts;
  featured: PersonEntryPayload[];
  projects: PersonEntryPayload[];
  blogs: PersonEntryPayload[];
  portfolio: PersonEntryPayload[];
  honors: PersonEntryPayload[];
  grades: PersonEntryPayload[];
  practices: PersonEntryPayload[];
  activities: PersonEntryPayload[];
  interests: PersonEntryPayload[];
  photos: PersonEntryPayload[];
  resumes: PersonEntryPayload[];
  introVideos: PersonEntryPayload[];
  albums: PersonSocialAlbumCard[];
  posts: PersonSocialCard[];
  pagination: PersonSocialPagination;
};

function Section({
  id,
  title,
  moreHref,
  children,
}: {
  id?: string;
  title: string;
  moreHref?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-10 sm:mt-12">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h2 className="person-section-title">{title}</h2>
        {moreHref ? (
          <Link href={moreHref} className="min-h-11 inline-flex items-center text-sm text-[var(--ps-gold)]">
            查看全部
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ContactChip({
  chip,
  prefix = "",
}: {
  chip: { key: string; label: string; value: string; href: string };
  prefix?: string;
}) {
  const text = chip.value !== chip.label ? chip.value : "";
  if (chip.href) {
    return (
      <a
        key={`${prefix}${chip.key}`}
        href={chip.href}
        className="person-chip"
        target={chip.href.startsWith("http") ? "_blank" : undefined}
        rel="noopener noreferrer"
      >
        <strong>{chip.label}</strong>
        {text}
      </a>
    );
  }
  return (
    <span key={`${prefix}${chip.key}`} className="person-chip">
      <strong>{chip.label}</strong>
      {text}
    </span>
  );
}

function socialChips(accounts: PersonSocialAccounts) {
  const items: { label: string; href: string }[] = [];
  if (accounts.bilibili) items.push({ label: PERSON_SOCIAL_PLATFORM_LABEL.BILIBILI, href: accounts.bilibili });
  if (accounts.douyin) items.push({ label: PERSON_SOCIAL_PLATFORM_LABEL.DOUYIN, href: accounts.douyin });
  if (accounts.xiaohongshu) {
    items.push({ label: PERSON_SOCIAL_PLATFORM_LABEL.XIAOHONGSHU, href: accounts.xiaohongshu });
  }
  if (accounts.wechatChannels) {
    items.push({
      label: PERSON_SOCIAL_PLATFORM_LABEL.WECHAT_CHANNELS,
      href: accounts.wechatChannels,
    });
  }
  return items;
}

export function PersonSiteHome({
  profile,
  socialAccounts,
  featured,
  projects,
  blogs,
  portfolio,
  honors,
  grades,
  practices,
  activities,
  interests,
  photos,
  resumes,
  introVideos,
  albums,
  posts,
  pagination,
}: Props) {
  const chips = buildPersonContactChips(profile);
  const labels = profile.sectionLabels || DEFAULT_SECTION_LABELS;
  const about = splitPersonAbout(profile.about);
  const media = socialChips(socialAccounts);
  const honorList = [...honors, ...grades].slice(0, 4);
  const lifeList = [...practices, ...activities].slice(0, 4);
  const navOrder = profile.navOrder?.length ? profile.navOrder : [...PERSON_PUBLIC_NAV_KEYS];

  const featuredSection = featured.length ? (
    <Section title={labels.home.featured}>
      <div className="person-grid person-grid-2">
        {featured.slice(0, 4).map((entry) => (
          <PersonEntryCard
            key={entry.id}
            entry={entry}
            showKind={personKindLabel(labels, entry.kind)}
          />
        ))}
      </div>
    </Section>
  ) : null;

  const renderNavSection = (key: PersonPublicNavKey) => {
    if (key === "about") {
      return (
        <Section id="about" title={labels.home.aboutMe}>
          {about.length ? (
            <div className="person-card person-prose p-5 sm:p-7">
              {about.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>
          ) : (
            <PersonEmpty>还没有写自我介绍。打开个人展示后台即可完善。</PersonEmpty>
          )}
        </Section>
      );
    }
    if (key === "resume") {
      return (
        <Section
          id="resume"
          title={labels.nav.resume}
          moreHref={resumes.length > 1 ? "/about/person/resume" : undefined}
        >
          {resumes.length ? (
            <div className="grid gap-5">
              {resumes.slice(0, 2).map((entry) => (
                <div key={entry.id}>
                  <PersonEntryCard entry={entry} />
                  <PersonFileGallery entryId={entry.id} files={entry.files} />
                </div>
              ))}
            </div>
          ) : (
            <PersonEmpty>简历文档会在这里预览和下载。</PersonEmpty>
          )}
        </Section>
      );
    }
    if (key === "intro") {
      return (
        <Section
          id="intro"
          title={labels.nav.intro}
          moreHref={introVideos.length > 1 ? "/about/person/intro" : undefined}
        >
          {introVideos.length ? (
            <div className="grid gap-5">
              {introVideos.slice(0, 2).map((entry) => {
                const video = firstPersonVideo(entry.files);
                return (
                  <div key={entry.id} className="person-card overflow-hidden p-4 sm:p-5">
                    <p className="person-meta">{entry.period || "自我介绍"}</p>
                    <h3 className="mt-1 text-lg font-semibold">{entry.title}</h3>
                    {entry.summary ? (
                      <p className="mt-2 text-sm leading-6 text-[var(--ps-muted)]">{entry.summary}</p>
                    ) : null}
                    {video ? (
                      <video
                        className="person-file-media mt-4"
                        src={video.url.startsWith("/uploads/") ? video.url : personFilePreviewPath(entry.id, video.id)}
                        controls
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <PersonFileGallery entryId={entry.id} files={entry.files} />
                    )}
                    <Link
                      href={personEntryHref(entry)}
                      className="mt-3 inline-flex min-h-11 items-center text-sm text-[var(--ps-gold)]"
                    >
                      查看这条介绍
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <PersonEmpty>视频自我介绍会显示在这里，后台上传后首页就能看到。</PersonEmpty>
          )}
        </Section>
      );
    }
    if (key === "projects") {
      return (
        <Section id="projects" title={labels.nav.projects} moreHref={projects.length > 4 ? "/about/person/projects" : undefined}>
          {projects.length ? (
            <div className="person-grid person-grid-2">
              {projects.slice(0, 4).map((entry) => (
                <PersonEntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <PersonEmpty>项目经历将在这里展示。</PersonEmpty>
          )}
        </Section>
      );
    }
    if (key === "blog") {
      return (
        <Section id="blog" title={labels.nav.blog} moreHref={blogs.length > 3 ? "/about/person/blog" : undefined}>
          {blogs.length ? (
            <div className="person-grid person-grid-2">
              {blogs.slice(0, 4).map((entry) => (
                <PersonEntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <PersonEmpty>技术随笔还没开始写。</PersonEmpty>
          )}
        </Section>
      );
    }
    if (key === "portfolio") {
      return (
        <Section id="portfolio" title={labels.nav.portfolio} moreHref={portfolio.length > 3 ? "/about/person/portfolio" : undefined}>
          {portfolio.length ? (
            <div className="person-grid person-grid-3">
              {portfolio.slice(0, 6).map((entry) => (
                <PersonEntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <PersonEmpty>作品集还是空的。</PersonEmpty>
          )}
        </Section>
      );
    }
    if (key === "honors") {
      return (
        <Section id="honors" title={labels.nav.honors} moreHref={honorList.length ? "/about/person/honors" : undefined}>
          {honorList.length ? (
            <div className="person-grid person-grid-2">
              {honorList.map((entry) => (
                <PersonEntryCard
                  key={entry.id}
                  entry={entry}
                  showKind={personKindLabel(labels, entry.kind)}
                />
              ))}
            </div>
          ) : (
            <PersonEmpty>成绩、奖项与荣誉可在后台添加。</PersonEmpty>
          )}
        </Section>
      );
    }
    if (key === "life") {
      return (
        <Section id="life" title={labels.nav.life} moreHref={lifeList.length || interests.length ? "/about/person/life" : undefined}>
          {lifeList.length || interests.length ? (
            <div className="grid gap-4">
              {lifeList.length ? (
                <div className="person-grid person-grid-2">
                  {lifeList.map((entry) => (
                    <PersonEntryCard
                      key={entry.id}
                      entry={entry}
                      showKind={personKindLabel(labels, entry.kind)}
                    />
                  ))}
                </div>
              ) : null}
              {interests.length ? (
                <div className="flex flex-wrap gap-2">
                  {interests.map((item) => (
                    <Link key={item.id} href={personEntryHref(item)} className="person-chip">
                      {item.title}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <PersonEmpty>社会实践、课外活动会列在这里。</PersonEmpty>
          )}
        </Section>
      );
    }
    return (
      <Section id="photos" title={labels.nav.photos} moreHref={photos.length > 8 ? "/about/person/photos" : undefined}>
        {photos.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.slice(0, 8).map((photo) => {
              const src = photo.coverUrl || photo.images[0];
              if (!src) return null;
              return (
                <Link
                  key={photo.id}
                  href={personEntryHref(photo)}
                  className="person-card overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={photo.title} className="aspect-[4/3] w-full object-cover" />
                </Link>
              );
            })}
          </div>
        ) : (
          <PersonEmpty>照片会显示在这里，后台添加后首页就能看到。</PersonEmpty>
        )}
      </Section>
    );
  };

  return (
    <div>
      <section className="person-hero">
        {profile.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="person-hero-cover" src={profile.coverUrl} alt="" />
        ) : (
          <div className="person-hero-cover bg-[var(--ps-navy-soft)]" />
        )}
        <div className="person-hero-body">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="person-avatar" src={profile.avatarUrl} alt={profile.displayName || "头像"} />
          ) : (
            <div className="person-avatar grid place-items-center text-2xl text-[#d4c19a]">
              {(profile.displayName || "我").slice(0, 1)}
            </div>
          )}
          <div>
            <p className="person-kicker">About me</p>
            <h1 className="person-name">{profile.displayName || "个人介绍"}</h1>
            {profile.headline ? <p className="person-headline">{profile.headline}</p> : null}
          </div>
        </div>
      </section>

      {chips.length || media.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <ContactChip key={chip.key} chip={chip} />
          ))}
          {media.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="person-chip"
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>自媒体</strong>
              {item.label}
            </a>
          ))}
        </div>
      ) : null}

      {navOrder.map((key) => (
        <div key={key}>
          {renderNavSection(key)}
          {key === "about" ? featuredSection : null}
        </div>
      ))}

      {chips.length || media.length ? (
        <Section id="contact" title={labels.home.contact}>
          <div className="person-card p-5 sm:p-7">
            <p className="text-sm leading-7 text-[var(--ps-muted)]">
              邮件、电话与常见社交账号都可以直接点开。微信 / QQ 请按号码添加。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <ContactChip key={`contact-${chip.key}`} chip={chip} prefix="contact-" />
              ))}
              {media.map((item) => (
                <a
                  key={`contact-media-${item.label}`}
                  href={item.href}
                  className="person-chip"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <strong>自媒体</strong>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </Section>
      ) : null}

      {personSocialHasAccount(socialAccounts) || albums.length || posts.length ? (
        <Section id="social" title={labels.home.social}>
          <PersonSocialFeed albums={albums} posts={posts} pagination={pagination} />
        </Section>
      ) : null}
    </div>
  );
}
