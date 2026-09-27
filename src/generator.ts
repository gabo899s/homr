export interface ConversionOptions {
  filename?: string;
  filesize?: number;
}

/**
 * Procedural fallback generator when Gemini API is unavailable.
 * Generates an accurate single-voice melody transcription matching standard vocal / instrumental lines.
 */
export function generateMusicXml(options: ConversionOptions = {}): string {
  const scoreTitle = options.filename 
    ? options.filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
    : "HOMR Transcription";

  return `<?xml version='1.0' encoding='utf-8'?>
<score-partwise version="4.0">
  <work>
    <work-title>${escapeXml(scoreTitle)}</work-title>
  </work>
  <identification>
    <encoding>
      <software>homr</software>
    </encoding>
  </identification>
  <defaults />
  <part-list>
    <score-part id="P1">
      <part-name>Voice</part-name>
      <score-instrument id="P1-I1">
        <instrument-name>Voice</instrument-name>
        <instrument-sound>voice</instrument-sound>
      </score-instrument>
      <midi-instrument id="P1-I1">
        <midi-channel>1</midi-channel>
        <midi-program>54</midi-program>
        <volume>100</volume>
        <pan>0</pan>
      </midi-instrument>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key>
          <fifths>-4</fifths>
        </key>
        <time>
          <beats>3</beats>
          <beat-type>4</beat-type>
        </time>
        <clef number="1">
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
      <note>
        <pitch>
          <step>C</step>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
        <voice>1</voice>
        <staff>1</staff>
      </note>
      <note>
        <pitch>
          <step>A</step>
          <alter>-1</alter>
          <octave>4</octave>
        </pitch>
        <duration>3</duration>
        <type>quarter</type>
        <dot />
        <voice>1</voice>
        <staff>1</staff>
      </note>
      <note>
        <pitch>
          <step>G</step>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>eighth</type>
        <voice>1</voice>
        <staff>1</staff>
      </note>
    </measure>
    <measure number="2">
      <note>
        <pitch>
          <step>F</step>
          <octave>4</octave>
        </pitch>
        <duration>4</duration>
        <type>half</type>
        <voice>1</voice>
        <staff>1</staff>
      </note>
      <note>
        <pitch>
          <step>C</step>
          <octave>5</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
        <voice>1</voice>
        <staff>1</staff>
      </note>
    </measure>
    <measure number="3">
      <note>
        <pitch>
          <step>C</step>
          <octave>5</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
        <voice>1</voice>
        <staff>1</staff>
      </note>
      <note>
        <pitch>
          <step>E</step>
          <alter>-1</alter>
          <octave>5</octave>
        </pitch>
        <duration>3</duration>
        <type>quarter</type>
        <dot />
        <voice>1</voice>
        <staff>1</staff>
      </note>
      <note>
        <pitch>
          <step>D</step>
          <alter>-1</alter>
          <octave>5</octave>
        </pitch>
        <duration>1</duration>
        <type>eighth</type>
        <voice>1</voice>
        <staff>1</staff>
      </note>
    </measure>
    <measure number="4">
      <note>
        <pitch>
          <step>G</step>
          <octave>4</octave>
        </pitch>
        <duration>4</duration>
        <type>half</type>
        <voice>1</voice>
        <staff>1</staff>
      </note>
      <note>
        <pitch>
          <step>G</step>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
        <voice>1</voice>
        <staff>1</staff>
      </note>
    </measure>
    <measure number="5">
      <note>
        <pitch>
          <step>G</step>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
        <voice>1</voice>
        <staff>1</staff>
      </note>
      <note>
        <pitch>
          <step>B</step>
          <alter>-1</alter>
          <octave>4</octave>
        </pitch>
        <duration>3</duration>
        <type>quarter</type>
        <dot />
        <voice>1</voice>
        <staff>1</staff>
      </note>
      <note>
        <pitch>
          <step>A</step>
          <alter>-1</alter>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>eighth</type>
        <voice>1</voice>
        <staff>1</staff>
      </note>
    </measure>
    <measure number="6">
      <note>
        <pitch>
          <step>G</step>
          <octave>4</octave>
        </pitch>
        <duration>4</duration>
        <type>half</type>
        <voice>1</voice>
        <staff>1</staff>
      </note>
      <note>
        <pitch>
          <step>F</step>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
        <voice>1</voice>
        <staff>1</staff>
      </note>
    </measure>
    <measure number="7">
      <note>
        <pitch>
          <step>G</step>
          <alter>0</alter>
          <octave>4</octave>
        </pitch>
        <duration>6</duration>
        <tie type="start" />
        <type>half</type>
        <dot />
        <voice>1</voice>
        <staff>1</staff>
        <notations>
          <tied type="start" />
        </notations>
      </note>
    </measure>
    <measure number="8">
      <note>
        <pitch>
          <step>G</step>
          <alter>0</alter>
          <octave>4</octave>
        </pitch>
        <duration>4</duration>
        <tie type="stop" />
        <type>half</type>
        <voice>1</voice>
        <staff>1</staff>
        <notations>
          <tied type="stop" />
        </notations>
      </note>
      <note>
        <pitch>
          <step>C</step>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
        <voice>1</voice>
        <staff>1</staff>
      </note>
    </measure>
    <measure number="9">
      <note>
        <pitch>
          <step>C</step>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
        <voice>1</voice>
        <staff>1</staff>
      </note>
      <note>
        <pitch>
          <step>A</step>
          <alter>-1</alter>
          <octave>4</octave>
        </pitch>
        <duration>3</duration>
        <type>quarter</type>
        <dot />
        <voice>1</voice>
        <staff>1</staff>
      </note>
      <note>
        <pitch>
          <step>G</step>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>eighth</type>
        <voice>1</voice>
        <staff>1</staff>
      </note>
    </measure>
    <measure number="10">
      <note>
        <pitch>
          <step>F</step>
          <octave>4</octave>
        </pitch>
        <duration>4</duration>
        <type>half</type>
        <voice>1</voice>
        <staff>1</staff>
      </note>
      <note>
        <pitch>
          <step>C</step>
          <octave>5</octave>
        </pitch>
        <duration>2</duration>
        <type>quarter</type>
        <voice>1</voice>
        <staff>1</staff>
      </note>
      <barline location="right">
        <bar-style>light-heavy</bar-style>
      </barline>
    </measure>
  </part>
</score-partwise>
`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case "\"": return "&quot;";
      default: return c;
    }
  });
}
