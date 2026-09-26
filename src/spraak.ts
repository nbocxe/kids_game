/** Voorlezen in het Nederlands via de Web Speech API (zelfde aanpak als de Taal-app). */

export function kanVoorlezen(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function spreek(tekst: string, tempo = 0.95) {
  if (!kanVoorlezen()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  // Emoji en beletseltekens niet uitspreken.
  const schoon = tekst.replace(/\p{Extended_Pictographic}/gu, "").replace(/…/g, ",");
  const uiting = new SpeechSynthesisUtterance(schoon);
  uiting.lang = "nl-NL";
  uiting.rate = tempo;
  uiting.pitch = 1.1;
  const stem = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith("nl"));
  if (stem) uiting.voice = stem;
  synth.speak(uiting);
}

export function stil() {
  if (kanVoorlezen()) window.speechSynthesis.cancel();
}
