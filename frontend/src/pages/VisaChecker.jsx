import React, { useState } from "react";
import { getVisaInfo } from "../api/apiClient";
import { auth } from "../firebase";

const VisaChecker = () => {
  const [nationality, setNationality] = useState("Indian");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const userId = auth.currentUser?.uid;
      const { data } = await getVisaInfo({ nationality, destinationCountry, userId });
      setResult(data.visa);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch visa info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="page-header">
        <h1>Visa Checker</h1>
        <p>Understand visa requirements, documents, and processing time.</p>
      </section>

      <section className="page-content">
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Your Nationality
            <input
              type="text"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              required
            />
          </label>
          <label>
            Destination Country
            <input
              type="text"
              value={destinationCountry}
              onChange={(e) => setDestinationCountry(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Checking..." : "Check Visa"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {result && (
          <div className="result">
            <h2>Visa Summary</h2>

{result && (
  <div className="result">
    <h2>Visa Summary</h2>

    <div className="space-y-3 text-sm text-slate-100">
      <p>
        <span className="font-semibold">Visa required:</span>{" "}
        {result.visaRequired}
      </p>

      <p>
        <span className="font-semibold">Visa type:</span>{" "}
        {result.visaType}
      </p>

      <p>
        <span className="font-semibold">Processing time:</span>{" "}
        {result.processingTime}
      </p>

      <p>
        <span className="font-semibold">Fees:</span>{" "}
        {result.fees}
      </p>

      <p>
        <span className="font-semibold">Stay limit:</span>{" "}
        {result.stayLimit}
      </p>

      <p>
        <span className="font-semibold">Entry type:</span>{" "}
        {result.entryType}
      </p>

      <div className="mt-4">
        <p className="font-semibold mb-1">Required documents</p>
        <ul className="list-disc list-inside space-y-1 text-slate-200">
          {Array.isArray(result.documents) &&
            result.documents.map((doc, i) => (
              <li key={i}>{doc}</li>
            ))}
        </ul>
      </div>

      {Array.isArray(result.notes) && result.notes.length > 0 && (
        <div className="mt-4">
          <p className="font-semibold mb-1">Important notes</p>
          <ul className="list-disc list-inside space-y-1 text-slate-200">
            {result.notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {result.summary && (
        <div className="mt-4">
          <p className="font-semibold mb-1">Summary</p>
          <p className="text-slate-200">{result.summary}</p>
        </div>
      )}

      {result.disclaimer && (
        <div className="mt-4 border-t border-slate-700 pt-3 text-xs text-slate-400">
          {result.disclaimer}
        </div>
      )}
    </div>
  </div>
)}

          </div>
        )}
      </section>
    </main>
  );
};

export default VisaChecker;
