import qrcode from 'qrcode-generator';

// Encode text as UTF-8 bytes so special characters (e.g. currency symbols)
// survive inside the QR data.
qrcode.stringToBytes = (s) => Array.from(new TextEncoder().encode(s));

function QRCode({ value, size = 128, level = 'L', bgColor = '#FFFFFF', fgColor = '#000000', title, ...props }) {
  if (!value) return null;

  let qr;
  try {
    qr = qrcode(0, level);
    qr.addData(value);
    qr.make();
  } catch (error) {
    console.warn('QR generation failed:', error);
    return null;
  }

  const moduleCount = qr.getModuleCount();
  let fgPath = '';
  let bgPath = '';

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        fgPath += `M ${col} ${row} l 1 0 0 1 -1 0 Z `;
      } else {
        bgPath += `M ${col} ${row} l 1 0 0 1 -1 0 Z `;
      }
    }
  }

  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox={`0 0 ${moduleCount} ${moduleCount}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      shapeRendering="crispEdges"
    >
      {title ? <title>{title}</title> : null}
      {bgPath && <path d={bgPath} fill={bgColor} />}
      {fgPath && <path d={fgPath} fill={fgColor} />}
    </svg>
  );
}

export default QRCode;
