/**
 * Puts the revealed panels and story blocks straight into their final state
 * when scripting is unavailable, since their hidden state is declared in CSS.
 */
export function RevealFallback() {
  return (
    <noscript>
      <style>{`[data-reveal='panel'],[data-reveal='story']{opacity:1!important;transform:none!important}`}</style>
    </noscript>
  );
}
