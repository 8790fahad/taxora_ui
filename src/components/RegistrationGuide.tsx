interface RegistrationGuideProps {
  step: 1 | 2 | 3 | 4;
}

const STEPS = [
  {
    num: 1,
    title: 'Verify CAC',
    text: 'Click the "Verify CAC" button above, enter your CAC number, and select your business type to begin.',
  },
  {
    num: 2,
    title: 'Review Details',
    text: 'Once verified, your company details will be auto-filled from the CAC database. Review and edit if needed.',
  },
  {
    num: 3,
    title: 'Account setup',
    text: 'Enter your name and password to create your Taxora account linked to this company.',
  },
  {
    num: 4,
    title: 'Complete Registration',
    text: 'Submit to finish registration and continue to ERP connection and subscription.',
  },
];

export default function RegistrationGuide({ step }: RegistrationGuideProps) {
  return (
    <div className="panel-guide">
      <h3 className="text-lg font-semibold">Registration Guide</h3>
      <p className="mt-1 text-sm text-secondary-200">Step-by-Step Process</p>
      <ol className="mt-6 space-y-5">
        {STEPS.map((s) => (
          <li key={s.num} className="flex gap-3">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                step === s.num ? 'bg-primary-500 text-white' : 'bg-white/15 text-white'
              }`}
            >
              {s.num}
            </span>
            <div>
              <p className={`font-medium ${step === s.num ? 'text-white' : 'text-secondary-200'}`}>
                Step {s.num}: {s.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-secondary-300">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
