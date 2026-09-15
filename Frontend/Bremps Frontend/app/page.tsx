import Link from "next/link";
import { ArrowRight, CheckCircle2, LifeBuoy } from "lucide-react";
import { CATEGORIES } from "@/lib/constants/categories";
import { formatCurrency } from "@/lib/utils";

export default function Home() {
	return (
		<main className="flex-1">
			<section className="hero-glow hero-cloud-background border-b border-indigo-100 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
				<div aria-hidden="true">
					<span className="hero-software-slide" />
					<span className="hero-software-slide" />
					<span className="hero-software-slide" />
					<span className="hero-software-slide" />
				</div>
				<div className="relative z-10 mx-auto max-w-6xl text-center">
					  <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#4285f4,#7c4dff_58%,#e9427a)] text-white shadow-lg shadow-indigo-500/20">
						<LifeBuoy className="h-7 w-7" />
					</div>
					<p className="mb-3 text-xs font-bold uppercase tracking-widest text-sky-700">AURATECH</p>
					<h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
						Focused solutions for software problems.
					</h1>
					<p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
						Get dedicated software support from the three-person AURATECH team for development tools, databases, operating systems, and everyday application problems.
					</p>
					<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
						<Link
							href="/new-ticket"
							className="inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#4285f4,#6d5dfc)] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:brightness-95"
						>
							Submit a support ticket <ArrowRight className="h-4 w-4" />
						</Link>
						<Link
							href="/services"
							className="inline-flex items-center justify-center rounded-xl border border-indigo-100 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-white"
						>
							View services
						</Link>
					</div>
				</div>
			</section>

			<section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="mb-6 flex items-end justify-between gap-4">
					<div>
						<p className="text-xs font-bold uppercase tracking-widest text-sky-700">Support catalog</p>
						<h2 className="mt-1 text-2xl font-bold text-slate-900">Common service areas</h2>
					</div>
					<Link href="/services" className="text-sm font-semibold text-sky-700 hover:text-sky-800">All services</Link>
				</div>
				<div className="reveal-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{CATEGORIES.map((category) => (
						<div key={category.id} className="interactive-lift rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
							<div className="flex items-start justify-between gap-3">
								<h3 className="font-bold text-slate-900">{category.name}</h3>
								<span className="shrink-0 text-sm font-bold text-slate-900">{formatCurrency(category.basePrice)}</span>
							</div>
							<p className="mt-2 text-sm leading-6 text-slate-500">{category.description}</p>
							<div className="mt-4 space-y-2">
								{category.commonIssues.slice(0, 2).map((issue) => (
									<div key={issue} className="flex items-center gap-2 text-xs text-slate-600">
										<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
										<span>{issue}</span>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</section>
		</main>
	);
}
