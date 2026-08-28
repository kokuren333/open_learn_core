export async function resolveVoicevoxSpeaker({ endpoint, name, style }) {
  const response = await fetch(`${endpoint.replace(/\/$/, "")}/speakers`);
  if (!response.ok) throw new Error(`VOICEVOX /speakers failed: HTTP ${response.status}`);
  const speakers = await response.json();
  const speaker = speakers.find((item) => item.name === name)?.styles?.find((item) => item.name === style);
  if (!speaker) throw new Error(`VOICEVOX speaker/style not found: ${name} / ${style}`);
  return { speakerUuid: speaker.id, speakerName: name, styleName: style };
}

export async function synthesizeVoicevox({ endpoint, spokenScript, speaker, speedScale = 1.25, outputPath }) {
  const base = endpoint.replace(/\/$/, "");
  const queryResponse = await fetch(`${base}/audio_query?text=${encodeURIComponent(spokenScript)}&speaker=${speaker.speakerUuid}`, { method: "POST" });
  if (!queryResponse.ok) throw new Error(`VOICEVOX /audio_query failed: HTTP ${queryResponse.status}`);
  const query = await queryResponse.json();
  query.speedScale = speedScale;
  const audioResponse = await fetch(`${base}/synthesis?speaker=${speaker.speakerUuid}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(query) });
  if (!audioResponse.ok) throw new Error(`VOICEVOX /synthesis failed: HTTP ${audioResponse.status}`);
  const { writeFile } = await import("node:fs/promises");
  await writeFile(outputPath, Buffer.from(await audioResponse.arrayBuffer()));
  return outputPath;
}

export async function synthesizeAivis({ endpoint, spokenScript, speakerId, outputPath }) {
  throw new Error(`Aivis adapter is available as an interface but requires a configured engine contract: ${endpoint} (speaker ${speakerId ?? "unresolved"})`);
}
