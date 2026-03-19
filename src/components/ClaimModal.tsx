"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import claimService from "../services/claimService";

interface ClaimModalProps {
  isOpen: boolean;
  itemId: string;
  itemTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClaimModal({
  isOpen,
  itemId,
  itemTitle,
  onClose,
  onSuccess,
}: ClaimModalProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await claimService.submitClaim(itemId, message);
      setSuccess(true);
      setMessage("");

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        onSuccess();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to submit claim");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              {/* Success State */}
              {success ? (
                <div className="p-6 text-center">
                  <div className="mb-4">
                    <svg
                      className="h-12 w-12 text-green-500 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Claim submitted!
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Item owner will review your claim
                  </p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Claim Item
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{itemTitle}</p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Why do you claim this item?
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe how this item belongs to you..."
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent resize-none"
                        rows={4}
                      />
                    </div>

                    {error && (
                      <div className="rounded-lg bg-red-50 p-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !message.trim()}
                        className="flex-1 px-4 py-2 bg-terracotta text-white rounded-lg font-medium hover:bg-terracotta-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? "Submitting..." : "Submit Claim"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
