"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    attending: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const fieldErrors: Record<string, string> = {};
          data.errors.forEach((err: { path: string[]; message: string }) => {
            fieldErrors[err.path[0]] = err.message;
          });
          setErrors(fieldErrors);
        }
        return;
      }

      router.push(`/confirm/${data.token}`);
    } catch (error) {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          {process.env.NEXT_PUBLIC_EVENT_NAME}
        </h1>
        <p className="text-gray-400 text-sm mb-2">
          {process.env.NEXT_PUBLIC_EVENT_DATE}
        </p>
        <p className="text-gray-500 mb-8">
          Please fill in your details to confirm your attendance.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Jane Smith"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Will you be attending?
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, attending: true })}
                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  formData.attending
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                Yes, I'll be there
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, attending: false })}
                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  !formData.attending
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                Can't make it
              </button>
            </div>
          </div>

          {errors.form && (
            <p className="text-red-500 text-sm">{errors.form}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Confirm RSVP"}
          </button>
        </form>
      </div>
    </main>
  );
}
