import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, ShieldAlert, X } from 'lucide-react';
import { PatientRecord, UrgencyCategory } from '../../data/patients';

interface UrgencyBadgeProps {
  urgency: UrgencyCategory;
  patient?: PatientRecord;
  onClick?: () => void;
  showExplanationOnClick?: boolean;
  size?: 'sm' | 'md';
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({
  urgency,
  patient,
  onClick,
  showExplanationOnClick = true,
  size = 'md',
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Never trigger row click / call
    if (onClick) {
      onClick();
    } else if (showExplanationOnClick) {
      setShowModal(true);
    }
  };

  const badgeStyles = {
    EMERGENCY: {
      bg: 'bg-red-50 text-crimsonRed-500 border-red-200 hover:bg-red-100',
      dot: 'bg-crimsonRed-500 animate-pulse',
      icon: ShieldAlert,
      label: 'Emergency',
      labelOdia: 'ଜରୁରୀକାଳୀନ',
    },
    URGENT: {
      bg: 'bg-amberOrange-50 text-amberOrange-700 border-amberOrange-300 hover:bg-amberOrange-100',
      dot: 'bg-amberOrange-500 animate-pulse',
      icon: AlertTriangle,
      label: 'Urgent',
      labelOdia: 'ତୁରନ୍ତ ଧ୍ୟାନ',
    },
    ROUTINE: {
      bg: 'bg-emerald-50 text-forestGreen-500 border-emerald-200 hover:bg-emerald-100',
      dot: 'bg-forestGreen-500',
      icon: CheckCircle2,
      label: 'Routine',
      labelOdia: 'ସାଧାରଣ',
    },
  }[urgency];

  const Icon = badgeStyles.icon;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title="Click to view clinical triage explanation"
        className={`inline-flex items-center gap-1.5 rounded-full border font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-amberOrange-500/30 shrink-0 ${badgeStyles.bg} ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${badgeStyles.dot}`} />
        <span>{badgeStyles.label}</span>
        <Info className="w-3 h-3 opacity-60 hover:opacity-100" />
      </button>

      {/* Urgency Explanation Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(false);
          }}
        >
          <div
            className="bg-surface border border-subtleBorder rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-subtleBorder">
              <div className="flex items-center gap-2.5">
                <span className={`p-2 rounded-xl ${badgeStyles.bg}`}>
                  <Icon className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-primaryText text-base">
                    Triage Classification: {badgeStyles.label}
                  </h3>
                  <p className="text-xs text-secondaryText">Configured Clinical Urgency Standard</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-secondaryText hover:text-primaryText hover:bg-canvas transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Explanation Details */}
            <div className="space-y-3 text-xs">
              {/* Recorded Reason */}
              <div className="bg-canvas p-3.5 rounded-xl border border-subtleBorder space-y-1">
                <span className="font-bold text-primaryText block uppercase tracking-wider text-[10px]">
                  Clinical Reason Recorded:
                </span>
                <p className="text-secondaryText leading-relaxed">
                  {patient?.urgencyReason || 'No urgency explanation recorded.'}
                </p>
              </div>

              {/* Relevant Vitals / Symptoms if available */}
              {patient && patient.vitals && (
                <div className="bg-canvas p-3.5 rounded-xl border border-subtleBorder space-y-1.5">
                  <span className="font-bold text-primaryText block uppercase tracking-wider text-[10px]">
                    Associated Vitals &amp; Symptoms:
                  </span>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div className="bg-surface px-2.5 py-1.5 rounded border border-subtleBorder">
                      <span className="text-secondaryText block text-[9px] uppercase font-sans">Temperature</span>
                      <span className="font-bold text-primaryText">{patient.vitals.tempF}°F</span>
                    </div>
                    <div className="bg-surface px-2.5 py-1.5 rounded border border-subtleBorder">
                      <span className="text-secondaryText block text-[9px] uppercase font-sans">Blood Pressure</span>
                      <span className="font-bold text-primaryText">{patient.vitals.bp} mmHg</span>
                    </div>
                    <div className="bg-surface px-2.5 py-1.5 rounded border border-subtleBorder">
                      <span className="text-secondaryText block text-[9px] uppercase font-sans">Oxygen (SpO2)</span>
                      <span className="font-bold text-forestGreen-500">{patient.vitals.spo2}%</span>
                    </div>
                    <div className="bg-surface px-2.5 py-1.5 rounded border border-subtleBorder">
                      <span className="text-secondaryText block text-[9px] uppercase font-sans">Heart Rate</span>
                      <span className="font-bold text-primaryText">{patient.vitals.pulse} bpm</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommended Workflow Rule */}
              <div className="bg-canvas p-3.5 rounded-xl border border-subtleBorder space-y-1">
                <span className="font-bold text-primaryText block uppercase tracking-wider text-[10px]">
                  Protocol-Configured Workflow:
                </span>
                <p className="text-secondaryText leading-relaxed">
                  {patient?.triageWorkflow || 'Follow standard sub-center queue protocols.'}
                </p>
              </div>

              {/* Honest Clinical Governance Disclaimer */}
              <div className="flex items-start gap-2 text-[11px] text-secondaryText bg-amberOrange-50/60 p-3 rounded-xl border border-amberOrange-200/60">
                <AlertCircle className="w-4 h-4 text-amberOrange-600 shrink-0 mt-0.5" />
                <p>
                  This triage category is based on verified health worker vital signs and clinical rule sets. It is not an automated or AI diagnosis and requires physician verification.
                </p>
              </div>
            </div>

            {/* Close Action */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-primaryText hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
