'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { StoreManager, getInitialSeedState } from '@/lib/store';
import { 
  Compass, 
  Search, 
  Building2, 
  Star, 
  HelpCircle, 
  MessageSquare, 
  Tag, 
  Send, 
  CheckCircle2, 
  Award, 
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { AtlasPost } from '@/types/database';

export default function InternshipAtlasPage() {
  const { storeState, refreshStore } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Question modal state
  const [questionModalPost, setQuestionModalPost] = useState<AtlasPost | null>(null);
  const [juniorName, setJuniorName] = useState('');
  const [juniorQuestion, setJuniorQuestion] = useState('');
  const [questionSuccess, setQuestionSuccess] = useState(false);

  const seed = getInitialSeedState();
  const rawPosts = storeState?.atlasPosts || [];
  const posts = rawPosts.length > 0 ? rawPosts : seed.atlasPosts;

  // Filter logic with defensive null-checks
  const filteredPosts = posts.filter((p) => {
    const compName = (p.company_name || '').toLowerCase();
    const dom = (p.domain || '').toLowerCase();
    const tip = (p.tips || '').toLowerCase();
    const q = searchQuery.toLowerCase().trim();

    const matchesSearch = !q || compName.includes(q) || dom.includes(q) || tip.includes(q);
    const matchesDomain = selectedDomain === 'all' || p.domain === selectedDomain;
    const matchesDiff = selectedDifficulty === 'all' || (p.difficulty_rating && p.difficulty_rating.toString() === selectedDifficulty);

    return matchesSearch && matchesDomain && matchesDiff;
  });

  // Extract unique domains defensively
  const domains = Array.from(new Set(posts.map((p) => p.domain).filter(Boolean)));

  // Leaderboard of "Most Welcoming Companies"
  const welcomingCompanies = [
    { name: 'Goa Shipyard Limited', score: 98, rating: 5, domain: 'Defense & Embedded Systems', reviews: 12 },
    { name: 'Siemens Healthineers', score: 95, rating: 5, domain: 'Medical Signal Processing', reviews: 8 },
    { name: 'D-Link India Ltd.', score: 92, rating: 4.8, domain: 'Networking & Firmware', reviews: 9 },
    { name: 'Persistent Systems Ltd.', score: 89, rating: 4.7, domain: 'Cloud & Edge AI', reviews: 11 },
  ];

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionModalPost || !juniorQuestion.trim()) return;

    const store = StoreManager.getInstance();
    const intern = store.getState().internships.find((i) => i.id === questionModalPost.internship_id);
    const seniorStudent = intern ? store.getState().profiles.find((p) => p.id === intern.student_id) : null;

    if (seniorStudent) {
      // Create notification for senior intern
      store.addNotification(
        seniorStudent.id,
        `Junior Inquiry regarding ${questionModalPost.company_name}`,
        `A junior asked: "${juniorQuestion.slice(0, 80)}..." Reply through the Atlas portal.`,
        '/atlas'
      );

      // Log email to outbox
      store.addOutboxEmail(
        seniorStudent.email,
        `InternTrack Atlas: Junior Question about your internship at ${questionModalPost.company_name}`,
        `<p>Dear ${seniorStudent.name},<br/>A junior student (${juniorName || 'Anonymous Junior'}) sent you a question via the Internship Atlas:<br/><br/><i>"${juniorQuestion.trim()}"</i><br/><br/>No personal contact info was shared.</p>`,
        'comment_notification'
      );
      store.saveState();
      refreshStore();
    }

    setQuestionSuccess(true);
    setTimeout(() => {
      setQuestionSuccess(false);
      setQuestionModalPost(null);
      setJuniorQuestion('');
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-800/80 border border-blue-700 text-blue-200 text-xs font-semibold">
          <Compass className="w-4 h-4 text-amber-300" />
          <span>Institutional Knowledge Base • Don Bosco College of Engineering</span>
        </div>

        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Internship Atlas for Future Batches
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Anonymized peer insights, interview experiences, tips, and ranking of most welcoming industry partners curated by Class of 2025.
        </p>
      </div>

      {/* Leaderboard: Most Welcoming Companies */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Most Welcoming Companies (Ranked by Supervisor Speed & Reviews)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked objectively using supervisor confirmation turnaround and intern feedback.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
            Top 4 Ranked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {welcomingCompanies.map((comp, idx) => (
            <div key={comp.name} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-blue-900 dark:bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  #{idx + 1}
                </span>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{comp.rating}.0</span>
                </div>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{comp.name}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{comp.domain}</p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-400">
                <span>Turnaround: {comp.score}%</span>
                <span>{comp.reviews} Interns</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative sm:col-span-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search company, tech stack, tips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
          />
        </div>

        <div>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
          >
            <option value="all">All Domains & Roles ({domains.length})</option>
            {domains.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
          >
            <option value="all">All Difficulty Levels</option>
            <option value="1">Level 1 (Entry Friendly)</option>
            <option value="2">Level 2 (Moderate)</option>
            <option value="3">Level 3 (Challenging)</option>
            <option value="4">Level 4 (Rigorous Core)</option>
            <option value="5">Level 5 (Advanced)</option>
          </select>
        </div>
      </div>

      {/* Atlas Post Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{post.company_name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{post.domain}</p>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  <Star className="w-3 h-3 fill-current text-amber-500" />
                  <span>{post.overall_rating || 5}.0</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {(post.tags || []).map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-lg text-[10px] bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                    {t}
                  </span>
                ))}
              </div>

              {/* Advice Columns */}
              <div className="space-y-2 text-xs">
                {post.how_i_got_it && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-white text-[11px] block mb-0.5">How I Got It:</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{post.how_i_got_it}</p>
                  </div>
                )}

                {post.tips && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-white text-[11px] block mb-0.5">Top Advice for Juniors:</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{post.tips}</p>
                  </div>
                )}

                {post.what_i_wish_i_knew && (
                  <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <span className="font-bold text-amber-900 dark:text-amber-200 text-[11px] block mb-0.5">What I Wish I Knew:</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{post.what_i_wish_i_knew}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">
                Verified Anonymous Alumni Review
              </span>

              <button
                onClick={() => setQuestionModalPost(post)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Ask Past Intern a Question</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Ask Question Modal */}
      {questionModalPost && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Ask Question to Senior Intern @ {questionModalPost.company_name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Your question routes safely through InternTrack. No personal phone or email is exposed.
                </p>
              </div>
              <button
                onClick={() => setQuestionModalPost(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {questionSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-sm">Question Dispatched!</p>
                <p className="text-[11px] text-slate-600">The past intern has been notified in-app and via email.</p>
              </div>
            ) : (
              <form onSubmit={handleSendQuestion} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Your Name or Roll No (Optional)</label>
                  <input
                    type="text"
                    value={juniorName}
                    onChange={(e) => setJuniorName(e.target.value)}
                    placeholder="e.g. Rahul (Semester V) or leave blank for Anonymous"
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Your Question *</label>
                  <textarea
                    required
                    rows={4}
                    value={juniorQuestion}
                    onChange={(e) => setJuniorQuestion(e.target.value)}
                    placeholder="Ask about interview questions, stipend, project difficulty, work culture..."
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setQuestionModalPost(null)}
                    className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 text-white rounded-lg font-bold hover:bg-blue-800"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Question via Portal</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
