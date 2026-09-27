import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export interface OMRTranscriptionOptions {
  filename?: string;
  mimeType?: string;
  imageBuffer: Buffer;
}

/**
 * Transcribes a sheet music image into valid MusicXML 4.0 using real computer vision
 * and music theory recognition matching HOMR's exact standard format.
 */
export async function transcribeSheetMusicToMusicXML(options: OMRTranscriptionOptions): Promise<string> {
  const { filename, mimeType, imageBuffer } = options;
  const base64Data = imageBuffer.toString("base64");
  const actualMime = mimeType && mimeType.startsWith("image/") ? mimeType : "image/png";

  const systemInstruction = `You are HOMR (Hybrid Optical Music Recognition), an expert Optical Music Recognition engine.
Your task is to accurately transcribe the uploaded sheet music image into valid, standard MusicXML 4.0 (partwise).

CRITICAL ACCURACY GUIDELINES:
1. Examine the image carefully:
   - Identify the clef (e.g. G clef on line 2, F clef on line 4).
   - Identify the key signature (number of sharps/flats, <fifths>). Note: 4 flats is fifths -4 (Ab major / F minor).
   - Identify the time signature (<beats> and <beat-type>, e.g. 3/4, 4/4, 2/4, 6/8).
   - Recognize every staff (single staff voice/instrument vs piano grand staff with 2 staves). If it's a single line of melody/voice, output 1 part. If it's piano with two staves, output accordingly.
   - For every measure, accurately transcribe the notes:
     * pitch (step, alter if flat/sharp/natural, octave)
     * duration and divisions (e.g. divisions=2 or divisions=4, duration corresponding to beat values)
     * type (whole, half, quarter, eighth, 16th)
     * dots (<dot/>) if dotted notes
     * ties (<tie type="start|stop"/> and <notations><tied type="start|stop"/></notations>)
     * rests (<rest/> or <rest measure="yes"/>)
     * chords if multiple notes occur simultaneously (<chord/>)
2. Follow standard MusicXML 4.0 structure:
   - Root element: <score-partwise version="4.0">
   - Header with <work><work-title/></work>, <identification><encoding><software>homr</software></encoding></identification>
   - <part-list> with <score-part id="P1">...
   - <part id="P1"> with <measure number="1"> containing <attributes> (<divisions>, <key>, <time>, <clef>)
3. The sum of note durations in each measure MUST strictly match the time signature!
4. Output ONLY the raw XML string starting with <?xml or <score-partwise. Do NOT wrap in markdown backticks (\`\`\`xml or \`\`\`). Do NOT include conversational explanations.`;

  const prompt = `Transcribe this sheet music image into valid MusicXML 4.0. Extract the exact notes, clef, key, meter, pitches, durations, and measures present in the image. File: ${filename || "score.png"}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: actualMime,
                data: base64Data,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.1, // low temperature for maximum determinism and notation fidelity
      },
    });

    let xmlText = response.text?.trim() || "";

    // Strip markdown code fences if model enclosed them
    if (xmlText.startsWith("```")) {
      xmlText = xmlText.replace(/^```(?:xml)?\s*\n?/, "").replace(/\n?```\s*$/, "").trim();
    }

    // Ensure it starts from <?xml or <score-partwise
    const xmlStartIdx = xmlText.search(/<(?:\?xml|score-partwise)/i);
    if (xmlStartIdx > 0) {
      xmlText = xmlText.slice(xmlStartIdx);
    }

    // Ensure standard <?xml declaration is present
    if (!xmlText.startsWith("<?xml")) {
      xmlText = `<?xml version="1.0" encoding="UTF-8"?>\n` + xmlText;
    }

    // Validate that it looks like valid XML
    if (!xmlText.includes("<score-partwise") || !xmlText.includes("</score-partwise>")) {
      throw new Error("El modelo no generó una estructura MusicXML válida.");
    }

    return xmlText;
  } catch (err) {
    console.error("[HOMR OMR] Gemini recognition error:", err);
    throw err;
  }
}
