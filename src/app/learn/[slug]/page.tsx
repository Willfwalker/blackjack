import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, CheckCircle2, ExternalLink, ListChecks, Play, TriangleAlert } from "lucide-react";
import { BasicStrategySheet } from "@/components/basic-strategy-sheet";
import { getLessonBySlug, lessons } from "@/lib/lessons";

type LessonPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return lessons.map((lesson) => ({
    slug: lesson.slug,
  }));
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson) {
    return notFound();
  }

  return {
    title: `${lesson.title} | Blackjack Counting Lab`,
    description: lesson.summary,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson) {
    return notFound();
  }

  const lessonIndex = lessons.findIndex((item) => item.slug === lesson.slug);
  const previousLesson = lessons[lessonIndex - 1];
  const nextLesson = lessons[lessonIndex + 1];

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-neutral-950">
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="hidden md:block">
            <Link href="/?mode=learn" className="icon-text-button w-fit">
              <ArrowLeft className="h-4 w-4" />
              Back to trainer
            </Link>
          </div>

          <div className="mt-0 grid gap-6 md:mt-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-emerald-800">
                Lesson {lessonIndex + 1} / {lessons.length} - {lesson.badge} - {lesson.duration}
              </p>
              <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-normal sm:text-5xl">
                {lesson.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">{lesson.summary}</p>
            </div>

            <div className="rounded-md border border-neutral-200 bg-[#fbfaf7] p-4">
              <h2 className="flex items-center gap-2 text-lg font-black">
                <ListChecks className="h-5 w-5 text-emerald-800" />
                Objectives
              </h2>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-neutral-700">
                {lesson.objectives.map((objective) => (
                  <li key={objective} className="flex gap-2">
                    <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-emerald-700" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8">
        <article className="grid min-w-0 gap-6">
          <div className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="lesson-video">
              <iframe
                src={`https://www.youtube.com/embed/${lesson.videoId}`}
                title={lesson.videoTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm font-bold text-neutral-600">
              <Play className="h-4 w-4 text-emerald-800" />
              {lesson.videoTitle}
            </div>
          </div>

          <div className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black">Quick Rules</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {lesson.quickRules.map((rule) => (
                <div key={rule} className="rounded-md border border-neutral-200 bg-[#fbfaf7] p-4">
                  <p className="text-sm font-semibold leading-6 text-neutral-800">{rule}</p>
                </div>
              ))}
            </div>
          </div>

          {lesson.slug === "perfect-blackjack-without-counting" ? <BasicStrategySheet /> : null}

          {lesson.sections.map((section) => (
            <section key={section.title} className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-black">{section.title}</h2>
              <div className="mt-4 grid gap-4 text-base leading-8 text-neutral-700">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-2xl font-black">
                <BookOpen className="h-6 w-6 text-emerald-800" />
                Drills
              </h2>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-neutral-700">
                {lesson.drills.map((drill) => (
                  <li key={drill} className="rounded-md border border-neutral-200 bg-[#fbfaf7] p-3">
                    {drill}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-2xl font-black">
                <TriangleAlert className="h-6 w-6 text-amber-700" />
                Common Mistakes
              </h2>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-neutral-700">
                {lesson.mistakes.map((mistake) => (
                  <li key={mistake} className="rounded-md border border-neutral-200 bg-[#fffaf0] p-3">
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </article>

        <aside className="grid h-fit gap-4">
          <div className="hidden rounded-md border border-neutral-200 bg-white p-5 shadow-sm lg:block">
            <h2 className="text-lg font-black">Lesson Path</h2>
            <div className="mt-3 grid gap-2">
              {lessons.map((item, index) => (
                <Link
                  key={item.slug}
                  href={`/learn/${item.slug}`}
                  className={`lesson-nav-link ${item.slug === lesson.slug ? "lesson-nav-link-active" : ""}`}
                >
                  <span>{index + 1}</span>
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">Sources</h2>
            <div className="mt-3 grid gap-2">
              {lesson.sources.map((source) => (
                <a
                  key={source.href}
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:border-emerald-700 hover:text-emerald-800"
                >
                  <span className="inline-flex items-center gap-2">
                    {source.label}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            {previousLesson ? (
              <Link href={`/learn/${previousLesson.slug}`} className="secondary-button">
                Previous lesson
              </Link>
            ) : null}
            {nextLesson ? (
              <Link href={`/learn/${nextLesson.slug}`} className="primary-button">
                Next lesson
              </Link>
            ) : (
              <Link href="/?mode=practice" className="primary-button">
                Go practice
              </Link>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
