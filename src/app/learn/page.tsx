import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { lessons } from "@/lib/lessons";

export const metadata = {
  title: "Learn | Blackjack Counting Lab",
  description: "The full blackjack counting curriculum with videos, drills, and source-backed lessons.",
};

export default function LearnIndexPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-neutral-950">
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/" className="icon-text-button w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to trainer
          </Link>
          <p className="mt-6 text-sm font-black uppercase tracking-wide text-emerald-800">
            Full Curriculum
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-normal sm:text-5xl">
            Learn card counting step by step.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
            Each lesson has a video, researched notes, drills, common mistakes, and source links.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:px-6 md:grid-cols-2 lg:px-8">
        {lessons.map((lesson, index) => (
          <Link key={lesson.slug} href={`/learn/${lesson.slug}`} className="curriculum-card">
            <span className="lesson-check">{index + 1}</span>
            <span className="min-w-0">
              <span className="block text-sm font-black uppercase tracking-wide text-emerald-800">
                {lesson.badge} - {lesson.duration}
              </span>
              <span className="mt-2 block text-2xl font-black text-neutral-950">{lesson.title}</span>
              <span className="mt-3 block text-sm leading-6 text-neutral-700">{lesson.summary}</span>
            </span>
            <ChevronRight className="ml-auto h-5 w-5 flex-none text-neutral-500" />
          </Link>
        ))}
      </section>
    </main>
  );
}
