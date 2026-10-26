// Secure server-side AI endpoint for Z-Path Sri Lanka.
// Set OPENAI_API_KEY in Netlify environment variables. Never put it in index.html.
exports.handler = async function(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }
  if (event.httpMethod !== "POST") return json(405, { error: "Use POST for advisor requests." });
  if (!process.env.OPENAI_API_KEY) {
    return json(503, { error: "AI is not configured yet. Add OPENAI_API_KEY in your Netlify site environment variables, then redeploy." });
  }
  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch (_) { return json(400, { error: "Request body must be valid JSON." }); }

  const student = body.student || {};
  const stream = clean(student.stream, 80);
  const district = clean(student.district, 80);
  const subjects = Array.isArray(student.subjects) ? student.subjects.slice(0, 3).map(s => ({
    name: clean(s && s.name, 100), marks: Number(s && s.marks)
  })) : [];
  if (!stream || !district || subjects.length !== 3 || subjects.some(s => !s.name || !Number.isFinite(s.marks) || s.marks < 0 || s.marks > 100)) {
    return json(400, { error: "Please calculate results and provide a valid stream, district, subjects and marks first." });
  }

  const payload = {
    stream, district, subjects,
    interests: clean(body.interests, 250),
    careerGoals: clean(body.careerGoals, 250),
    priorities: clean(body.priorities, 700)
  };
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const instructions = `You are Z-Path AI Advisor, an educational guidance assistant for students in Sri Lanka. Give age-appropriate, supportive, practical guidance. This service has no verified live UGC admissions database and no validated current labour-market feed. Do not pretend that you checked live data, do not invent official cut-off scores, admission rules, university course availability, citations, job statistics, salaries, or employment guarantees. Never claim a student is eligible for or likely to enter a named university based only on these marks. The supplied marks are raw marks, not official admission Z-scores. The supplied personalEstimate, if present, is a simple average of user-entered subject Z-scores and is NOT the official UGC Z-score; do not use it to rank universities or judge eligibility. If mentioning specific universities or courses, clearly label them as options to research and tell the student to verify current requirements in the latest official UGC University Admissions Handbook and official university websites. Recommend how to research course accreditation, entry requirements, skills, and employment trends using recent credible sources. Separate general career guidance from facts requiring verification. Explain that district quota and annual cut-offs can affect admission. Do not ask for personal identifying information. Format answer with headings: 1) What your subjects may lead to, 2) Course areas to explore (not an eligibility result), 3) Career paths and skills, 4) How to verify university admission information, 5) Suggested next steps. Be clear, encouraging, concise, and tailored to the student's stream, subjects, interests, and priorities.`;

  try {
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": "Bearer " + process.env.OPENAI_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        instructions,
        input: JSON.stringify(payload),
        max_output_tokens: 1000
      })
    });
    const result = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("AI provider request failed", upstream.status, result && result.error && result.error.code);
      return json(502, { error: "The AI service could not complete the request. Check your API account and Netlify function logs, then try again." });
    }
    const answer = extractText(result);
    if (!answer) return json(502, { error: "The AI service returned an empty response. Please try again." });
    return json(200, { answer });
  } catch (err) {
    console.error("Advisor request failed", err && err.message);
    return json(502, { error: "Could not reach the AI service. Please try again later." });
  }
};

function clean(value, max) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function extractText(result) {
  if (typeof result.output_text === "string") return result.output_text.trim();
  const out = [];
  (Array.isArray(result.output) ? result.output : []).forEach(item => {
    (Array.isArray(item.content) ? item.content : []).forEach(part => {
      if (part.type === "output_text" && typeof part.text === "string") out.push(part.text);
    });
  });
  return out.join("\n").trim();
}
function corsHeaders() {
  return { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
}
function json(statusCode, value) { return { statusCode, headers: corsHeaders(), body: JSON.stringify(value) }; }
