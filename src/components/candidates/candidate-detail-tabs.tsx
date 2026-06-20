'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { CandidateNotesPanel } from '@/components/candidates/candidate-notes-panel';
import { CandidateResumesPanel } from '@/components/candidates/candidate-resumes-panel';
import { CandidateActivityTimeline } from '@/components/candidates/candidate-activity-timeline';
import type { CandidateDetail } from '@/types/candidate';
import { Button } from '@/components/ui/button';

interface CandidateDetailTabsProps {
  candidate: CandidateDetail;
}

const tabOptions = [
  { key: 'overview', label: 'Overview' },
  { key: 'resumes', label: 'Resumes' },
  { key: 'notes', label: 'Notes' },
  { key: 'activity', label: 'Activity' },
];

export function CandidateDetailTabs({ candidate }: CandidateDetailTabsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const statuses = useMemo(
    () => ({
      NEW: 'bg-slate-900 text-slate-200',
      SCREENING: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
      INTERVIEW: 'bg-sky-500/10 text-sky-300 border border-sky-500/20',
      OFFERED: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
      HIRED: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
      REJECTED: 'bg-rose-500/10 text-rose-300 border border-rose-500/20',
    }) as Record<string, string>,
    []
  );

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-[32px] bg-slate-950/90 p-3 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
        <div className="flex gap-2">
          {tabOptions.map((tab) => (
            <Button
              key={tab.key}
              type="button"
              variant={activeTab === tab.key ? 'primary' : 'secondary'}
              className="min-w-[120px]"
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="grid gap-6 xl:grid-cols-[0.65fr_0.35fr]">
              <div className="glass-card p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Profile overview</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{candidate.fullName}</h2>
                  </div>
                  <span className={`inline-flex rounded-3xl px-4 py-2 text-sm font-semibold ${statuses[candidate.status] || 'bg-slate-900 text-slate-200'}`}>
                    {candidate.status}
                  </span>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    { label: 'Email', value: candidate.email },
                    { label: 'Phone', value: candidate.phone },
                    { label: 'Role', value: candidate.role },
                    { label: 'Location', value: candidate.location },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-sm text-slate-400">{item.label}</p>
                      <p className="mt-2 text-base font-medium text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white">Hiring summary</h3>
                <div className="mt-6 grid gap-4">
                  {[
                    { label: 'Department', value: candidate.department },
                    { label: 'Recruiter', value: candidate.recruiterName ?? 'Unassigned' },
                    { label: 'Experience', value: `${candidate.experienceYears} yrs` },
                    { label: 'Notice period', value: `${candidate.noticePeriodDays} days` },
                  ].map((item) => (
                    <div key={item.label} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                      <p className="text-sm text-slate-400">{item.label}</p>
                      <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold text-white">Skills</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {candidate.skills.length ? candidate.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-slate-900/90 px-4 py-2 text-sm text-slate-200">{skill}</span>
                )) : (
                  <span className="text-sm text-slate-400">No skills were added yet.</span>
                )}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold text-white">Offer history</h3>
              <div className="mt-6 space-y-4">
                {candidate.offerHistory.length ? candidate.offerHistory.map((offer) => (
                  <div key={offer.id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-white">{offer.title}</p>
                      <p className="mt-1 text-sm text-slate-400">Version {offer.version} · {offer.status}</p>
                    </div>
                    <span className="text-sm text-slate-400">{new Date(offer.offerDate).toLocaleDateString()}</span>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400">No offers created for this candidate yet.</p>
                )}
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'resumes' ? (
          <motion.div
            key="resumes"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <CandidateResumesPanel candidateId={candidate.id} />
          </motion.div>
        ) : activeTab === 'notes' ? (
          <motion.div
            key="notes"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <CandidateNotesPanel candidateId={candidate.id} />
          </motion.div>
        ) : (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <CandidateActivityTimeline candidateId={candidate.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
