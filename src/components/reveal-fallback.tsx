/**
 * Puts the image panels straight into their final state when scripting is
 * unavailable, since their hidden state is declared in CSS.
 */
export function RevealFallback() {
  return (
    <noscript>
      <style>{`[data-reveal='panel']{opacity:1!important;transform:none!important}`}</style>
    </noscript>
  );
}
