 "use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { patientSchema, PatientFormValues } from "@/lib/validation";
import { emptyPatient } from "@/types/patient";
import { usePatientSocket } from "@/hooks/usePatientSocket";
import { getOrCreatePatientSessionId } from "@/lib/session";
import { ConnectionBadge } from "@/components/ui/ConnectionBadge";

const NATIONALITY_OPTIONS = [
  "Thai", "Chinese", "Japanese", "Korean", "American", "British", "Australian",
  "Indian", "Myanmar", "Laotian", "Cambodian", "Vietnamese", "Filipino", "Malaysian", "Singaporean", "Other"
];
const RELIGION_OPTIONS = ["Buddhist", "Christian", "Muslim", "Hindu", "Sikh", "Other", "Prefer not to say"];
const RELATIONSHIP_OPTIONS = ["Spouse", "Parent", "Child", "Sibling", "Relative", "Friend", "Other"];

type InputField = {
  kind?: "input";
  name: keyof PatientFormValues;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  maxLength?: number;
  inputMode?: "tel" | "email" | "text";
};
type SelectField = {
  kind: "select";
  name: keyof PatientFormValues;
  label: string;
  placeholder: string;
  required?: boolean;
  options: string[];
};

const fields: Array<InputField | SelectField> = [
  { name: "firstName", label: "First Name", placeholder: "Enter first name", required: true },
  { name: "middleName", label: "Middle Name", placeholder: "Optional" },
  { name: "lastName", label: "Last Name", placeholder: "Enter last name", required: true },
  { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
  { name: "phoneNumber", label: "Phone Number", placeholder: "+66 81 234 5678", required: true, maxLength: 20, inputMode: "tel" },
  { name: "email", label: "Email", placeholder: "patient@example.com", required: true },
  { name: "address", label: "Address", placeholder: "Enter address", required: true },
  { name: "nationality", label: "Nationality", kind: "select", placeholder: "Select nationality", required: true, options: NATIONALITY_OPTIONS },
  { name: "emergencyContactName", label: "Emergency Contact Name", placeholder: "Optional" },
  { name: "emergencyContactRelationship", label: "Emergency Contact Relationship", kind: "select", placeholder: "Select relationship (optional)", options: RELATIONSHIP_OPTIONS },
  { name: "religion", label: "Religion", kind: "select", placeholder: "Select religion (optional)", options: RELIGION_OPTIONS }
];

const sanitizePhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
  e.target.value = e.target.value.replace(/[^0-9+()\-\s]/g, "").slice(0, 20);
};

export default function PatientForm() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { session, connectionStatus, updatePatient } = usePatientSocket(sessionId);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updatedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (updatedTimeoutRef.current) clearTimeout(updatedTimeoutRef.current);
  }, []);

  useEffect(() => {
    setSessionId(getOrCreatePatientSessionId());
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: emptyPatient,
    mode: "onBlur"
  });

  const values = watch();

  useEffect(() => {
    if (!Object.values(values).some(Boolean)) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        await updatePatient(values, submitted ? "submitted" : "active", submitted ? new Date().toISOString() : null);
      } catch {
        // Keep the form usable if the realtime backend is unavailable.
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [values, submitted, updatePatient]);

  const onSubmit = async (data: PatientFormValues) => {
    if (saving) return;
    setSaving(true);
    setJustUpdated(false);
    const wasAlreadySubmitted = submitted;
    try {
      await updatePatient(data, "submitted", new Date().toISOString());
      await new Promise((resolve) => setTimeout(resolve, 400));
      setSubmitted(true);
      if (wasAlreadySubmitted) {
        setJustUpdated(true);
        if (updatedTimeoutRef.current) clearTimeout(updatedTimeoutRef.current);
        updatedTimeoutRef.current = setTimeout(() => setJustUpdated(false), 1500);
      }
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (name: keyof PatientFormValues) =>
    `mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
      errors[name] ? "border-red-400" : "border-slate-200"
    }`;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Agnos</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Patient Information</h1>
            <p className="mt-1 text-sm text-slate-500">Please enter your information below.</p>
          </div>
          <ConnectionBadge status={connectionStatus} />
        </header>

        {submitted && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold">Your information has been submitted successfully.</p>
              <p className="text-xs text-emerald-700">You can still update your details below if anything changes.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            {fields.map((field) => (
              <label key={field.name} className={field.name === "address" ? "sm:col-span-2" : ""}>
                <span className="text-sm font-semibold text-slate-800">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </span>
                {field.kind === "select" ? (
                  <select {...register(field.name)} className={inputClass(field.name)} defaultValue="">
                    <option value="" disabled={field.required}>{field.placeholder}</option>
                    {field.options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    {...register(field.name, field.name === "phoneNumber" ? { onChange: sanitizePhoneNumber } : undefined)}
                    type={field.type ?? "text"}
                    inputMode={field.inputMode}
                    maxLength={field.maxLength}
                    placeholder={field.placeholder}
                    className={inputClass(field.name)}
                  />
                )}
                {errors[field.name] && <span className="mt-1 block text-xs text-red-600">{errors[field.name]?.message}</span>}
              </label>
            ))}

            <label>
              <span className="text-sm font-semibold text-slate-800">Gender <span className="text-red-500">*</span></span>
              <select {...register("gender")} className={inputClass("gender")} defaultValue="">
                <option value="" disabled>Select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
              {errors.gender && <span className="mt-1 block text-xs text-red-600">{errors.gender.message}</span>}
            </label>

            <label>
              <span className="text-sm font-semibold text-slate-800">Preferred Language <span className="text-red-500">*</span></span>
              <select {...register("preferredLanguage")} className={inputClass("preferredLanguage")} defaultValue="">
                <option value="" disabled>Select language</option>
                <option value="thai">Thai</option>
                <option value="english">English</option>
                <option value="other">Other</option>
              </select>
              {errors.preferredLanguage && <span className="mt-1 block text-xs text-red-600">{errors.preferredLanguage.message}</span>}
            </label>
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">Your information is synchronized securely in real time.</div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {!saving && justUpdated && <CheckCircle2 size={16} />}
              {saving ? "Saving..." : justUpdated ? "Updated!" : submitted ? "Update Information" : "Submit Information"}
            </button>
          </div>
        </form>

        {session?.updated_at && (
          <p className="mt-4 text-center text-xs text-slate-400">
            Last synchronized: {new Date(session.updated_at).toLocaleTimeString()}
          </p>
        )}
      </div>
    </main>
  );
}